import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'default' | 'compact' | 'minimal' | 'floating';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  variant = 'default', 
  size = 'md', 
  showLabel = false,
  className = '' 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return `${sizeClasses[size]} rounded-xl bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-blue-600/10 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-indigo-600/10 hover:from-yellow-400/20 hover:via-orange-400/20 hover:to-blue-600/20 dark:hover:from-blue-600/20 dark:hover:via-purple-600/20 dark:hover:to-indigo-600/20 border border-yellow-200/50 dark:border-blue-700/50 transition-all duration-300`;
      
      case 'minimal':
        return `${sizeClasses[size]} rounded-lg bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300`;
      
      case 'floating':
        return `${sizeClasses[size]} rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300`;
      
      default:
        return `${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-yellow-400/10 via-orange-400/10 to-blue-600/10 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-indigo-600/10 hover:from-yellow-400/20 hover:via-orange-400/20 hover:to-blue-600/20 dark:hover:from-blue-600/20 dark:hover:via-purple-600/20 dark:hover:to-indigo-600/20 border border-yellow-200/50 dark:border-blue-700/50 transition-all duration-300`;
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div 
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className={`relative overflow-hidden group ${getVariantClasses()}`}
          title={theme === 'dark' ? 'تغییر به تم روشن' : 'تغییر به تم تاریک'}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-blue-600/5 dark:from-blue-600/5 dark:to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <AnimatePresence mode="wait">
            {theme === 'dark' ? (
              <motion.div
                key="sun"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.175, 0.885, 0.32, 1.275],
                  opacity: { duration: 0.2 }
                }}
                className="relative z-10"
              >
                <Sun className={`${iconSizes[size]} text-yellow-500 drop-shadow-sm`} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ scale: 0, rotate: 180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: -180, opacity: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.175, 0.885, 0.32, 1.275],
                  opacity: { duration: 0.2 }
                }}
                className="relative z-10"
              >
                <Moon className={`${iconSizes[size]} text-blue-600 dark:text-blue-400 drop-shadow-sm`} />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
      
      {showLabel && (
        <motion.span 
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'dark' ? 'تم تاریک' : 'تم روشن'}
        </motion.span>
      )}
    </div>
  );
}