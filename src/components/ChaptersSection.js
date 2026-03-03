import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SimplePdfViewer from './SimplePdfViewer';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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

  // Study Schedule state management
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleChapters, setScheduleChapters] = useState([]);
  const [scheduleSettings, setScheduleSettings] = useState({
    study_hours_per_day: 2.0,
    include_weekends: true,
    break_days: [],
    start_date: new Date().toISOString().split('T')[0], // Today's date
    exam_date: '', // Optional exam date
    auto_schedule: false // Auto-scheduling feature
  });
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [showScheduleResult, setShowScheduleResult] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

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
      alert(t('chapters.deleteSuccess', { title: chapter.title }));
      
    } catch (err) {
      console.error('Error deleting chapter:', err);
      alert(t('chapters.deleteFailed', { error: err.message }));
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
      alert(t('chapters.summaryFailed', { error: err.message }));
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
      alert(t('chapters.worksheetFailed', { error: err.message }));
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
      alert(t('chapters.updateFailed', { error: err.message }));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Download schedule function - Enhanced PDF generation with website-matching styles
  const downloadSchedule = (format = 'json') => {
    if (!scheduleResult) return;

    const fileName = `study_schedule_${book?.title || 'textbook'}_${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'json') {
      // Download as JSON
      const dataStr = JSON.stringify(scheduleResult, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${fileName}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'pdf') {
      // Enhanced PDF generation with styled layout matching website
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });
      
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 40;
      let pageNumber = 1;
      
      // Design constants
      const margin = {
        left: 40,
        right: 40,
        top: 40,
        bottom: 60
      };
      const maxWidth = pageWidth - margin.left - margin.right;
      const colors = {
        primary: { r: 79, g: 70, b: 229 }, // Indigo-600
        success: { r: 34, g: 197, b: 94 }, // Green-600
        warning: { r: 245, g: 158, b: 11 }, // Amber-600
        danger: { r: 239, g: 68, b: 68 }, // Red-500
        purple: { r: 147, g: 51, b: 234 }, // Purple-600
        blue: { r: 37, g: 99, b: 235 }, // Blue-600
        lightBg: { r: 249, g: 250, b: 251 }, // Gray-50
        border: { r: 229, g: 231, b: 235 }, // Gray-200
        text: { r: 31, g: 41, b: 55 }, // Gray-800
        textLight: { r: 107, g: 114, b: 128 } // Gray-500
      };

      // Helper functions
      const addWatermark = () => {
        doc.setFontSize(60);
        doc.setTextColor(200, 200, 200);
        doc.setFont(undefined, 'bold');
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        // Center the watermark
        const watermarkText = 'Sahayak AI';
        const textWidth = doc.getTextWidth(watermarkText);
        doc.text(watermarkText, (pageWidth - textWidth) / 2, pageHeight / 2, { angle: -45 });
        doc.restoreGraphicsState();
        doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      };

      const addPageNumber = () => {
        doc.setFontSize(9);
        doc.setTextColor(colors.textLight.r, colors.textLight.g, colors.textLight.b);
        doc.setFont(undefined, 'normal');
        const pageText = `Page ${pageNumber}`;
        doc.text(pageText, pageWidth / 2, pageHeight - 30, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin.left, pageHeight - 30);
        doc.setTextColor(colors.text.r, colors.text.g, colors.text.b);
      };

      const checkAndAddPage = (requiredSpace = 100) => {
        if (yPosition + requiredSpace > pageHeight - margin.bottom) {
          addPageNumber();
          doc.addPage();
          pageNumber++;
          addWatermark();
          yPosition = margin.top;
          return true;
        }
        return false;
      };

      const addColoredBox = (x, y, width, height, color, opacity = 0.1) => {
        doc.saveGraphicsState();
        doc.setFillColor(color.r, color.g, color.b);
        doc.setGState(new doc.GState({ opacity }));
        doc.roundedRect(x, y, width, height, 6, 6, 'F');
        doc.restoreGraphicsState();
      };

      const addBorder = (x, y, width, height, color = colors.border, lineWidth = 1) => {
        doc.setDrawColor(color.r, color.g, color.b);
        doc.setLineWidth(lineWidth);
        doc.roundedRect(x, y, width, height, 6, 6, 'S');
      };

      const addStyledText = (text, x, y, fontSize = 11, fontStyle = 'normal', color = colors.text, options = {}) => {
        doc.setFontSize(fontSize);
        doc.setFont(undefined, fontStyle);
        doc.setTextColor(color.r, color.g, color.b);
        
        if (options.maxWidth) {
          const lines = doc.splitTextToSize(text, options.maxWidth);
          let currentY = y;
          lines.forEach(line => {
            doc.text(line, x, currentY, options);
            currentY += fontSize + 2;
          });
          return currentY - y;
        } else {
          doc.text(text, x, y, options);
          return fontSize + 2;
        }
      };

      // Start PDF generation
      addWatermark();

      // Header with gradient effect
      addColoredBox(margin.left, yPosition, maxWidth, 80, colors.primary, 0.05);
      addColoredBox(margin.left, yPosition, maxWidth, 80, colors.success, 0.03);
      
      // Title
      yPosition += 30;
      addStyledText('Your Study Schedule', pageWidth / 2, yPosition, 24, 'bold', colors.text, { align: 'center' });
      yPosition += 25;
      
      // Date range
      if (scheduleResult.start_date && scheduleResult.end_date) {
        const dateText = `From ${new Date(scheduleResult.start_date).toLocaleDateString()} to ${new Date(scheduleResult.end_date).toLocaleDateString()}`;
        addStyledText(dateText, pageWidth / 2, yPosition, 12, 'normal', colors.textLight, { align: 'center' });
      }
      yPosition += 35;

      // Book title
      addStyledText(`Book: ${book?.title || 'Textbook'}`, margin.left, yPosition, 13, 'bold');
      yPosition += 25;

      // Conflicts/Warnings Section
      if (scheduleResult.conflicts && scheduleResult.conflicts.length > 0) {
        checkAndAddPage(100 + scheduleResult.conflicts.length * 20);
        
        // Red warning box
        const conflictHeight = 40 + scheduleResult.conflicts.length * 18;
        addColoredBox(margin.left, yPosition, maxWidth, conflictHeight, colors.danger, 0.05);
        addBorder(margin.left, yPosition, maxWidth, conflictHeight, { r: 252, g: 165, b: 165 });
        
        yPosition += 25;
        addStyledText('⚠ Scheduling Conflicts', margin.left + 15, yPosition, 14, 'bold', colors.danger);
        yPosition += 20;
        
        scheduleResult.conflicts.forEach(conflict => {
          addStyledText(`• ${conflict}`, margin.left + 15, yPosition, 10, 'normal', colors.danger, { maxWidth: maxWidth - 30 });
          yPosition += 18;
        });
        yPosition += 15;
      }

      // Recommendations Section  
      if (scheduleResult.recommendations && scheduleResult.recommendations.length > 0) {
        checkAndAddPage(100 + scheduleResult.recommendations.length * 20);
        
        // Blue info box
        const recHeight = 40 + scheduleResult.recommendations.length * 18;
        addColoredBox(margin.left, yPosition, maxWidth, recHeight, colors.blue, 0.05);
        addBorder(margin.left, yPosition, maxWidth, recHeight, { r: 147, g: 197, b: 253 });
        
        yPosition += 25;
        addStyledText('ⓘ Recommendations', margin.left + 15, yPosition, 14, 'bold', colors.blue);
        yPosition += 20;
        
        scheduleResult.recommendations.forEach(rec => {
          addStyledText(`• ${rec}`, margin.left + 15, yPosition, 10, 'normal', colors.blue, { maxWidth: maxWidth - 30 });
          yPosition += 18;
        });
        yPosition += 15;
      }

      // Schedule Overview Section
      checkAndAddPage(180);
      addStyledText('Schedule Overview', margin.left, yPosition, 18, 'bold');
      yPosition += 30;

      // Stats cards in grid
      const cardWidth = (maxWidth - 20) / 3;
      const cardHeight = 70;
      
      // Total Chapters card
      addColoredBox(margin.left, yPosition, cardWidth, cardHeight, colors.purple, 0.1);
      addBorder(margin.left, yPosition, cardWidth, cardHeight, colors.purple, 0.5);
      addStyledText(String(scheduleResult.total_chapters), margin.left + cardWidth/2, yPosition + 35, 24, 'bold', colors.purple, { align: 'center' });
      addStyledText('Total Chapters', margin.left + cardWidth/2, yPosition + 55, 11, 'normal', colors.textLight, { align: 'center' });
      
      // Total Study Days card
      const totalDays = scheduleResult.schedule?.reduce((sum, ch) => sum + (ch.estimated_study_days || 0), 0) || 0;
      addColoredBox(margin.left + cardWidth + 10, yPosition, cardWidth, cardHeight, colors.success, 0.1);
      addBorder(margin.left + cardWidth + 10, yPosition, cardWidth, cardHeight, colors.success, 0.5);
      addStyledText(String(totalDays), margin.left + cardWidth + 10 + cardWidth/2, yPosition + 35, 24, 'bold', colors.success, { align: 'center' });
      addStyledText('Total Study Days', margin.left + cardWidth + 10 + cardWidth/2, yPosition + 55, 11, 'normal', colors.textLight, { align: 'center' });
      
      // Hours per Day card
      const hoursPerDay = scheduleResult.schedule?.[0]?.daily_hours || 0;
      addColoredBox(margin.left + (cardWidth + 10) * 2, yPosition, cardWidth, cardHeight, colors.blue, 0.1);
      addBorder(margin.left + (cardWidth + 10) * 2, yPosition, cardWidth, cardHeight, colors.blue, 0.5);
      addStyledText(String(hoursPerDay), margin.left + (cardWidth + 10) * 2 + cardWidth/2, yPosition + 35, 24, 'bold', colors.blue, { align: 'center' });
      addStyledText('Hours/Day', margin.left + (cardWidth + 10) * 2 + cardWidth/2, yPosition + 55, 11, 'normal', colors.textLight, { align: 'center' });
      
      yPosition += cardHeight + 30;

      // Chapter Schedule Cards
      checkAndAddPage(50);
      addStyledText('Chapter Schedule', margin.left, yPosition, 18, 'bold');
      yPosition += 25;

      scheduleResult.schedule?.forEach((chapter, index) => {
        checkAndAddPage(140);
        
        // Chapter card with border
        const chapterCardHeight = 120 + (chapter.study_tips?.length > 0 ? 30 : 0);
        addColoredBox(margin.left, yPosition, maxWidth, chapterCardHeight, colors.lightBg, 0.3);
        addBorder(margin.left, yPosition, maxWidth, chapterCardHeight);
        
        // Chapter name and priority badge
        yPosition += 20;
        addStyledText(`${index + 1}. ${chapter.chapter_name}`, margin.left + 15, yPosition, 13, 'bold');
        
        // Priority badge
        const priorityColors = {
          high: colors.danger,
          medium: colors.warning,
          low: colors.success
        };
        const priorityColor = priorityColors[chapter.priority] || colors.textLight;
        const badgeX = pageWidth - margin.right - 80;
        addColoredBox(badgeX, yPosition - 12, 70, 20, priorityColor, 0.2);
        addStyledText(chapter.priority?.toUpperCase() || 'MEDIUM', badgeX + 35, yPosition, 9, 'bold', priorityColor, { align: 'center' });
        
        yPosition += 25;
        
        // Date information
        addStyledText(`📅 Start: ${new Date(chapter.suggested_start_date).toLocaleDateString()}`, margin.left + 15, yPosition, 10, 'normal', colors.textLight);
        addStyledText(`🎯 Target: ${new Date(chapter.target_completion_date).toLocaleDateString()}`, margin.left + 200, yPosition, 10, 'normal', colors.textLight);
        yPosition += 20;
        
        // Stats in grid
        const statWidth = (maxWidth - 45) / 3;
        const statY = yPosition;
        
        // Study Days box
        addColoredBox(margin.left + 15, statY, statWidth, 35, colors.lightBg, 0.5);
        addStyledText('Study Days', margin.left + 15 + statWidth/2, statY + 12, 9, 'normal', colors.textLight, { align: 'center' });
        addStyledText(String(chapter.estimated_study_days), margin.left + 15 + statWidth/2, statY + 25, 12, 'bold', colors.text, { align: 'center' });
        
        // Daily Hours box
        addColoredBox(margin.left + 15 + statWidth + 5, statY, statWidth, 35, colors.lightBg, 0.5);
        addStyledText('Daily Hours', margin.left + 15 + statWidth + 5 + statWidth/2, statY + 12, 9, 'normal', colors.textLight, { align: 'center' });
        addStyledText(String(chapter.daily_hours), margin.left + 15 + statWidth + 5 + statWidth/2, statY + 25, 12, 'bold', colors.text, { align: 'center' });
        
        // Total Hours box
        const totalHours = (chapter.estimated_study_days * chapter.daily_hours).toFixed(1);
        addColoredBox(margin.left + 15 + (statWidth + 5) * 2, statY, statWidth, 35, colors.lightBg, 0.5);
        addStyledText('Total Hours', margin.left + 15 + (statWidth + 5) * 2 + statWidth/2, statY + 12, 9, 'normal', colors.textLight, { align: 'center' });
        addStyledText(totalHours, margin.left + 15 + (statWidth + 5) * 2 + statWidth/2, statY + 25, 12, 'bold', colors.text, { align: 'center' });
        
        yPosition += 45;
        
        // Study Tips
        if (chapter.study_tips && chapter.study_tips.length > 0) {
          doc.setDrawColor(colors.border.r, colors.border.g, colors.border.b);
          doc.setLineWidth(0.5);
          doc.line(margin.left + 15, yPosition, pageWidth - margin.right - 15, yPosition);
          yPosition += 10;
          
          addStyledText('Study Tips:', margin.left + 15, yPosition, 9, 'bold', colors.textLight);
          yPosition += 12;
          
          const tipsPerRow = 3;
          const tipWidth = (maxWidth - 30) / tipsPerRow - 5;
          chapter.study_tips.forEach((tip, tipIndex) => {
            const col = tipIndex % tipsPerRow;
            const tipX = margin.left + 15 + (tipWidth + 5) * col;
            
            addColoredBox(tipX, yPosition - 10, tipWidth, 18, colors.blue, 0.1);
            addStyledText(tip, tipX + 5, yPosition, 8, 'normal', colors.blue, { maxWidth: tipWidth - 10 });
            
            if (col === tipsPerRow - 1) {
              yPosition += 20;
            }
          });
          
          if (chapter.study_tips.length % tipsPerRow !== 0) {
            yPosition += 20;
          }
        }
        
        yPosition += 15;
      });

      // Weekly Breakdown
      if (scheduleResult.weekly_breakdown && Object.keys(scheduleResult.weekly_breakdown).length > 0) {
        checkAndAddPage(200);
        yPosition += 20;
        addStyledText('Weekly Breakdown', margin.left, yPosition, 18, 'bold');
        yPosition += 25;
        
        const weekEntries = Object.entries(scheduleResult.weekly_breakdown);
        const colWidth = (maxWidth - 10) / 2;
        let col = 0;
        let rowY = yPosition;
        
        weekEntries.forEach(([week, chapters], index) => {
          const boxX = margin.left + (colWidth + 10) * col;
          const chapterHeight = 40 + chapters.length * 15;
          
          // Week box with gradient effect
          addColoredBox(boxX, rowY, colWidth, chapterHeight, colors.purple, 0.05);
          addColoredBox(boxX, rowY, colWidth, chapterHeight, colors.primary, 0.03);
          addBorder(boxX, rowY, colWidth, chapterHeight, { r: 196, g: 181, b: 253 });
          
          addStyledText(week, boxX + 10, rowY + 20, 12, 'bold', colors.purple);
          
          let chapterY = rowY + 35;
          chapters.forEach(ch => {
            addStyledText(`• ${ch}`, boxX + 10, chapterY, 9, 'normal', colors.text, { maxWidth: colWidth - 20 });
            chapterY += 15;
          });
          
          col++;
          if (col === 2) {
            col = 0;
            rowY += chapterHeight + 10;
            if (index < weekEntries.length - 1) {
              checkAndAddPage(chapterHeight + 20);
            }
          }
        });
        
        if (col === 1) {
          yPosition = rowY + 100;
        } else {
          yPosition = rowY;
        }
      }

      // Add final page number
      addPageNumber();
      
      // Save the PDF
      doc.save(`${fileName}.pdf`);
    } else if (format === 'text') {
      // Download as formatted text
      let textContent = `STUDY SCHEDULE\n`;
      textContent += `Book: ${book?.title || 'Textbook'}\n`;
      textContent += `Generated: ${new Date().toLocaleDateString()}\n`;
      textContent += `=====================================\n\n`;
      
      // Overview
      textContent += `OVERVIEW\n`;
      textContent += `---------\n`;
      textContent += `Total Chapters: ${scheduleResult.total_chapters}\n`;
      textContent += `Total Study Days: ${scheduleResult.schedule?.reduce((sum, ch) => sum + (ch.estimated_study_days || 0), 0) || 0}\n`;
      textContent += `Daily Study Hours: ${scheduleResult.schedule?.[0]?.daily_hours || 0}\n`;
      textContent += `Target Date: ${scheduleResult.target_date}\n\n`;
      
      // Recommendations
      if (scheduleResult.recommendations?.length > 0) {
        textContent += `RECOMMENDATIONS\n`;
        textContent += `---------------\n`;
        scheduleResult.recommendations.forEach(rec => {
          textContent += `• ${rec}\n`;
        });
        textContent += `\n`;
      }
      
      // Conflicts
      if (scheduleResult.conflicts?.length > 0) {
        textContent += `CONFLICTS/WARNINGS\n`;
        textContent += `------------------\n`;
        scheduleResult.conflicts.forEach(conflict => {
          textContent += `• ${conflict}\n`;
        });
        textContent += `\n`;
      }
      
      // Chapter Schedule
      textContent += `CHAPTER SCHEDULE\n`;
      textContent += `----------------\n\n`;
      
      scheduleResult.schedule?.forEach((chapter, index) => {
        textContent += `${index + 1}. ${chapter.chapter_name}\n`;
        textContent += `   Priority: ${chapter.priority?.toUpperCase()}\n`;
        textContent += `   Start Date: ${new Date(chapter.suggested_start_date).toLocaleDateString()}\n`;
        textContent += `   Target Completion: ${new Date(chapter.target_completion_date).toLocaleDateString()}\n`;
        textContent += `   Study Days: ${chapter.estimated_study_days}\n`;
        textContent += `   Daily Hours: ${chapter.daily_hours}\n`;
        textContent += `   Pages: ${chapter.pages}\n`;
        if (chapter.topics?.length > 0) {
          textContent += `   Topics:\n`;
          chapter.topics.forEach(topic => {
            textContent += `     - ${topic}\n`;
          });
        }
        textContent += `\n`;
      });
      
      // Create and download text file
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', url);
      linkElement.setAttribute('download', `${fileName}.txt`);
      linkElement.click();
      URL.revokeObjectURL(url);
    }
  };

  // Download chapter summary as PDF - creates clean document
  const downloadChapterSummary = async (summaryData) => {
    if (!summaryData) return;

    try {
      // Show loading indication
      const originalButtonText = document.querySelector('.download-pdf-btn')?.textContent;
      const downloadButton = document.querySelector('.download-pdf-btn');
      if (downloadButton) {
        downloadButton.textContent = 'Generating PDF...';
        downloadButton.disabled = true;
      }

      // Create a temporary container with just the content
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '794px'; // A4 width at 96 DPI
      tempContainer.style.padding = '40px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      
      // Build clean content HTML
      tempContainer.innerHTML = `
        <div style="color: #1a1a1a;">
          <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #1f2937;">
            Chapter ${summaryData.chapterNumber} Summary
          </h1>
          <h2 style="font-size: 18px; color: #6b7280; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
            ${summaryData.chapterTitle}
          </h2>
          
          <div style="margin-top: 24px;">
            <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">
              Summary
            </h3>
            <div style="font-size: 14px; line-height: 1.8; color: #374151; text-align: justify; background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
              ${(summaryData.summary || 'No summary available').replace(/\n/g, '<br>')}
            </div>
          </div>
          
          ${summaryData.keyConcepts && summaryData.keyConcepts.length > 0 ? `
            <div style="margin-top: 32px;">
              <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">
                Key Concepts
              </h3>
              <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <ul style="font-size: 14px; line-height: 1.8; color: #374151; list-style: none; padding: 0; margin: 0;">
                  ${summaryData.keyConcepts.map(concept => 
                    `<li style="margin-bottom: 8px; padding-left: 20px; position: relative;">
                      <span style="position: absolute; left: 0; color: #7c3aed;">•</span>
                      ${concept}
                    </li>`
                  ).join('')}
                </ul>
              </div>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      `;
      
      // Append to body temporarily
      document.body.appendChild(tempContainer);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the clean content
      const canvas = await html2canvas(tempContainer, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: tempContainer.scrollHeight
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190; // A4 width minus margins (210 - 20)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10; // Top margin
      const pageHeight = 277; // A4 height minus margins (297 - 20)
      
      // Add the image to PDF, handling multiple pages if needed
      while (heightLeft > 0) {
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        if (heightLeft > 0) {
          position = 10 - (imgHeight - heightLeft); // Continue from where we left off
          pdf.addPage();
        }
      }
      
      // Generate filename
      const safeTitle = summaryData.chapterTitle
        .replace(/[^a-z0-9\s]/gi, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      
      const fileName = `Chapter_${summaryData.chapterNumber}_Summary_${safeTitle}.pdf`;
      
      // Save the PDF
      pdf.save(fileName);
      
      // Restore button text
      if (downloadButton) {
        downloadButton.textContent = originalButtonText || 'Download PDF';
        downloadButton.disabled = false;
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.\n\nError: ' + error.message);
      
      // Restore button if error occurs
      const downloadButton = document.querySelector('.download-pdf-btn');
      if (downloadButton) {
        downloadButton.textContent = 'Download PDF';
        downloadButton.disabled = false;
      }
    }
  };

  // Handle generate study schedule
  const handleGenerateSchedule = async () => {
    try {
      setGeneratingSchedule(true);
      setScheduleError(null);

      // Filter selected chapters only
      const selectedChapters = scheduleChapters.filter(ch => ch.isSelected);
      
      if (selectedChapters.length === 0) {
        setScheduleError('Please select at least one chapter to include in the schedule');
        setGeneratingSchedule(false);
        return;
      }

      // Validate that selected chapters have target dates if individual dates are enabled
      const validChapters = selectedChapters.filter(ch => {
        // If using auto-schedule, we don't need individual dates
        if (scheduleSettings.auto_schedule) return true;
        // Otherwise, check for target date
        return ch.target_completion_date;
      });
      
      if (!scheduleSettings.auto_schedule && validChapters.length === 0) {
        setScheduleError('Please set target completion dates for selected chapters or enable auto-scheduling');
        setGeneratingSchedule(false);
        return;
      }

      // Validate study hours
      if (scheduleSettings.study_hours_per_day <= 0 || scheduleSettings.study_hours_per_day > 24) {
        setScheduleError('Study hours per day must be between 0.5 and 24 hours');
        setGeneratingSchedule(false);
        return;
      }

      // Validate start date
      if (!scheduleSettings.start_date) {
        setScheduleError('Please select a start date for your schedule');
        setGeneratingSchedule(false);
        return;
      }
      
      // Validate estimated hours for selected chapters
      const chaptersWithoutHours = validChapters.filter(ch => !ch.estimated_hours || ch.estimated_hours <= 0);
      if (chaptersWithoutHours.length > 0) {
        setScheduleError(`Please set estimated hours for all selected chapters`);
        setGeneratingSchedule(false);
        return;
      }

      // Prepare the request body
      const requestBody = {
        chapters: validChapters.map(ch => ({
          chapter_name: ch.chapter_name,
          target_completion_date: ch.target_completion_date ? 
            new Date(ch.target_completion_date).toISOString().slice(0, -1) : null,
          estimated_hours: parseFloat(ch.estimated_hours) || 2.0,
          priority: ch.priority || 'medium',
          difficulty: ch.difficulty || 'medium'
        })),
        study_hours_per_day: parseFloat(scheduleSettings.study_hours_per_day),
        include_weekends: scheduleSettings.include_weekends,
        break_days: scheduleSettings.break_days.map(date => new Date(date).toISOString().slice(0, -1)),
        start_date: scheduleSettings.start_date ? new Date(scheduleSettings.start_date).toISOString().slice(0, -1) : null,
        exam_date: scheduleSettings.exam_date ? new Date(scheduleSettings.exam_date).toISOString().slice(0, -1) : null,
        auto_schedule: scheduleSettings.auto_schedule || false
      };

      console.log('Generating study schedule:', requestBody);

      const response = await fetch('http://localhost:8000/api/v1/schedule/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('API Error Response:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = {};
        }
        
        // Handle different error response formats
        let errorMessage = 'Failed to generate schedule';
        
        if (errorData.detail) {
          // If detail is a string, use it directly
          if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
          // If detail is an array (validation errors), format them
          else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => 
              typeof err === 'object' ? (err.msg || err.message || JSON.stringify(err)) : err
            ).join(', ');
          }
          // If detail is an object, try to extract meaningful message
          else if (typeof errorData.detail === 'object') {
            errorMessage = errorData.detail.msg || errorData.detail.message || JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = `Failed to generate schedule: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const scheduleData = await response.json();
      console.log('Schedule generated successfully:', scheduleData);

      setScheduleResult(scheduleData);
      setShowScheduleModal(false);
      setShowScheduleResult(true);
    } catch (err) {
      console.error('Error generating schedule:', err);
      // Ensure we always set a string error message
      const errorMessage = typeof err === 'string' ? err : 
                          (err.message || err.toString() || 'An unexpected error occurred');
      setScheduleError(errorMessage);
    } finally {
      setGeneratingSchedule(false);
    }
  };

  // Handle updating schedule chapter data
  const handleScheduleChapterUpdate = (index, field, value) => {
    setScheduleChapters(prev => {
      const updated = [...prev];
      
      // Handle numeric fields with validation
      if (field === 'estimated_hours') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue >= 0.5 && numValue <= 100) {
          updated[index] = { ...updated[index], [field]: numValue };
        } else if (value === '') {
          updated[index] = { ...updated[index], [field]: '' };
        }
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      
      return updated;
    });
  };
  
  // Handle selecting/deselecting chapters for schedule
  const handleToggleChapterSelection = (index) => {
    setScheduleChapters(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isSelected: !updated[index].isSelected };
      return updated;
    });
  };
  
  // Handle select/deselect all chapters
  const handleSelectAllChapters = (selectAll) => {
    setScheduleChapters(prev => 
      prev.map(ch => ({ ...ch, isSelected: selectAll }))
    );
  };

  // Handle adding a break day
  const handleAddBreakDay = (date) => {
    // Check if date already exists
    if (scheduleSettings.break_days.includes(date)) {
      setScheduleError('This date is already added as a break day');
      setTimeout(() => setScheduleError(null), 3000);
      return;
    }
    
    // Check if date is in the past
    if (new Date(date) < new Date(new Date().setHours(0,0,0,0))) {
      setScheduleError('Cannot add past dates as break days');
      setTimeout(() => setScheduleError(null), 3000);
      return;
    }
    
    setScheduleSettings(prev => ({
      ...prev,
      break_days: [...prev.break_days, date].sort()
    }));
  };

  // Handle removing a break day
  const handleRemoveBreakDay = (index) => {
    setScheduleSettings(prev => ({
      ...prev,
      break_days: prev.break_days.filter((_, i) => i !== index)
    }));
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
                {t('chapters.editChapter', { number: editingChapter.chapter_number || editingChapter.number })}
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
                  {t('chapters.chapterTitle')}
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('chapters.enterChapterTitle')}
                />
              </div>

              {/* Page Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('chapters.pageRange')}
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
                      placeholder={t('chapters.startPage')}
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
                      placeholder={t('chapters.endPage')}
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
                  {t('chapters.selectPagesFromPDF')}
                </button>
              </div>

              {/* Current Selection Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{t('chapters.currentSelection')}:</span> {t('chapters.pagesRange', { 
                    start: editFormData.start_page, 
                    end: editFormData.end_page, 
                    total: editFormData.end_page - editFormData.start_page + 1 
                  })}
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
                      {t('chapters.updating')}
                    </>
                  ) : (
                    t('chapters.updateChapter')
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
                {t('chapters.worksheetSettings')}
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
                  {t('chapters.chapter')} {selectedChapterForWorksheet.chapter_number || selectedChapterForWorksheet.number}: {selectedChapterForWorksheet.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {t('chapters.pages')}: {selectedChapterForWorksheet.start_page} - {selectedChapterForWorksheet.end_page}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('chapters.numberOfQuestions')}
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
                <strong>{t('chapters.warning')}:</strong> {t('chapters.deleteWarningMessage')}
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
                {t('chapters.deleteChapter')}
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
                  {t('chapters.chapterSummary', { number: summaryModal.data.chapterNumber })}
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
                  {t('chapters.summary')}
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
                    {t('chapters.keyConcepts')}
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
            <div className="flex justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => downloadChapterSummary(summaryModal.data)}
                className="download-pdf-btn px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                {t('chapters.downloadPdf')}
              </button>
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

      {/* Action Buttons for All Chapters */}
      {!loading && !error && chapters.length > 0 && (
        <div className="mb-4 flex justify-end space-x-3">
          <button
            onClick={() => {
              // Initialize schedule chapters with all chapters
              const initialChapters = chapters.map((ch, index) => ({
                chapter_name: ch.title,
                chapter_number: ch.chapter_number || ch.number || index + 1,
                target_completion_date: '',
                estimated_hours: Math.max(2, Math.ceil((ch.end_page - ch.start_page) * 0.3)), // Estimate based on pages
                priority: 'medium',
                difficulty: 'medium',
                isSelected: true, // Select all by default
                page_count: ch.end_page - ch.start_page + 1
              }));
              setScheduleChapters(initialChapters);
              setScheduleSettings(prev => ({
                ...prev,
                start_date: new Date().toISOString().split('T')[0],
                exam_date: '',
                auto_schedule: false,
                break_days: []
              }));
              setScheduleError(null);
              setShowScheduleModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            Create Study Schedule
          </button>
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

      {/* Study Schedule Creation Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Create Study Schedule
                </h3>
                <p className="text-sm text-gray-600 mt-1">Plan your chapter completion timeline</p>
              </div>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setScheduleError(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {scheduleError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md text-sm text-red-700">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <strong className="font-semibold">Error:</strong> {typeof scheduleError === 'string' ? scheduleError : 'An error occurred while generating the schedule. Please check your inputs and try again.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Study Settings */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Study Settings</h4>
                
                {/* Date Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={scheduleSettings.start_date}
                      onChange={(e) => setScheduleSettings(prev => ({
                        ...prev,
                        start_date: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target/Exam Date (Optional)
                    </label>
                    <input
                      type="date"
                      min={scheduleSettings.start_date || new Date().toISOString().split('T')[0]}
                      value={scheduleSettings.exam_date}
                      onChange={(e) => setScheduleSettings(prev => ({
                        ...prev,
                        exam_date: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto-Schedule
                    </label>
                    <button
                      onClick={() => setScheduleSettings(prev => ({
                        ...prev,
                        auto_schedule: !prev.auto_schedule
                      }))}
                      className={`w-full px-4 py-2 rounded-md transition-colors flex items-center justify-center ${
                        scheduleSettings.auto_schedule
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      title="Automatically distribute chapters based on exam date and priorities"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {scheduleSettings.auto_schedule ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
                
                {/* Study Hours and Weekends Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Hours Per Day <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="range"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={scheduleSettings.study_hours_per_day}
                        onChange={(e) => setScheduleSettings(prev => ({
                          ...prev,
                          study_hours_per_day: parseFloat(e.target.value)
                        }))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="0.5"
                        max="12"
                        step="0.5"
                        value={scheduleSettings.study_hours_per_day}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0.5 && val <= 12) {
                            setScheduleSettings(prev => ({
                              ...prev,
                              study_hours_per_day: val
                            }));
                          }
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center font-semibold text-purple-600"
                      />
                      <span className="text-sm text-gray-500">hours</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Include Weekends
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setScheduleSettings(prev => ({
                          ...prev,
                          include_weekends: true
                        }))}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                          scheduleSettings.include_weekends
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setScheduleSettings(prev => ({
                          ...prev,
                          include_weekends: false
                        }))}
                        className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                          !scheduleSettings.include_weekends
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>

                {/* Break Days */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Holidays / Break Days
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      id="break-day-input"
                      min={scheduleSettings.start_date || new Date().toISOString().split('T')[0]}
                      max={scheduleSettings.exam_date || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddBreakDay(e.target.value);
                          document.getElementById('break-day-input').value = '';
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-500">Add dates when you won't study</span>
                  </div>
                  {scheduleSettings.break_days && scheduleSettings.break_days.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {scheduleSettings.break_days.map((date, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <button
                            onClick={() => handleRemoveBreakDay(index)}
                            className="ml-2 text-red-500 hover:text-red-700 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Study Tips */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Tips:</strong> 
                    {scheduleSettings.auto_schedule ? 
                      " Auto-schedule will distribute chapters evenly based on their priority and difficulty levels." :
                      " Set realistic target dates for each chapter. Consider your other commitments when planning."
                    }
                  </p>
                </div>
              </div>

              {/* Chapters List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">Select Chapters to Include</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSelectAllChapters(true)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => handleSelectAllChapters(false)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Clear All
                    </button>
                    <span className="text-sm text-gray-500">
                      {scheduleChapters.filter(ch => ch.isSelected).length} of {scheduleChapters.length} selected
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scheduleChapters.map((chapter, index) => (
                    <div 
                      key={index} 
                      className={`bg-white border rounded-lg p-4 transition-all ${
                        chapter.isSelected 
                          ? 'border-purple-400 bg-purple-50' 
                          : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={chapter.isSelected}
                          onChange={() => handleToggleChapterSelection(index)}
                          className="mt-1 h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-semibold text-gray-800">
                                Chapter {chapter.chapter_number}: {chapter.chapter_name}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({chapter.page_count} pages)
                              </span>
                            </div>
                          </div>
                          
                          {chapter.isSelected && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Target Date {!scheduleSettings.auto_schedule && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                  type="date"
                                  min={scheduleSettings.start_date || new Date().toISOString().split('T')[0]}
                                  max={scheduleSettings.exam_date || ''}
                                  value={chapter.target_completion_date}
                                  onChange={(e) => handleScheduleChapterUpdate(index, 'target_completion_date', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                                  disabled={scheduleSettings.auto_schedule}
                                  title={scheduleSettings.auto_schedule ? 'Dates are auto-calculated when auto-schedule is enabled' : ''}
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Est. Hours <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="number"
                                  min="0.5"
                                  max="100"
                                  step="0.5"
                                  value={chapter.estimated_hours}
                                  onChange={(e) => handleScheduleChapterUpdate(index, 'estimated_hours', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                                  placeholder="Hours"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                                <select
                                  value={chapter.priority}
                                  onChange={(e) => handleScheduleChapterUpdate(index, 'priority', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                                <select
                                  value={chapter.difficulty || 'medium'}
                                  onChange={(e) => handleScheduleChapterUpdate(index, 'difficulty', e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="easy">Easy</option>
                                  <option value="medium">Medium</option>
                                  <option value="hard">Hard</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col space-y-3">
                {/* Helper Text */}
                <div className="text-sm text-gray-600">
                  {scheduleSettings.auto_schedule ? (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Auto-schedule enabled: Dates will be calculated based on priorities and exam date
                    </p>
                  ) : (
                    <p>Select chapters and set target completion dates for your study plan</p>
                  )}
                  {scheduleChapters.filter(ch => ch.isSelected).length > 0 && (
                    <p className="mt-1 font-medium text-purple-600">
                      Total study time: {scheduleChapters
                        .filter(ch => ch.isSelected)
                        .reduce((sum, ch) => sum + (parseFloat(ch.estimated_hours) || 0), 0)
                        .toFixed(1)} hours across {scheduleChapters.filter(ch => ch.isSelected).length} chapters
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {scheduleSettings.exam_date && (
                      <span className="text-sm text-gray-500">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Exam: {new Date(scheduleSettings.exam_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowScheduleModal(false);
                        setScheduleError(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGenerateSchedule}
                      disabled={generatingSchedule || scheduleChapters.filter(ch => ch.isSelected).length === 0}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      title={scheduleChapters.filter(ch => ch.isSelected).length === 0 ? 'Please select at least one chapter' : ''}
                    >
                      {generatingSchedule ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                          Generate Schedule
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Study Schedule Result Modal */}
      {showScheduleResult && scheduleResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Your Study Schedule
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {scheduleResult.start_date && scheduleResult.end_date && (
                    <>From {new Date(scheduleResult.start_date).toLocaleDateString()} to {new Date(scheduleResult.end_date).toLocaleDateString()}</>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* Download buttons */}
                <div className="relative group">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download Schedule"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button
                      onClick={() => downloadSchedule('pdf')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Download as PDF
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowScheduleResult(false);
                    setScheduleResult(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Conflicts Warning */}
              {scheduleResult.conflicts && scheduleResult.conflicts.length > 0 && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Scheduling Conflicts
                  </h4>
                  <ul className="space-y-1">
                    {scheduleResult.conflicts.map((conflict, index) => (
                      <li key={index} className="text-red-700 text-sm">• {conflict}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {scheduleResult.recommendations && scheduleResult.recommendations.length > 0 && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Recommendations
                  </h4>
                  <ul className="space-y-1">
                    {scheduleResult.recommendations.map((rec, index) => (
                      <li key={index} className="text-blue-700 text-sm">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Schedule Overview */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Schedule Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{scheduleResult.total_chapters}</p>
                    <p className="text-sm text-gray-600">Total Chapters</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {scheduleResult.schedule && scheduleResult.schedule.reduce((sum, ch) => sum + (ch.estimated_study_days || 0), 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Study Days</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {(scheduleResult.schedule && scheduleResult.schedule[0]?.daily_hours) || 0}
                    </p>
                    <p className="text-sm text-gray-600">Hours/Day</p>
                  </div>
                </div>

                {/* Chapter Schedule Cards */}
                <div className="space-y-3">
                  {scheduleResult.schedule && scheduleResult.schedule.map((chapter, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-800">{chapter.chapter_name}</h5>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              Start: {new Date(chapter.suggested_start_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Target: {new Date(chapter.target_completion_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          chapter.priority === 'high' ? 'bg-red-100 text-red-700' :
                          chapter.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {chapter.priority?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Study Days</p>
                          <p className="font-semibold">{chapter.estimated_study_days}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Daily Hours</p>
                          <p className="font-semibold">{chapter.daily_hours}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Total Hours</p>
                          <p className="font-semibold">{(chapter.estimated_study_days * chapter.daily_hours).toFixed(1)}</p>
                        </div>
                      </div>

                      {/* Study Tips */}
                      {chapter.study_tips && chapter.study_tips.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-500 mb-2">Study Tips:</p>
                          <div className="flex flex-wrap gap-2">
                            {chapter.study_tips.map((tip, tipIndex) => (
                              <span key={tipIndex} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                {tip}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Breakdown */}
              {scheduleResult.weekly_breakdown && Object.keys(scheduleResult.weekly_breakdown).length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Weekly Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(scheduleResult.weekly_breakdown).map(([week, chapters]) => (
                      <div key={week} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border border-purple-200">
                        <h5 className="font-semibold text-purple-800 mb-2">{week}</h5>
                        <div className="space-y-1">
                          {chapters.map((ch, idx) => (
                            <p key={idx} className="text-sm text-gray-700">• {ch}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowScheduleResult(false);
                  setScheduleResult(null);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
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