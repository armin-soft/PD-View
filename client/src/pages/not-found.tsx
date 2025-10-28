import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Home, 
  ArrowRight, 
  FileQuestion, 
  Sparkles,
  Search,
  Library
} from 'lucide-react';

export default function NotFound() {
  const [, setLocation] = useLocation();

  const suggestedPages = [
    { href: '/', label: 'صفحه اصلی', icon: Home, color: 'from-blue-500 to-purple-600' },
    { href: '/library', label: 'کتابخانه', icon: Library, color: 'from-green-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        { }
        <motion.div 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <ThemeToggle variant="floating" size="md" />
        </motion.div>

        { }
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            whileHover={{ scale: 1.05, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <FileQuestion className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            ۴۰۴
          </motion.h1>

          <motion.h2 
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            صفحه مورد نظر یافت نشد
          </motion.h2>

          <motion.p 
            className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            متأسفانه صفحه ای که دنبال آن می گردید وجود ندارد یا ممکن است جابجا شده باشد
          </motion.p>
        </motion.div>

        { }
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {suggestedPages.map((page, index) => (
            <motion.div
              key={page.href}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
            >
              <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-orange-200/30 dark:border-orange-700/30 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => setLocation(page.href)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${page.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <page.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {page.label}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        بازگشت به {page.label}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        { }
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Button 
            onClick={() => setLocation('/')}
            className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            بازگشت به صفحه اصلی
          </Button>

          <Button 
            variant="outline"
            onClick={() => window.history.back()}
            className="border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl px-8 py-3 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            صفحه قبل
          </Button>
        </motion.div>

        { }
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-orange-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
