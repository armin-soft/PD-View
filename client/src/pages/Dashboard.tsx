import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/contexts/AuthContext';
import { formatPersianPrice, formatPersianNumber, getPersianRelativeTime } from '@/lib/persian-utils';
import { queryClient } from '@/lib/queryClient';
import {
  FileText,
  ShoppingCart,
  TrendingUp,
  Star,
  Calendar,
  Eye,
  CheckCircle,
  User,
  Sparkles,
  Crown,
  Award,
  BarChart3,
  PieChart,
  Clock,
  Activity,
  RefreshCw,
  DollarSign,
  Target,
  Zap,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Diamond,
  Heart,
  BookOpen,
  Gift,
  Trophy,
  Rocket,
  Globe,
  Shield,
  ChevronRight,
  PlayCircle,
  Bookmark,
  Plus,
  Minus,
  TrendingDown,
} from 'lucide-react';

interface PurchasedFile {
  id: number;
  title: string;
  price: number;
  purchaseDate: Date;
  status: 'active' | 'pending' | 'expired';
  totalPages: number;
}

interface PurchaseHistory {
  id: number;
  fileName: string;
  amount: number;
  date: Date;
  status: 'approved' | 'pending' | 'rejected';
}

interface UserStats {
  totalPurchases: number;
  totalSpent: number;
  activeLicenses: number;
  totalViews: number;
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);

   
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

   
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    enabled: isAuthenticated,
  });

  const { data: purchasedFiles } = useQuery({
    queryKey: ['/api/user/purchased-files'],
    enabled: isAuthenticated,
  });

  const { data: purchaseHistory } = useQuery({
    queryKey: ['/api/purchases'],
    enabled: isAuthenticated,
  });

   
  if (!isAuthenticated) {
    return null;
  }

   
  const stats = userStats || {
    totalPurchases: 0,
    totalSpent: 0,
    activeLicenses: 0,
    totalViews: 0
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/user/stats'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/user/purchased-files'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/purchases'] })
      ]);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-600 border-green-200 dark:border-green-800">فعال</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-800">در انتظار تایید</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-200 dark:border-red-800">رد شده</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800">منقضی شده</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-800">نامشخص</Badge>;
    }
  };

  const statsCards = [
    {
      title: 'کل خریدها',
      value: formatPersianNumber(stats.totalPurchases),
      icon: ShoppingCart,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'from-blue-500/5 via-blue-400/10 to-purple-600/5',
      textColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%',
      trendUp: true,
      description: 'افزایش نسبت به ماه گذشته'
    },
    {
      title: 'مجموع هزینه',
      value: formatPersianPrice(stats.totalSpent),
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-500/5 via-emerald-400/10 to-teal-600/5',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      trend: '+8%',
      trendUp: true,
      description: 'کل مبلغ پرداختی تاکنون'
    },
    {
      title: 'مجوزهای فعال',
      value: formatPersianNumber(stats.activeLicenses),
      icon: Crown,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'from-violet-500/5 via-violet-400/10 to-purple-600/5',
      textColor: 'text-violet-600 dark:text-violet-400',
      trend: '+3',
      trendUp: true,
      description: 'فایل های در دسترس شما'
    },
    {
      title: 'کل بازدیدها',
      value: formatPersianNumber(stats.totalViews),
      icon: Eye,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-500/5 via-amber-400/10 to-orange-600/5',
      textColor: 'text-amber-600 dark:text-amber-400',
      trend: '+25%',
      trendUp: true,
      description: 'تعداد بازدیدهای انجام شده'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-gradient-to-r from-violet-400/15 to-pink-600/15 rounded-full blur-3xl"></div>
      </div>

      <Navigation />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        { }
        <motion.div 
          className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl p-8 mb-8 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          { }
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-3xl" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <motion.div
                className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <User className="relative z-10 w-8 h-8 text-white" />
              </motion.div>
              
              <div>
                <motion.h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  داشبورد کاربری
                </motion.h1>
                <motion.div 
                  className="flex items-center gap-3 mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <p className="text-slate-600 dark:text-slate-400">
                    خوش آمدید، <span className="font-bold text-slate-800 dark:text-white">{user?.firstName} {user?.lastName}</span>
                  </p>
                  <Badge className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-700/50">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    کاربر فعال
                  </Badge>
                </motion.div>
              </div>
            </div>
            
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="lg"
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-600/50 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 shadow-lg"
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                به روزرسانی
              </Button>
            </motion.div>
          </div>
        </motion.div>

        { }
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 hover:border-purple-400/50 dark:hover:border-purple-500/50 shadow-lg hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2">
                        {stat.title}
                      </p>
                      <p className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black ${stat.textColor} transition-colors`}>
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          <span className="font-semibold">{stat.trend}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{stat.description}</span>
                      </div>
                    </div>
                    <motion.div
                      className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${stat.bgColor} rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 15 }}
                    >
                      <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${stat.textColor}`} />
                    </motion.div>
                  </div>
                  <div className={`mt-3 h-1 bg-gradient-to-r ${stat.color} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        { }
        <div className="grid lg:grid-cols-3 gap-8">
          { }
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >

          </motion.div>

          { }
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            { }
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-600/20 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    خلاصه پروفایل
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/50 dark:to-blue-900/50 rounded-xl">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    <User className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username
                    }
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {user?.email}
                  </p>
                  <Badge className="bg-gradient-to-r from-green-500/10 to-teal-600/10 text-green-600 border-green-200 dark:border-green-800">
                    <CheckCircle className="w-3 h-3 ml-1" />
                    کاربر فعال
                  </Badge>
                </div>
              </CardContent>
            </Card>

            { }
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    دسترسی سریع
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { 
                    title: 'کتابخانه پی دی اف', 
                    icon: BookOpen, 
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50',
                    textColor: 'text-blue-600 dark:text-blue-400',
                    href: '/pdf-library'
                  },

                  { 
                    title: 'پروفایل کاربری', 
                    icon: User, 
                    color: 'from-green-500 to-green-600',
                    bgColor: 'from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50',
                    textColor: 'text-green-600 dark:text-green-400',
                    href: '/profile'
                  }
                ].map((action, index) => (
                  <motion.div
                    key={action.title}
                    className={`p-4 bg-gradient-to-r ${action.bgColor} rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                        whileHover={{ rotate: 10 }}
                      >
                        <action.icon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <p className={`font-semibold ${action.textColor}`}>
                          {action.title}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${action.textColor} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            { }
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-yellow-500/20 to-orange-600/20 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </motion.div>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    دستاوردها
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { 
                      icon: Crown, 
                      title: 'خریدار نمونه', 
                      color: 'from-yellow-400 to-orange-500',
                      bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30',
                      earned: true 
                    },
                    { 
                      icon: Star, 
                      title: 'کاربر فعال', 
                      color: 'from-blue-400 to-purple-500',
                      bgColor: 'from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30',
                      earned: true 
                    },
                    { 
                      icon: Heart, 
                      title: 'طرفدار وفادار', 
                      color: 'from-pink-400 to-red-500',
                      bgColor: 'from-pink-50 to-red-50 dark:from-pink-900/30 dark:to-red-900/30',
                      earned: false 
                    },
                    { 
                      icon: Rocket, 
                      title: 'اولی بودن', 
                      color: 'from-green-400 to-teal-500',
                      bgColor: 'from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30',
                      earned: true 
                    }
                  ].map((badge, index) => (
                    <motion.div
                      key={badge.title}
                      className={`relative p-4 bg-gradient-to-r ${badge.bgColor} rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center ${badge.earned ? 'opacity-100' : 'opacity-50'}`}
                      whileHover={{ scale: badge.earned ? 1.05 : 1 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: badge.earned ? 1 : 0.5, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      {badge.earned && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1 + index * 0.1 }}
                        >
                          <CheckCircle className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                      <motion.div
                        className={`w-8 h-8 bg-gradient-to-r ${badge.color} rounded-lg flex items-center justify-center mx-auto mb-2`}
                        whileHover={badge.earned ? { rotate: 360 } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <badge.icon className="w-4 h-4 text-white" />
                      </motion.div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {badge.title}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}