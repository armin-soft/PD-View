import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

 
const suppressResizeObserverError = () => {
  const errorPattern = /ResizeObserver loop completed with undelivered notifications/;
  
   
  const originalError = console.error;
  console.error = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : (args[0]?.message || '');
    if (errorPattern.test(message)) return;
    originalError.apply(console, args);
  };

   
  window.addEventListener('error', (e) => {
    if (errorPattern.test(e.message)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

   
  window.addEventListener('unhandledrejection', (e) => {
    const message = typeof e.reason === 'string' ? e.reason : (e.reason?.message || '');
    if (errorPattern.test(message)) {
      e.preventDefault();
      return false;
    }
  });

   
  if (typeof ResizeObserver !== 'undefined') {
    const OriginalResizeObserver = ResizeObserver;
    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        const wrappedCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
          requestAnimationFrame(() => {
            try {
              callback(entries, observer);
            } catch (error) {
               
            }
          });
        };
        super(wrappedCallback);
      }
    };
  }
};

suppressResizeObserverError();

createRoot(document.getElementById("root")!).render(<App />);
