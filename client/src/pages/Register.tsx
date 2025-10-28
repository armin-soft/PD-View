import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserPlus, Sparkles, Zap, Crown, Gift } from 'lucide-react';

export default function Register() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-900 via-blue-900 to-teal-900 dark:from-gray-900 dark:via-green-900 dark:to-teal-900">
      { }
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.3),transparent_50%)] opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)] opacity-30"></div>
        <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,transparent,rgba(255,255,255,0.05),transparent)] opacity-20"></div>
      </div>

      { }
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-400/30 rounded-full"
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

      <Navigation />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          { }
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg relative"
              whileHover={{ scale: 1.05, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <UserPlus className="w-8 h-8 text-white" />
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Gift className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white via-green-200 to-teal-200 bg-clip-text text-transparent mb-2">
              ثبت نام
            </h1>
            <p className="text-white/70 text-sm mb-4">
              ایجاد حساب کاربری و دسترسی به امکانات پلتفرم
            </p>
            
            { }
            <div className="flex justify-center gap-6 text-white/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">هوش مصنوعی</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs">سرعت بالا</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                <span className="text-xs">کیفیت برتر</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <AuthModal
              isOpen={true}
              onClose={() => setLocation('/')}
              defaultMode="register"
            />
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
