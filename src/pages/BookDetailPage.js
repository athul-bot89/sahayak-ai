import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        // Fetch all books and find the one with matching ID
        // Note: If your API has a single book endpoint, you can use that instead
        const response = await fetch(`http://localhost:8000/api/v1/textbooks/?skip=0&limit=100`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }

        const data = await response.json();
        const bookData = data.find(b => b.id === parseInt(id));
        
        if (!bookData) {
          throw new Error('Book not found');
        }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Error: {error}</p>
          <button 
            onClick={() => navigate('/library')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-xl mb-4">Book not found</p>
          <button 
            onClick={() => navigate('/library')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Library
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
            Back to Library
          </button>
          <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
          <p className="text-lg">by {book.author}</p>
        </div>
      </div>

      {/* Book Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Book Cover/Icon */}
            <div className="flex justify-center md:justify-start">
              <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg p-12 flex items-center justify-center">
                <svg className="w-32 h-32 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
              </div>
            </div>

            {/* Right Column - Book Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Book Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 w-40">Title:</span>
                  <span className="text-gray-600">{book.title}</span>
                </div>
                
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 w-40">Author:</span>
                  <span className="text-gray-600">{book.author}</span>
                </div>
                
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 w-40">Original Filename:</span>
                  <span className="text-gray-600">{book.original_filename}</span>
                </div>
                
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 w-40">Total Pages:</span>
                  <span className="text-gray-600">{book.total_pages}</span>
                </div>
                
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 w-40">Uploaded Date:</span>
                  <span className="text-gray-600">{formatDate(book.uploaded_at)}</span>
                </div>
                
                {book.has_toc_extracted && (
                  <>
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 w-40">TOC Pages:</span>
                      <span className="text-gray-600">
                        {book.toc_start_page && book.toc_end_page 
                          ? `Pages ${book.toc_start_page} - ${book.toc_end_page}`
                          : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 w-40">Chapter Count:</span>
                      <span className="text-gray-600">{book.chapter_count}</span>
                    </div>
                  </>
                )}
                
                <div className="flex items-start">
                  <span className="font-semibold text-gray-700 w-40">TOC Extracted:</span>
                  <span className={`inline-flex px-2 py-1 rounded text-sm ${
                    book.has_toc_extracted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {book.has_toc_extracted ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Download PDF
                </button>
                
                <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  Read Online
                </button>
                
                {book.has_toc_extracted && (
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                    </svg>
                    View Table of Contents
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;