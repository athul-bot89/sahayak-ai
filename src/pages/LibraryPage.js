import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LibraryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterTOC, setFilterTOC] = useState('');
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/textbooks/?skip=0&limit=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique authors for filter
  const uniqueAuthors = [...new Set(books.map(book => book.author))];

  // Filter books based on search and filters
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.original_filename.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAuthor = filterAuthor === '' || book.author === filterAuthor;
    
    const matchesTOC = filterTOC === '' || 
                       (filterTOC === 'yes' && book.has_toc_extracted) ||
                       (filterTOC === 'no' && !book.has_toc_extracted);
    
    return matchesSearch && matchesAuthor && matchesTOC;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadFile(file);
      setUploadError(null);
    } else {
      setUploadFile(null);
      setUploadError('Please select a valid PDF file');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadFile || !uploadTitle || !uploadAuthor) {
      setUploadError('Please fill in all fields');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('author', uploadAuthor);

      const response = await fetch('http://localhost:8000/api/v1/textbooks/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload textbook');
      }

      await response.json(); // Process response but don't need to use it
      setUploadSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadAuthor('');
        setUploadSuccess(false);
        fetchBooks(); // Refresh the book list
      }, 2000);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadTitle('');
    setUploadAuthor('');
    setUploadError(null);
    setUploadSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex-grow bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow bg-gray-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Error: {error}</p>
          <button 
            onClick={fetchBooks}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-4">{t('library.title')}</h1>
              <p className="text-lg">
                {t('library.subtitle')}
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Textbook
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder={t('library.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Authors</option>
              {uniqueAuthors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
            <select 
              value={filterTOC}
              onChange={(e) => setFilterTOC(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Books</option>
              <option value="yes">With TOC</option>
              <option value="no">Without TOC</option>
            </select>
          </div>
          {filteredBooks.length !== books.length && (
            <p className="mt-4 text-gray-600">
              Showing {filteredBooks.length} of {books.length} books
            </p>
          )}
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                onClick={() => handleBookClick(book.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">{book.title}</h3>
                </div>
                
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Author:</span> {book.author}
                </p>
                
                <p className="text-gray-500 text-sm mb-4 truncate">
                  <span className="font-medium">File:</span> {book.original_filename}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 text-sm">
                    {book.total_pages} pages
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    book.has_toc_extracted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {book.has_toc_extracted ? 'TOC Available' : 'No TOC'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    Uploaded: {formatDate(book.uploaded_at)}
                  </span>
                  {book.chapter_count > 0 && (
                    <span className="text-blue-600 text-sm font-medium">
                      {book.chapter_count} chapters
                    </span>
                  )}
                </div>
                
                <button 
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookClick(book.id);
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Upload Textbook</h2>
              <button
                onClick={closeUploadModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {uploadSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                <p className="font-medium">Success!</p>
                <p>Textbook uploaded successfully. Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit}>
                {uploadError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <p className="font-medium">Error</p>
                    <p>{uploadError}</p>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
                    PDF File *
                  </label>
                  <input
                    type="file"
                    id="file"
                    accept="application/pdf"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={uploadLoading}
                  />
                  {uploadFile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., GATE Data Analysis"
                    disabled={uploadLoading}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="author">
                    Author *
                  </label>
                  <input
                    type="text"
                    id="author"
                    value={uploadAuthor}
                    onChange={(e) => setUploadAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., John Doe"
                    disabled={uploadLoading}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeUploadModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={uploadLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={uploadLoading || !uploadFile || !uploadTitle || !uploadAuthor}
                  >
                    {uploadLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;