import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { formatPersianPrice, formatPersianNumber, formatPersianDateTime } from '@/lib/persian-utils';
import { useAuth } from '@/contexts/AuthContext';
import { queryClient } from '@/lib/queryClient';
import {
  ShoppingCart,
  Eye,
  Search,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Calendar,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

interface Purchase {
  id: number;
  fileId: number;
  fileName: string;
  fileCategory: string;
  amount: number;
  discountCode?: string;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}

interface UserPurchaseStats {
  totalPurchases: number;
  totalSpent: number;
  approvedPurchases: number;
  pendingPurchases: number;
}

export default function PurchaseHistory() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [refreshing, setRefreshing] = useState(false);

   
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

   
  if (!isAuthenticated) {
    return null;
  }

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['/api/user/purchases', { search: searchQuery, status: statusFilter, sort: sortBy }],
  });

  const { data: userStats } = useQuery<UserPurchaseStats>({
    queryKey: ['/api/user/purchase-stats'],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
       
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/user/purchases'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/user/purchase-stats'] })
      ]);
      
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">تایید شده</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">در انتظار</Badge>;
      case 'rejected':
        return <Badge variant="destructive">رد شده</Badge>;
      default:
        return <Badge variant="secondary">نامشخص</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };


  const filteredPurchases = (purchases as Purchase[])?.filter(purchase => {
    const matchesSearch = purchase.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedPurchases = filteredPurchases?.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'amount-high':
        return b.finalAmount - a.finalAmount;
      case 'amount-low':
        return a.finalAmount - b.finalAmount;
      default:
        return 0;
    }
  });

  const stats = userStats || {
    totalPurchases: 0,
    totalSpent: 0,
    approvedPurchases: 0,
    pendingPurchases: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        { }
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/50 dark:to-purple-900/50 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg backdrop-blur-sm mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <ShoppingCart className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                تاریخچه خریدها
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                مشاهده و مدیریت تمام خریدهای انجام شده
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle variant="compact" size="md" />
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-300/50 dark:border-blue-600/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-300"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'در حال بروزرسانی...' : 'بروزرسانی'}
            </Button>
          </div>
        </motion.div>

        { }
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            {
              title: 'کل خریدها',
              value: formatPersianNumber(stats.totalPurchases),
              icon: ShoppingCart,
              color: 'from-purple-500 to-blue-600',
              bgColor: 'from-purple-500/10 to-blue-600/10',
              textColor: 'text-purple-600 dark:text-purple-400'
            },
            {
              title: 'مجموع هزینه',
              value: formatPersianPrice(stats.totalSpent),
              icon: CreditCard,
              color: 'from-yellow-500 to-orange-600',
              bgColor: 'from-yellow-500/10 to-orange-600/10',
              textColor: 'text-yellow-600 dark:text-yellow-400'
            },
            {
              title: 'تایید شده',
              value: formatPersianNumber(stats.approvedPurchases),
              icon: CheckCircle,
              color: 'from-green-500 to-teal-600',
              bgColor: 'from-green-500/10 to-teal-600/10',
              textColor: 'text-green-600 dark:text-green-400'
            },
            {
              title: 'در انتظار',
              value: formatPersianNumber(stats.pendingPurchases),
              icon: Clock,
              color: 'from-orange-500 to-red-600',
              bgColor: 'from-orange-500/10 to-red-600/10',
              textColor: 'text-orange-600 dark:text-orange-400'
            }
          ].map((stat, index) => (
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="mb-6 sm:mb-8 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-700/50 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-center justify-between">
                { }
                <div className="relative flex-1 max-w-md w-full lg:w-auto">
                  <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <Input
                    placeholder="جستجو در خریدها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 sm:pr-12 pl-3 sm:pl-4 py-2 sm:py-3 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl text-sm sm:text-lg"
                  />
                </div>

                { }
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full lg:w-auto">
                  { }
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40 lg:w-48 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه وضعیت ها</SelectItem>
                      <SelectItem value="approved">تایید شده</SelectItem>
                      <SelectItem value="pending">در انتظار</SelectItem>
                      <SelectItem value="rejected">رد شده</SelectItem>
                    </SelectContent>
                  </Select>

                  { }
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40 lg:w-48 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-xl">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">جدیدترین</SelectItem>
                      <SelectItem value="oldest">قدیمی ترین</SelectItem>
                      <SelectItem value="amount-high">گران ترین</SelectItem>
                      <SelectItem value="amount-low">ارزان ترین</SelectItem>
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
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/30 dark:border-purple-700/30 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      تاریخچه خریدها
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400">
                      {formatPersianNumber(sortedPurchases?.length || 0)} خرید ثبت شده
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <motion.div
                    className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">در حال بارگذاری خریدها...</p>
                </div>
              ) : sortedPurchases?.length === 0 ? (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div
                    className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
                    whileHover={{ scale: 1.1 }}
                  >
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    هنوز خریدی انجام نداده اید
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    برای مشاهده و خرید فایل های موجود به کتابخانه دیجیتال ما مراجعه کنید
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <FileText className="w-4 h-4 ml-2" />
                    مشاهده کتابخانه
                  </Button>
                </motion.div>
              ) : (
                <>
                  { }
                  <div className="hidden lg:block">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>شناسه</TableHead>
                            <TableHead>فایل</TableHead>
                            <TableHead>مبلغ</TableHead>
                            <TableHead>وضعیت</TableHead>
                            <TableHead>تاریخ خرید</TableHead>
                            <TableHead>عملیات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedPurchases?.map((purchase) => (
                            <TableRow key={purchase.id}>
                              <TableCell className="font-mono">
                                #{formatPersianNumber(purchase.id)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{purchase.fileName}</p>
                                  <p className="text-sm text-gray-500">{purchase.fileCategory}</p>
                                  {purchase.discountCode && (
                                    <p className="text-sm text-green-600">
                                      کد تخفیف: {purchase.discountCode}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  {purchase.discountAmount > 0 && (
                                    <p className="text-sm text-gray-500 line-through">
                                      {formatPersianPrice(purchase.amount)}
                                    </p>
                                  )}
                                  <p className="font-bold">
                                    {formatPersianPrice(purchase.finalAmount)}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(purchase.status)}
                                  {getStatusBadge(purchase.status)}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatPersianDateTime(new Date(purchase.createdAt))}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="مشاهده جزئیات"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  { }
                  <div className="lg:hidden space-y-4">
                    {sortedPurchases?.map((purchase) => (
                      <motion.div
                        key={purchase.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                              {purchase.fileName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                              شناسه: #{formatPersianNumber(purchase.id)}
                            </p>
                            {purchase.discountCode && (
                              <p className="text-xs sm:text-sm text-green-600 mt-1">
                                کد تخفیف: {purchase.discountCode}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            {getStatusIcon(purchase.status)}
                            {getStatusBadge(purchase.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">مبلغ</p>
                            <div className="mt-1">
                              {purchase.discountAmount > 0 && (
                                <p className="text-xs text-gray-500 line-through">
                                  {formatPersianPrice(purchase.amount)}
                                </p>
                              )}
                              <p className="font-bold text-sm">
                                {formatPersianPrice(purchase.finalAmount)}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">تاریخ خرید</p>
                            <p className="text-xs sm:text-sm font-medium mt-1">
                              {formatPersianDateTime(new Date(purchase.createdAt))}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-xs sm:text-sm"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                            جزئیات
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
          </CardContent>
        </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}