import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChaptersSection from '../components/ChaptersSection';
import ProcessingNotification from '../components/ProcessingNotification';

// Lazy load PDF viewers to avoid issues if react-pdf fails
const PdfViewer = lazy(() => import('../components/PdfViewer').catch(() => {
  // Fallback to SimplePdfViewer if PdfViewer fails to load
  return import('../components/SimplePdfViewer');
}));

const BookDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTocMode, setShowTocMode] = useState(false);
  const [tocSaved, setTocSaved] = useState(false);
  const [navigateToPage, setNavigateToPage] = useState(null);
  const [processingChapters, setProcessingChapters] = useState(false);
  const [chapterError, setChapterError] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [processingDetails, setProcessingDetails] = useState([]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        // Fetch specific book details by ID using the dedicated endpoint
        const response = await fetch(`http://localhost:8000/api/v1/textbooks/${id}`, {
          headers: {
            'accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Book not found');
          } else if (response.status === 422) {
            throw new Error('Invalid book ID');
          } else {
            throw new Error('Failed to fetch book details');
          }
        }

        const bookData = await response.json();
        setBook(bookData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Process TOC: Extract text, detect chapters, and create them
  const processTocAndCreateChapters = async (textbookId) => {
    try {
      console.log('Starting TOC processing for textbook:', textbookId);
      setProcessingDetails([]);
      
      // Step 1: Get TOC text
      setProcessingStep('Extracting Table of Contents text...');
      const tocResponse = await fetch(
        `http://localhost:8000/api/v1/extract/textbook/${textbookId}/toc`,
        {
          headers: {
            'accept': 'application/json'
          }
        }
      );

      if (!tocResponse.ok) {
        throw new Error('Failed to extract TOC text');
      }

      const tocData = await tocResponse.json();
      const tocText = tocData.extracted_text;
      
      if (!tocText) {
        throw new Error('No TOC text extracted');
      }

      setProcessingDetails(prev => [...prev, `✓ TOC text extracted (${tocData.page_count} pages)`]);
      console.log('TOC text extracted successfully');

      // Step 2: Detect chapters from TOC text
      setProcessingStep('Analyzing TOC to detect chapters...');
      const detectResponse = await fetch(
        'http://localhost:8000/api/v1/chapters/detect',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            textbook_id: parseInt(textbookId),
            toc_text: tocText
          })
        }
      );

      if (!detectResponse.ok) {
        throw new Error('Failed to detect chapters');
      }

      const detectedData = await detectResponse.json();
      const detectedChapters = detectedData.chapters;
      
      if (!detectedChapters || detectedChapters.length === 0) {
        throw new Error('No chapters detected');
      }

      setProcessingDetails(prev => [...prev, `✓ Detected ${detectedChapters.length} chapters`]);
      console.log('Detected chapters:', detectedChapters);

      // Step 3: Create chapters in batch
      setProcessingStep('Creating chapters and extracting content...');
      const createResponse = await fetch(
        'http://localhost:8000/api/v1/chapters/batch',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            textbook_id: parseInt(textbookId),
            chapters: detectedChapters
          })
        }
      );

      if (!createResponse.ok) {
        throw new Error('Failed to create chapters');
      }

      const createdData = await createResponse.json();
      setProcessingDetails(prev => [...prev, `✓ Created ${createdData.created_count} chapters successfully`]);
      setProcessingStep('Chapters created successfully!');
      console.log('Chapters created successfully:', createdData);
      
      return createdData;
    } catch (error) {
      console.error('Error processing TOC and creating chapters:', error);
      setProcessingStep('');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">{t('bookDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{t('bookDetail.error')}: {error}</p>
          <button 
            onClick={() => navigate('/library')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('bookDetail.backToLibrary')}
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl mb-4">{t('bookDetail.notFound')}</p>
          <button 
            onClick={() => navigate('/library')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('bookDetail.backToLibrary')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <button 
            onClick={() => navigate('/library')}
            className="mb-4 text-white hover:text-gray-200 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            {t('bookDetail.backToLibrary')}
          </button>
          <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
          <p className="text-lg">by {book.author}</p>
        </div>
      </div>

      {/* Book Details and PDF Viewer */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* PDF Viewer and Book Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Column - PDF Viewer (2/3 width) */}
            <div className="lg:col-span-2 border-r border-gray-200 overflow-hidden">
              <div className="p-2 md:p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">PDF Preview</h3>
              </div>
              <div className="relative bg-gray-100 overflow-hidden" style={{ height: '600px', maxHeight: '80vh' }}>
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      <p className="mt-2 text-gray-600">Loading PDF Viewer...</p>
                    </div>
                  </div>
                }>
                  <PdfViewer 
                    textbookId={id}
                    totalPages={book.total_pages}
                    embedded={true}
                    onClose={() => {}}
                    startInTocMode={showTocMode}
                    navigateToPage={navigateToPage}
                    onPageNavigated={() => setNavigateToPage(null)}
                    onTocSaved={async () => {
                      setTocSaved(true);
                      setShowTocMode(false);
                      
                      try {
                        // Process TOC and create chapters automatically
                        console.log('TOC saved, processing chapters...');
                        await processTocAndCreateChapters(id);
                        
                        // Refresh book data to get updated TOC info and chapter count
                        const response = await fetch(`http://localhost:8000/api/v1/textbooks/${id}`, {
                          headers: { 'accept': 'application/json' }
                        });
                        
                        if (response.ok) {
                          const data = await response.json();
                          setBook(data);
                          console.log('Book data refreshed with chapters');
                        }
                      } catch (err) {
                        console.error('Error processing TOC:', err);
                        // Still refresh book data even if chapter creation fails
                        fetch(`http://localhost:8000/api/v1/textbooks/${id}`, {
                          headers: { 'accept': 'application/json' }
                        })
                        .then(res => res.json())
                        .then(data => setBook(data))
                        .catch(error => console.error('Failed to refresh book data:', error));
                      }
                    }}
                  />
                </Suspense>
              </div>
            </div>

            {/* Right Column - Book Information (1/3 width) */}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6 text-gray-800">{t('bookDetail.bookInfo')}</h2>
              
              {/* TOC Status Alert */}
              {showTocMode && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-300 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-800">TOC Selection Mode Active</p>
                      <p className="text-xs text-purple-700 mt-1">Click on pages in the PDF viewer to select the Table of Contents range.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="pb-3 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('bookDetail.title')}</span>
                  <span className="text-gray-800 text-sm font-medium">{book.title}</span>
                </div>
                
                <div className="pb-3 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('bookDetail.author')}</span>
                  <span className="text-gray-800 text-sm">{book.author}</span>
                </div>
                
                <div className="pb-3 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('bookDetail.originalFilename')}</span>
                  <span className="text-gray-800 text-sm break-all">{book.original_filename}</span>
                </div>
                
                <div className="pb-3 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('bookDetail.totalPages')}</span>
                  <span className="text-gray-800 text-sm font-medium">{book.total_pages} pages</span>
                </div>
                
                <div className="pb-3 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('bookDetail.uploadedDate')}</span>
                  <span className="text-gray-800 text-sm">{formatDate(book.uploaded_at)}</span>
                </div>
                
                {book.has_toc_extracted && (
                  <>
                    <div className="pb-3 border-b border-gray-200">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('bookDetail.tocPages')}</span>
                      <span className="text-gray-800 text-sm">
                        {book.toc_start_page && book.toc_end_page 
                          ? `Pages ${book.toc_start_page} - ${book.toc_end_page}`
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="pb-3 border-b border-gray-200">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('bookDetail.chapterCount')}</span>
                      <span className="text-gray-800 text-sm font-medium">{book.chapter_count} chapters</span>
                    </div>
                  </>
                )}
                
                <div className="pb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">{t('bookDetail.tocExtracted')}</span>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    book.has_toc_extracted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {book.has_toc_extracted ? '✓ Extracted' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Processing Notification */}
              {processingChapters && (
                <ProcessingNotification
                  status="Processing Table of Contents"
                  message={processingStep}
                  details={processingDetails}
                  type="info"
                />
              )}

              {/* Success Message */}
              {tocSaved && !processingChapters && !chapterError && (
                <ProcessingNotification
                  status="Success!"
                  message="Table of Contents has been successfully set and chapters have been created."
                  details={processingDetails.length > 0 ? processingDetails : undefined}
                  type="success"
                />
              )}

              {/* Error Message */}
              {chapterError && (
                <ProcessingNotification
                  status="Partial Success"
                  message={`TOC saved but chapter creation encountered an issue: ${chapterError}`}
                  details={[
                    'The Table of Contents has been saved successfully.',
                    'You can try creating chapters manually or contact support if the issue persists.'
                  ]}
                  type="warning"
                />
              )}

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                <button 
                  onClick={async () => {
                    try {
                      const response = await fetch(`http://localhost:8000/api/v1/textbooks/${id}/pdf`, {
                        headers: { 'accept': 'application/pdf' }
                      });
                      if (!response.ok) throw new Error('Failed to download PDF');
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${book.title || 'textbook'}.pdf`;
                      link.click();
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      alert('Failed to download PDF: ' + err.message);
                    }
                  }}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  {t('bookDetail.downloadPdf')}
                </button>
                
                {/* TOC Management Button */}
                {!book.has_toc_extracted ? (
                  <button 
                    onClick={() => setShowTocMode(true)}
                    className="w-full bg-purple-600 text-white py-2.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Set Table of Contents
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        // Navigate to the TOC start page in the PDF viewer
                        if (book.toc_start_page) {
                          setNavigateToPage(book.toc_start_page);
                        }
                      }}
                      className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-medium">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                      </svg>
                      {t('bookDetail.viewToc')}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Processing Notification for Chapters */}
        {processingChapters && (
          <ProcessingNotification
            title="Processing Chapters"
            step={processingStep}
            details={processingDetails}
            onClose={() => setProcessingChapters(false)}
          />
        )}
        
        {/* Chapter Error Alert */}
        {chapterError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-700">{chapterError}</p>
              <button
                onClick={() => setChapterError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Chapters Section */}
        <div className="mt-8">
          <ChaptersSection 
            textbookId={id} 
            book={book}
            onChapterClick={async (chapter) => {
              // Handle special actions
              if (chapter?.action === 'process_chapters') {
                try {
                  setProcessingChapters(true);
                  setChapterError(null);
                  console.log('Manually triggering chapter processing...');
                  
                  await processTocAndCreateChapters(id);
                  
                  // Refresh book data
                  const response = await fetch(`http://localhost:8000/api/v1/textbooks/${id}`, {
                    headers: { 'accept': 'application/json' }
                  });
                  
                  if (response.ok) {
                    const data = await response.json();
                    setBook(data);
                    console.log('Book data refreshed after manual chapter processing');
                  }
                } catch (err) {
                  console.error('Error processing chapters:', err);
                  setChapterError('Failed to process chapters: ' + err.message);
                } finally {
                  setProcessingChapters(false);
                }
                return;
              }
              
              // Normal chapter click - Navigate to the chapter's start page in the PDF viewer
              if (chapter?.start_page) {
                setNavigateToPage(chapter.start_page);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;