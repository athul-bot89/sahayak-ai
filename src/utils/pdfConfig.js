// PDF.js configuration
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker
// Using CDN for better reliability with react-pdf v10
export const configurePdfWorker = () => {
  // For react-pdf v10, use the CDN worker
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
};

// Export configured pdfjs
export { pdfjs };