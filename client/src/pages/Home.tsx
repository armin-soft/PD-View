import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  User, 
  Users, 
  FileText, 
  Lock, 
  CreditCard, 
  Settings,
  ArrowLeft,
  Sparkles,
  Zap,
  Crown,
  Shield,
  Clock,
  Star,
  CheckCircle,
  PlayCircle,
  TrendingUp,
  Globe,
  Award,
  Layers,
  ChevronRight,
  Database,
  Smartphone
} from 'lucide-react';

export default function Home() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleUserAccess = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 dark:bg-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-blue-900/30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

        { }
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8" data-testid="badge-top-platform">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white/90 text-sm font-medium">برترین پلتفرم مدیریت پی دی اف در ایران</span>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <FileText className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 text-white" />
              </div>
              
              <h1 
                data-testid="text-app-title"
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-purple-400 to-blue-400 bg-clip-text text-transparent"
              >
                پی دی ویو
              </h1>
            </div>

            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-white/90 max-w-4xl mx-auto leading-relaxed px-4" data-testid="text-app-description">
              پلتفرم <span className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">هوشمند</span> و 
              <span className="font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> مدرن</span> برای مدیریت، فروش و مطالعه فایل های پی دی اف
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
            {[
              { icon: Shield, text: "امنیت بالا" },
              { icon: Zap, text: "سرعت بی نظیر" }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/15 transition-all duration-300" data-testid={`badge-feature-${index}`}>
                <item.icon className="w-4 h-4 text-white" />
                <span className="text-white/90 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16 lg:mb-24">
          <div className="group relative hover:scale-105 transition-transform duration-300" data-testid="card-guest-access">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-400 via-gray-500 to-slate-600 rounded-3xl blur-sm opacity-0 group-hover:opacity-75 transition-all duration-500"></div>
            
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl shadow-2xl h-full rounded-3xl">
              { }
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/20 via-gray-600/10 to-slate-700/20"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(148,163,184,0.3),transparent_50%)]"></div>
              
              <CardContent className="relative p-8 lg:p-10 text-center h-full flex flex-col">
                <div className="flex-1">
                  <div className="relative w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-gray-600 rounded-2xl shadow-xl"></div>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <Users className="w-10 h-10 lg:w-12 lg:h-12 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4" data-testid="text-guest-title">
                    دسترسی مهمان
                  </h3>
                  
                  <p className="text-white/80 text-base lg:text-lg mb-8 leading-relaxed max-w-sm mx-auto" data-testid="text-guest-description">
                    کاوش در کتابخانه گسترده ما و مطالعه صفحات رایگان بدون نیاز به ثبت نام
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 justify-center text-white/90" data-testid="item-guest-feature-0">
                      <CheckCircle className="w-5 h-5 text-slate-300" />
                      <span className="text-sm font-medium">دسترسی به کتابخانه</span>
                    </div>
                    <div className="flex items-center gap-3 justify-center text-white/90" data-testid="item-guest-feature-1">
                      <CheckCircle className="w-5 h-5 text-slate-300" />
                      <span className="text-sm font-medium">مشاهده صفحات نمونه</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link href="/library" data-testid="link-library">
                    <Button data-testid="button-guest-library" className="w-full bg-gradient-to-r from-slate-500 via-gray-600 to-slate-700 hover:from-slate-600 hover:via-gray-700 hover:to-slate-800 text-white font-bold h-14 lg:h-16 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group border-0 text-base lg:text-lg relative overflow-hidden">
                      { }
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center justify-center gap-3">
                        <FileText className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                        <span>ورود به کتابخانه</span>
                        <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group relative hover:scale-105 transition-transform duration-300" data-testid="card-user-access">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ⭐محبوب ترین انتخاب
              </div>
            </div>
            
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white/15 via-white/10 to-white/15 backdrop-blur-2xl shadow-2xl h-full rounded-3xl">
              { }
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-600/15 to-pink-500/20"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.4),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(168,85,247,0.3),transparent_50%)]"></div>
              
              { }
              <CardContent className="relative p-8 lg:p-10 text-center h-full flex flex-col">
                <div className="flex-1">
                  <div className="relative w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl shadow-xl"></div>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 lg:w-12 lg:h-12 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4" data-testid="text-user-title">
                    حساب کاربری
                  </h3>
                  
                  <p className="text-white/90 text-base lg:text-lg mb-8 leading-relaxed max-w-sm mx-auto" data-testid="text-user-description">
                    تجربه کامل خرید و مدیریت فایل های پی دی اف با امکانات ویژه و پیشرفته
                  </p>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 justify-center text-white/95" data-testid="item-user-feature-0">
                      <CheckCircle className="w-5 h-5 text-blue-300" />
                      <span className="text-sm font-medium">خرید و مشاهده نامحدود</span>
                    </div>
                    <div className="flex items-center gap-3 justify-center text-white/95" data-testid="item-user-feature-1">
                      <CheckCircle className="w-5 h-5 text-purple-300" />
                      <span className="text-sm font-medium">پنل کاربری امن</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Button 
                      onClick={handleUserAccess}
                      data-testid="button-user-login"
                      className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white font-bold h-14 lg:h-16 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group border-0 text-base lg:text-lg relative overflow-hidden"
                    >
                      { }
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative flex items-center justify-center gap-3">
                        <User className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                        <span>ورود به حساب کاربری</span>
                        <motion.div
                          className="w-3 h-3 bg-white rounded-full"
                          animate={{ 
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        />
                      </div>
                    </Button>
                  </div>

                  { }
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button 
                      onClick={handleRegister}
                      data-testid="button-user-register"
                      className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 hover:border-white/50 text-white font-semibold h-12 lg:h-14 rounded-2xl transition-all duration-300 group text-base lg:text-lg relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <User className="w-5 h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                        <span>ثبت نام رایگان</span>
                        <motion.div
                          className="w-2 h-2 bg-green-400 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      </div>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>


        </div>

        { }
        <motion.div 
          className="max-w-7xl mx-auto mb-20 lg:mb-32"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          { }
          <motion.div 
            className="text-center mb-16 lg:mb-20"
            variants={featureVariants}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-purple-400/30 rounded-full px-6 py-3 mb-8"
              whileHover={{ scale: 1.05 }}
              data-testid="badge-unique-features"
            >
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-purple-200 font-medium">ویژگی های منحصر به فرد</span>
            </motion.div>
            
            <h2 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6" data-testid="text-why-choose-title">
              چرا پی دی ویو را انتخاب کنید؟
            </h2>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed" data-testid="text-why-choose-description">
              با بهره گیری از آخرین تکنولوژی ها و بهترین تجربه کاربری، ما پلتفرمی بی نظیر برای مدیریت پی دی اف ایجاد کرده ایم
            </p>
          </motion.div>
          
          { }
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Shield,
                title: "امنیت چندلایه",
                description: "رمزگذاری پیشرفته AES-256 و حفاظت کامل از اطلاعات شخصی و فایل های شما",
                color: "from-green-400 to-emerald-600",
                features: ["رمزگذاری پیشرفته", "احراز هویت دوعاملی", "پشتیبان گیری خودکار"]
              },
              {
                icon: Zap,
                title: "سرعت فوق العاده",
                description: "بارگذاری و نمایش در کمتر از 3 ثانیه با استفاده از سی دی ان جهانی و بهینه سازی مدرن",
                color: "from-yellow-400 to-orange-600",
                features: ["سی دی ان پرسرعت", "کمپرسی هوشمند", "کش گذاری پیشرفته"]
              },
              {
                icon: Smartphone,
                title: "طراحی ریسپانسیو",
                description: "تجربه یکسان در تمام دستگاه ها - کامپیوتر، تبلت و موبایل با رابط کاربری مدرن",
                color: "from-purple-400 to-pink-600",
                features: ["موبایل فرست", "طراحی مدرن", "تجربه کاربری بهینه"]
              },
              {
                icon: CreditCard,
                title: "پرداخت آسان و امن",
                description: "روش های متنوع پرداخت با درگاه های معتبر ایرانی و بین المللی",
                color: "from-blue-400 to-indigo-600",
                features: ["درگاه های معتبر", "پرداخت آنی", "رسید دیجیتال"]
              },
              {
                icon: Database,
                title: "مدیریت هوشمند",
                description: "ابزارهای پیشرفته آنالیز، گزارش گیری و مدیریت فروش با داشبورد جامع",
                color: "from-cyan-400 to-teal-600",
                features: ["داشبورد تحلیلی", "گزارش گیری", "مدیریت کاربران"]
              },
              {
                icon: Award,
                title: "پشتیبانی ۲۴/۷",
                description: "تیم پشتیبانی مجرب آماده پاسخگویی به سوالات و رفع مشکلات شما در تمام ساعات",
                color: "from-pink-400 to-rose-600",
                features: ["پشتیبانی زنده", "راهنمای کامل", "آموزش های ویدیویی"]
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={featureVariants}
                className="group relative"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                data-testid={`card-feature-${index}`}
              >
                { }
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-3xl blur-sm opacity-0 group-hover:opacity-50 transition-all duration-500`}></div>
                
                <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 h-full">
                  { }
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 10 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors" data-testid={`text-feature-title-${index}`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-white/80 text-sm leading-relaxed mb-6" data-testid={`text-feature-description-${index}`}>
                    {feature.description}
                  </p>
                  
                  { }
                  <div className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        className="flex items-center gap-2 text-white/70"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 + index * 0.1 + itemIndex * 0.1 }}
                        data-testid={`item-feature-detail-${index}-${itemIndex}`}
                      >
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>

      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />

      <Footer />
    </div>
  );
}