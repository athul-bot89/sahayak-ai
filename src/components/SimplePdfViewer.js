import React, { useState } from 'react';

const SimplePdfViewer = ({ textbookId, totalPages, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode] = useState('iframe'); // 'iframe' or 'image'
  const [selectedPages, setSelectedPages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // API base URL
  const API_BASE = 'http://localhost:8000/api/v1';

  // Build PDF URL for iframe
  const getPdfUrl = () => {
    return `${API_BASE}/textbooks/${textbookId}/pdf`;
  };

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

  // Toggle page selection
  const togglePageSelection = (pageNum) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNum)) {
        return prev.filter(p => p !== pageNum);
      } else {
        return [...prev, pageNum];
      }
    });
  };

  // Navigation functions
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      setCurrentPage(value);
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header Toolbar */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Page navigation (for page selection mode) */}
          {isSelectionMode && (
            <div className="flex items-center space-x-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={currentPage}
                  onChange={handlePageInputChange}
                  className="w-16 px-2 py-1 text-center bg-gray-700 rounded"
                  min="1"
                  max={totalPages}
                />
                <span> / {totalPages}</span>
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Zoom controls (for iframe mode) */}
          {viewMode === 'iframe' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-gray-700 rounded"
                title="Zoom out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              
              <span className="min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
              
              <button
                onClick={zoomIn}
                className="p-2 hover:bg-gray-700 rounded"
                title="Zoom in"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-3">
          {/* Selection mode toggle */}
          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedPages([]);
            }}
            className={`px-3 py-1 rounded ${isSelectionMode ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
          >
            {isSelectionMode ? 'Exit Selection' : 'Select Pages'}
          </button>

          {isSelectionMode && selectedPages.length > 0 && (
            <span className="text-sm">{selectedPages.length} pages selected</span>
          )}

          {/* Download options */}
          <div className="flex items-center space-x-2">
            {isSelectionMode && selectedPages.length > 0 && (
              <button
                onClick={handleDownloadSelectedPages}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded flex items-center"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Selected
              </button>
            )}
            
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded flex items-center"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Full PDF
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto bg-gray-900 relative">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <p className="mt-2">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-10">
            {error}
          </div>
        )}

        {/* Main PDF Display */}
        {!isSelectionMode ? (
          // Regular viewing mode using iframe
          <div className="h-full w-full flex items-center justify-center p-4">
            <iframe
              src={getPdfUrl()}
              className="w-full h-full max-w-6xl bg-white rounded shadow-2xl"
              style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
              title="PDF Viewer"
            />
          </div>
        ) : (
          // Page selection mode
          <div className="p-4">
            <div className="bg-white rounded-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Select Pages to Download</h3>
              <p className="text-gray-600 mb-6">Click on page numbers to select them for download</p>
              
              {/* Page grid */}
              <div className="grid grid-cols-10 gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => togglePageSelection(pageNum)}
                      className={`p-3 rounded border-2 transition-all ${
                        selectedPages.includes(pageNum)
                          ? 'border-green-500 bg-green-100 text-green-800 font-semibold'
                          : currentPage === pageNum
                          ? 'border-blue-500 bg-blue-100 text-blue-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Quick selection helpers */}
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPages([...Array(totalPages)].map((_, i) => i + 1))}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Select All
                </button>
                <button
                  onClick={() => setSelectedPages([])}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Clear All
                </button>
                <button
                  onClick={() => {
                    const start = Math.max(1, currentPage - 5);
                    const end = Math.min(totalPages, currentPage + 5);
                    const range = [];
                    for (let i = start; i <= end; i++) {
                      range.push(i);
                    }
                    setSelectedPages(range);
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  Select Range (±5 from current)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-friendly controls */}
      <div className="md:hidden bg-gray-800 p-3 border-t border-gray-700 flex justify-around">
        <button
          onClick={handleDownloadPdf}
          className="p-2 bg-blue-600 rounded"
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3" />
          </svg>
        </button>
        
        <button
          onClick={() => setIsSelectionMode(!isSelectionMode)}
          className={`p-2 rounded ${isSelectionMode ? 'bg-green-600' : 'bg-gray-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>
        
        <button
          onClick={onClose}
          className="p-2 bg-red-600 rounded"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SimplePdfViewer;