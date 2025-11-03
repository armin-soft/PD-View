import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { queryClient } from '@/lib/queryClient';
import { AdminStats } from './AdminStats';
import { FileManagement } from './FileManagement';
import { UserManagement } from './UserManagement';
import { PaymentManagement } from './PaymentManagement';
import { FinancialReports } from './FinancialReports';
import { BankCardManagement } from './BankCardManagement';
import { DiscountCodeManagement } from './DiscountCodeManagement';
import { SalesChart } from '../charts/SalesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
 
import { 
  CheckCircle, 
  Upload, 
  Clock, 
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Home,
  FileText,
  Users,
  CreditCard,
  Sparkles,
  Zap,
  Shield,
  Settings
} from 'lucide-react';
import { formatPersianDateTime, getPersianRelativeTime } from '@/lib/persian-utils';

interface ActivityItem {
  id: number;
  userId: number | null;
  action: string;
  entity?: string;
  entityId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  userFirstName?: string | null;
  userLastName?: string | null;
  userUsername?: string | null;
  userEmail?: string | null;
}

interface AdminStats {
  totalUsers: number;
  totalFiles: number;
  totalRevenue: number;
  pendingPayments: number;
  userGrowth: number;
  fileGrowth: number;
  revenueGrowth: number;
}

interface SalesData {
  month: string;
  sales: number;
  files: number;
}

 
const getActivityInfo = (action: string, activity?: ActivityItem) => {
  const userName = activity?.userFirstName && activity?.userLastName 
    ? `${activity.userFirstName} ${activity.userLastName}` 
    : activity?.userUsername || 'کاربر';

  switch (action) {
    case 'login':
      return {
        title: 'ورود به سیستم',
        description: `${userName} وارد سیستم شد`,
        icon: CheckCircle,
        color: 'bg-green-100 dark:bg-green-900 text-green-600'
      };
    case 'user_created':
      return {
        title: 'کاربر جدید',
        description: `${userName} ثبت نام کرد`,
        icon: Users,
        color: 'bg-blue-100 dark:bg-blue-900 text-blue-600'
      };
    case 'file_uploaded':
      return {
        title: 'آپلود فایل',
        description: `${userName} فایل جدیدی آپلود کرد`,
        icon: Upload,
        color: 'bg-purple-100 dark:bg-purple-900 text-purple-600'
      };
    case 'purchase_approved':
      return {
        title: 'تایید خرید',
        description: `${userName} خرید را تایید کرد`,
        icon: CheckCircle,
        color: 'bg-green-100 dark:bg-green-900 text-green-600'
      };
    case 'purchase_created':
      return {
        title: 'خرید جدید',
        description: `${userName} خرید جدیدی ثبت کرد`,
        icon: CreditCard,
        color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600'
      };
    case 'bank_card_created':
      return {
        title: 'کارت بانکی جدید',
        description: `${userName} کارت بانکی جدیدی اضافه کرد`,
        icon: CreditCard,
        color: 'bg-blue-100 dark:bg-blue-900 text-blue-600'
      };
    case 'bank_card_updated':
      return {
        title: 'بروزرسانی کارت بانکی',
        description: `${userName} کارت بانکی را ویرایش کرد`,
        icon: CreditCard,
        color: 'bg-purple-100 dark:bg-purple-900 text-purple-600'
      };
    case 'bank_card_deleted':
      return {
        title: 'حذف کارت بانکی',
        description: `${userName} کارت بانکی را حذف کرد`,
        icon: CreditCard,
        color: 'bg-red-100 dark:bg-red-900 text-red-600'
      };
    case 'user_updated':
      return {
        title: 'بروزرسانی کاربر',
        description: `${userName} اطلاعات خود را بروزرسانی کرد`,
        icon: Users,
        color: 'bg-blue-100 dark:bg-blue-900 text-blue-600'
      };
    case 'purchase_status_updated':
      return {
        title: 'تغییر وضعیت خرید',
        description: `${userName} وضعیت خرید را تغییر داد`,
        icon: CreditCard,
        color: 'bg-orange-100 dark:bg-orange-900 text-orange-600'
      };
    default:
      return {
        title: 'فعالیت سیستم',
        description: `${userName}: ${action.replace(/_/g, ' ')}`,
        icon: Settings,
        color: 'bg-gray-100 dark:bg-gray-900 text-gray-600'
      };
  }
};

