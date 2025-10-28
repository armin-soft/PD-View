import { Suspense, lazy } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

 
const SecurePdfViewer = lazy(() => 
  import('./SecurePDFViewer').then(module => ({
    default: module.SecurePdfViewer
  }))
);

interface PDFViewerLazyProps {
  fileId: number;
  title: string;
  isLicensed: boolean;
  pageLimit?: number;
  totalPages: number;
  watermarkText?: string;
  onPurchaseRequest?: () => void;
  isGuestMode?: boolean;
}

 
function PDFViewerSkeleton() {
  return (
    <Card className="w-full min-h-[600px] flex items-center justify-center">
      <CardContent className="p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-16 h-16 text-purple-500 animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              در حال بارگذاری نمایشگر PDF
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              لطفاً صبر کنید...
            </p>
          </div>
          <Progress value={undefined} className="w-64" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PDFViewerLazy(props: PDFViewerLazyProps) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PDFViewerSkeleton />}>
        <SecurePdfViewer {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}