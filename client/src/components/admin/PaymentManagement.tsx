import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPersianPrice, formatPersianNumber, formatPersianDateTime } from '@/lib/persian-utils';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  BarChart3,
  Activity,
  Sparkles,
  Zap,
  Crown,
  Shield,
  Upload,
  Star,
  Heart,
  Gift,
  Wallet,
  Download,
} from 'lucide-react';

interface Purchase {
  id: number;
  userId: number;
  fileId: number;
  userName: string;
  userEmail: string;
  userFirstName?: string;
  userLastName?: string;
  fileName: string;
  amount: number;
  discountCode?: string;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  transactionId?: string;
  adminNotes?: string;
  createdAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  approvedCount: number;
  rejectedCount: number;
  revenueGrowth: number;
  transactionGrowth: number;
}

export function PaymentManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['/api/admin/purchases', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/purchases?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت خریدها');
      return response.json();
    },
  });

  const { data: paymentStats } = useQuery({
    queryKey: ['/api/admin/payment-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/payment-stats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت آمار پرداخت ها');
      return response.json();
    },
  });

  const updatePurchaseStatusMutation = useMutation({
    mutationFn: async ({ 
      purchaseId, 
      status, 
      adminNotes 
    }: { 
      purchaseId: number; 
      status: string; 
      adminNotes?: string;
    }) => {
      const response = await fetch(`/api/admin/purchases/${purchaseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در تغییر وضعیت پرداخت');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-stats'] });
      toast({ title: 'وضعیت پرداخت تغییر یافت' });
      setReviewDialogOpen(false);
      setSelectedPurchase(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'خطا در تغییر وضعیت', 
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    },
  });

  const purchasesList = Array.isArray(purchases) ? purchases : [];
  const stats: PaymentStats = (paymentStats as PaymentStats) || {
    totalRevenue: 0,
    pendingAmount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    revenueGrowth: 0,
    transactionGrowth: 0,
  };

  const getUserDisplayName = (purchase: Purchase) => {
    if (purchase.userEmail?.includes('@deleted.local')) {
      return 'کاربر حذف شده';
    }
    return purchase.userName || 'کاربر ناشناس';
  };

  const getUserDisplayEmail = (purchase: Purchase) => {
    if (purchase.userEmail?.includes('@deleted.local')) {
      return 'حساب کاربری حذف شده';
    }
    return purchase.userEmail || '-';
  };

  const filteredPurchases = purchasesList.filter((purchase: Purchase) => {
    const displayName = getUserDisplayName(purchase);
    const displayEmail = getUserDisplayEmail(purchase);
    const matchesSearch = 
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      displayEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (purchase.transactionId && purchase.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleReviewPurchase = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setAdminNotes(purchase.adminNotes || '');
    setReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedPurchase) {
      updatePurchaseStatusMutation.mutate({
        purchaseId: selectedPurchase.id,
        status: 'approved',
        adminNotes
      });
    }
  };

  const handleReject = () => {
    if (selectedPurchase) {
      updatePurchaseStatusMutation.mutate({
        purchaseId: selectedPurchase.id,
        status: 'rejected',
        adminNotes
      });
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/admin/reports/excel', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('خطا در دریافت فایل گزارش');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({ 
        title: 'گزارش با موفقیت دانلود شد',
        description: 'فایل اکسل گزارش پرداخت ها آماده است'
      });
    } catch (error) {
      toast({ 
        title: 'خطا در دانلود گزارش', 
        description: 'لطفاً دوباره تلاش کنید',
        variant: 'destructive' 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="w-3 h-3 ml-1" />
            تایید شده
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <XCircle className="w-3 h-3 ml-1" />
            رد شده
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock className="w-3 h-3 ml-1" />
            در انتظار
          </Badge>
        );
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      case 'wallet':
        return <Wallet className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'card_to_card': 'کارت به کارت',
      'card': 'کارت بانکی',
      'wallet': 'کیف پول',
      'online': 'پرداخت آنلاین',
    };
    return labels[method.toLowerCase()] || method;
  };

  return (
    <motion.div 
      className="space-y-4 sm:space-y-6 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      { }
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/50 dark:to-pink-900/50 p-6 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <CreditCard className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              مدیریت پرداخت ها
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              بررسی، تایید و مدیریت تراکنش های مالی
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleExportExcel}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg"
          data-testid="button-export-excel"
        >
          <Download className="w-4 h-4 ml-2" />
          دانلود گزارش اکسل
        </Button>

      </motion.div>

      { }
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-green-200/50 dark:border-green-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">کل درآمد</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatPersianPrice(stats.totalRevenue)}
                </p>
                <p className="text-xs text-green-500 mt-1">
                  +{formatPersianNumber(stats.revenueGrowth)}% نسبت به ماه قبل
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-yellow-200/50 dark:border-yellow-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">در انتظار تایید</p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatPersianPrice(stats.pendingAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">نیاز به بررسی</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-blue-200/50 dark:border-blue-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">تایید شده</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPersianNumber(stats.approvedCount)}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  +{formatPersianNumber(stats.transactionGrowth)}% امروز
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-red-200/50 dark:border-red-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">رد شده</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatPersianNumber(stats.rejectedCount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">کل رد شده ها</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      { }
      <motion.div 
        className="flex flex-col sm:flex-row gap-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="جستجو در پرداخت ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-purple-500 dark:focus:border-purple-400"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white/50 dark:bg-gray-800/50">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder="وضعیت پرداخت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه پرداخت ها</SelectItem>
            <SelectItem value="pending">در انتظار</SelectItem>
            <SelectItem value="approved">تایید شده</SelectItem>
            <SelectItem value="rejected">رد شده</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      { }
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              لیست پرداخت ها ({formatPersianNumber(filteredPurchases.length)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse">
                    <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPurchases.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  پرداختی یافت نشد
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  {searchQuery ? 'پرداخت مورد نظر پیدا نشد' : 'هیچ پرداختی ثبت نشده است'}
                </p>
              </motion.div>
            ) : (
              <>
                { }
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                      <TableHead className="text-right font-semibold">کاربر</TableHead>
                      <TableHead className="text-right font-semibold">فایل</TableHead>
                      <TableHead className="text-right font-semibold">مبلغ</TableHead>
                      <TableHead className="text-right font-semibold">روش پرداخت</TableHead>
                      <TableHead className="text-right font-semibold">وضعیت</TableHead>
                      <TableHead className="text-right font-semibold">تاریخ</TableHead>
                      <TableHead className="text-center font-semibold">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredPurchases.map((purchase: Purchase, index) => (
                        <motion.tr
                          key={purchase.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {getUserDisplayName(purchase)}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {getUserDisplayEmail(purchase)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-500" />
                              <span className="font-medium">{purchase.fileName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {purchase.discountAmount > 0 && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatPersianPrice(purchase.amount)}
                                </div>
                              )}
                              <div className="font-semibold text-purple-600 dark:text-purple-400">
                                {formatPersianPrice(purchase.finalAmount)}
                              </div>
                              {purchase.discountCode && (
                                <div className="text-xs text-green-500 flex items-center gap-1">
                                  <Gift className="w-3 h-3" />
                                  {purchase.discountCode}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(purchase.paymentMethod)}
                              <span className="text-sm">{getPaymentMethodLabel(purchase.paymentMethod)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(purchase.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {formatPersianDateTime(purchase.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReviewPurchase(purchase)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {purchase.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPurchase(purchase);
                                      updatePurchaseStatusMutation.mutate({
                                        purchaseId: purchase.id,
                                        status: 'approved'
                                      });
                                    }}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPurchase(purchase);
                                      updatePurchaseStatusMutation.mutate({
                                        purchaseId: purchase.id,
                                        status: 'rejected'
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                { }
                <div className="lg:hidden space-y-4">
                  <AnimatePresence>
                    {filteredPurchases.map((purchase: Purchase, index) => (
                      <motion.div
                        key={purchase.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        { }
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {getUserDisplayName(purchase)}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {getUserDisplayEmail(purchase)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <FileText className="w-3 h-3 text-purple-500" />
                              <span className="text-xs sm:text-sm font-medium">{purchase.fileName}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(purchase.status)}
                          </div>
                        </div>

                        { }
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">مبلغ</p>
                            <div className="mt-1">
                              {purchase.discountAmount > 0 && (
                                <p className="text-xs text-gray-500 line-through">
                                  {formatPersianPrice(purchase.amount)}
                                </p>
                              )}
                              <p className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                                {formatPersianPrice(purchase.finalAmount)}
                              </p>
                              {purchase.discountCode && (
                                <div className="text-xs text-green-500 flex items-center gap-1 mt-1">
                                  <Gift className="w-3 h-3" />
                                  {purchase.discountCode}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">روش پرداخت</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getPaymentMethodIcon(purchase.paymentMethod)}
                              <span className="text-xs sm:text-sm">{getPaymentMethodLabel(purchase.paymentMethod)}</span>
                            </div>
                          </div>
                        </div>

                        { }
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReviewPurchase(purchase)}
                            className="flex-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            بررسی
                          </Button>
                          {purchase.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPurchase(purchase);
                                  updatePurchaseStatusMutation.mutate({
                                    purchaseId: purchase.id,
                                    status: 'approved'
                                  });
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedPurchase(purchase);
                                  updatePurchaseStatusMutation.mutate({
                                    purchaseId: purchase.id,
                                    status: 'rejected'
                                  });
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                              >
                                <XCircle className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      { }
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-purple-200/50 dark:border-purple-700/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              بررسی پرداخت
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              مشاهده جزئیات و تایید یا رد پرداخت
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4 py-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">اطلاعات تراکنش</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">کاربر:</span>
                    <p className="font-medium">{selectedPurchase.userName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">فایل:</span>
                    <p className="font-medium">{selectedPurchase.fileName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">مبلغ نهایی:</span>
                    <p className="font-medium text-purple-600">
                      {formatPersianPrice(selectedPurchase.finalAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">کد تراکنش:</span>
                    <p className="font-medium">{selectedPurchase.transactionId || 'ندارد'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">یادداشت مدیر</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="یادداشت یا توضیحات اضافی..."
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                >
                  انصراف
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={updatePurchaseStatusMutation.isPending}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  رد کردن
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={updatePurchaseStatusMutation.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تایید کردن
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


    </motion.div>
  );
}