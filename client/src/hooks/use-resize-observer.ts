import { useRef, useEffect, useCallback } from 'react';

 
export function useResizeObserver<T extends HTMLElement = HTMLDivElement>(
  callback: (entry: ResizeObserverEntry) => void
) {
  const elementRef = useRef<T>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
     
    requestAnimationFrame(() => {
      if (entries[0]) {
        callback(entries[0]);
      }
    });
  }, [callback]);

  useEffect(() => {
    if (elementRef.current) {
       
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

       
      try {
        observerRef.current = new ResizeObserver(handleResize);
        observerRef.current.observe(elementRef.current);
      } catch (error) {
         
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleResize]);

  return elementRef;
}