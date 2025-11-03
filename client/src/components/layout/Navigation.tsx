import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toPersianDigits } from '@/lib/persian-utils';
import {
  FileText,
  Moon,
  Sun,
  User,
  LogOut,
  Menu,
  X,
  Settings,
  ShoppingCart,
  Library,
  Shield,
  Users,
  Home,
  ChevronDown,
  Sparkles,
  Zap,
  Crown,
  Search,
  Heart,
  Bookmark,
  ArrowRight,
  CreditCard,
  BarChart3,
  Building2,
  Star,
  Layers,
  TrendingUp,
  Award,
  Palette,
  Activity,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

   
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

   
  const publicItems = [
    { href: '/library', label: 'کتابخانه', icon: Library, color: 'from-emerald-500 to-teal-600', badge: null },
  ];

   
  const userMenuItems = [
    { href: '/dashboard', label: 'داشبورد', icon: Home, color: 'from-blue-500 to-purple-600', badge: null },
    { href: '/library', label: 'کتابخانه', icon: Library, color: 'from-green-500 to-teal-600', badge: null },
    { href: '/purchases', label: 'تاریخچه خرید', icon: ShoppingCart, color: 'from-orange-500 to-red-600', badge: null },
    { href: '/profile', label: 'پروفایل کاربری', icon: Settings, color: 'from-purple-500 to-pink-600', badge: null },
  ];

   
  const filteredUserMenuItems = location === '/admin' 
    ? userMenuItems.filter(item => item.href !== '/library')
    : userMenuItems;

   
  const adminMenuItems = [
    { tab: 'dashboard', label: 'داشبورد مدیریت', icon: BarChart3, color: 'from-blue-500 to-purple-600', badge: null },
    { tab: 'users', label: 'مدیریت کاربران', icon: Users, color: 'from-green-500 to-teal-600', badge: null },
    { tab: 'files', label: 'مدیریت فایل ها', icon: FileText, color: 'from-indigo-500 to-blue-600', badge: 'جدید' },
    { tab: 'payments', label: 'مدیریت پرداخت ها', icon: CreditCard, color: 'from-orange-500 to-red-600', badge: null },
    { tab: 'bank-cards', label: 'کارت های بانکی', icon: Building2, color: 'from-emerald-500 to-cyan-600', badge: null },
    { tab: 'reports', label: 'گزارش های مالی', icon: Shield, color: 'from-amber-500 to-orange-600', badge: null },
  ];

   
  const handleAdminMenuClick = (tabName: string) => {
     
    if (location !== '/admin') {
       
      setLocation('/admin');
       
      setTimeout(() => {
        const event = new CustomEvent('adminTabChange', { detail: { tab: tabName } });
        window.dispatchEvent(event);
      }, 50);
    } else {
       
      const event = new CustomEvent('adminTabChange', { detail: { tab: tabName } });
      window.dispatchEvent(event);
    }
  };



  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      { }
      {!mobile && location !== '/admin' && (
        <div className="flex items-center gap-2">
          {publicItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={item.href}>
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative overflow-hidden px-4 py-2.5 h-10 rounded-xl font-medium transition-all duration-300 border border-transparent hover:border-opacity-50 ${
                      location === item.href
                        ? `bg-gradient-to-r ${item.color}/15 border-current text-gray-900 dark:text-white shadow-lg`
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 ml-2 relative z-10" />
                    <span className="relative z-10">{item.label}</span>
                    {item.badge && (
                      <motion.span
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </Button>
                  { }
                  {location === item.href && (
                    <motion.div
                      className={`absolute -bottom-1 left-1/2 w-6 h-0.5 bg-gradient-to-r ${item.color} rounded-full`}
                      initial={{ scale: 0, x: '-50%' }}
                      animate={{ scale: 1, x: '-50%' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      { }
      {mobile && location !== '/admin' && (
        <div className="space-y-2">
          { }
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="relative group w-full"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 text-gray-700 dark:text-gray-300 border border-transparent hover:border-purple-200/50 dark:hover:border-purple-800/50 rounded-xl px-4 py-3 font-medium h-auto"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center ml-3 relative z-10">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <span className="relative z-10">خانه</span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          { }
          {publicItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (index + 2) * 0.1 }}
            >
              <Link href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group w-full"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-600/10 text-gray-700 dark:text-gray-300 border border-transparent hover:border-emerald-200/50 dark:hover:border-emerald-800/50 rounded-xl px-4 py-3 font-medium h-auto"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center ml-3 relative z-10`}>
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col items-start relative z-10">
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <motion.span
                        className="mr-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <>
      { }
      <motion.nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl border-b border-purple-200/30 dark:border-purple-800/30' 
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-800/20'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        { }
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 items-center justify-between">
            
            { }
            <motion.div 
              className="flex items-center gap-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
            >
              <Link href="/">
                <motion.div 
                  className="flex items-center gap-3 cursor-pointer group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  { }
                  <motion.div
                    className="relative h-10 w-10 sm:h-12 sm:w-12"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8, type: "spring" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-600 to-teal-500 rounded-2xl shadow-lg" />
                    <div className="absolute inset-0.5 bg-white dark:bg-gray-900 rounded-2xl" />
                    <div className="absolute inset-1 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <motion.div
                      className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  
                  { }
                  <div className="flex flex-col">
                    <motion.span 
                      className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      پی دی ویو
                    </motion.span>
                    <motion.span 
                      className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      مرجع فایل های دیجیتال
                    </motion.span>
                  </div>
                  
                  { }
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                    initial={{ scale: 0, rotate: -45 }}
                    whileHover={{ scale: 1, rotate: 0 }}
                  >
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </motion.div>
                </motion.div>
              </Link>

              { }
              {!isMobile && (
                <motion.div 
                  className="hidden lg:flex items-center gap-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <NavItems />
                </motion.div>
              )}
            </motion.div>

            { }
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              { }
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-blue-600/10 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-indigo-600/10 hover:from-yellow-400/20 hover:via-orange-400/20 hover:to-blue-600/20 dark:hover:from-blue-600/20 dark:hover:via-purple-600/20 dark:hover:to-indigo-600/20 border border-yellow-200/50 dark:border-blue-700/50 transition-all duration-300 overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-blue-600/5 dark:from-blue-600/5 dark:to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <AnimatePresence mode="wait">
                    {theme === 'dark' ? (
                      <motion.div
                        key="sun"
                        initial={{ rotate: 180, scale: 0, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: -180, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        className="relative z-10"
                      >
                        <Sun className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 180, scale: 0, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: -180, scale: 0, opacity: 0 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        className="relative z-10"
                      >
                        <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>

              { }
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.02 }} 
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-3 px-4 py-2.5 h-11 rounded-2xl bg-gradient-to-br from-purple-500/10 via-blue-600/10 to-teal-500/10 hover:from-purple-500/20 hover:via-blue-600/20 hover:to-teal-500/20 transition-all duration-300 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm group"
                      >
                        { }
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                            {isAdmin ? (
                              <Crown className="w-4 h-4 text-white" />
                            ) : (
                              <User className="w-4 h-4 text-white" />
                            )}
                          </div>
                          {isAdmin && (
                            <motion.div
                              className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Zap className="w-2 h-2 text-white" />
                            </motion.div>
                          )}
                        </div>
                        
                        { }
                        <div className="hidden sm:flex flex-col items-start">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                            {user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user?.username
                            }
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 leading-none mt-0.5">
                            {isAdmin ? 'مدیر سیستم' : 'کاربر'}
                          </span>
                        </div>
                        
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent 
                    className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border border-purple-200/30 dark:border-purple-700/30 shadow-2xl rounded-2xl p-2"
                    align="end"
                    sideOffset={8}
                  >
                    { }
                    <div className="px-3 py-3 border-b border-purple-200/20 dark:border-purple-700/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                          {isAdmin ? <Crown className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user?.username
                            }
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    { }
                    <div className="py-2">
                      {isAdmin ? (
                        <>
                          { }
                          <div className="px-3 py-2 mb-2">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                                پنل مدیریت
                              </span>
                            </div>
                          </div>
                          
                          { }
                          {adminMenuItems.map((item, index) => (
                            <DropdownMenuItem 
                              key={item.tab} 
                              className="rounded-xl cursor-pointer mb-1"
                              onClick={() => handleAdminMenuClick(item.tab)}
                            >
                              <motion.div 
                                className="flex items-center gap-3 w-full py-2.5 px-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 rounded-xl transition-all duration-200 group"
                                whileHover={{ x: 4 }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-200 shadow-sm group-hover:shadow-md`}>
                                  <item.icon className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-medium">{item.label}</span>
                                <ArrowRight className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                              </motion.div>
                            </DropdownMenuItem>
                          ))}
                        </>
                      ) : (
                        <>
                          { }
                          <div className="px-3 py-2 mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                پنل کاربری
                              </span>
                            </div>
                          </div>
                          
                          { }
                          {filteredUserMenuItems.map((item, index) => (
                            <DropdownMenuItem key={item.href} asChild className="rounded-xl mb-1">
                              <Link href={item.href}>
                                <motion.div 
                                  className="flex items-center gap-3 w-full py-2.5 px-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 rounded-xl transition-all duration-200 group"
                                  whileHover={{ x: 4 }}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all duration-200 shadow-sm group-hover:shadow-md`}>
                                    <item.icon className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-medium">{item.label}</span>
                                  <ArrowRight className="w-4 h-4 mr-auto opacity-0 group-hover:opacity-50 transition-opacity" />
                                </motion.div>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </div>
                    
                    <DropdownMenuSeparator className="bg-purple-200/30 dark:bg-purple-700/30" />
                    
                    { }
                    <DropdownMenuItem 
                      onClick={logout}
                      className="text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl mx-1"
                    >
                      <motion.div 
                        className="flex items-center gap-3 w-full py-2"
                        whileHover={{ x: 4 }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-medium">خروج</span>
                      </motion.div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-purple-500 via-blue-600 to-teal-500 hover:from-purple-600 hover:via-blue-700 hover:to-teal-600 text-white rounded-2xl px-6 py-2.5 h-11 shadow-lg hover:shadow-xl transition-all duration-300 font-medium border-0">
                      <User className="w-4 h-4 ml-2" />
                      ورود / ثبت نام
                    </Button>
                  </Link>
                </motion.div>
              )}

              { }
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <motion.div 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100/80 via-white/80 to-gray-100/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80 hover:from-purple-100/80 hover:to-blue-100/80 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300"
                      >
                        <AnimatePresence mode="wait">
                          {mobileMenuOpen ? (
                            <motion.div
                              key="close"
                              initial={{ rotate: 180, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: -180, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="menu"
                              initial={{ rotate: -90, opacity: 0 }}
                              animate={{ rotate: 0, opacity: 1 }}
                              exit={{ rotate: 90, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Menu className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </motion.div>
                  </SheetTrigger>
                  
                  <SheetContent 
                    side="right" 
                    className="w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-l border-purple-200/30 dark:border-purple-700/30 p-0"
                  >
                    <div className="p-6 space-y-6">
                      { }
                      <motion.div 
                        className="flex items-center gap-3 pb-4 border-b border-purple-200/20 dark:border-purple-700/20"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            پی دی ویو
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">منوی اصلی</p>
                        </div>
                      </motion.div>

                      { }
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <NavItems mobile={true} />
                      </motion.div>
                      
                      { }
                      {isAuthenticated && (
                        <motion.div 
                          className="pt-4 border-t border-purple-200/20 dark:border-purple-700/20"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <div className="flex items-center gap-2 mb-4 px-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                              {isAdmin ? <Shield className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-white" />}
                            </div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                              {isAdmin ? 'پنل مدیریت' : 'حساب کاربری'}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {isAdmin ? (
                              adminMenuItems.map((item, index) => (
                                <motion.div
                                  key={item.tab}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: (index + 4) * 0.1 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start rounded-xl h-auto py-3 px-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 transition-all duration-200 group"
                                    onClick={() => {
                                      handleAdminMenuClick(item.tab);
                                      setMobileMenuOpen(false);
                                    }}
                                  >
                                    <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center ml-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                                      <item.icon className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                      <span className="font-medium">{item.label}</span>
                                      {item.badge && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    {item.badge && (
                                      <span className="mr-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                        {item.badge}
                                      </span>
                                    )}
                                  </Button>
                                </motion.div>
                              ))
                            ) : (
                              filteredUserMenuItems.map((item, index) => (
                                <motion.div
                                  key={item.href}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3, delay: (index + 4) * 0.1 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <Link href={item.href}>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start rounded-xl h-auto py-3 px-3 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-600/10 transition-all duration-200 group"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center ml-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                                        <item.icon className="w-4 h-4 text-white" />
                                      </div>
                                      <div className="flex flex-col items-start">
                                        <span className="font-medium">{item.label}</span>
                                        {item.badge && (
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      {item.badge && (
                                        <span className="mr-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                          {item.badge}
                                        </span>
                                      )}
                                    </Button>
                                  </Link>
                                </motion.div>
                              ))
                            )}
                          </div>

                          { }
                          <motion.div
                            className="pt-4 border-t border-red-200/20 dark:border-red-700/20 mt-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                          >
                            <Button
                              variant="ghost"
                              onClick={() => {
                                logout();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full justify-start rounded-xl h-auto py-3 px-3 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200 group"
                            >
                              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center ml-3">
                                <LogOut className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium">خروج از حساب</span>
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </motion.div>
          </div>
        </div>

        { }
        <AnimatePresence>
          {isMobile && searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-purple-200/30 dark:border-purple-700/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="جستجو در فایل ها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10 pl-4 h-11 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-800 focus:border-purple-300 dark:focus:border-purple-600 transition-all duration-300 text-right"
                    autoFocus
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      
      { }
      <div className="h-16 sm:h-18" />
    </>
  );
}