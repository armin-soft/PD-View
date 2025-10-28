import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { formatPersianNumber, formatPersianPrice } from '@/lib/persian-utils';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { useResizeObserver } from '@/hooks/use-resize-observer';

interface SalesData {
  month: string;
  sales: number;
  files: number;
  growth?: number;
}

interface SalesChartProps {
  data: SalesData[];
  type?: 'bar' | 'line' | 'area';
  showTrend?: boolean;
}

export function SalesChart({ data, type = 'bar', showTrend = true }: SalesChartProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const handleResize = useCallback((entry: ResizeObserverEntry) => {
    const { width, height } = entry.contentRect;
    setContainerSize({ width, height });
  }, []);
  
  const containerRef = useResizeObserver<HTMLDivElement>(handleResize);
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-xl"
        >
          <p className="font-bold text-gray-900 dark:text-white mb-2 text-sm sm:text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            {label}
          </p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {entry.dataKey === 'sales' ? 'فروش:' : 'فایل ها:'}
                </span>
                <span className="text-xs sm:text-sm font-semibold" style={{ color: entry.color }}>
                  {entry.dataKey === 'sales' 
                    ? formatPersianPrice(entry.value) 
                    : formatPersianNumber(entry.value)
                  }
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  const calculateTrend = () => {
    if (data.length < 2) return { trend: 0, isPositive: true };
    const current = data[data.length - 1]?.sales || 0;
    const previous = data[data.length - 2]?.sales || 0;
    const trend = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    return { trend: Math.abs(trend), isPositive: trend >= 0 };
  };

  const { trend, isPositive } = calculateTrend();

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={chartVariants}
    >
      { }
      {showTrend && (
        <motion.div 
          className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200/30 dark:border-blue-700/30"
          variants={headerVariants}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                نمودار فروش
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                آمار ماهانه فروش و فایل ها
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {formatPersianNumber(Math.round(trend))}%
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              نسبت به ماه قبل
            </p>
          </div>
        </motion.div>
      )}

      { }
      <motion.div 
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 sm:p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        variants={chartVariants}
      >
        <div ref={containerRef} className="h-56 sm:h-64 lg:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'area' ? (
              <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="filesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  tickFormatter={(value) => formatPersianNumber(value)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="files"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#filesGradient)"
                />
              </AreaChart>
            ) : type === 'line' ? (
              <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  tickFormatter={(value) => formatPersianNumber(value)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="files" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#F59E0B', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="salesBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.7}/>
                  </linearGradient>
                  <linearGradient id="filesBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 11, fill: 'currentColor' }}
                  tickFormatter={(value) => formatPersianNumber(value)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="sales" 
                  fill="url(#salesBarGradient)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
                <Bar 
                  dataKey="files" 
                  fill="url(#filesBarGradient)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        { }
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">فروش</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">فایل ها</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}