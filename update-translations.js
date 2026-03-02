const fs = require('fs');
const path = require('path');

// Read the English translations (source of truth)
const enPath = path.join(__dirname, 'src', 'locales', 'en.json');
const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// List of all language files
const languages = ['ml', 'mr', 'ta', 'te', 'kn', 'gu', 'bn'];

// New keys that need to be added to all language files
const newBookDetailKeys = {
  "downloadFailed": "Failed to download PDF: {{error}}"
};

const newLibraryKeys = {
  "loading": "Loading library...",
  "allAuthors": "All Authors",
  "allBooks": "All Books",
  "withTOC": "With TOC",
  "withoutTOC": "Without TOC",
  "showingBooks": "Showing {{showing}} of {{total}} books",
  "noBooksMatchingCriteria": "No books found matching your criteria.",
  "uploadTextbook": "Upload Textbook",
  "success": "Success!",
  "uploadSuccessMessage": "Textbook uploaded successfully. Redirecting...",
  "error": "Error",
  "pdfFile": "PDF File",
  "selected": "Selected",
  "titleLabel": "Title",
  "authorLabel": "Author",
  "authorPlaceholder": "e.g., John Doe",
  "cancel": "Cancel",
  "uploading": "Uploading...",
  "upload": "Upload"
};

const newChapterKeys = {
  "title": "Chapters",
  "loading": "Loading chapters...",
  "error": "Error loading chapters",
  "noChapters": "No chapters found in this textbook",
  "tocNotExtracted": "Table of Contents needs to be extracted first",
  "extractTocHint": "Use the \"Set Table of Contents\" button to extract chapters",
  "tocExtracted": "TOC Extracted",
  "pages": "Pages",
  "pagesCount": "pages",
  "subsections": "Subsections will be displayed here",
  "totalChapters": "Total Chapters",
  "tocPages": "TOC Pages",
  "totalPages": "Total Pages",
  "avgPagesPerChapter": "Avg Pages/Chapter",
  "deleteSuccess": "Chapter \"{{title}}\" deleted successfully",
  "deleteFailed": "Failed to delete chapter: {{error}}",
  "summaryFailed": "Failed to generate summary: {{error}}",
  "worksheetFailed": "Failed to generate worksheet: {{error}}",
  "updateFailed": "Failed to update chapter: {{error}}",
  "editChapter": "Edit Chapter {{number}}",
  "chapterTitle": "Chapter Title",
  "enterChapterTitle": "Enter chapter title",
  "pageRange": "Page Range",
  "startPage": "Start page",
  "endPage": "End page",
  "selectPagesFromPDF": "Select Pages from PDF",
  "currentSelection": "Current selection",
  "pagesRange": "Pages {{start}} - {{end}} ({{total}} pages total)",
  "cancel": "Cancel",
  "updating": "Updating...",
  "updateChapter": "Update Chapter",
  "worksheetSettings": "Worksheet Settings",
  "chapter": "Chapter",
  "numberOfQuestions": "Number of Questions",
  "deleteConfirmation": "Delete Confirmation",
  "deleteConfirmMessage": "Are you sure you want to delete the chapter \"{{title}}\"?",
  "warning": "Warning",
  "deleteWarningMessage": "This action cannot be undone. All associated files and data will be permanently deleted.",
  "deleteChapter": "Delete Chapter",
  "chapterSummary": "Chapter {{number}} Summary",
  "summary": "Summary",
  "keyConcepts": "Key Concepts",
  "close": "Close"
};

// Process each language file
languages.forEach(lang => {
  const langPath = path.join(__dirname, 'src', 'locales', `${lang}.json`);
  
  try {
    let langTranslations = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    
    // Add missing bookDetail keys
    if (!langTranslations.bookDetail) {
      langTranslations.bookDetail = {};
    }
    Object.keys(newBookDetailKeys).forEach(key => {
      if (!langTranslations.bookDetail[key]) {
        langTranslations.bookDetail[key] = newBookDetailKeys[key];
      }
    });
    
    // Add missing chapters section if it doesn't exist
    if (!langTranslations.chapters) {
      langTranslations.chapters = {};
    }
    
    // Add all chapter keys (using English as fallback)
    Object.keys(newChapterKeys).forEach(key => {
      if (!langTranslations.chapters[key]) {
        langTranslations.chapters[key] = newChapterKeys[key];
      }
    });
    
    // Add missing library keys
    if (!langTranslations.library) {
      langTranslations.library = {};
    }
    Object.keys(newLibraryKeys).forEach(key => {
      if (!langTranslations.library[key]) {
        langTranslations.library[key] = newLibraryKeys[key];
      }
    });
    
    // Write back the updated translations
    fs.writeFileSync(langPath, JSON.stringify(langTranslations, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated ${lang}.json`);
    
  } catch (error) {
    console.error(`❌ Error updating ${lang}.json:`, error.message);
  }
});

console.log('\n✨ All translation files have been updated with missing keys!');
console.log('Note: The new keys have been added with English text as fallback.');
console.log('You may want to provide proper translations for each language.');