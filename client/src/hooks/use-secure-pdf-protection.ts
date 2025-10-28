import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSecurePDFProtection(isEnabled: boolean = true) {
  const { toast } = useToast();

  useEffect(() => {
    if (!isEnabled) return;

     
    const securityManager = {
      blockKeyboardShortcuts: (e: KeyboardEvent) => {
         
        const blockedKeys = [
          's', 'S', 'p', 'P', 'a', 'A', 'u', 'U', 'i', 'I', 'c', 'C', 'v', 'V'
        ];
        
        if ((e.ctrlKey || e.metaKey) && blockedKeys.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          toast({
            title: "هشدار امنیتی",
            description: "این عملیات مجاز نیست. محتوا فقط قابل مطالعه است.",
            variant: "destructive",
            duration: 3000,
          });
          return false;
        }

         
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && e.key === 'I') ||
            (e.ctrlKey && e.key === 'u') ||
            e.key === 'F5' ||
            (e.ctrlKey && e.key === 'r')) {
          e.preventDefault();
          e.stopPropagation();
          toast({
            title: "دسترسی محدود",
            description: "این قابلیت در حالت امن غیرفعال است.",
            variant: "destructive",
            duration: 2000,
          });
          return false;
        }
      },

      blockContextMenu: (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toast({
          title: "منوی راست کلیک غیرفعال",
          description: "محتوا محافظت شده است.",
          variant: "default",
          duration: 2000,
        });
        return false;
      },

      blockSelection: (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      },

      blockDragDrop: (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer?.clearData();
        return false;
      },

      blockPrint: () => {
         
        (window as any).print = () => {
          toast({
            title: "چاپ غیرمجاز",
            description: "امکان چاپ این محتوا وجود ندارد.",
            variant: "destructive",
            duration: 3000,
          });
        };
      },

      blockDevTools: () => {
         
        let devtools = { open: false, orientation: null };
        const threshold = 160;

        setInterval(() => {
          if (window.outerHeight - window.innerHeight > threshold || 
              window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
              devtools.open = true;
               
            }
          } else {
            devtools.open = false;
          }
        }, 500);
      }
    };

     
    document.addEventListener('keydown', securityManager.blockKeyboardShortcuts, true);
    document.addEventListener('contextmenu', securityManager.blockContextMenu, true);
    document.addEventListener('selectstart', securityManager.blockSelection, true);
    document.addEventListener('dragstart', securityManager.blockDragDrop, true);
    document.addEventListener('drop', securityManager.blockDragDrop, true);
    
    securityManager.blockPrint();
    securityManager.blockDevTools();

     
    const createWatermark = () => {
      const watermark = document.createElement('div');
      watermark.id = 'pdview-security-watermark';
      watermark.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 999999;
        background-image: 
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 80px,
            rgba(147, 51, 234, 0.03) 80px,
            rgba(147, 51, 234, 0.03) 160px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 80px,
            rgba(147, 51, 234, 0.02) 80px,
            rgba(147, 51, 234, 0.02) 160px
          );
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      `;
      
       
      const watermarkTexts = [
        'پی دی ویو - محافظت شده',
        'فقط خواندنی',
        'غیرقابل دانلود',
        'محتوای محافظت شده'
      ];
      
      watermarkTexts.forEach((text, index) => {
        const textElement = document.createElement('div');
        textElement.style.cssText = `
          position: absolute;
          top: ${20 + (index * 25)}%;
          left: ${15 + (index * 20)}%;
          transform: rotate(${-30 + (index * 15)}deg);
          font-size: ${48 + (index * 8)}px;
          font-weight: bold;
          color: rgba(147, 51, 234, 0.08);
          user-select: none;
          pointer-events: none;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          white-space: nowrap;
        `;
        textElement.textContent = text;
        watermark.appendChild(textElement);
      });
      
      document.body.appendChild(watermark);
      return watermark;
    };

    const watermark = createWatermark();

     
    return () => {
      document.removeEventListener('keydown', securityManager.blockKeyboardShortcuts, true);
      document.removeEventListener('contextmenu', securityManager.blockContextMenu, true);
      document.removeEventListener('selectstart', securityManager.blockSelection, true);
      document.removeEventListener('dragstart', securityManager.blockDragDrop, true);
      document.removeEventListener('drop', securityManager.blockDragDrop, true);
      
      if (watermark && watermark.parentNode) {
        watermark.parentNode.removeChild(watermark);
      }
    };
  }, [isEnabled, toast]);

  const protectElement = useCallback((element: HTMLElement) => {
    if (!isEnabled) return;
    
    element.classList.add('secure-content');
    
     
    const style = element.style as any;
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    style.mozUserSelect = 'none';
    style.msUserSelect = 'none';
    style.webkitTouchCallout = 'none';
    style.webkitUserDrag = 'none';
    style.khtmlUserSelect = 'none';
    
    element.setAttribute('unselectable', 'on');
    element.setAttribute('onselectstart', 'return false;');
    element.setAttribute('onmousedown', 'return false;');
    element.setAttribute('ondragstart', 'return false;');
    element.setAttribute('oncontextmenu', 'return false;');
    
     
    element.setAttribute('data-protected', 'true');
    element.setAttribute('draggable', 'false');
  }, [isEnabled]);

  const unprotectElement = useCallback((element: HTMLElement) => {
    element.classList.remove('secure-content');
    const style = element.style as any;
    element.style.userSelect = '';
    element.style.webkitUserSelect = '';
    style.mozUserSelect = '';
    style.msUserSelect = '';
    style.webkitTouchCallout = '';
    style.webkitUserDrag = '';
    style.khtmlUserSelect = '';
    
    element.removeAttribute('unselectable');
    element.removeAttribute('onselectstart');
    element.removeAttribute('onmousedown');
    element.removeAttribute('ondragstart');
    element.removeAttribute('oncontextmenu');
    element.removeAttribute('data-protected');
    element.removeAttribute('draggable');
  }, []);

  return {
    protectElement,
    unprotectElement,
  };
}
