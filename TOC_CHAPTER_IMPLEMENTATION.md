# Table of Contents and Chapter Auto-Creation Implementation

## Overview
This implementation adds automatic chapter detection and creation functionality when a Table of Contents (TOC) is set for a textbook.

## Implementation Details

### Workflow
When a user sets the TOC pages for a textbook, the following automated process occurs:

1. **TOC Text Extraction**: The system calls `/api/v1/extract/textbook/{textbook_id}/toc` to get the extracted text from the TOC pages
2. **Chapter Detection**: Using AI, the system calls `/api/v1/chapters/detect` with the TOC text to detect chapters
3. **Batch Chapter Creation**: The detected chapters are created in batch using `/api/v1/chapters/batch`, which also triggers:
   - PDF splitting for each chapter
   - Text extraction from each chapter
   - Summary generation (if configured)

### Files Modified

#### 1. **BookDetailPage.js** (`src/pages/BookDetailPage.js`)
- Added `processTocAndCreateChapters()` function to handle the 3-step workflow
- Updated the `onTocSaved` callback to trigger automatic chapter processing
- Added state management for processing status and error handling
- Integrated ProcessingNotification component for better user feedback

#### 2. **ChaptersSection.js** (`src/components/ChaptersSection.js`)
- Added `fetchChapters()` function to retrieve chapters from the API
- Updated to display actual chapters with their metadata (chapter number, title, pages)
- Added refresh button to manually reload chapters
- Displays status icons for PDF, extracted text, and summary availability
- Responsive to changes in the book's chapter count

#### 3. **ProcessingNotification.js** (New file: `src/components/ProcessingNotification.js`)
- Reusable notification component for displaying processing status
- Supports multiple types: info, success, warning, error
- Shows step-by-step progress during chapter processing

#### 4. **tocProcessor.js** (New utility: `src/utils/tocProcessor.js`)
- Utility module for TOC processing functions
- Encapsulates the API calls for TOC extraction, chapter detection, and creation
- Provides helper functions for checking TOC status and fetching chapters

### Features

1. **Automatic Chapter Creation**: When TOC is set, chapters are automatically detected and created
2. **Real-time Feedback**: Users see step-by-step progress during processing
3. **Error Handling**: Graceful error handling with informative messages
4. **Visual Indicators**: Clear status indicators for TOC extraction and chapter availability
5. **Chapter Navigation**: Click on chapters to navigate to their start page in the PDF viewer
6. **Refresh Capability**: Manual refresh button to reload chapters if needed

### API Endpoints Used

1. `GET /api/v1/extract/textbook/{textbook_id}/toc`
   - Retrieves extracted TOC text

2. `POST /api/v1/chapters/detect`
   - Detects chapters from TOC text using AI
   - Request body: `{ textbook_id, toc_text }`

3. `POST /api/v1/chapters/batch`
   - Creates multiple chapters at once
   - Request body: `{ textbook_id, chapters: [{ title, chapter_number, start_page, end_page }] }`

4. `GET /api/v1/chapters/textbook/{textbook_id}`
   - Fetches all chapters for a textbook

### User Experience Flow

1. User opens a textbook in BookDetailPage
2. User clicks "Set Table of Contents" button
3. User selects TOC page range in the PDF viewer
4. User saves the TOC selection
5. System automatically:
   - Extracts TOC text
   - Detects chapters using AI
   - Creates chapters with metadata
   - Shows progress notifications
6. Chapters appear in the ChaptersSection
7. User can click on chapters to navigate to them

### Error Scenarios Handled

- No TOC text extracted
- No chapters detected from TOC
- API failures at any step
- Network connectivity issues

### Testing Instructions

1. Upload a textbook PDF
2. Navigate to the book detail page
3. Click "Set Table of Contents"
4. Select the TOC pages in the PDF viewer
5. Save the selection
6. Watch the automatic chapter creation process
7. Verify chapters appear in the chapters section
8. Test chapter navigation by clicking on chapters

### Future Enhancements

1. Manual chapter editing after auto-detection
2. Chapter merging/splitting functionality
3. Sub-chapter/section detection
4. Chapter content preview
5. Batch operations on chapters
6. Export chapter metadata