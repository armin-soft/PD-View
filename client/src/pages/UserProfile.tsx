import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatPersianPrice, formatPersianNumber, getPersianRelativeTime } from '@/lib/persian-utils';
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  CreditCard,
  Eye,
  Settings,
  Save,
  Phone,
  Crown,
  Sparkles,
  Activity,
  Calendar,
  CheckCircle,
  UserCheck,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
  phoneNumber: z.string().optional(),
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'اطلاعات رمز عبور اشتباه است',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;

interface UserStats {
  totalPurchases: number;
  totalSpent: number;
  memberSince: string | Date;
  lastLogin: string | Date;
}

export default function UserProfile() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

   
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

   
  const { data: securityLogs } = useQuery({
    queryKey: ['/api/user/security-logs'],
    enabled: isAuthenticated,
  });

   
  const { data: userStatsData } = useQuery<UserStats>({
    queryKey: ['/api/user/profile-stats'],
    enabled: isAuthenticated,
  });

   
  if (!isAuthenticated) {
    return null;
  }

  const logs = Array.isArray(securityLogs) ? securityLogs.map((log: any) => ({
    id: log.id,
    action: log.action,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt ? new Date(log.createdAt) : new Date(),
    details: log.details
  })) : [];

  const userStats = {
    totalPurchases: userStatsData?.totalPurchases || 0,
    totalSpent: userStatsData?.totalSpent || 0,
    memberSince: userStatsData?.memberSince ? new Date(userStatsData.memberSince) : new Date(),
    lastLogin: userStatsData?.lastLogin ? new Date(userStatsData.lastLogin) : new Date(),
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const response = await apiRequest('PUT', '/api/user/profile', data);
      return response.json();
    },
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile-stats'] });
      
      toast({
        title: 'پروفایل به روزرسانی شد',
        description: 'اطلاعات شما با موفقیت ذخیره شد',
      });
      
       
      form.setValue('currentPassword', '');
      form.setValue('newPassword', '');
      form.setValue('confirmPassword', '');
    },
    onError: (error: Error) => {
      toast({
        title: 'خطا در به روزرسانی',
        description: error.message || 'لطفاً دوباره تلاش کنید',
        variant: 'destructive',
      });
    },
  });

  const handleProfileUpdate = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const getActivityTitle = (action: string) => {
    const actionMap: Record<string, string> = {
      'login': 'ورود به سیستم',
      'profile_updated': 'بروزرسانی پروفایل',
      'user_role_updated': 'تغییر نقش کاربری',
      'user_deactivated': 'غیرفعال سازی حساب',
      'user_activated': 'فعال سازی حساب',
      'password_changed': 'تغییر رمز عبور',
      'email_updated': 'تغییر ایمیل',
      'purchase_created': 'خرید جدید',
      'file_uploaded': 'بارگذاری فایل',
      'file_downloaded': 'دانلود فایل',
      'bank_card_created': 'افزودن کارت بانکی',
      'bank_card_updated': 'بروزرسانی کارت بانکی',
      'bank_card_deleted': 'حذف کارت بانکی',
    };
    return actionMap[action] || action;
  };

  const getActivityDescription = (log: any) => {
    const baseDesc = getActivityTitle(log.action);
    if (log.ipAddress) {
      return `${baseDesc} - IP: ${log.ipAddress}`;
    }
    return baseDesc;
  };

  const getSecurityStatusIcon = (action: string) => {
    if (action === 'login') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (action === 'user_deactivated' || action.includes('delete')) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    } else if (action.includes('update') || action.includes('change')) {
      return <Activity className="w-4 h-4 text-blue-500" />;
    }
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        { }
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/50 dark:to-purple-900/50 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg backdrop-blur-sm mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Settings className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  پروفایل کاربری
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  مدیریت اطلاعات شخصی و تنظیمات حساب کاربری
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle variant="compact" size="md" />
            </div>
          </div>
        </motion.div>

        { }
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-purple-200/50 dark:border-purple-700/50 rounded-xl p-1 gap-1 sm:gap-0">
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">اطلاعات شخصی</span>
                <span className="sm:hidden">پروفایل</span>
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                <KeyRound className="w-3 h-3 sm:w-4 sm:h-4" />
                امنیت
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white rounded-lg transition-all duration-300 text-xs sm:text-sm"
              >
                <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">آمار کاربری</span>
                <span className="sm:hidden">آمار</span>
              </TabsTrigger>
            </TabsList>

            { }
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 shadow-xl">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-600/20 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                          ویرایش اطلاعات شخصی
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">
                          اطلاعات حساب کاربری خود را به روزرسانی کنید
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                          >
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <User className="w-4 h-4" />
                                    نام
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <User className="w-4 h-4" />
                                    نام خانوادگی
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                          >
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <UserCheck className="w-4 h-4" />
                                    نام کاربری
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                          >
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Mail className="w-4 h-4" />
                                    ایمیل
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="email" 
                                      className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                          >
                            <FormField
                              control={form.control}
                              name="phoneNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Phone className="w-4 h-4" />
                                    شماره تلفن
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5" />
                            تغییر رمز عبور
                          </h3>
                          <div className="grid md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 dark:text-gray-300">رمز عبور فعلی</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="password" 
                                      className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="newPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 dark:text-gray-300">رمز عبور جدید</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="password" 
                                      className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700 dark:text-gray-300">تکرار رمز عبور</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="password" 
                                      className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <motion.div 
                          className="flex justify-end"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            {updateProfileMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                                در حال ذخیره...
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 ml-2" />
                                ذخیره تغییرات
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            { }
            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-teal-600/20 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                          فعالیت های امنیتی
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400">
                          تاریخچه ورود و فعالیت های حساب کاربری
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {logs.length > 0 ? logs.map((log, index) => (
                        <motion.div
                          key={log.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
                          data-testid={`activity-log-${index}`}
                        >
                          <div className="flex items-center gap-4">
                            {getSecurityStatusIcon(log.action)}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {getActivityTitle(log.action)}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {log.ipAddress ? `آی‌پی: ${log.ipAddress}` : 'اطلاعات سیستم موجود نیست'}
                                {log.userAgent && ` • ${log.userAgent.split(' ')[0]}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {getPersianRelativeTime(log.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="text-center py-8">
                          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            هیچ فعالیت امنیتی یافت نشد
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            فعالیت های امنیتی حساب شما در اینجا نمایش داده می شود
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            { }
            <TabsContent value="stats">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </motion.div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        آمار کلی
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/50 dark:to-purple-900/50 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">کل خریدها:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {formatPersianNumber(userStats.totalPurchases)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50/50 to-teal-50/50 dark:from-green-900/50 dark:to-teal-900/50 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">مجموع هزینه:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatPersianPrice(userStats.totalSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/50 dark:to-pink-900/50 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">عضویت از:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {getPersianRelativeTime(userStats.memberSince)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-blue-600/20 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </motion.div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                        وضعیت حساب
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6">
                      <motion.div
                        className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4"
                        whileHover={{ scale: 1.1 }}
                      >
                        <CheckCircle className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        حساب تایید شده
                      </h3>
                      <Badge className="bg-green-500/10 text-green-600 border-green-200 dark:border-green-800">
                        کاربر فعال
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}