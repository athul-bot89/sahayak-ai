import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import { configurePdfWorker } from '../utils/pdfConfig';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfViewer.css';

// Configure PDF.js worker
configurePdfWorker();

const PdfViewer = ({ textbookId, totalPages, onClose, embedded = false, startInTocMode = false, onTocSaved }) => {
  const [numPages, setNumPages] = useState(totalPages);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(embedded ? 0.8 : 1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(embedded ? 'continuous' : 'single'); // 'single' or 'continuous'
  const [selectedPages, setSelectedPages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [pageCache, setPageCache] = useState({});
  const [loadedPages, setLoadedPages] = useState(new Set());
  const [containerWidth, setContainerWidth] = useState(null);
  const [tocMode, setTocMode] = useState(startInTocMode);
  const [tocStartPage, setTocStartPage] = useState(null);
  const [tocEndPage, setTocEndPage] = useState(null);
  const [isSavingToc, setIsSavingToc] = useState(false);
  const [tocSaveSuccess, setTocSaveSuccess] = useState(false);

  // API base URL
  const API_BASE = 'http://localhost:8000/api/v1';
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (embedded) {
        const container = document.querySelector('.pdf-viewer-container');
        if (container) {
          setContainerWidth(container.clientWidth);
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [embedded]);

  // Load PDF pages on demand
  const loadPageRange = useCallback(async (startPage, endPage) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/textbooks/${textbookId}/preview?start_page=${startPage}&end_page=${endPage}`,
        {
          headers: {
            'accept': 'application/pdf'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load pages ${startPage}-${endPage}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Cache the loaded pages
      setPageCache(prevCache => {
        const newCache = { ...prevCache };
        for (let i = startPage; i <= endPage; i++) {
          newCache[i] = url;
        }
        return newCache;
      });
      
      setLoadedPages(prev => {
        const newSet = new Set(prev);
        for (let i = startPage; i <= endPage; i++) {
          newSet.add(i);
        }
        return newSet;
      });
      
      return url;
    } catch (err) {
      setError(err.message);
      console.error('Error loading pages:', err);
    } finally {
      setLoading(false);
    }
  }, [textbookId]);

  // Load initial pages
  useEffect(() => {
    // Load first 5 pages initially
    loadPageRange(1, Math.min(5, totalPages));
  }, [textbookId, loadPageRange, totalPages]);
  
  // Handle startInTocMode prop changes
  useEffect(() => {
    if (startInTocMode && !tocMode) {
      setTocMode(true);
      setIsSelectionMode(false);
      setSelectedPages([]);
    }
  }, [startInTocMode, tocMode]);
  
  // Track current page when scrolling in continuous mode
  useEffect(() => {
    if (viewMode === 'continuous' && embedded) {
      const handleScroll = (e) => {
        const container = e.target;
        const pages = container.querySelectorAll('[id^="page-"]');
        
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const rect = page.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          // Check if page is in viewport
          if (rect.top >= containerRect.top && rect.top <= containerRect.top + containerRect.height / 2) {
            const pageNum = parseInt(page.id.replace('page-', ''));
            if (pageNum !== currentPage) {
              setCurrentPage(pageNum);
            }
            break;
          }
        }
      };
      
      const container = document.querySelector('.pdf-viewer-container');
      if (container) {
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
      }
    }
  }, [viewMode, embedded, currentPage]);

  // Prefetch pages as user navigates
  useEffect(() => {
    if (viewMode === 'single') {
      // Prefetch next and previous pages
      const pagesToLoad = [];
      
      // Check pages around current page
      for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (!loadedPages.has(i)) {
          pagesToLoad.push(i);
        }
      }
      
      if (pagesToLoad.length > 0) {
        const minPage = Math.min(...pagesToLoad);
        const maxPage = Math.max(...pagesToLoad);
        loadPageRange(minPage, maxPage);
      }
    }
  }, [currentPage, viewMode, loadedPages, totalPages, loadPageRange]);

  // Download full PDF
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/textbooks/${textbookId}/pdf`, {
        headers: {
          'accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `textbook_${textbookId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Download selected pages
  const handleDownloadSelectedPages = async () => {
    if (selectedPages.length === 0) {
      alert('Please select pages to download');
      return;
    }

    const sortedPages = [...selectedPages].sort((a, b) => a - b);
    const startPage = sortedPages[0];
    const endPage = sortedPages[sortedPages.length - 1];

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/textbooks/${textbookId}/preview?start_page=${startPage}&end_page=${endPage}`,
        {
          headers: {
            'accept': 'application/pdf'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download selected pages');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `textbook_${textbookId}_pages_${startPage}-${endPage}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle page selection
  const togglePageSelection = (pageNum) => {
    if (tocMode) {
      // In TOC mode, set start and end pages
      if (tocStartPage === null) {
        setTocStartPage(pageNum);
        setTocEndPage(pageNum);
      } else if (pageNum < tocStartPage) {
        setTocStartPage(pageNum);
      } else if (pageNum > tocEndPage) {
        setTocEndPage(pageNum);
      } else {
        // Clicking within range - reset to this single page
        setTocStartPage(pageNum);
        setTocEndPage(pageNum);
      }
    } else {
      setSelectedPages(prev => {
        if (prev.includes(pageNum)) {
          return prev.filter(p => p !== pageNum);
        } else {
          return [...prev, pageNum];
        }
      });
    }
  };

  // Handle TOC save
  const handleSaveToc = async () => {
    if (tocStartPage === null || tocEndPage === null) {
      alert('Please select the TOC page range first');
      return;
    }

    try {
      setIsSavingToc(true);
      const response = await fetch(
        `${API_BASE}/extract/textbook/${textbookId}/set-toc`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            start_page: tocStartPage,
            end_page: tocEndPage
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to set TOC pages');
      }

      const data = await response.json();
      setTocSaveSuccess(true);
      
      // Call parent callback if provided
      if (onTocSaved) {
        onTocSaved(data);
      }
      
      // Show success message
      setTimeout(() => {
        setTocSaveSuccess(false);
        setTocMode(false);
        setTocStartPage(null);
        setTocEndPage(null);
      }, 3000);
      
      console.log('TOC extracted:', data);
    } catch (err) {
      setError(err.message);
      console.error('Error setting TOC:', err);
    } finally {
      setIsSavingToc(false);
    }
  };

  // Navigation functions
  const goToPrevPage = () => {
    const newPage = Math.max(1, currentPage - 1);
    setCurrentPage(newPage);
    
    // In continuous mode, scroll to the page
    if (viewMode === 'continuous') {
      const targetPage = document.getElementById(`page-${newPage}`);
      if (targetPage) {
        targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const goToNextPage = () => {
    const newPage = Math.min(numPages || totalPages, currentPage + 1);
    setCurrentPage(newPage);
    
    // In continuous mode, scroll to the page
    if (viewMode === 'continuous') {
      const targetPage = document.getElementById(`page-${newPage}`);
      if (targetPage) {
        targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePageInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= (numPages || totalPages)) {
      setCurrentPage(value);
      
      // In continuous mode, scroll to the page
      if (viewMode === 'continuous') {
        const targetPage = document.getElementById(`page-${value}`);
        if (targetPage) {
          targetPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <div className={embedded ? "h-full flex flex-col overflow-hidden" : "fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col"}>
      {/* Header Toolbar */}
      <div className={embedded ? "bg-gray-100 text-gray-800 p-2 md:p-4 flex flex-wrap items-center justify-between border-b" : "bg-gray-800 text-white p-4 flex items-center justify-between"}>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {/* Close button */}
          {!embedded && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* View mode toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('single')}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${viewMode === 'single' ? 'bg-blue-600 text-white' : embedded ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
              Single
            </button>
            <button
              onClick={() => setViewMode('continuous')}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${viewMode === 'continuous' ? 'bg-blue-600 text-white' : embedded ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
              Continuous
            </button>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className={`p-1 md:p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed ${embedded ? 'hover:bg-gray-300' : 'hover:bg-gray-700'}`}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex items-center gap-1 text-xs md:text-sm">
              <input
                type="number"
                value={currentPage}
                onChange={handlePageInputChange}
                className={`w-12 md:w-16 px-1 md:px-2 py-0.5 md:py-1 text-center rounded text-xs md:text-sm ${embedded ? 'bg-white border border-gray-300' : 'bg-gray-700 text-white'}`}
                min="1"
                max={numPages || totalPages}
              />
              <span className="text-xs md:text-sm">/{numPages || totalPages}</span>
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage >= (numPages || totalPages)}
              className={`p-1 md:p-2 rounded disabled:opacity-50 disabled:cursor-not-allowed ${embedded ? 'hover:bg-gray-300' : 'hover:bg-gray-700'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              className={`p-1 md:p-2 rounded ${embedded ? 'hover:bg-gray-300' : 'hover:bg-gray-700'}`}
              title="Zoom out"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            
            <span className="min-w-[40px] md:min-w-[50px] text-center font-medium text-xs md:text-sm">{Math.round(scale * 100)}%</span>
            
            <button
              onClick={zoomIn}
              className={`p-1 md:p-2 rounded ${embedded ? 'hover:bg-gray-300' : 'hover:bg-gray-700'}`}
              title="Zoom in"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            
            <button
              onClick={resetZoom}
              className={`px-1.5 md:px-2 py-0.5 md:py-1 text-xs md:text-sm rounded ${embedded ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
          {/* TOC mode toggle - show in both embedded and non-embedded modes when appropriate */}
          {(embedded || !embedded) && (
            <button
              onClick={() => {
                setTocMode(!tocMode);
                setTocStartPage(null);
                setTocEndPage(null);
                setIsSelectionMode(false);
                setSelectedPages([]);
              }}
              className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm ${tocMode ? 'bg-purple-600 text-white' : embedded ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
              {tocMode ? 'Exit TOC' : 'Set TOC'}
            </button>
          )}

          {tocMode && tocStartPage !== null && tocEndPage !== null && (
            <>
              <span className="text-xs md:text-sm text-white">
                TOC: Pages {tocStartPage} - {tocEndPage}
              </span>
              <button
                onClick={handleSaveToc}
                disabled={isSavingToc}
                className="px-2 md:px-3 py-0.5 md:py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded text-xs md:text-sm flex items-center"
              >
                {isSavingToc ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>Save TOC</>
                )}
              </button>
            </>
          )}

          {tocSaveSuccess && (
            <span className="text-green-400 text-xs md:text-sm animate-pulse">
              ✓ TOC saved successfully!
            </span>
          )}

          {/* Selection mode toggle */}
          {!embedded && !tocMode && (
            <button
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                setSelectedPages([]);
              }}
              className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-xs md:text-sm ${isSelectionMode ? 'bg-green-600 text-white' : embedded ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
            >
              {isSelectionMode ? 'Exit' : 'Select'}
            </button>
          )}

          {isSelectionMode && selectedPages.length > 0 && (
            <span className={`text-xs md:text-sm ${embedded ? 'text-gray-600' : 'text-white'}`}>{selectedPages.length} selected</span>
          )}

          {/* Download options */}
          <div className="flex items-center gap-1 md:gap-2">
            {!embedded && isSelectionMode && selectedPages.length > 0 && (
              <button
                onClick={handleDownloadSelectedPages}
                className="px-2 md:px-3 py-0.5 md:py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center text-xs md:text-sm"
                disabled={loading}
              >
                <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden md:inline">Download Selected</span>
                <span className="md:hidden">DL</span>
              </button>
            )}
            
            {!embedded && (
              <button
                onClick={handleDownloadPdf}
                className="px-2 md:px-3 py-0.5 md:py-1 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center text-xs md:text-sm"
                disabled={loading}
              >
                <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden md:inline">Download PDF</span>
                <span className="md:hidden">PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className={`flex-1 overflow-auto relative pdf-viewer-container ${embedded ? 'bg-gray-50' : 'bg-gray-900'}`} 
           style={{ scrollBehavior: 'smooth' }}>
        {/* TOC Mode Instructions */}
        {tocMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-20 max-w-md text-center">
            <p className="font-semibold mb-1">Table of Contents Selection Mode</p>
            <p className="text-sm">
              Click on pages to select the TOC range. The first click sets the start page, 
              subsequent clicks extend the range. Selected pages will be highlighted in purple.
            </p>
            {tocStartPage === null && (
              <p className="text-xs mt-2 font-medium">👆 Click on the first TOC page to begin</p>
            )}
            {tocStartPage !== null && tocEndPage !== null && (
              <p className="text-xs mt-2 font-medium">
                Selected: Pages {tocStartPage} to {tocEndPage}
              </p>
            )}
          </div>
        )}
        
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className={embedded ? "text-gray-800 text-center" : "text-white text-center"}>
              <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${embedded ? 'border-blue-600' : 'border-white'}`}></div>
              <p className="mt-2">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-10">
            {error}
          </div>
        )}

        <div className={`flex justify-center ${viewMode === 'single' ? 'items-center min-h-full' : ''} p-4`}>
          {viewMode === 'single' ? (
            // Single page view with streaming
            <div className="relative">
              {loadedPages.has(currentPage) ? (
                <div 
                  className={`bg-white shadow-2xl ${isSelectionMode || tocMode ? 'cursor-pointer' : ''}`}
                  onClick={() => (isSelectionMode || tocMode) && togglePageSelection(currentPage)}
                >
                  {/* Render page from cache or load it */}
                  <div className="relative">
                    <Document
                      file={pageCache[currentPage] || `${API_BASE}/textbooks/${textbookId}/preview?start_page=${currentPage}&end_page=${currentPage}`}
                      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                      loading={
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      }
                    >
                      <Page 
                        pageNumber={1} 
                        scale={embedded && containerWidth ? undefined : scale}
                        width={embedded && containerWidth ? containerWidth * 0.9 : undefined}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                      />
                    </Document>
                    
                    {isSelectionMode && (
                      <div className={`absolute top-2 right-2 ${selectedPages.includes(currentPage) ? 'bg-green-600' : 'bg-gray-600'} text-white rounded-full w-8 h-8 flex items-center justify-center`}>
                        {selectedPages.includes(currentPage) && '✓'}
                      </div>
                    )}
                    
                    {tocMode && (
                      <div className={`absolute top-2 right-2 ${
                        tocStartPage !== null && currentPage >= tocStartPage && currentPage <= tocEndPage 
                          ? 'bg-purple-600' 
                          : 'bg-gray-600'
                      } text-white rounded-full w-8 h-8 flex items-center justify-center`}>
                        {tocStartPage !== null && currentPage >= tocStartPage && currentPage <= tocEndPage && '✓'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded shadow-2xl">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3">Loading page {currentPage}...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Continuous scroll view - smooth scrollable
            <div className="w-full px-2 md:px-4 py-4">
              <Document
                file={`${API_BASE}/textbooks/${textbookId}/pdf`}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading PDF document...</span>
                  </div>
                }
                error={
                  <div className="text-center p-8">
                    <p className="text-red-600 mb-4">Failed to load PDF</p>
                    <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded">
                      Retry
                    </button>
                  </div>
                }
                className="pdf-document-container"
              >
                {[...Array(numPages || totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <div 
                      key={pageNum} 
                      className={`mb-4 bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl ${isSelectionMode || tocMode ? 'cursor-pointer' : ''} pdf-page-container`}
                      onClick={() => (isSelectionMode || tocMode) && togglePageSelection(pageNum)}
                      id={`page-${pageNum}`}
                    >
                      <div className="relative overflow-hidden">
                        <Page 
                          pageNumber={pageNum} 
                          scale={embedded && containerWidth ? undefined : scale}
                          width={embedded && containerWidth ? containerWidth * 0.9 : undefined}
                          loading={
                            <div className="flex items-center justify-center p-8 bg-gray-50">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                              <span className="ml-3 text-gray-600">Loading page {pageNum}...</span>
                            </div>
                          }
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          className="pdf-page"
                        />
                        
                        {isSelectionMode && (
                          <div className={`absolute top-2 right-2 ${selectedPages.includes(pageNum) ? 'bg-green-600' : 'bg-gray-600'} text-white rounded-full w-8 h-8 flex items-center justify-center`}>
                            {selectedPages.includes(pageNum) && '✓'}
                          </div>
                        )}
                        
                        {tocMode && (
                          <div className={`absolute top-2 right-2 ${
                            tocStartPage !== null && pageNum >= tocStartPage && pageNum <= tocEndPage 
                              ? 'bg-purple-600' 
                              : 'bg-gray-600'
                          } text-white rounded-full w-8 h-8 flex items-center justify-center`}>
                            {tocStartPage !== null && pageNum >= tocStartPage && pageNum <= tocEndPage && '✓'}
                          </div>
                        )}
                        
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Page {pageNum} / {numPages || totalPages}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Document>
            </div>
          )}
        </div>
      </div>

      {/* Footer with page thumbnails (optional) */}
      {(isSelectionMode || tocMode) && viewMode === 'single' && (
        <div className={`p-3 border-t ${embedded ? 'bg-gray-100 border-gray-300' : 'bg-gray-800 border-gray-700'}`}>
          <div className="flex items-center justify-center space-x-2 overflow-x-auto">
            {[...Array(Math.min(20, totalPages))].map((_, index) => {
              const pageNum = index + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    togglePageSelection(pageNum);
                    if (viewMode === 'single') setCurrentPage(pageNum);
                  }}
                  className={`w-12 h-12 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                    tocMode && tocStartPage !== null && pageNum >= tocStartPage && pageNum <= tocEndPage
                      ? 'bg-purple-600 text-white'
                      : selectedPages.includes(pageNum)
                      ? 'bg-green-600 text-white'
                      : currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : embedded
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 20 && (
              <span className={embedded ? "text-gray-600 px-2" : "text-gray-400 px-2"}>...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;