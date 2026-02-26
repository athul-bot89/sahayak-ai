import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SimplePdfViewer from './SimplePdfViewer';

const ChaptersSection = ({ textbookId, book, onChapterClick }) => {
  const { t } = useTranslation();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [chapterDetails, setChapterDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [editingChapter, setEditingChapter] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    start_page: 1,
    end_page: 1
  });
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [isSelectingPages, setIsSelectingPages] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deletingChapter, setDeletingChapter] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState({});
  const [summaryModal, setSummaryModal] = useState({ show: false, data: null });
  const [generatingWorksheet, setGeneratingWorksheet] = useState({});
  const [worksheetModal, setWorksheetModal] = useState({ show: false, data: null });
  const [worksheetSettings, setWorksheetSettings] = useState({ numQuestions: 10 });
  const [showWorksheetSettings, setShowWorksheetSettings] = useState(false);
  const [selectedChapterForWorksheet, setSelectedChapterForWorksheet] = useState(null);
  
  // Chat state management
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedChapterForChat, setSelectedChapterForChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [includeContext, setIncludeContext] = useState(true);

  useEffect(() => {
    // Fetch chapters when component mounts or textbook changes
    const fetchChapters = async () => {
      if (!textbookId) {
        console.log('No textbookId provided, skipping fetch');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching chapters for textbook ID: ${textbookId}`);
        const response = await fetch(
          `http://localhost:8000/api/v1/chapters/textbook/${textbookId}`,
          {
            headers: {
              'accept': 'application/json'
            }
          }
        );
        
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // No chapters found - this is okay
            console.log('No chapters found (404)');
            setChapters([]);
            return;
          }
          throw new Error(`Failed to fetch chapters: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.length} chapters:`, data);
        
        // Validate and process the chapter data
        if (Array.isArray(data)) {
          // Ensure each chapter has the expected properties
          const processedChapters = data.map((chapter, index) => ({
            ...chapter,
            // Ensure chapter_number exists (fallback to number or index)
            chapter_number: chapter.chapter_number || chapter.number || (index + 1),
            // Ensure required properties have defaults
            start_page: chapter.start_page || 1,
            end_page: chapter.end_page || 1,
            title: chapter.title || `Chapter ${chapter.chapter_number || chapter.number || (index + 1)}`
          }));
          setChapters(processedChapters);
        } else {
          console.error('Unexpected response format:', data);
          setChapters([]);
        }
      } catch (err) {
        console.error('Error fetching chapters:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [textbookId, book?.chapter_count]);

  // Separate fetchChapters function for manual retry button
  const fetchChapters = async () => {
    if (!textbookId) {
      console.log('No textbookId provided, skipping fetch');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching chapters for textbook ID: ${textbookId}`);
      const response = await fetch(
        `http://localhost:8000/api/v1/chapters/textbook/${textbookId}`,
        {
          headers: {
            'accept': 'application/json'
          }
        }
      );
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No chapters found - this is okay
          console.log('No chapters found (404)');
          setChapters([]);
          return;
        }
        throw new Error(`Failed to fetch chapters: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.length} chapters:`, data);
      
      // Validate and process the chapter data
      if (Array.isArray(data)) {
        // Ensure each chapter has the expected properties
        const processedChapters = data.map((chapter, index) => ({
          ...chapter,
          // Ensure chapter_number exists (fallback to number or index)
          chapter_number: chapter.chapter_number || chapter.number || (index + 1),
          // Ensure required properties have defaults
          start_page: chapter.start_page || 1,
          end_page: chapter.end_page || 1,
          title: chapter.title || `Chapter ${chapter.chapter_number || chapter.number || (index + 1)}`
        }));
        setChapters(processedChapters);
      } else {
        console.error('Unexpected response format:', data);
        setChapters([]);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapterDetails = async (chapterId) => {
    // Don't fetch if already have details
    if (chapterDetails[chapterId]) {
      return;
    }
    
    try {
      setLoadingDetails(prev => ({ ...prev, [chapterId]: true }));
      
      const response = await fetch(
        `http://localhost:8000/api/v1/chapters/${chapterId}`,
        {
          headers: {
            'accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chapter details: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process the data to exclude or truncate the extracted_text
      const processedData = {
        ...data,
        // Create a summary of extracted_text instead of showing the full text
        textPreview: data.extracted_text ? 
          (data.extracted_text.length > 200 ? 
            data.extracted_text.substring(0, 200) + '...' : 
            data.extracted_text) : 
          null,
        // Count text statistics
        textStats: data.extracted_text ? {
          totalLength: data.extracted_text.length,
          wordCount: data.extracted_text.split(/\s+/).length,
          pageCount: (data.extracted_text.match(/--- Page \d+ ---/g) || []).length
        } : null
      };
      
      // Don't store the full extracted_text in state
      delete processedData.extracted_text;
      
      setChapterDetails(prev => ({ ...prev, [chapterId]: processedData }));
    } catch (err) {
      console.error(`Error fetching chapter ${chapterId} details:`, err);
      setChapterDetails(prev => ({ 
        ...prev, 
        [chapterId]: { error: err.message } 
      }));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [chapterId]: false }));
    }
  };

  const toggleChapter = async (chapterId) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
        // Fetch chapter details when expanding
        fetchChapterDetails(chapterId);
      }
      return newSet;
    });
  };

  const handleChapterClick = (chapter) => {
    if (onChapterClick) {
      onChapterClick(chapter);
    }
  };

  // Handle edit chapter click
  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setEditFormData({
      title: chapter.title,
      start_page: chapter.start_page,
      end_page: chapter.end_page
    });
    setShowEditModal(true);
  };

  // Handle delete chapter
  const handleDeleteChapter = async (chapter) => {
    try {
      setDeletingChapter(chapter.id);
      
      const response = await fetch(
        `http://localhost:8000/api/v1/chapters/${chapter.id}`,
        {
          method: 'DELETE',
          headers: {
            'accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to delete chapter: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Chapter deleted successfully:', result);

      // Remove the deleted chapter from the list
      setChapters(prevChapters => prevChapters.filter(ch => ch.id !== chapter.id));
      
      // Clean up expanded state and details
      setExpandedChapters(prev => {
        const newSet = new Set(prev);
        newSet.delete(chapter.id);
        return newSet;
      });
      
      setChapterDetails(prev => {
        const newDetails = { ...prev };
        delete newDetails[chapter.id];
        return newDetails;
      });

      // Show success message (you can add a toast notification here)
      alert(`Chapter "${chapter.title}" deleted successfully`);
      
    } catch (err) {
      console.error('Error deleting chapter:', err);
      alert(`Failed to delete chapter: ${err.message}`);
    } finally {
      setDeletingChapter(null);
      setShowDeleteConfirm(false);
    }
  };

  const confirmDeleteChapter = (chapter) => {
    setDeletingChapter(chapter);
    setShowDeleteConfirm(true);
  };

  // Handle generate summary
  const handleGenerateSummary = async (chapter) => {
    try {
      setGeneratingSummary(prev => ({ ...prev, [chapter.id]: true }));
      
      const response = await fetch(
        `http://localhost:8000/api/v1/chapters/${chapter.id}/generate-summary`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to generate summary: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Summary generated successfully:', result);

      // Update the chapter details with the new summary
      setChapterDetails(prev => ({
        ...prev,
        [chapter.id]: {
          ...prev[chapter.id],
          summary: result.summary,
          key_concepts: result.key_concepts,
          has_summary: true
        }
      }));

      // Update the chapter in the chapters list
      setChapters(prevChapters => 
        prevChapters.map(ch => 
          ch.id === chapter.id 
            ? { ...ch, summary: result.summary, has_summary: true }
            : ch
        )
      );

      // Show the summary in a modal
      setSummaryModal({
        show: true,
        data: {
          chapterTitle: result.chapter_title || chapter.title,
          chapterNumber: chapter.chapter_number || chapter.number,
          summary: result.summary,
          keyConcepts: result.key_concepts || []
        }
      });
      
    } catch (err) {
      console.error('Error generating summary:', err);
      alert(`Failed to generate summary: ${err.message}`);
    } finally {
      setGeneratingSummary(prev => ({ ...prev, [chapter.id]: false }));
    }
  };

  // Handle generate worksheet
  // Handle opening chat for a chapter
  const handleOpenChat = (chapter) => {
    setSelectedChapterForChat(chapter);
    setShowChatModal(true);
    setChatMessages([]);
    setCurrentMessage('');
    setChatError(null);
  };

  // Handle sending chat message
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isSendingMessage || !selectedChapterForChat) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    setIsSendingMessage(true);
    setChatError(null);

    // Add user message to chat
    const newUserMessage = {
      type: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      // Prepare conversation history for API
      const conversationHistory = chatMessages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Use the chat endpoint
      const response = await fetch(
        `http://localhost:8000/api/v1/chapters/${selectedChapterForChat.id}/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            question: userMessage,
            include_context: includeContext,
            conversation_history: conversationHistory
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to get response: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage = {
        type: 'assistant',
        content: data.answer,
        timestamp: data.timestamp || new Date().toISOString(),
        relatedConcepts: data.related_concepts,
        confidenceScore: data.confidence_score
      };
      setChatMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error('Error sending message:', err);
      setChatError(err.message);
      
      // Add error message to chat
      const errorMessage = {
        type: 'error',
        content: `Failed to get response: ${err.message}`,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle Ask a Question (single question mode)
  // eslint-disable-next-line no-unused-vars
  const handleAskQuestion = async (chapter, question) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/chapters/${chapter.id}/ask-question`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify({
            question: question,
            include_context: true,
            conversation_history: []
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to get answer: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error asking question:', err);
      throw err;
    }
  };

  const handleGenerateWorksheet = async (chapter, numQuestions = 10) => {
    try {
      setGeneratingWorksheet(prev => ({ ...prev, [chapter.id]: true }));
      
      const response = await fetch(
        `http://localhost:8000/api/v1/chapters/${chapter.id}/generate-worksheet?num_questions=${numQuestions}`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to generate worksheet: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Worksheet generated successfully:', result);

      // Show the worksheet in a modal
      setWorksheetModal({
        show: true,
        data: {
          chapterTitle: result.chapter_title || chapter.title,
          chapterNumber: chapter.chapter_number || chapter.number,
          chapterId: result.chapter_id,
          totalQuestions: result.total_questions,
          questions: result.questions || [],
          generatedAt: result.generated_at
        }
      });
      
    } catch (err) {
      console.error('Error generating worksheet:', err);
      alert(`Failed to generate worksheet: ${err.message}`);
    } finally {
      setGeneratingWorksheet(prev => ({ ...prev, [chapter.id]: false }));
    }
  };

  // Handle page selection from PDF viewer
  const handlePageSelection = (startPage, endPage) => {
    setEditFormData(prev => ({
      ...prev,
      start_page: startPage,
      end_page: endPage
    }));
    setShowPdfViewer(false);
    setIsSelectingPages(false);
  };

  // Submit chapter update
  const handleUpdateChapter = async () => {
    if (!editingChapter) return;

    try {
      setUpdateLoading(true);
      
      const response = await fetch(
        `http://localhost:8000/api/v1/chapters/${editingChapter.id}`,
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: editFormData.title,
            start_page: editFormData.start_page,
            end_page: editFormData.end_page
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update chapter: ${response.status} ${response.statusText}`);
      }

      const updatedChapter = await response.json();
      
      // Update the chapter in the local state
      setChapters(prevChapters => 
        prevChapters.map(ch => 
          ch.id === editingChapter.id ? { ...ch, ...updatedChapter } : ch
        )
      );

      // Update chapter details if it was already loaded
      if (chapterDetails[editingChapter.id]) {
        setChapterDetails(prev => ({
          ...prev,
          [editingChapter.id]: { ...prev[editingChapter.id], ...updatedChapter }
        }));
      }

      // Close modal
      setShowEditModal(false);
      setEditingChapter(null);
      
      // Show success message (optional)
      console.log('Chapter updated successfully');
    } catch (err) {
      console.error('Error updating chapter:', err);
      alert(`Failed to update chapter: ${err.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Placeholder UI - will be populated when chapters data is available
  return (
    <div className="chapters-section bg-white rounded-lg shadow-lg p-6">
      {/* Edit Chapter Modal */}
      {showEditModal && editingChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Edit Chapter {editingChapter.chapter_number || editingChapter.number}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingChapter(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chapter Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter chapter title"
                />
              </div>

              {/* Page Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page Range
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={editFormData.start_page}
                      onChange={(e) => setEditFormData(prev => ({ 
                        ...prev, 
                        start_page: parseInt(e.target.value) || 1 
                      }))}
                      min="1"
                      max={book?.total_pages || 1000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Start page"
                    />
                  </div>
                  <span className="text-gray-500">to</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={editFormData.end_page}
                      onChange={(e) => setEditFormData(prev => ({ 
                        ...prev, 
                        end_page: parseInt(e.target.value) || 1 
                      }))}
                      min={editFormData.start_page}
                      max={book?.total_pages || 1000}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="End page"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPdfViewer(true);
                    setIsSelectingPages(true);
                    setShowEditModal(false);
                  }}
                  className="mt-2 w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  Select Pages from PDF
                </button>
              </div>

              {/* Current Selection Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Current selection:</span> Pages {editFormData.start_page} - {editFormData.end_page} 
                  ({editFormData.end_page - editFormData.start_page + 1} pages total)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingChapter(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateChapter}
                  disabled={updateLoading || !editFormData.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {updateLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Update Chapter'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer for Page Selection */}
      {showPdfViewer && isSelectingPages && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
          <SimplePdfViewer 
            textbookId={textbookId}
            totalPages={book?.total_pages || 100}
            onClose={() => {
              setShowPdfViewer(false);
              setIsSelectingPages(false);
              setShowEditModal(true);
            }}
            selectionMode={true}
            initialStartPage={editFormData.start_page}
            initialEndPage={editFormData.end_page}
            onPageRangeSelect={(startPage, endPage) => {
              handlePageSelection(startPage, endPage);
              setShowEditModal(true);
            }}
          />
        </div>
      )}

      {/* Worksheet Settings Modal */}
      {showWorksheetSettings && selectedChapterForWorksheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Worksheet Settings
              </h3>
              <button
                onClick={() => {
                  setShowWorksheetSettings(false);
                  setSelectedChapterForWorksheet(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm font-semibold text-gray-800">
                  Chapter {selectedChapterForWorksheet.chapter_number || selectedChapterForWorksheet.number}: {selectedChapterForWorksheet.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Pages: {selectedChapterForWorksheet.start_page} - {selectedChapterForWorksheet.end_page}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      id="numQuestions"
                      min="1"
                      max="20"
                      value={worksheetSettings.numQuestions}
                      onChange={(e) => setWorksheetSettings({ ...worksheetSettings, numQuestions: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={worksheetSettings.numQuestions}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= 20) {
                          setWorksheetSettings({ ...worksheetSettings, numQuestions: val });
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Choose between 1 and 20 questions</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Question Types</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                    <p>• Multiple Choice Questions</p>
                    <p>• True/False Questions</p>
                    <p>• Short Answer Questions</p>
                    <p>• Essay Questions</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> The worksheet will be generated based on the chapter content. Questions will vary in difficulty (Easy, Medium, Hard) and type.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowWorksheetSettings(false);
                  setSelectedChapterForWorksheet(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleGenerateWorksheet(selectedChapterForWorksheet, worksheetSettings.numQuestions);
                  setShowWorksheetSettings(false);
                  setSelectedChapterForWorksheet(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                Generate Worksheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Confirm Delete
              </h3>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingChapter(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the following chapter?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <p className="font-semibold text-gray-800">
                  Chapter {deletingChapter.chapter_number || deletingChapter.number}: {deletingChapter.title}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Pages: {deletingChapter.start_page} - {deletingChapter.end_page}
                </p>
              </div>
              <p className="text-sm text-red-600 mt-3">
                <strong>Warning:</strong> This action cannot be undone. All associated files and data will be permanently deleted.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingChapter(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChapter(deletingChapter)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {summaryModal.show && summaryModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Chapter {summaryModal.data.chapterNumber} Summary
                </h3>
                <p className="text-sm text-gray-600 mt-1">{summaryModal.data.chapterTitle}</p>
              </div>
              <button
                onClick={() => setSummaryModal({ show: false, data: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Summary Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Summary
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {summaryModal.data.summary}
                  </p>
                </div>
              </div>

              {/* Key Concepts Section */}
              {summaryModal.data.keyConcepts && summaryModal.data.keyConcepts.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    Key Concepts
                  </h4>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <ul className="space-y-2">
                      {summaryModal.data.keyConcepts.map((concept, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2 mt-0.5">•</span>
                          <span className="text-gray-700">{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSummaryModal({ show: false, data: null })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worksheet Modal */}
      {worksheetModal.show && worksheetModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Chapter {worksheetModal.data.chapterNumber} Worksheet
                </h3>
                <p className="text-sm text-gray-600 mt-1">{worksheetModal.data.chapterTitle}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Generated on {new Date(worksheetModal.data.generatedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setWorksheetModal({ show: false, data: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                  {worksheetModal.data.totalQuestions} Questions
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {worksheetModal.data.questions.map((question, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded">
                        Q{index + 1}
                      </span>
                      <div className="flex space-x-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                          {question.question_type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-800 font-medium mb-3">{question.question}</p>

                    {/* Options for multiple choice and true/false */}
                    {question.options && question.options.length > 0 && (
                      <div className="ml-4 mb-3">
                        {question.question_type === 'true_false' ? (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <label key={optIndex} className="flex items-center space-x-2">
                                <input type="radio" name={`question-${index}`} className="text-blue-600" />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <ol className="list-decimal list-inside space-y-2">
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex} className="text-gray-700">{option}</li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}

                    {/* Answer area for short answer and essay */}
                    {(question.question_type === 'short_answer' || question.question_type === 'essay') && (
                      <div className="ml-4">
                        {question.question_type === 'short_answer' ? (
                          <input 
                            type="text" 
                            placeholder="Enter your answer here..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <textarea
                            rows="4"
                            placeholder="Write your answer here..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    )}

                    {/* Show Answer Button */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Show Answer
                      </summary>
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          <strong>Correct Answer:</strong> {question.correct_answer}
                        </p>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Export to PDF or print functionality can be added here
                  window.print();
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                Print Worksheet
              </button>
              <button
                onClick={() => setWorksheetModal({ show: false, data: null })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {t('chapters.title', 'Chapters')}
        </h2>
        <div className="flex items-center space-x-2">
          {book?.has_toc_extracted && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {t('chapters.tocExtracted', 'TOC Extracted')}
            </span>
          )}
          <button
            onClick={fetchChapters}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh chapters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">{t('chapters.loading', 'Loading chapters...')}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
          <p className="font-semibold">{t('chapters.error', 'Error loading chapters')}</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* No Chapters State */}
      {!loading && !error && chapters.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
            </path>
          </svg>
          <p className="mt-3 text-gray-600">
            {book?.has_toc_extracted 
              ? t('chapters.noChapters', 'No chapters found in this textbook')
              : t('chapters.tocNotExtracted', 'Table of Contents needs to be extracted first')}
          </p>
          {!book?.has_toc_extracted && (
            <p className="mt-2 text-sm text-gray-500">
              {t('chapters.extractTocHint', 'Use the "Set Table of Contents" button to extract chapters')}
            </p>
          )}
          {book?.has_toc_extracted && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">
                TOC has been extracted but chapters are not created yet.
              </p>
              <button
                onClick={async () => {
                  if (onChapterClick) {
                    // Trigger chapter processing through parent component
                    onChapterClick({ action: 'process_chapters' });
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Process Chapters from TOC
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chapters List - To be populated when data is available */}
      {!loading && !error && chapters.length > 0 && (
        <div className="space-y-2">
          {/* Chapter items will be mapped here */}
          {chapters.map((chapter) => (
            <div 
              key={chapter.id}
              className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => handleChapterClick(chapter)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center flex-1 text-left">
                  <span className="text-blue-600 font-semibold mr-3">
                    {chapter.chapter_number || chapter.number}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-800">{chapter.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('chapters.pages', 'Pages')}: {chapter.start_page} - {chapter.end_page}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {chapter.has_pdf && (
                    <span className="text-green-500" title="PDF Available">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  {chapter.has_text && (
                    <span className="text-blue-500" title="Text Extracted">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                  <span className="text-sm text-gray-400">
                    {chapter.end_page - chapter.start_page + 1} {t('chapters.pagesCount', 'pages')}
                  </span>
                  {/* Quick Ask AI Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenChat(chapter);
                    }}
                    className="px-3 py-1 bg-teal-600 text-white text-xs rounded-full hover:bg-teal-700 transition-colors flex items-center"
                    title="Ask questions about this chapter"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    Ask AI
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChapter(chapter.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg 
                      className={`w-5 h-5 text-gray-600 transform transition-transform ${
                        expandedChapters.has(chapter.id) ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
              </button>
              
              {/* Expanded chapter details */}
              {expandedChapters.has(chapter.id) && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  {loadingDetails[chapter.id] ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading chapter details...</span>
                    </div>
                  ) : chapterDetails[chapter.id]?.error ? (
                    <div className="text-red-600 text-sm">
                      Error loading details: {chapterDetails[chapter.id].error}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Chapter Status - Use details from API if available, fallback to basic chapter info */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">PDF:</span>
                          {(chapterDetails[chapter.id]?.has_pdf ?? chapter.has_pdf) ? (
                            <span className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Available
                            </span>
                          ) : (
                            <span className="text-gray-500">Not extracted</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">Text:</span>
                          {(chapterDetails[chapter.id]?.has_text ?? chapter.has_text) ? (
                            <span className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Extracted
                            </span>
                          ) : (
                            <span className="text-gray-500">Not extracted</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">Summary:</span>
                          {(chapterDetails[chapter.id]?.has_summary ?? chapter.has_summary) ? (
                            <span className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Generated
                            </span>
                          ) : (
                            <span className="text-gray-500">Not generated</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Text Statistics if available */}
                      {chapterDetails[chapter.id]?.textStats && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2">Text Statistics:</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Words:</span>
                              <span className="ml-2 font-semibold">{chapterDetails[chapter.id].textStats.wordCount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Characters:</span>
                              <span className="ml-2 font-semibold">{chapterDetails[chapter.id].textStats.totalLength.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Extracted Pages:</span>
                              <span className="ml-2 font-semibold">{chapterDetails[chapter.id].textStats.pageCount}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Text Preview if available */}
                      {chapterDetails[chapter.id]?.textPreview && (
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2">Text Preview:</h4>
                          <p className="text-sm text-gray-600 leading-relaxed font-mono whitespace-pre-wrap">
                            {chapterDetails[chapter.id].textPreview}
                          </p>
                        </div>
                      )}
                      
                      {/* Summary if available */}
                      {(chapterDetails[chapter.id]?.summary || chapter.summary) && (
                        <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-700">Summary:</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSummaryModal({
                                  show: true,
                                  data: {
                                    chapterTitle: chapter.title,
                                    chapterNumber: chapter.chapter_number || chapter.number,
                                    summary: chapterDetails[chapter.id]?.summary || chapter.summary,
                                    keyConcepts: chapterDetails[chapter.id]?.key_concepts || []
                                  }
                                });
                              }}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              View Full Summary
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                            {chapterDetails[chapter.id]?.summary || chapter.summary}
                          </p>
                          {chapterDetails[chapter.id]?.key_concepts && chapterDetails[chapter.id].key_concepts.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs font-semibold text-gray-700">Key Concepts: </span>
                              <span className="text-xs text-gray-600">
                                {chapterDetails[chapter.id].key_concepts.slice(0, 3).join(', ')}
                                {chapterDetails[chapter.id].key_concepts.length > 3 && '...'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Additional metadata from API */}
                      {chapterDetails[chapter.id]?.created_at && (
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>Created: {new Date(chapterDetails[chapter.id].created_at).toLocaleString()}</div>
                          {chapterDetails[chapter.id]?.updated_at && (
                            <div>Updated: {new Date(chapterDetails[chapter.id].updated_at).toLocaleString()}</div>
                          )}
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditChapter(chapter);
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteChapter(chapter);
                          }}
                          disabled={deletingChapter === chapter.id}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingChapter === chapter.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                        {(chapterDetails[chapter.id]?.has_pdf ?? chapter.has_pdf) && chapterDetails[chapter.id]?.pdf_path && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Download chapter PDF using the pdf_path from API
                              window.open(`http://localhost:8000/${chapterDetails[chapter.id].pdf_path}`, '_blank');
                            }}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Download Chapter PDF
                          </button>
                        )}
                        {(chapterDetails[chapter.id]?.has_text ?? chapter.has_text) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // You can implement full text view in a modal here
                              console.log('View full chapter text:', chapter.id);
                            }}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                          >
                            View Full Text
                          </button>
                        )}
                        {!(chapterDetails[chapter.id]?.has_summary || chapter.has_summary) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateSummary(chapter);
                            }}
                            disabled={generatingSummary[chapter.id]}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {generatingSummary[chapter.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                                Generate Summary
                              </>
                            )}
                          </button>
                        )}
                        {(chapterDetails[chapter.id]?.has_summary || chapter.has_summary) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateSummary(chapter);
                            }}
                            disabled={generatingSummary[chapter.id]}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {generatingSummary[chapter.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Regenerating...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Regenerate Summary
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChapterForWorksheet(chapter);
                            setShowWorksheetSettings(true);
                          }}
                          disabled={generatingWorksheet[chapter.id]}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingWorksheet[chapter.id] ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                              </svg>
                              Generate Worksheet
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenChat(chapter);
                          }}
                          className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                          </svg>
                          Ask Questions
                        </button>
                        {generatingSummary[chapter.id] && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // You can implement summary generation here
                              console.log('Generate summary for chapter:', chapter.id);
                            }}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                          >
                            Generate Summary
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedChapterForChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Chat about Chapter {selectedChapterForChat.chapter_number || selectedChapterForChat.number}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{selectedChapterForChat.title}</p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={includeContext}
                    onChange={(e) => setIncludeContext(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-gray-700">Use chapter context</span>
                </label>
                <button
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedChapterForChat(null);
                    setChatMessages([]);
                    setCurrentMessage('');
                    setChatError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                  <p className="text-gray-500">Start a conversation by asking a question about this chapter</p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600">Example questions:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {[
                        "What are the key concepts in this chapter?",
                        "Can you summarize the main points?",
                        "Explain the most important formula",
                        "What should I focus on for exams?"
                      ].map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentMessage(example)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-lg px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.type === 'assistant' && (
                      <div className="flex items-start space-x-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <span className="font-semibold text-gray-700">AI Assistant</span>
                        {message.confidenceScore && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {Math.round(message.confidenceScore * 100)}% confident
                          </span>
                        )}
                      </div>
                    )}
                    {message.type === 'user' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span className="font-semibold text-white/90">You</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.relatedConcepts && message.relatedConcepts.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-sm font-semibold mb-1">Related Concepts:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.relatedConcepts.map((concept, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isSendingMessage && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="animate-bounce w-2 h-2 bg-gray-600 rounded-full"></div>
                      <div className="animate-bounce w-2 h-2 bg-gray-600 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                      <div className="animate-bounce w-2 h-2 bg-gray-600 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Area */}
            <div className="border-t border-gray-200 p-4">
              {chatError && (
                <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-md text-sm text-red-700">
                  {chatError}
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your question here..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSendingMessage}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isSendingMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSendingMessage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                      </svg>
                      Send
                    </>
                  )}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Press Enter to send • The AI will use chapter content to provide accurate answers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Statistics - Optional */}
      {book && book.has_toc_extracted && book.chapter_count > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{book.chapter_count}</p>
              <p className="text-sm text-gray-600">{t('chapters.totalChapters', 'Total Chapters')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {book.toc_end_page - book.toc_start_page + 1}
              </p>
              <p className="text-sm text-gray-600">{t('chapters.tocPages', 'TOC Pages')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{book.total_pages}</p>
              <p className="text-sm text-gray-600">{t('chapters.totalPages', 'Total Pages')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Math.round((book.total_pages / book.chapter_count))}
              </p>
              <p className="text-sm text-gray-600">{t('chapters.avgPagesPerChapter', 'Avg Pages/Chapter')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChaptersSection;