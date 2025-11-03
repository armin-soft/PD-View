import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPersianNumber, formatPersianDateTime, formatPersianPrice } from '@/lib/persian-utils';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Lock,
  Unlock,
  Crown,
  Star,
  TrendingUp,
  Activity,
  Calendar,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Sparkles,
  Zap,
  BookOpen,
  FileText,
  ShoppingCart,
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  totalPurchases: number;
  totalSpent: number;
  lastLogin: string;
  createdAt: string;
}

interface UserActivity {
  id: number;
  action: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export function UserManagement() {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<{fileId: number, title: string, hasAccess: boolean}[]>([]);
  const [permanentDeleteDialogOpen, setPermanentDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users', searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter && roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت کاربران');
      return response.json();
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در تغییر وضعیت کاربر');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'تغییر وضعیت کاربر',
        description: `کاربر ${data.isActive ? 'فعال' : 'غیرفعال'} شد.`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در تغییر وضعیت کاربر',
        description: error.message || 'عملیات تغییر وضعیت کاربر ناموفق بود. لطفاً دوباره تلاش کنید.',
        variant: 'destructive'
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ایجاد کاربر');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setNewUserDialogOpen(false);
      toast({
        title: 'کاربر جدید ایجاد شد',
        description: `کاربر ${data.firstName} ${data.lastName} با موفقیت ایجاد شد.`
      });
       
      const form = document.querySelector('form');
      if (form) form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در ایجاد کاربر',
        description: error.message || 'عملیات ایجاد کاربر ناموفق بود. لطفاً دوباره تلاش کنید.',
        variant: 'destructive'
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در غیرفعال کردن کاربر');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'غیرفعال کردن کاربر',
        description: 'کاربر با موفقیت غیرفعال و حساب کاربری او ناشناس شد. برای مشاهده کاربران غیرفعال، فیلتر وضعیت را تغییر دهید.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در غیرفعال کردن کاربر',
        description: error.message || 'عملیات غیرفعال کردن کاربر ناموفق بود. لطفاً دوباره تلاش کنید.',
        variant: 'destructive'
      });
    },
  });

  const permanentDeleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/permanent`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در حذف دائمی کاربر');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setPermanentDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        title: 'حذف دائمی کاربر',
        description: 'کاربر به طور کامل و دائم از دیتابیس حذف شد.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در حذف دائمی کاربر',
        description: error.message || 'عملیات حذف دائمی کاربر ناموفق بود. لطفاً دوباره تلاش کنید.',
        variant: 'destructive'
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: any }) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ویرایش کاربر');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditUserDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: 'ویرایش کاربر',
        description: `اطلاعات کاربر ${data.firstName} ${data.lastName} با موفقیت به روزرسانی شد.`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در ویرایش کاربر',
        description: error.message || 'عملیات ویرایش کاربر ناموفق بود. لطفاً دوباره تلاش کنید.',
        variant: 'destructive'
      });
    },
  });

   
  const getPermissionsMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در دریافت مجوزها');
      return response.json();
    },
    onSuccess: (data) => {
      setUserPermissions(data);
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در دریافت مجوزها',
        description: error.message || 'دریافت مجوزهای کاربر ناموفق بود.',
        variant: 'destructive'
      });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, filePermissions }: { userId: number; filePermissions: {fileId: number, hasAccess: boolean}[] }) => {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePermissions }),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('خطا در به روزرسانی مجوزها');
      return response.json();
    },
    onSuccess: () => {
      setPermissionsDialogOpen(false);
      toast({
        title: 'به روزرسانی مجوزها',
        description: 'مجوزهای دسترسی کاربر با موفقیت به روزرسانی شد.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطا در به روزرسانی مجوزها',
        description: error.message || 'عملیات به روزرسانی مجوزها ناموفق بود.',
        variant: 'destructive'
      });
    },
  });

  const usersList = Array.isArray(users) ? users : [];

  const filteredUsers = usersList.filter((user: User) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const getUserStatusBadge = (user: User) => {
    if (!user.isActive) {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <UserX className="w-3 h-3 ml-1" />
          غیرفعال
        </Badge>
      );
    }
    
    return user.role === 'admin' ? (
      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
        <Crown className="w-3 h-3 ml-1" />
        مدیر
      </Badge>
    ) : (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
        <UserCheck className="w-3 h-3 ml-1" />
        کاربر فعال
      </Badge>
    );
  };

  const getUserInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return user.username.charAt(0).toUpperCase();
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
        className="flex flex-col gap-4 sm:gap-6 bg-gradient-to-r from-white via-orange-50 to-red-50 dark:from-gray-900 dark:via-orange-900/50 dark:to-red-900/50 p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-orange-200/50 dark:border-orange-700/50 shadow-lg backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4">
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              مدیریت کاربران
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              مشاهده، ویرایش و مدیریت حساب های کاربری
            </p>
          </div>
        </div>
        
        <div className="flex justify-center xs:justify-start">
          <Button 
            variant="outline" 
            size="sm"
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-sm"
            onClick={() => setNewUserDialogOpen(true)}
          >
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
            <span className="hidden xs:inline">کاربر جدید</span>
            <span className="xs:hidden">جدید</span>
          </Button>
        </div>
      </motion.div>

      { }
      <motion.div 
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-blue-200/50 dark:border-blue-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">کل کاربران</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatPersianNumber(usersList.length)}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-green-200/50 dark:border-green-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">کاربران فعال</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatPersianNumber(usersList.filter((u: User) => u.isActive).length)}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-purple-200/50 dark:border-purple-700/50 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">مدیران</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatPersianNumber(usersList.filter((u: User) => u.role === 'admin').length)}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      { }
      {statusFilter !== 'active' && (
        <motion.div
          className="p-4 bg-blue-50/80 dark:bg-blue-900/30 rounded-xl border border-blue-200/50 dark:border-blue-700/50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                توجه: کاربران غیرفعال
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                در حال مشاهده کاربران غیرفعال هستید. این کاربران از سیستم حذف نشده‌اند، فقط حساب آنها غیرفعال و ناشناس شده است.
              </p>
            </div>
          </div>
        </motion.div>
      )}

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
            placeholder="جستجو در کاربران..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-white/50 dark:bg-gray-800/50 border-gray-300/50 dark:border-gray-600/50 focus:border-orange-500 dark:focus:border-orange-400"
          />
        </div>
        
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-white/50 dark:bg-gray-800/50">
            <SelectValue placeholder="نقش" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه نقش ها</SelectItem>
            <SelectItem value="admin">مدیران</SelectItem>
            <SelectItem value="user">کاربران</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px] bg-white/50 dark:bg-gray-800/50">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت ها</SelectItem>
            <SelectItem value="active">فعال</SelectItem>
            <SelectItem value="inactive">غیرفعال</SelectItem>
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
              <Activity className="w-5 h-5 text-orange-500" />
              لیست کاربران ({formatPersianNumber(filteredUsers.length)})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 animate-pulse">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  کاربری یافت نشد
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  {searchQuery ? 'کاربر مورد نظر پیدا نشد' : 'هیچ کاربری ثبت نشده است'}
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
                      <TableHead className="text-right font-semibold">نقش</TableHead>
                      <TableHead className="text-right font-semibold">آمار خرید</TableHead>
                      <TableHead className="text-right font-semibold">آخرین ورود</TableHead>
                      <TableHead className="text-right font-semibold">وضعیت</TableHead>
                      <TableHead className="text-center font-semibold">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredUsers.map((user: User, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border-2 border-orange-200/50">
                                <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold">
                                  {getUserInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {user.firstName && user.lastName 
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.username
                                  }
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getUserStatusBadge(user)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {formatPersianNumber(user.totalPurchases)} خرید
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatPersianPrice(user.totalSpent)} تومان
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {user.lastLogin ? formatPersianDateTime(new Date(user.lastLogin)) : 'هرگز'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              variant="gradient"
                              size="sm"
                              checked={user.isActive}
                              onCheckedChange={(checked) => 
                                toggleUserStatusMutation.mutate({ userId: user.id, isActive: checked })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUserDetails(user)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setEditUserDialogOpen(true);
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  getPermissionsMutation.mutate(user.id);
                                  setPermissionsDialogOpen(true);
                                }}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                              >
                                <BookOpen className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm(`آیا از غیرفعال کردن کاربر ${user.firstName} ${user.lastName} اطمینان دارید؟\n\nتوجه: این عملیات کاربر را حذف نمی‌کند، بلکه حساب کاربری را غیرفعال و ناشناس می‌کند.`)) {
                                    deleteUserMutation.mutate(user.id);
                                  }
                                }}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                                disabled={deleteUserMutation.isPending}
                                title="غیرفعال کردن کاربر"
                                data-testid={`button-deactivate-user-${user.id}`}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUserToDelete(user);
                                  setPermanentDeleteDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                                disabled={permanentDeleteUserMutation.isPending}
                                title="حذف دائمی از دیتابیس"
                                data-testid={`button-permanent-delete-user-${user.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
                    {filteredUsers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        { }
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                                {user.firstName} {user.lastName}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                @{user.username}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {user.role === 'admin' ? (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                <Crown className="w-3 h-3 ml-1" />
                                ادمین
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Users className="w-3 h-3 ml-1" />
                                کاربر
                              </Badge>
                            )}
                            <Switch
                              variant="gradient"
                              size="sm"
                              checked={user.isActive}
                              onCheckedChange={(checked) => 
                                toggleUserStatusMutation.mutate({ userId: user.id, isActive: checked })
                              }
                            />
                          </div>
                        </div>

                        { }
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">کل خریدها</p>
                            <p className="font-semibold text-sm text-blue-600 dark:text-blue-400 mt-1">
                              {formatPersianNumber(user.totalPurchases)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">مجموع هزینه</p>
                            <p className="font-semibold text-sm text-green-600 dark:text-green-400 mt-1">
                              {formatPersianPrice(user.totalSpent)}
                            </p>
                          </div>
                        </div>

                        { }
                        <div className="flex items-center gap-1 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUserDetails(user)}
                            className="flex-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            مشاهده
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUserDialogOpen(true);
                            }}
                            className="flex-1 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
                          >
                            <Edit className="w-3 h-3 ml-1" />
                            ویرایش
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              getPermissionsMutation.mutate(user.id);
                              setPermissionsDialogOpen(true);
                            }}
                            className="flex-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                          >
                            <BookOpen className="w-3 h-3 ml-1" />
                            مجوز
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (window.confirm(`آیا از غیرفعال کردن کاربر ${user.firstName} ${user.lastName} اطمینان دارید؟\n\nتوجه: این عملیات کاربر را حذف نمی‌کند، بلکه حساب کاربری را غیرفعال و ناشناس می‌کند.`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                            disabled={deleteUserMutation.isPending}
                            title="غیرفعال کردن"
                          >
                            <UserX className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUserToDelete(user);
                              setPermanentDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                            disabled={permanentDeleteUserMutation.isPending}
                            title="حذف دائمی"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
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
      <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-green-200/50 dark:border-green-700/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              ایجاد کاربر جدید
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              اطلاعات کاربر جدید را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">نام</Label>
                <Input id="firstName" placeholder="نام کاربر" className="bg-white/50 dark:bg-gray-800/50" />
              </div>
              <div>
                <Label htmlFor="lastName">نام خانوادگی</Label>
                <Input id="lastName" placeholder="نام خانوادگی" className="bg-white/50 dark:bg-gray-800/50" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" type="email" placeholder="example@domain.com" className="bg-white/50 dark:bg-gray-800/50" />
            </div>
            <div>
              <Label htmlFor="username">نام کاربری</Label>
              <Input id="username" placeholder="نام کاربری منحصر به فرد" className="bg-white/50 dark:bg-gray-800/50" />
            </div>
            <div>
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" type="password" placeholder="حداقل ۸ کاراکتر" className="bg-white/50 dark:bg-gray-800/50" />
            </div>
            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">توجه:</span> کاربر جدید با نقش "کاربر" ایجاد می شود. سیستم فقط یک مدیر دارد و امکان افزودن مدیر جدید وجود ندارد.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setNewUserDialogOpen(false)}>
                انصراف
              </Button>
              <Button 
                className="bg-green-500 hover:bg-green-600"
                disabled={createUserMutation.isPending}
                onClick={() => {
                  const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
                  const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value;
                  const email = (document.getElementById('email') as HTMLInputElement)?.value;
                  const username = (document.getElementById('username') as HTMLInputElement)?.value;
                  const password = (document.getElementById('password') as HTMLInputElement)?.value;
                  
                  if (!firstName || !lastName || !email || !username || !password) {
                    toast({
                      title: 'خطا',
                      description: 'تمام فیلدها الزامی هستند',
                      variant: 'destructive'
                    });
                    return;
                  }
                  
                  const userData = {
                    firstName,
                    lastName,
                    email,
                    username,
                    password,
                    role: 'user',
                    phoneNumber: null
                  };
                  
                  createUserMutation.mutate(userData);
                }}
              >
                <UserPlus className="w-4 h-4 ml-2" />
                ایجاد کاربر
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-blue-200/50 dark:border-blue-700/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ویرایش کاربر
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              اطلاعات کاربر را ویرایش کنید
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">نام</Label>
                  <Input 
                    id="editFirstName" 
                    defaultValue={selectedUser.firstName || ''} 
                    placeholder="نام کاربر" 
                    className="bg-white/50 dark:bg-gray-800/50" 
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">نام خانوادگی</Label>
                  <Input 
                    id="editLastName" 
                    defaultValue={selectedUser.lastName || ''} 
                    placeholder="نام خانوادگی" 
                    className="bg-white/50 dark:bg-gray-800/50" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="editEmail">ایمیل</Label>
                <Input 
                  id="editEmail" 
                  type="email" 
                  defaultValue={selectedUser.email} 
                  placeholder="example@domain.com" 
                  className="bg-white/50 dark:bg-gray-800/50" 
                />
              </div>
              <div>
                <Label htmlFor="editUsername">نام کاربری</Label>
                <Input 
                  id="editUsername" 
                  defaultValue={selectedUser.username} 
                  placeholder="نام کاربری منحصر به فرد" 
                  className="bg-white/50 dark:bg-gray-800/50" 
                />
              </div>
              <div>
                <Label htmlFor="editPhoneNumber">شماره تلفن</Label>
                <Input 
                  id="editPhoneNumber" 
                  defaultValue={selectedUser.phoneNumber || ''} 
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹" 
                  className="bg-white/50 dark:bg-gray-800/50" 
                />
              </div>
              <div>
                <Label htmlFor="editPassword">رمز عبور جدید (اختیاری)</Label>
                <Input 
                  id="editPassword" 
                  type="password" 
                  placeholder="برای تغییر نمادن رمز عبور خالی بگذارید" 
                  className="bg-white/50 dark:bg-gray-800/50" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => {
                  setEditUserDialogOpen(false);
                  setSelectedUser(null);
                }}>
                  انصراف
                </Button>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600"
                  disabled={updateUserMutation.isPending}
                  onClick={() => {
                    const firstName = (document.getElementById('editFirstName') as HTMLInputElement)?.value;
                    const lastName = (document.getElementById('editLastName') as HTMLInputElement)?.value;
                    const email = (document.getElementById('editEmail') as HTMLInputElement)?.value;
                    const username = (document.getElementById('editUsername') as HTMLInputElement)?.value;
                    const phoneNumber = (document.getElementById('editPhoneNumber') as HTMLInputElement)?.value;
                    const password = (document.getElementById('editPassword') as HTMLInputElement)?.value;
                    
                    if (!firstName || !lastName || !email || !username) {
                      toast({
                        title: 'خطا',
                        description: 'فیلدهای نام، نام خانوادگی، ایمیل و نام کاربری الزامی هستند',
                        variant: 'destructive'
                      });
                      return;
                    }
                    
                    const userData: any = {
                      firstName,
                      lastName,
                      email,
                      username,
                      phoneNumber: phoneNumber || null
                    };
                    
                    if (password && password.trim() !== '') {
                      userData.password = password;
                    }
                    
                    updateUserMutation.mutate({ userId: selectedUser.id, userData });
                  }}
                >
                  <Edit className="w-4 h-4 ml-2" />
                  {updateUserMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-purple-200/50 dark:border-purple-700/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              مدیریت دسترسی کتاب ها
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              تعیین کنید کاربر به کدام کتاب ها دسترسی داشته باشد
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-4 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                <Avatar className="w-12 h-12 border-2 border-purple-200/50">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold">
                    {getUserInitials(selectedUser)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.username
                    }
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              {getPermissionsMutation.isPending ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="mr-3 text-gray-600 dark:text-gray-400">در حال بارگذاری مجوزها...</span>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-3">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    کتاب های موجود:
                  </div>
                  {userPermissions.map((permission) => (
                    <motion.div
                      key={permission.fileId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {permission.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            شناسه: {formatPersianNumber(permission.fileId)}
                          </p>
                        </div>
                      </div>
                      <Checkbox
                        variant="premium"
                        size="lg"
                        checked={permission.hasAccess}
                        onCheckedChange={(checked) => {
                          setUserPermissions(prev => 
                            prev.map(p => 
                              p.fileId === permission.fileId 
                                ? { ...p, hasAccess: checked as boolean }
                                : p
                            )
                          );
                        }}
                      />
                    </motion.div>
                  ))}
                  
                  {userPermissions.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>هیچ کتابی یافت نشد</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setPermissionsDialogOpen(false);
                    setUserPermissions([]);
                  }}
                >
                  انصراف
                </Button>
                <Button 
                  className="bg-purple-500 hover:bg-purple-600"
                  disabled={updatePermissionsMutation.isPending}
                  onClick={() => {
                    const filePermissions = userPermissions.map(p => ({
                      fileId: p.fileId,
                      hasAccess: p.hasAccess
                    }));
                    
                    updatePermissionsMutation.mutate({
                      userId: selectedUser.id,
                      filePermissions
                    });
                  }}
                >
                  <BookOpen className="w-4 h-4 ml-2" />
                  {updatePermissionsMutation.isPending ? 'در حال ذخیره...' : 'ذخیره مجوزها'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      { }
      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              جزئیات کاربر
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              مشاهده کامل اطلاعات و فعالیت های کاربر
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
                <Avatar className="w-16 h-16 border-2 border-orange-200/50">
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold">
                    {getUserInitials(selectedUser)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}`
                      : selectedUser.username
                    }
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  {getUserStatusBadge(selectedUser)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">نقش کاربر</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedUser.role === 'admin' ? 'مدیر' : 'کاربر عادی'}
                  </p>
                </div>
                <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">وضعیت</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {selectedUser.isActive ? 'فعال' : 'غیرفعال'}
                  </p>
                </div>
                <div className="p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">تعداد خریدها</p>
                  <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {formatPersianNumber(selectedUser.totalPurchases)}
                  </p>
                </div>
                <div className="p-3 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">کل مبلغ خرید</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {formatPersianPrice(selectedUser.totalSpent)}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  اطلاعات تکمیلی
                </h4>
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">نام کاربری:</span>
                    <span className="font-medium">{selectedUser.username}</span>
                  </div>
                  {selectedUser.phoneNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">شماره تلفن:</span>
                      <span className="font-medium">{selectedUser.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">آخرین ورود:</span>
                    <span className="font-medium">
                      {selectedUser.lastLogin ? formatPersianDateTime(new Date(selectedUser.lastLogin)) : 'هرگز'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">تاریخ عضویت:</span>
                    <span className="font-medium">
                      {formatPersianDateTime(new Date(selectedUser.createdAt))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={permanentDeleteDialogOpen} onOpenChange={setPermanentDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-red-200/50 dark:border-red-700/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              حذف دائمی کاربر
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {userToDelete && (
                <div className="space-y-3 mt-4">
                  <p className="font-semibold text-base">
                    آیا از حذف دائمی کاربر "{userToDelete.firstName} {userToDelete.lastName}" اطمینان دارید؟
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 space-y-2">
                    <p className="text-red-700 dark:text-red-300 font-bold flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      هشدار: این عملیات غیرقابل بازگشت است!
                    </p>
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 mr-7">
                      <li>• کاربر به طور کامل از دیتابیس حذف خواهد شد</li>
                      <li>• تمام اطلاعات کاربر برای همیشه از بین می‌رود</li>
                      <li>• امکان بازیابی اطلاعات وجود نخواهد داشت</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>نکته:</strong> اگر فقط می‌خواهید کاربر را غیرفعال کنید، از دکمه "غیرفعال کردن" استفاده کنید.
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
              data-testid="button-cancel-permanent-delete"
            >
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  permanentDeleteUserMutation.mutate(userToDelete.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={permanentDeleteUserMutation.isPending}
              data-testid="button-confirm-permanent-delete"
            >
              {permanentDeleteUserMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                  در حال حذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 ml-2" />
                  بله، حذف دائمی شود
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}