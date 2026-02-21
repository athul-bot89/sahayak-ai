# PDF Viewer Documentation

## Overview

The PDF viewer implementation provides a comprehensive solution for viewing and downloading PDF textbooks with both full document and page streaming capabilities.

## Features

### 1. **Full PDF Download**
- Direct download of the complete PDF file
- Uses the `/api/v1/textbooks/{textbook_id}/pdf` endpoint
- Automatically names the downloaded file with the book title

### 2. **Page Streaming & Preview**
- Load specific pages on demand for better performance
- Uses the `/api/v1/textbooks/{textbook_id}/preview` endpoint
- Supports page range selection (start_page, end_page parameters)
- Intelligent prefetching of adjacent pages for smooth navigation

### 3. **View Modes**
- **Single Page View**: Display one page at a time with navigation controls
- **Continuous Scroll**: View multiple pages in a scrollable layout
- **Selection Mode**: Interactive page selection for targeted downloads

### 4. **Page Selection & Download**
- Select specific pages for download
- Visual feedback for selected pages
- Download selected page ranges as separate PDF
- Quick selection helpers (Select All, Clear All, Range Selection)

### 5. **Zoom Controls**
- Zoom in/out functionality
- Reset zoom to default
- Percentage display of current zoom level
- Smooth scaling transitions

### 6. **Navigation**
- Previous/Next page buttons
- Direct page number input
- Page thumbnails for quick navigation
- Current page indicator

## Components

### PdfViewer Component (`src/components/PdfViewer.js`)
Advanced PDF viewer using react-pdf library with:
- Document rendering with PDF.js
- Page caching mechanism
- Lazy loading of pages
- Text selection support
- Annotation layer support

### SimplePdfViewer Component (`src/components/SimplePdfViewer.js`)
Fallback PDF viewer using native browser capabilities:
- iframe-based rendering
- Lightweight implementation
- Mobile-friendly controls
- Basic zoom and navigation

### BookDetailPage Integration
The PDF viewer is integrated into the Book Detail page with:
- "Read Online" button to open the viewer
- "Download PDF" button for direct download
- Lazy loading with Suspense for optimal performance
- Automatic fallback to SimplePdfViewer if react-pdf fails

## API Endpoints Used

### 1. Get Full PDF
```
GET /api/v1/textbooks/{textbook_id}/pdf
```
- Returns the complete PDF file
- Used for full document download and iframe viewing

### 2. Preview Pages
```
GET /api/v1/textbooks/{textbook_id}/preview
```
Query Parameters:
- `start_page` (required): Starting page number
- `end_page` (optional): Ending page number
- Returns PDF with specified page range

## Implementation Details

### Page Caching Strategy
```javascript
// Pages are cached as blob URLs to avoid re-fetching
const pageCache = {
  1: 'blob:http://...',
  2: 'blob:http://...',
  // ...
}
```

### Prefetching Logic
- Loads initial 5 pages on mount
- Prefetches ±2 pages from current page in single view mode
- Loads first 10 pages in continuous mode

### Error Handling
- Graceful fallback from PdfViewer to SimplePdfViewer
- Error messages displayed to users
- Loading states for all async operations
- Network error recovery

## Mobile Responsiveness

### Touch Gestures
- Swipe navigation between pages
- Pinch to zoom on mobile devices
- Tap to show/hide controls

### Mobile-Specific UI
- Simplified toolbar for small screens
- Bottom navigation bar on mobile
- Responsive button sizes and spacing

## Performance Optimizations

### 1. Lazy Loading
- Components loaded on demand
- PDF viewer only loaded when needed
- Suspense boundaries for smooth loading

### 2. Page Streaming
- Load pages as needed instead of full PDF
- Reduces initial load time
- Better memory management

### 3. Blob URL Management
- Proper cleanup of blob URLs to prevent memory leaks
- URL.revokeObjectURL() called after downloads

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Fallback Support
- Automatic fallback to SimplePdfViewer for older browsers
- iframe-based viewing as last resort
- Download functionality works on all browsers

## Styling

### Custom CSS Classes
- `.pdf-viewer-container`: Main container styling
- `.pdf-toolbar`: Header toolbar styling
- `.page-selection-overlay`: Page selection visual feedback
- Custom scrollbar styling for better UX

### Tailwind Integration
- Consistent with application design system
- Responsive utility classes
- Dark mode support

## Usage Example

```javascript
import { useState } from 'react';
import PdfViewer from './components/PdfViewer';

function MyComponent() {
  const [showPdf, setShowPdf] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowPdf(true)}>
        Open PDF
      </button>
      
      {showPdf && (
        <PdfViewer
          textbookId={123}
          totalPages={250}
          onClose={() => setShowPdf(false)}
        />
      )}
    </>
  );
}
```

## Configuration

### PDF.js Worker Configuration
Located in `src/utils/pdfConfig.js`:
```javascript
// Automatic fallback to CDN if local worker fails
configurePdfWorker();
```

### Environment Variables (Optional)
```env
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_PDF_WORKER_URL=https://cdnjs.cloudflare.com/ajax/libs/pdf.js/...
```

## Troubleshooting

### Common Issues

1. **PDF Worker Not Loading**
   - Solution: Check network connectivity to CDN
   - Fallback: SimplePdfViewer will be used automatically

2. **CORS Errors**
   - Ensure backend allows frontend origin
   - Check API response headers

3. **Large PDF Performance**
   - Use page streaming instead of loading full PDF
   - Implement pagination for very large documents

4. **Mobile Scrolling Issues**
   - Use single page mode on mobile
   - Disable continuous mode for better performance

## Future Enhancements

### Planned Features
1. **Search Functionality**
   - Text search within PDF
   - Navigate to search results

2. **Annotations**
   - Add notes to pages
   - Highlight text
   - Save annotations

3. **Bookmarks**
   - Save page positions
   - Quick navigation to bookmarked pages

4. **Print Support**
   - Print selected pages
   - Print with annotations

5. **Offline Support**
   - Cache viewed pages
   - Progressive Web App capabilities

6. **Advanced Page Selection**
   - Custom page ranges (e.g., 1-5, 10-15, 20)
   - Even/odd page selection

## Security Considerations

### Content Security
- PDFs served from trusted backend only
- No execution of embedded JavaScript in PDFs
- Sanitization of PDF metadata

### API Security
- Authentication tokens for protected PDFs
- Rate limiting on preview endpoints
- Watermarking support for sensitive documents

## Testing

### Unit Tests
```javascript
// Example test
describe('PdfViewer', () => {
  it('should load and display PDF', async () => {
    // Test implementation
  });
  
  it('should handle page navigation', () => {
    // Test implementation
  });
});
```

### Integration Tests
- Test API endpoints with mock data
- Test error scenarios
- Test mobile responsiveness

## Dependencies

### Required Packages
```json
{
  "react-pdf": "^9.1.1",
  "pdfjs-dist": "^5.4.296"
}
```

### Optional Packages (for enhanced features)
```json
{
  "react-window": "^1.8.10",  // For virtualized scrolling
  "pdfjs-annotations": "^1.0.0"  // For annotation support
}
```

## License

This implementation is part of the SAHAYAK AI project and follows the project's licensing terms.

## Support

For issues or questions regarding the PDF viewer:
1. Check this documentation
2. Review the troubleshooting section
3. Contact the development team

---

Last Updated: February 2026