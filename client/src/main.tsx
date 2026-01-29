import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // Ignore errors from browser extensions (content.js, injected scripts, etc.)
  if (reason && typeof reason === 'object') {
    const errorSource = (reason as any).source || '';
    const stack = (reason as any).stack || '';
    
    // Check if error is from a browser extension
    if (
      stack.includes('content.js') ||
      stack.includes('extension://') ||
      stack.includes('chrome-extension://') ||
      stack.includes('moz-extension://') ||
      errorSource.includes('extension') ||
      (reason as any).code === 403 && (reason as any).httpStatus === 200 // Common extension error pattern
    ) {
      // Silently ignore extension errors - they don't affect our app
      event.preventDefault();
      return;
    }
  }
  
  // Handle application errors
  if (reason instanceof Error) {
    // Only log if it's not from an extension
    if (!reason.stack?.includes('content.js') && !reason.stack?.includes('extension://')) {
      console.warn('Unhandled promise rejection:', reason.message, reason);
    }
  } else if (typeof reason === 'string') {
    console.warn('Unhandled promise rejection:', reason);
  } else if (reason && typeof reason === 'object') {
    // Try to extract message from error object
    const message = (reason as any).message || (reason as any).error || JSON.stringify(reason);
    // Only log if it's not from an extension
    if (!(reason as any).stack?.includes('content.js')) {
      console.warn('Unhandled promise rejection:', message, reason);
    }
  } else {
    console.warn('Unhandled promise rejection:', reason);
  }
  
  // Prevent the default browser error logging for non-extension errors
  event.preventDefault();
});

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error || event.message);
  // Prevent default error handling if needed
  // event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
