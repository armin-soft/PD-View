import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText,
  Table,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatPersianPrice, formatPersianNumber, formatPersianDateTime } from '@/lib/persian-utils';

export function FinancialReports() {
  const [reportPeriod, setReportPeriod] = useState('month');
  const [reportType, setReportType] = useState('summary');
  const { toast } = useToast();

  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت آمار');
      return response.json();
    },
  });

  const { data: salesData } = useQuery({
    queryKey: ['/api/admin/sales-data'],
    queryFn: async () => {
      const response = await fetch('/api/admin/sales-data', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت داده های فروش');
      return response.json();
    },
  });



  return (
    <motion.div 
      className="space-y-6"
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
            <BarChart3 className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              گزارش های مالی
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              مشاهده گزارش های مالی تفصیلی
            </p>
          </div>
        </div>
        

      </motion.div>

      { }
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-purple-200/50 dark:border-purple-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Calendar className="w-5 h-5" />
              تنظیمات گزارش
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>دوره گزارش</Label>
                <Select value={reportPeriod} onValueChange={setReportPeriod}>
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">هفته جاری</SelectItem>
                    <SelectItem value="month">ماه جاری</SelectItem>
                    <SelectItem value="quarter">سه ماه گذشته</SelectItem>
                    <SelectItem value="year">سال جاری</SelectItem>
                    <SelectItem value="custom">دوره سفارشی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نوع گزارش</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">خلاصه مالی</SelectItem>
                    <SelectItem value="detailed">گزارش تفصیلی</SelectItem>
                    <SelectItem value="sales">گزارش فروش</SelectItem>
                    <SelectItem value="users">گزارش کاربران</SelectItem>
                    <SelectItem value="complete">گزارش کامل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      { }
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-20"></div>
            <CardContent className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="stat-card-icon bg-gradient-to-br from-green-500 to-emerald-600">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="stat-card-label text-gray-700 dark:text-gray-300">
                  درآمد کل
                </h3>
                <p className="stat-card-value text-gray-900 dark:text-white">
                  {formatPersianPrice(adminStats?.totalRevenue || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 opacity-20"></div>
            <CardContent className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="stat-card-icon bg-gradient-to-br from-blue-500 to-cyan-600">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="stat-card-label text-gray-700 dark:text-gray-300">
                  پرداخت های در انتظار
                </h3>
                <p className="stat-card-value text-gray-900 dark:text-white">
                  {formatPersianNumber(adminStats?.pendingPayments || 0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-600/10 opacity-20"></div>
            <CardContent className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="stat-card-icon bg-gradient-to-br from-purple-500 to-violet-600">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="stat-card-label text-gray-700 dark:text-gray-300">
                  رشد درآمد
                </h3>
                <p className="stat-card-value text-gray-900 dark:text-white">
                  {formatPersianNumber(adminStats?.revenueGrowth || 0)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-600/10 opacity-20"></div>
            <CardContent className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="stat-card-icon bg-gradient-to-br from-orange-500 to-amber-600">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="stat-card-label text-gray-700 dark:text-gray-300">
                  متوسط فروش
                </h3>
                <p className="stat-card-value text-gray-900 dark:text-white">
                  {formatPersianPrice((adminStats?.totalRevenue || 0) / Math.max(adminStats?.totalFiles || 1, 1))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      { }
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-purple-200/50 dark:border-purple-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Table className="w-5 h-5" />
              عملیات گزارش گیری
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Table className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">فرمت اکسل</p>
                  <p className="text-xs text-gray-500">قابل ویرایش و تحلیل</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                گزارش های مالی شامل آمار کاربران، فایل ها، درآمد و تحلیل های تفصیلی برای مشاهده آنلاین
              </p>
              <div className="flex justify-center">
                <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    گزارش های مالی برای مشاهده آنلاین در دسترس است
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}