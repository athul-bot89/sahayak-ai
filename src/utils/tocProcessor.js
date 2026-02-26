// TOC Processing Utilities
// This module handles the automated processing of Table of Contents

/**
 * Process TOC and create chapters automatically
 * @param {number} textbookId - The ID of the textbook
 * @returns {Promise<Object>} The created chapters data
 */
export const processTocAndCreateChapters = async (textbookId) => {
  const API_BASE = 'http://localhost:8000/api/v1';
  
  try {
    console.log('Starting TOC processing for textbook:', textbookId);
    
    // Step 1: Get TOC text
    const tocResponse = await fetch(
      `${API_BASE}/extract/textbook/${textbookId}/toc`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (!tocResponse.ok) {
      throw new Error(`Failed to extract TOC text: ${tocResponse.status}`);
    }

    const tocData = await tocResponse.json();
    const tocText = tocData.extracted_text;
    
    if (!tocText) {
      throw new Error('No TOC text extracted');
    }

    console.log('TOC text extracted successfully, length:', tocText.length);

    // Step 2: Detect chapters from TOC text
    const detectResponse = await fetch(
      `${API_BASE}/chapters/detect`,
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
      const error = await detectResponse.text();
      throw new Error(`Failed to detect chapters: ${error}`);
    }

    const detectedData = await detectResponse.json();
    const detectedChapters = detectedData.chapters;
    
    if (!detectedChapters || detectedChapters.length === 0) {
      throw new Error('No chapters detected from TOC');
    }

    console.log(`Detected ${detectedChapters.length} chapters`);

    // Step 3: Create chapters in batch
    const createResponse = await fetch(
      `${API_BASE}/chapters/batch`,
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
      const error = await createResponse.text();
      throw new Error(`Failed to create chapters: ${error}`);
    }

    const createdData = await createResponse.json();
    console.log(`Successfully created ${createdData.created_count} chapters`);
    
    return createdData;
  } catch (error) {
    console.error('Error in TOC processing pipeline:', error);
    throw error;
  }
};

/**
 * Check if TOC has been extracted for a textbook
 * @param {number} textbookId - The ID of the textbook
 * @returns {Promise<boolean>} Whether TOC has been extracted
 */
export const checkTocStatus = async (textbookId) => {
  const API_BASE = 'http://localhost:8000/api/v1';
  
  try {
    const response = await fetch(
      `${API_BASE}/textbooks/${textbookId}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.has_toc_extracted || false;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking TOC status:', error);
    return false;
  }
};

/**
 * Get chapters for a textbook
 * @param {number} textbookId - The ID of the textbook
 * @returns {Promise<Array>} Array of chapters
 */
export const fetchChapters = async (textbookId) => {
  const API_BASE = 'http://localhost:8000/api/v1';
  
  try {
    const response = await fetch(
      `${API_BASE}/chapters/textbook/${textbookId}`,
      {
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      return await response.json();
    } else if (response.status === 404) {
      return [];
    } else {
      throw new Error('Failed to fetch chapters');
    }
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return [];
  }
};

export default {
  processTocAndCreateChapters,
  checkTocStatus,
  fetchChapters
};