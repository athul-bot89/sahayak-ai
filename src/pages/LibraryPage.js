import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LibraryPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterTOC, setFilterTOC] = useState('');

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
          <h1 className="text-4xl font-bold mb-4">Digital Library</h1>
          <p className="text-lg">
            Browse and explore our collection of {books.length} textbooks and resources
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by title, author, or filename..."
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
    </div>
  );
};

export default LibraryPage;