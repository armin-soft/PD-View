import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { PDFViewerLazy } from '@/components/pdf/PDFViewerLazy';
import { PurchaseDialog } from '@/components/payment/PurchaseDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPersianPrice, formatPersianNumber } from '@/lib/persian-utils';
import { queryClient } from '@/lib/queryClient';
import {
  Search,
  Eye,
  ShoppingCart,
  FileText,
  Grid3X3,
  List,
  BookOpen,
  RefreshCw,
  Sparkles,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Award,
  Globe,
  Target,
  Layers,
  Crown,
  Gift,
  Flame,
  ThumbsUp,
  MessageCircle,
  BarChart3,
  ArrowLeft,
  Plus,
  Minus,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  Shield,
  Zap,
  Tag
} from 'lucide-react';

interface PdfFile {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  totalPages: number;
  freePages: number;
  thumbnailUrl: string;
  fileUrl?: string;
  isNew?: boolean;
  discount?: number;
  tags?: string[];
  author?: string;
  language?: string;
  size?: string;
  category?: string;
  publishDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'pages';
type ViewMode = 'grid' | 'list' | 'card';
type FilterType = 'all' | 'free' | 'premium' | 'new' | 'discounted';

export default function PdfLibrary() {
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedFile, setSelectedFile] = useState<PdfFile | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [showFilters, setShowFilters] = useState(false);

   
  const { data: files, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/files'],
    queryFn: async () => {
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      return response.json() as Promise<PdfFile[]>;
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

   
  const categories = useMemo(() => {
    if (!files) return [];
    const cats = ['all', ...Array.from(new Set(files.map(f => f.category || 'عمومی').filter(Boolean)))];
    return cats;
  }, [files]);

  const filteredAndSortedFiles = useMemo(() => {
    if (!files) return [];
    
    let filtered = files.filter(file => {
       
      const searchMatch = searchTerm === '' || 
        file.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.author?.toLowerCase().includes(searchTerm.toLowerCase());
      
       
      let typeMatch = true;
      switch (filterType) {
        case 'free':
          typeMatch = file.price === 0;
          break;
        case 'premium':
          typeMatch = file.price > 0;
          break;
        case 'new':
          typeMatch = Boolean(file.isNew);
          break;
        case 'discounted':
          typeMatch = Boolean(file.discount && file.discount > 0);
          break;
      }
      
       
      const categoryMatch = selectedCategory === 'all' || file.category === selectedCategory;
      
       
      const priceMatch = file.price >= priceRange[0] && file.price <= priceRange[1];
      
      return searchMatch && typeMatch && categoryMatch && priceMatch;
    });
    
     
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'pages':
          return (b.totalPages || 0) - (a.totalPages || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [files, searchTerm, filterType, selectedCategory, priceRange, sortBy]);

   
  const stats = useMemo(() => {
    if (!files) return { total: 0, free: 0, premium: 0, new: 0 };
    return {
      total: files.length,
      free: files.filter(f => f.price === 0).length,
      premium: files.filter(f => f.price > 0).length,
      new: files.filter(f => f.isNew).length
    };
  }, [files]);

  const handlePurchase = async (data: any) => {
    if (!selectedFile) return false;
    
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fileId: selectedFile.id,
          amount: data.finalAmount,
          paymentMethod: data.paymentMethod,
        }),
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/user/purchased-files'] });
        setPurchaseDialogOpen(false);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const openViewer = (file: PdfFile) => {
    setSelectedFile(file);
    setViewerOpen(true);
  };

  const openPurchaseDialog = (file: PdfFile) => {
    setSelectedFile(file);
    setPurchaseDialogOpen(true);
  };

   
  const LoadingSkeleton = () => (
    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
      {Array.from({ length: 12 }).map((_, index) => (
        <Card key={index} className="animate-pulse bg-white/50 dark:bg-gray-900/50">
          <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t-lg"></div>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

   
  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatPersianNumber(stats.total)}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">کل فایل ها</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Gift className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatPersianNumber(stats.free)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">رایگان</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {formatPersianNumber(stats.premium)}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">پریمیوم</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {formatPersianNumber(stats.new)}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-400">جدید</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

   
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/50 dark:to-purple-900/50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FileText className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              خطا در بارگذاری فایل ها
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              متأسفانه امکان دریافت فایل ها وجود ندارد. لطفاً دوباره تلاش کنید.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              تلاش مجدد
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/50">
      <Navigation />
      
      { }
      <motion.section 
        className="relative py-16 sm:py-20 lg:py-24 px-4 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-teal-500/5 backdrop-blur-3xl" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-teal-400/15 to-blue-400/15 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div 
            className="text-center max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            { }
            <motion.div
              className="inline-flex items-center gap-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-full px-6 py-3 mb-8 border border-gray-200/60 dark:border-gray-700/60 shadow-2xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
              whileHover={{ scale: 1.05, y: -3 }}
            >
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200 font-semibold">کتابخانه دیجیتال پی دی ویو</span>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xs px-2 py-1">
                <Crown className="w-3 h-3 mr-1" />
                پیشرفته
              </Badge>
            </motion.div>
            
            { }
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 leading-[0.9] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                کتابخانه هوشمند
              </span>
              <motion.span 
                className="block text-gray-900 dark:text-white mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                اسناد دیجیتال
              </motion.span>
            </motion.h1>
            
            { }
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              دسترسی آسان به بزرگترین مجموعه اسناد، کتاب ها و منابع آموزشی دیجیتال 
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold"> با امنیت بالا</span> 
              و قابلیت های پیشرفته جستجو
            </motion.p>

            { }
            <motion.div 
              className="relative max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative flex items-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
                  <div className="absolute left-4 text-gray-400 dark:text-gray-500">
                    <Search className="w-5 h-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="جستجو در میان هزاران فایل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-14 text-lg pr-12 pl-4 border-0 bg-transparent focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    data-testid="input-search"
                  />
                  <motion.div 
                    className="pr-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl shadow-lg"
                    >
                      جستجو
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      { }
      <motion.section 
        className="container mx-auto px-4 pb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
      </motion.section>

      { }
      <div className="container mx-auto px-4 pb-20">
        { }
        <StatsCards />

        { }
        <motion.div 
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            { }
            <div className="flex flex-wrap items-center gap-4">
              <Badge className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 px-4 py-3 text-lg">
                <FileText className="w-5 h-5 mr-2" />
                {formatPersianNumber(filteredAndSortedFiles.length)} منبع یافت شد
              </Badge>
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="rounded-2xl border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-6"
                data-testid="button-refresh"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                بروزرسانی
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-2xl border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-6"
                data-testid="button-toggle-filters"
              >
                <Filter className="w-5 h-5 mr-2" />
                فیلترها
                <ChevronDown className={`w-4 h-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            { }
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">مرتب سازی:</label>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-40 rounded-xl" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">جدیدترین</SelectItem>
                    <SelectItem value="price-low">ارزان ترین</SelectItem>
                    <SelectItem value="price-high">گران ترین</SelectItem>
                    <SelectItem value="pages">بیشترین صفحه</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-xl px-4"
                  data-testid="view-grid"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-xl px-4"
                  data-testid="view-list"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="rounded-xl px-4"
                  data-testid="view-card"
                >
                  <Layers className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          { }
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  { }
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      دسته بندی
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="rounded-xl" data-testid="select-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>
                            {cat === 'all' ? 'همه دسته ها' : cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  { }
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      نوع محتوا
                    </label>
                    <Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
                      <SelectTrigger className="rounded-xl" data-testid="select-filter-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">همه انواع</SelectItem>
                        <SelectItem value="free">رایگان</SelectItem>
                        <SelectItem value="premium">پریمیوم</SelectItem>
                        <SelectItem value="new">جدید</SelectItem>
                        <SelectItem value="discounted">تخفیف دار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  { }
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      محدوده قیمت
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="حداقل"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="rounded-xl"
                        data-testid="input-price-min"
                      />
                      <span className="text-gray-400">تا</span>
                      <Input
                        type="number"
                        placeholder="حداکثر"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 1000000])}
                        className="rounded-xl"
                        data-testid="input-price-max"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        { }
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredAndSortedFiles.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <Search className="w-16 h-16 text-gray-400" />
              </div>
              <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
              {searchTerm || filterType !== 'all' || selectedCategory !== 'all' ? 'نتیجه ای یافت نشد' : 'هیچ فایلی موجود نیست'}
            </h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || filterType !== 'all' || selectedCategory !== 'all'
                ? 'لطفاً فیلترها را تغییر دهید یا کلمات کلیدی دیگری را امتحان کنید'
                : 'در حال حاضر فایلی برای نمایش وجود ندارد'
              }
            </p>
            {(searchTerm || filterType !== 'all' || selectedCategory !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setSelectedCategory('all');
                }}
                className="rounded-xl px-8 py-3"
                data-testid="button-clear-filters"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                پاک کردن فیلترها
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : viewMode === 'list'
                ? "space-y-4"
                : "grid grid-cols-1 md:grid-cols-2 gap-8"
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AnimatePresence>
              {filteredAndSortedFiles.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  data-testid={`file-card-${file.id}`}
                >
                  {viewMode === 'list' ? (
                     
                    <Card className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                      <div className="flex items-center p-6">
                        { }
                        <div className="relative w-24 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-xl mr-6 flex-shrink-0">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-blue-500/50" />
                          </div>
                          {file.isNew && (
                            <Badge className="absolute -top-2 -right-2 bg-green-500 text-white border-0 shadow-lg text-xs">
                              جدید
                            </Badge>
                          )}
                        </div>
                        
                        { }
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                                {file.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                {file.description}
                              </p>
                              
                              { }
                              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  {formatPersianNumber(file.totalPages)} صفحه
                                </div>
                                {file.author && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {file.author}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            { }
                            <div className="flex flex-col items-end gap-3 mr-4">
                              <div className="text-left">
                                {file.originalPrice && file.originalPrice > file.price && (
                                  <div className="text-sm text-gray-400 line-through">
                                    {formatPersianPrice(file.originalPrice)}
                                  </div>
                                )}
                                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                  {file.price === 0 ? 'رایگان' : formatPersianPrice(file.price)}
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openViewer(file)}
                                  className="rounded-xl"
                                  data-testid={`button-preview-${file.id}`}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  پیش نمایش
                                </Button>
                                
                                {isAuthenticated ? (
                                  <Button
                                    size="sm"
                                    onClick={() => openPurchaseDialog(file)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                    data-testid={`button-purchase-${file.id}`}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    خرید
                                  </Button>
                                ) : (
                                  <Button size="sm" disabled className="rounded-xl">
                                    ورود نیاز است
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : viewMode === 'card' ? (
                     
                    <Card className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                      <div className="flex">
                        { }
                        <div className="relative w-48 h-64 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex-shrink-0">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="w-20 h-20 text-blue-500/50" />
                          </div>
                          
                          { }
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            {file.isNew && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                                <Sparkles className="w-3 h-3 mr-1" />
                                جدید
                              </Badge>
                            )}
                            {file.discount && (
                              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                                %{formatPersianNumber(file.discount)} تخفیف
                              </Badge>
                            )}
                            {file.price === 0 && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                                <Gift className="w-3 h-3 mr-1" />
                                رایگان
                              </Badge>
                            )}
                          </div>

                          { }
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => openViewer(file)}
                                className="bg-white/90 text-gray-900 hover:bg-white rounded-xl"
                                data-testid={`button-preview-${file.id}`}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                پیش نمایش
                              </Button>
                              
                              {isAuthenticated ? (
                                <Button
                                  size="sm"
                                  onClick={() => openPurchaseDialog(file)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                                  data-testid={`button-purchase-${file.id}`}
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  خرید
                                </Button>
                              ) : (
                                <Button size="sm" disabled className="rounded-xl">
                                  ورود نیاز است
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        { }
                        <div className="flex-1 p-6">
                          <div className="h-full flex flex-col">
                            <div className="flex-1">
                              <h3 className="font-bold text-2xl text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3">
                                {file.title}
                              </h3>
                              
                              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                                {file.description}
                              </p>
                              
                              { }
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                  <FileText className="w-4 h-4" />
                                  <span>{formatPersianNumber(file.totalPages)} صفحه</span>
                                </div>
                                {file.author && (
                                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <Users className="w-4 h-4" />
                                    <span>{file.author}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            { }
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                              <div className="flex items-center gap-3">
                                {file.originalPrice && file.originalPrice > file.price && (
                                  <span className="text-lg text-gray-400 line-through">
                                    {formatPersianPrice(file.originalPrice)}
                                  </span>
                                )}
                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                  {file.price === 0 ? 'رایگان' : formatPersianPrice(file.price)}
                                </span>
                              </div>
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                     
                    <Card className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden">
                      { }
                      <div className="relative h-52 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText className="w-16 h-16 text-blue-500/50" />
                        </div>
                        
                        { }
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          {file.isNew && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg animate-pulse">
                              <Sparkles className="w-3 h-3 mr-1" />
                              جدید
                            </Badge>
                          )}
                          {file.discount && (
                            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                              %{formatPersianNumber(file.discount)} تخفیف
                            </Badge>
                          )}
                          {file.price === 0 && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                              <Gift className="w-3 h-3 mr-1" />
                              رایگان
                            </Badge>
                          )}
                        </div>

                        { }
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openViewer(file)}
                            className="bg-white/90 text-gray-900 hover:bg-white rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                            data-testid={`button-preview-${file.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            پیش نمایش
                          </Button>
                          
                          {isAuthenticated ? (
                            <Button
                              size="sm"
                              onClick={() => openPurchaseDialog(file)}
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                              data-testid={`button-purchase-${file.id}`}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              خرید
                            </Button>
                          ) : (
                            <Button size="sm" disabled className="rounded-xl">
                              ورود نیاز است
                            </Button>
                          )}
                        </div>
                        
                      </div>

                      { }
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                              {file.title}
                            </h3>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {file.description}
                            </p>
                          </div>

                          { }
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{formatPersianNumber(file.totalPages)}</span>
                            </div>
                          </div>

                          { }
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex flex-col gap-1">
                              {file.originalPrice && file.originalPrice > file.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPersianPrice(file.originalPrice)}
                                </span>
                              )}
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                {file.price === 0 ? 'رایگان' : formatPersianPrice(file.price)}
                              </span>
                            </div>
                            
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      { }
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] h-[95vh] p-4 overflow-hidden">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-right">پیش نمایش پی دی اف</DialogTitle>
            <DialogDescription className="text-right">نمایش پیش نمایش فایل پی دی اف</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedFile && (
              <PDFViewerLazy 
                fileId={selectedFile.id}
                title={selectedFile.title}
                isLicensed={false}
                pageLimit={selectedFile.freePages}
                totalPages={selectedFile.totalPages}
                isGuestMode={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      { }
      {selectedFile && (
        <PurchaseDialog
          isOpen={purchaseDialogOpen}
          onClose={() => setPurchaseDialogOpen(false)}
          fileData={{
            id: selectedFile.id,
            title: selectedFile.title,
            price: selectedFile.price,
            description: selectedFile.description,
            totalPages: selectedFile.totalPages,
          }}
          onPurchase={handlePurchase}
        />
      )}

      <Footer />
    </div>
  );
}