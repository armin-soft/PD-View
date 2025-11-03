import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Heart,
  ExternalLink,
  Shield,
  Users,
  Globe,
  Star,
  Award,
  Zap,
  Clock,
  Headphones,
  ChevronUp,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BookOpen,
  CreditCard,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPersianDigits } from '@/lib/persian-utils';

export function Footer() {
  const currentYear = 1404;  

  const quickLinks = [
    { label: 'صفحه اصلی', href: '/', icon: FileText },
    { label: 'کتابخانه', href: '/library', icon: BookOpen },
  ];

  const features = [
    { icon: Shield, label: 'امنیت بالا', description: 'محافظت کامل از فایل ها' },
    { icon: Headphones, label: `پشتیبانی ${toPersianDigits('24/7')}`, description: 'همیشه در کنار شما' },
    { icon: Globe, label: 'دسترسی جهانی', description: 'در سراسر دنیا' },
  ];

  const supportLinks = [
    { label: 'ورود', href: '/login', icon: BookOpen },
    { label: 'ثبت نام', href: '/register', icon: Users },
  ];


  return (
    <footer className="relative mt-auto bg-gradient-to-br from-slate-900 via-gray-900 to-black dark:from-black dark:via-gray-950 dark:to-black text-white overflow-hidden">
      { }
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"
          animate={{ x: [-100, 100, -100] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10">

        { }
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            { }
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              { }
              <div className="flex items-center gap-4 mb-8">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <motion.div
                    className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
                <div>
                  <h3 className="text-3xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    پی دی ویو
                  </h3>
                  <p className="text-purple-300 font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    آرمین سافت
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
                پلتفرم پیشرفته مدیریت و فروش پی دی اف با امکانات کامل امنیتی، رابط کاربری مدرن و تجربه کاربری بی نظیر
              </p>

              { }
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    className="group p-4 rounded-xl bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-cyan-900/30 border border-purple-700/30 hover:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300">
                        <feature.icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <h5 className="font-bold text-white text-sm">{feature.label}</h5>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

            </motion.div>

            { }
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                دسترسی سریع
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 8 }}
                  >
                    <Link href={link.href}>
                      <div className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-all duration-200 group py-2 px-3 rounded-lg hover:bg-purple-900/20">
                        <link.icon className="w-4 h-4 text-purple-500 group-hover:text-purple-400 transition-colors" />
                        <span className="font-medium">{link.label}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 mr-auto" />
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            { }
            <motion.div
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                ورود و ثبت نام
              </h4>
              <ul className="space-y-3 mb-8">
                {supportLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 8 }}
                  >
                    <Link href={link.href}>
                      <div className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-all duration-200 group py-2 px-3 rounded-lg hover:bg-blue-900/20">
                        <link.icon className="w-4 h-4 text-blue-500 group-hover:text-blue-400 transition-colors" />
                        <span className="font-medium">{link.label}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 mr-auto" />
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </ul>

            </motion.div>
          </div>
        </div>

        { }
        <motion.div 
          className="border-t border-gradient-to-r from-purple-700/30 via-blue-700/30 to-cyan-700/30 bg-gradient-to-r from-gray-900/50 via-black/50 to-gray-900/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-gray-300 text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span>© {currentYear} پی دی ویو - آرمین سافت.</span>
                </div>
                <span className="hidden sm:inline">تمامی حقوق محفوظ است</span>
              </div>
              
              <motion.div 
                className="flex items-center gap-3 text-gray-300 text-sm"
                whileHover={{ scale: 1.02 }}
              >
                <a 
                  href="https://armin-soft.ir" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-purple-300 transition-colors duration-200"
                >
                  توسعه دهنده آرمین سافت
                </a>
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
              </motion.div>

              { }
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                >
                  <ChevronUp className="w-4 h-4 text-purple-400" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}