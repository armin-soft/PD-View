import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Mail, Lock, User, Phone, Shield, UserPlus, LogIn, Sparkles, Crown, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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


const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
  rememberMe: z.boolean().default(false),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'نام الزامی است'),
  lastName: z.string().min(1, 'نام خانوادگی الزامی است'),
  phoneNumber: z.string().min(1, 'شماره تلفن الزامی است'),
  email: z.string().trim().toLowerCase().email('ایمیل معتبر وارد کنید'),
  username: z.string()
    .min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد')
    .max(20, 'نام کاربری باید حداکثر ۲۰ کاراکتر باشد'),
  password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'باید قوانین و مقررات را بپذیرید',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمزهای عبور مطابقت ندارند',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const { login, register, user, isAuthenticated } = useAuth();
  const { toast } = useToast();


   
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
      onClose();
    }
  }, [isAuthenticated, user, setLocation, onClose]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    const success = await login(data.email, data.password);
    setIsLoading(false);
    
    if (success) {
      toast({
        title: 'ورود موفق',
        description: 'خوش آمدید! با موفقیت وارد سامانه شدید.',
      });
       
    } else {
      toast({
        title: 'خطا در ورود',
        description: 'ایمیل یا رمز عبور اشتباه است. لطفاً دوباره تلاش کنید.',
        variant: 'destructive'
      });
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    const success = await register(data.firstName, data.lastName, data.email, data.username, data.password, data.phoneNumber);
    setIsLoading(false);
    
    if (success) {
      toast({
        title: 'ثبت نام موفق',
        description: `${data.firstName} عزیز، حساب کاربری شما با موفقیت ایجاد شد!`
      });
       
    } else {
      toast({
        title: 'خطا در ثبت نام',
        description: 'مشکلی در ایجاد حساب کاربری پیش آمد. ممکن است کاربری با این ایمیل قبلاً ثبت شده باشد.',
        variant: 'destructive'
      });
    }
  };

  const formVariants = {
    login: { x: 0, opacity: 1 },
    register: { x: 0, opacity: 1 },
    exit: { x: mode === 'login' ? -300 : 300, opacity: 0 }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === 'login' ? 'ورود به سیستم' : 'ایجاد حساب جدید'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'برای ورود به سیستم ایمیل و رمز عبور خود را وارد کنید'
              : 'برای ایجاد حساب جدید اطلاعات خود را وارد کنید'
            }
          </DialogDescription>
        </DialogHeader>
        { }
        <motion.div 
          className="flex flex-col items-center justify-center gap-4 bg-gradient-to-r from-white via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/50 dark:to-purple-900/50 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg backdrop-blur-sm -m-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                mode === 'login' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-r from-green-500 to-teal-600'
              }`}
              whileHover={{ scale: 1.05, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {mode === 'login' ? (
                <LogIn className="w-6 h-6 text-white" />
              ) : (
                <UserPlus className="w-6 h-6 text-white" />
              )}
            </motion.div>
            <div className="text-center">
              <h1 className={`text-xl sm:text-2xl font-black bg-clip-text text-transparent ${
                mode === 'login' 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600' 
                  : 'bg-gradient-to-r from-green-600 via-teal-600 to-blue-600'
              }`}>
                {mode === 'login' ? 'ورود به سیستم' : 'ایجاد حساب جدید'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {mode === 'login' 
                  ? 'به پلتفرم مدیریت اسناد خوش آمدید'
                  : 'برای شروع تجربه جدید عضو شوید'
                }
              </p>
            </div>
          </div>

          { }
          <div className="flex bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-1 w-full max-w-sm">
            <Button
              type="button"
              variant="ghost"
              className={`flex-1 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              onClick={() => setMode('login')}
            >
              <LogIn className="w-4 h-4 ml-2" />
              ورود
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={`flex-1 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              onClick={() => setMode('register')}
            >
              <UserPlus className="w-4 h-4 ml-2" />
              ثبت نام
            </Button>
          </div>
        </motion.div>

        <div className="relative px-2 sm:px-4">

          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...loginForm}>
                  { }
                  <motion.div 
                    className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div
                        className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Shield className="w-4 h-4 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">ورود امن</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">اطلاعات خود را وارد کنید</p>
                      </div>
                    </div>

                    <form onSubmit={loginForm.handleSubmit(handleLogin as any)} className="space-y-6">
                      <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 }}
                      >
                        <FormField
                          control={loginForm.control as any}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-500" />
                                آدرس ایمیل
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type="email"
                                    placeholder="example@email.com"
                                    className="bg-white/70 dark:bg-gray-800/70 border-blue-200/50 dark:border-blue-700/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm h-12 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                      >
                        <FormField
                          control={loginForm.control as any}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-blue-500" />
                                رمز عبور
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="رمز عبور امن خود را وارد کنید"
                                    autoComplete="current-password"
                                    className="pl-12 bg-white/70 dark:bg-gray-800/70 border-blue-200/50 dark:border-blue-700/50 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-sm h-12 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute left-1 top-1 h-10 w-10 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
                                      <EyeOff className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-blue-500" />
                                    )}
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.3 }}
                      >
                        <FormField
                          control={loginForm.control as any}
                          name="rememberMe"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-0 space-y-0 gap-3">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-transparent border-blue-300 dark:border-blue-600 rounded-md"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <Label 
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                  مرا به خاطر بسپار
                                </Label>
                              </div>
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      { }
                      <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.4 }}
                        className="pt-4"
                      >
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border-0"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span>در حال ورود...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span>ورود به سیستم</span>
                              <motion.div
                                className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100"
                                animate={{ scale: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                  </form>
                  </motion.div>
                </Form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...registerForm}>
                  { }
                  <motion.div 
                    className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50 rounded-2xl p-6 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <motion.div
                        className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Crown className="w-4 h-4 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">عضویت VIP</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">اطلاعات کامل خود را وارد کنید</p>
                      </div>
                    </div>

                    <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4 sm:space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.1 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <User className="w-4 h-4 text-green-500" />
                                  نام
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="نام شما"
                                    className="bg-white/70 dark:bg-gray-800/70 border-green-200/50 dark:border-green-700/50 focus:border-green-500 dark:focus:border-green-400 rounded-xl text-sm h-11 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.15 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <User className="w-4 h-4 text-green-500" />
                                  نام خانوادگی
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="نام خانوادگی شما"
                                    className="bg-white/70 dark:bg-gray-800/70 border-green-200/50 dark:border-green-700/50 focus:border-green-500 dark:focus:border-green-400 rounded-xl text-sm h-11 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </div>

                      <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.2 }}
                      >
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-green-500" />
                                آدرس ایمیل
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="example@email.com"
                                  className="bg-white/70 dark:bg-gray-800/70 border-green-200/50 dark:border-green-700/50 focus:border-green-500 dark:focus:border-green-400 rounded-xl text-sm h-11 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                />
                              </FormControl>
                              <FormMessage className="text-red-500 text-xs" />
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.25 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <Zap className="w-4 h-4 text-green-500" />
                                  نام کاربری
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="نام کاربری منحصر به فرد"
                                    className="bg-white/70 dark:bg-gray-800/70 border-green-200/50 dark:border-green-700/50 focus:border-green-500 dark:focus:border-green-400 rounded-xl text-sm h-11 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.3 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-green-500" />
                                  شماره تلفن
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                                    className="bg-white/70 dark:bg-gray-800/70 border-green-200/50 dark:border-green-700/50 focus:border-green-500 dark:focus:border-green-400 rounded-xl text-sm h-11 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.35 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <Lock className="w-4 h-4 text-green-500" />
                                  رمز عبور
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={showPassword ? 'text' : 'password'}
                                      placeholder="حداقل ۸ کاراکتر"
                                      className="pl-12 bg-white/70 dark:bg-gray-800/70 border-green-200/50 dark:border-green-700/50 focus:border-green-500 dark:focus:border-green-400 rounded-xl text-sm h-11 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute left-1 top-0.5 h-10 w-10 rounded-lg hover:bg-green-100 dark:hover:bg-green-900 transition-colors duration-200"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Eye className="h-4 w-4 text-green-500" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          variants={inputVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: 0.4 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-green-500" />
                                  تکرار رمز عبور
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="رمز عبور را دوباره وارد کنید"
                                    className="bg-white/70 dark:bg-gray-800/70 border-green-200/50 dark:border-green-700/50 focus:border-green-500 dark:focus:border-green-400 rounded-xl text-sm h-11 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500 text-xs" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </div>

                      <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.45 }}
                      >
                        <FormField
                          control={registerForm.control}
                          name="agreeToTerms"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-0 space-y-0 gap-3">
                              <FormControl>
                                <Checkbox 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-teal-600 data-[state=checked]:border-transparent border-green-300 dark:border-green-600 rounded-md"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <Label 
                                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                >
                                  قوانین و مقررات را می پذیرم
                                </Label>
                              </div>
                            </FormItem>
                          )}
                        />
                      </motion.div>

                      { }
                      <motion.div
                        variants={inputVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.5 }}
                        className="pt-4"
                      >
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-green-500 via-teal-600 to-blue-600 hover:from-green-600 hover:via-teal-700 hover:to-blue-700 text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border-0"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              <span>در حال ایجاد حساب...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span>ایجاد حساب VIP</span>
                              <motion.div
                                className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100"
                                animate={{ scale: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                  </form>
                  </motion.div>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}