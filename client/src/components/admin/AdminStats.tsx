import { motion } from 'framer-motion';
import { TrendingUp, Users, FileText, DollarSign, Clock, ArrowUp, ArrowDown, Sparkles, Zap, Crown, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPersianNumber, formatPersianPrice } from '@/lib/persian-utils';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeText: string;
  icon: typeof Users;
  gradient: string;
  bgGradient: string;
  shadowColor: string;
}

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    totalFiles: number;
    totalRevenue: number;
    pendingPayments: number;
    userGrowth: number;
    fileGrowth: number;
    revenueGrowth: number;
  };
}

export function AdminStats({ stats }: AdminStatsProps) {
  const statCards: StatCard[] = [
    {
      title: 'کل کاربران',
      value: formatPersianNumber(stats.totalUsers),
      change: stats.userGrowth,
      changeText: `نسبت به ماه گذشته`,
      icon: Users,
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-500/10 to-purple-600/10',
      shadowColor: 'shadow-blue-500/25',
    },
    {
      title: 'فایل های موجود',
      value: formatPersianNumber(stats.totalFiles),
      change: stats.fileGrowth,
      changeText: `نسبت به ماه گذشته`,
      icon: FileText,
      gradient: 'from-green-500 to-teal-600',
      bgGradient: 'from-green-500/10 to-teal-600/10',
      shadowColor: 'shadow-green-500/25',
    },
    {
      title: 'درآمد کل',
      value: formatPersianPrice(stats.totalRevenue),
      change: stats.revenueGrowth,
      changeText: `نسبت به ماه گذشته`,
      icon: DollarSign,
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-500/10 to-orange-600/10',
      shadowColor: 'shadow-yellow-500/25',
    },
    {
      title: 'پرداخت های در انتظار',
      value: formatPersianNumber(stats.pendingPayments),
      change: 0,
      changeText: 'نیاز به بررسی فوری',
      icon: Clock,
      gradient: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-500/10 to-pink-600/10',
      shadowColor: 'shadow-red-500/25',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.5,
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      className="stats-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          variants={cardVariants}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
          className="group"
        >
          <Card className="stat-card">
            { }
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-20`}></div>

            <CardContent className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`stat-card-icon bg-gradient-to-br ${stat.gradient}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/90">
                  <span className={`${stat.change >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                    {stat.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {stat.change !== 0 && formatPersianNumber(Math.abs(stat.change))}%
                  </span>
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="stat-card-label text-gray-700 dark:text-gray-300">
                  {stat.title}
                </h3>
                <p className="stat-card-value text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.changeText}
                </p>
              </div>
            </CardContent>

          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}