export function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

   
  useEffect(() => {
    const handleTabChange = (event: CustomEvent) => {
      const { tab } = event.detail;
      setActiveTab(tab);
    };

    window.addEventListener('adminTabChange', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('adminTabChange', handleTabChange as EventListener);
    };
  }, []);

   
  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت آمار مدیریت');
      return response.json();
    },
  });

  const { data: salesData } = useQuery<SalesData[]>({
    queryKey: ['/api/admin/sales-data'],
    queryFn: async () => {
      const response = await fetch('/api/admin/sales-data', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت داده های فروش');
      return response.json();
    },
  });

  const { data: activities } = useQuery<ActivityItem[]>({
    queryKey: ['/api/admin/activities'],
    queryFn: async () => {
      const response = await fetch('/api/admin/activities', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت فعالیت ها');
      return response.json();
    },
  });





  const handleRefresh = async () => {
    setRefreshing(true);
    try {
       
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/sales-data'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/admin/activities'] })
      ]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 w-full">
      { }
      <motion.div 
        className="flex flex-col gap-4 sm:gap-6 bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/50 dark:to-purple-900/50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4">
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              مرکز کنترل مدیریت
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              مدیریت جامع سیستم و بررسی آمار
            </p>
          </div>
        </div>
        <div className="flex justify-center xs:justify-start">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-300/50 dark:border-blue-600/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300 text-sm"
          >
            <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline">{refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی'}</span>
            <span className="xs:hidden">{refreshing ? 'بروزرسانی...' : 'بروز'}</span>
          </Button>
        </div>
      </motion.div>

      { }
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4 sm:space-y-6 w-full"
      >
        { }
        {activeTab === 'dashboard' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <AdminStats stats={adminStats || {
                totalUsers: 0,
                totalFiles: 0, 
                totalRevenue: 0,
                pendingPayments: 0,
                userGrowth: 0,
                fileGrowth: 0,
                revenueGrowth: 0
              }} />
            </motion.div>
            
            { }
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-blue-200/50 dark:border-blue-700/50 shadow-lg overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                    <span className="truncate">نمودار فروش</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="w-full overflow-x-auto">
                    <SalesChart data={salesData || []} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            { }
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-green-200/50 dark:border-green-700/50 shadow-lg overflow-hidden">
                <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                    <span className="truncate">فعالیت های اخیر</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="space-y-3 sm:space-y-4">
                    {activities && activities.length > 0 ? (
                      activities.slice(0, 5).map((activity) => {
                        const activityInfo = getActivityInfo(activity.action);
                        const Icon = activityInfo.icon;
                        return (
                          <motion.div
                            key={activity.id}
                            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30 border border-gray-200/50 dark:border-gray-700/50"
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activityInfo.color}`}>
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{activityInfo.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{activityInfo.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0 hidden xs:inline-flex">
                              {formatPersianDateTime(activity.createdAt)}
                            </Badge>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                        <Zap className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">فعالیت خاصی یافت نشد</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        { }
        {activeTab === 'files' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FileManagement />
          </motion.div>
        )}

        { }
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <UserManagement />
          </motion.div>
        )}

        { }
        {activeTab === 'payments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PaymentManagement />
          </motion.div>
        )}

        { }
        {activeTab === 'bank-cards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <BankCardManagement />
          </motion.div>
        )}

        { }
        {activeTab === 'discount-codes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <DiscountCodeManagement />
          </motion.div>
        )}

        { }
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <FinancialReports />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}