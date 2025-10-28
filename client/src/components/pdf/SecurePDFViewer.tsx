import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCw, Lock, ArrowLeft, FileText, Shield, Eye, AlertCircle, 
  Maximize, Minimize, Expand, Fullscreen, ChevronLeft, ChevronRight, MoreVertical, Settings, Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useSecurePDFProtection } from '@/hooks/use-secure-pdf-protection';
import { formatPersianNumber } from '@/lib/persian-utils';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

import { Viewer, Worker, TextDirection } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import * as pdfjs from 'pdfjs-dist';

 
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

 

 
const PDF_CONFIG = {
  cMapUrl: '/cmaps/',
  cMapPacked: true,
  enableXfa: false,
  disableFontFace: true,  
  disableRange: false,
  disableStream: false,
  disableAutoFetch: false,
  verbosity: 0,  
  useSystemFonts: false,  
};

interface SecurePdfViewerProps {
  fileId: number;
  title: string;
  isLicensed: boolean;
  pageLimit?: number;
  totalPages: number;
  watermarkText?: string;
  onPurchaseRequest?: () => void;
  isGuestMode?: boolean;
}

export function SecurePdfViewer({
  fileId,
  title,
  isLicensed,
  pageLimit = 3,
  totalPages,
  watermarkText = 'پی دی ویو',
  onPurchaseRequest,
  isGuestMode = false,
}: SecurePdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(120);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitMode, setFitMode] = useState<'width' | 'height' | 'auto'>('auto');
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pageTransition, setPageTransition] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
   
  const pdfUrl = `/api/files/${fileId}/view`;


   
  useEffect(() => {
    setIsLoading(true);
    setPdfError(null);
  }, [pdfUrl]);

   
  const { protectElement, unprotectElement } = useSecurePDFProtection(true);

   
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],  
  });
  
   
  const zoomPluginInstance = zoomPlugin();

   
  const optimizeTextLayer = useCallback(() => {
     
    setTimeout(() => {
      const viewerElement = viewerRef.current;
      if (!viewerElement) return;
      
       
      const textLayers = viewerElement.querySelectorAll('.rpv-core__text-layer, .react-pdf__Page__textContent');
      textLayers.forEach((textLayer) => {
        if (textLayer instanceof HTMLElement) {
           
          textLayer.style.fontFamily = 'Vazirmatn, "B Nazanin", Tahoma, Arial, sans-serif';
          textLayer.style.direction = 'rtl';
          textLayer.style.textAlign = 'right';
          textLayer.style.unicodeBidi = 'plaintext';
          textLayer.style.textRendering = 'optimizeLegibility';
          textLayer.style.fontVariantLigatures = 'common-ligatures contextual';
          textLayer.style.fontFeatureSettings = '"liga" 1, "kern" 1, "calt" 1, "rlig" 1';
        }
      });

       
      const textElements = viewerElement.querySelectorAll('.rpv-core__text-layer span, .react-pdf__Page__textContent span');
      textElements.forEach((textEl) => {
        if (textEl instanceof HTMLElement) {
          textEl.style.fontFamily = 'inherit';
          textEl.style.direction = 'inherit';
          textEl.style.unicodeBidi = 'inherit';
          textEl.style.textRendering = 'inherit';
          textEl.style.fontVariantLigatures = 'inherit';
          textEl.style.fontFeatureSettings = 'inherit';
        }
      });
    }, 100);
  }, []);

  const maxViewablePages = isLicensed ? totalPages : Math.min(pageLimit, totalPages);
  const canViewPage = currentPage <= maxViewablePages;

  useEffect(() => {
    if (viewerRef.current) {
       
      protectElement(viewerRef.current);
    }

    return () => {
      if (viewerRef.current) {
        unprotectElement(viewerRef.current);
      }
    };
  }, [protectElement, unprotectElement]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 20, 250));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 20, 50));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setPageTransition(true);
      setTimeout(() => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
        setPageTransition(false);
      }, 150);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    const maxPage = isLicensed ? totalPages : maxViewablePages;
    if (currentPage < maxPage) {
      setPageTransition(true);
      setTimeout(() => {
        setCurrentPage(prev => Math.min(prev + 1, maxPage));
        setPageTransition(false);
      }, 150);
    }
  }, [currentPage, isLicensed, totalPages, maxViewablePages]);

  const handleZoomChange = useCallback((value: number) => {
    setZoom(value);
  }, []);

  const handleFitToWidth = useCallback(() => {
    setFitMode('width');
    setZoom(120);
  }, []);

  const handleFitToHeight = useCallback(() => {
    setFitMode('height');
    setZoom(120);
  }, []);

  const handleActualSize = useCallback(() => {
    setFitMode('auto');
    setZoom(120);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const handleGoToPage = useCallback((page: number) => {
    const maxPage = isLicensed ? totalPages : maxViewablePages;
    const targetPage = Math.max(1, Math.min(page, maxPage));
    setPageTransition(true);
    setTimeout(() => {
      setCurrentPage(targetPage);
      setPageTransition(false);
    }, 150);
  }, [isLicensed, totalPages, maxViewablePages]);

   
  const handleDocumentLoad = useCallback(() => {
    setIsLoading(false);
    setPdfError(null);
    optimizeTextLayer();
  }, [optimizeTextLayer]);

   
  const handleLoadError = useCallback((error: any) => {
    setPdfError('خطا در بارگذاری پی دی اف');
    setIsLoading(false);
  }, []);

  return (
    <TooltipProvider>
      <motion.div 
        ref={containerRef}
        className={`relative transition-all duration-500 ${
          isFullscreen 
            ? 'fixed inset-0 z-50 bg-black/95 backdrop-blur-sm' 
            : 'bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
      >
        { }
        <motion.div 
          className={`relative p-4 sm:p-6 ${
            isFullscreen 
              ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
              : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-t-3xl border-b border-gray-200/50 dark:border-gray-700/50'
          }`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          { }
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            { }
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <motion.div 
                className="relative p-2.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="w-5 h-5 text-white" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              
              <div className="min-w-0 flex-1">
                <h2 className={`font-bold text-lg sm:text-xl lg:text-2xl truncate ${
                  isFullscreen 
                    ? 'text-white' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className="border-purple-300 bg-purple-100/90 dark:bg-purple-900/90 text-purple-700 dark:text-purple-300 text-xs backdrop-blur-sm"
                  >
                    <Shield className="w-3 h-3 ml-1" />
                    محافظت شده
                  </Badge>
                  
                  {!isLicensed && (
                    <Badge 
                      variant="secondary" 
                      className="bg-amber-100/90 dark:bg-amber-900/90 text-amber-700 dark:text-amber-300 text-xs backdrop-blur-sm animate-pulse"
                    >
                      <Lock className="w-3 h-3 ml-1" />
                      پیش نمایش محدود
                    </Badge>
                  )}
                  
                  {isLicensed && (
                    <Badge 
                      variant="default" 
                      className="bg-emerald-100/90 dark:bg-emerald-900/90 text-emerald-700 dark:text-emerald-300 text-xs backdrop-blur-sm"
                    >
                      <Eye className="w-3 h-3 ml-1" />
                      دسترسی کامل
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            { }
            <div className="flex items-center gap-2 lg:gap-3">
              
              { }
              <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 hover:bg-white/80 dark:hover:bg-gray-700/80 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>صفحه قبلی</TooltipContent>
                </Tooltip>
                
                <div className="flex items-center gap-2 px-2">
                  <Input
                    type="number"
                    value={currentPage}
                    onChange={(e) => handleGoToPage(parseInt(e.target.value) || 1)}
                    className="w-14 h-7 text-center text-xs border-0 bg-transparent focus:bg-white/50 dark:focus:bg-gray-700/50"
                    min={1}
                    max={isLicensed ? totalPages : maxViewablePages}
                  />
                  <span className={`text-xs font-medium ${
                    isFullscreen ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    از {formatPersianNumber(isLicensed ? totalPages : maxViewablePages)}
                  </span>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage >= (isLicensed ? totalPages : maxViewablePages)}
                      className="h-8 w-8 p-0 hover:bg-white/80 dark:hover:bg-gray-700/80 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>صفحه بعدی</TooltipContent>
                </Tooltip>
              </div>

              { }
              <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoom <= 25}
                      className="h-8 w-8 p-0 hover:bg-white/80 dark:hover:bg-gray-700/80"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>کوچک تر</TooltipContent>
                </Tooltip>
                
                <div className="flex items-center px-2">
                  <span className={`text-xs font-medium min-w-[40px] text-center ${
                    isFullscreen ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {formatPersianNumber(zoom)}%
                  </span>
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoom >= 300}
                      className="h-8 w-8 p-0 hover:bg-white/80 dark:hover:bg-gray-700/80"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>بزرگ تر</TooltipContent>
                </Tooltip>
              </div>

              { }
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50"
                >
                  <DropdownMenuItem onClick={handleFitToWidth} className="gap-2">
                    <Expand className="w-4 h-4" />
                    تنظیم بر اساس عرض
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFitToHeight} className="gap-2">
                    <Maximize className="w-4 h-4" />
                    تنظیم بر اساس ارتفاع
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleActualSize} className="gap-2">
                    <Grid className="w-4 h-4" />
                    اندازه واقعی
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleRotate} className="gap-2">
                    <RotateCw className="w-4 h-4" />
                    چرخش ۹۰ درجه
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              { }
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="h-8 w-8 p-0 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-700/80"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4" />
                    ) : (
                      <Fullscreen className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'خروج از تمام صفحه' : 'تمام صفحه'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </motion.div>

        { }
        <motion.div 
          className={`relative ${
            isFullscreen 
              ? 'p-4 sm:p-8' 
              : isGuestMode ? 'p-2' : 'p-6 sm:p-8 lg:p-10'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          
          { }
          <motion.div
            ref={viewerRef}
            className={`relative secure-content overflow-auto rounded-2xl border-2 border-gradient-to-br from-purple-200/50 to-blue-200/50 dark:from-purple-700/50 dark:to-blue-700/50 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/20 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 ${
              isFullscreen 
                ? 'min-h-[calc(100vh-200px)] max-h-[calc(100vh-200px)]' 
                : isGuestMode ? 'min-h-[60vh] max-h-[60vh]' : 'min-h-[70vh] max-h-[80vh]'
            }`}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            whileHover={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            
            { }
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            { }
            <div className="absolute inset-0 pointer-events-none z-10">
              { }
              <div className="absolute inset-0 flex items-center justify-center opacity-3">
                <motion.div 
                  className="text-4xl sm:text-6xl lg:text-8xl font-black text-purple-600/40 transform -rotate-45 select-none"
                  animate={{ 
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  محتوای محافظت شده
                </motion.div>
              </div>
              
              { }
              {!isLicensed && (
                <div className="absolute inset-0 flex items-center justify-center opacity-20 z-20">
                  <motion.div 
                    className="text-2xl sm:text-4xl lg:text-6xl font-bold text-amber-500 transform rotate-12 select-none"
                    animate={{ 
                      rotate: [12, 15, 12],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    {watermarkText}
                  </motion.div>
                </div>
              )}
            </div>
            
            { }
            <div className="absolute top-4 right-4 z-30 flex gap-2">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
              >
                <Badge 
                  variant="outline" 
                  className="border-purple-400/50 bg-purple-100/90 dark:bg-purple-900/90 text-purple-700 dark:text-purple-300 backdrop-blur-sm shadow-lg"
                >
                  <Shield className="w-3 h-3 ml-1" />
                  امن
                </Badge>
              </motion.div>
              
              {!isLicensed && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="border-amber-400/50 bg-amber-100/90 dark:bg-amber-900/90 text-amber-700 dark:text-amber-300 backdrop-blur-sm shadow-lg animate-pulse"
                  >
                    <Lock className="w-3 h-3 ml-1" />
                    محدود
                  </Badge>
                </motion.div>
              )}
            </div>

            { }
            <div className="relative z-10 w-full h-full pdf-persian-content">
              { }
              <Worker workerUrl="/js/pdf.worker.min.mjs">
                <Viewer
                  fileUrl={pdfUrl}
                  defaultScale={1.2}
                  withCredentials={false}
                  theme={{
                    direction: TextDirection.RightToLeft,
                  }}
                  transformGetDocumentParams={(options) =>
                    Object.assign({}, options, {
                      disableFontFace: true,
                      useSystemFonts: false,
                    })
                  }
                  onDocumentLoad={(e) => {
                    setTimeout(() => {
                      setIsLoading(false);
                      setPdfError(null);
                      optimizeTextLayer();
                    }, 0);
                  }}
                  renderError={(error) => {
                    setTimeout(() => {
                      setIsLoading(false);
                      setPdfError(error?.message || 'خطا در نمایش PDF');
                    }, 0);
                    return (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="text-6xl mb-4">📄</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          خطا در نمایش PDF
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {error?.message || 'فایل قابل نمایش نیست'}
                        </p>
                      </div>
                    );
                  }}
                />
              </Worker>
              
              { }
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full mb-6"
                    />
                    <div className="w-full max-w-md space-y-4">
                      <motion.div 
                        className="h-4 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 rounded-full"
                        animate={{ x: [-100, 100, -100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-4/6 animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                    <p className="text-purple-600 dark:text-purple-400 mt-4 font-medium">
                      در حال بارگذاری فایل...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              { }
              <AnimatePresence>
                {pdfError && (
                  <motion.div 
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <AlertCircle className="w-20 h-20 text-red-500 mb-4" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-3">
                      خطا در بارگذاری فایل
                    </h3>
                    <p className="text-red-600 dark:text-red-400 text-center max-w-md">
                      {pdfError}
                    </p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="mt-6 bg-red-500 hover:bg-red-600 text-white"
                    >
                      تلاش مجدد
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        { }
        {!isLicensed && (
          <motion.div 
            className={`${
              isFullscreen 
                ? 'fixed bottom-4 left-4 right-4' 
                : 'mt-8'
            } bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 backdrop-blur-sm rounded-2xl border border-amber-200/50 dark:border-amber-800/50 p-4 sm:p-6`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              { }
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                  <div>
                    <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm sm:text-base">
                      پیش نمایش محدود
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                      {formatPersianNumber(maxViewablePages)} از {formatPersianNumber(totalPages)} صفحه قابل مشاهده
                    </p>
                  </div>
                </div>
                
                { }
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-amber-700 dark:text-amber-300 mb-2">
                    <span>پیشرفت مطالعه</span>
                    <span>{formatPersianNumber(Math.round((maxViewablePages / totalPages) * 100))}%</span>
                  </div>
                  <div className="relative h-3 bg-amber-200/50 dark:bg-amber-800/50 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(maxViewablePages / totalPages) * 100}%` }}
                      transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
              </div>

              { }
              {onPurchaseRequest && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={onPurchaseRequest} 
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 via-blue-600 to-teal-600 hover:from-purple-600 hover:via-blue-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                  >
                    <span className="flex items-center gap-2">
                      خرید فایل کامل
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </motion.div>
                    </span>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

      </motion.div>
    </TooltipProvider>
  );
}
