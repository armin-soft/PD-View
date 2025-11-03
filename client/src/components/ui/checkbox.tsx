import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ModernCheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: 'default' | 'gradient' | 'minimal' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  indeterminate?: boolean;
}

const checkboxVariants = {
  size: {
    sm: {
      root: "h-4 w-4",
      icon: "h-3 w-3"
    },
    md: {
      root: "h-5 w-5", 
      icon: "h-4 w-4"
    },
    lg: {
      root: "h-6 w-6",
      icon: "h-5 w-5"
    }
  },
  variant: {
    default: {
      root: "border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-transparent data-[state=checked]:shadow-lg data-[state=checked]:shadow-blue-500/25",
      icon: "text-white"
    },
    gradient: {
      root: "border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-teal-600 data-[state=checked]:border-transparent data-[state=checked]:shadow-xl data-[state=checked]:shadow-green-500/30",
      icon: "text-white"
    },
    minimal: {
      root: "border-2 border-gray-400 dark:border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600",
      icon: "text-white"
    },
    premium: {
      root: "border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-purple-500 data-[state=checked]:via-pink-500 data-[state=checked]:to-rose-500 data-[state=checked]:border-purple-300 data-[state=checked]:shadow-2xl data-[state=checked]:shadow-purple-500/40 relative overflow-hidden",
      icon: "text-white drop-shadow-sm"
    }
  }
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  ModernCheckboxProps
>(({ className, variant = 'default', size = 'md', indeterminate = false, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer shrink-0 rounded-lg ring-offset-background transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:scale-110 active:scale-95 cursor-pointer",
      checkboxVariants.size[size].root,
      checkboxVariants.variant[variant].root,
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.3 
        }}
      >
        {indeterminate ? (
          <Minus className={cn(checkboxVariants.size[size].icon, checkboxVariants.variant[variant].icon)} />
        ) : (
          <Check className={cn(checkboxVariants.size[size].icon, checkboxVariants.variant[variant].icon)} />
        )}
      </motion.div>
    </CheckboxPrimitive.Indicator>
    
    { }
    {variant === 'premium' && (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-70"
            style={{
              left: `${25 + i * 50}%`,
              top: `${25 + i * 50}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    )}
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
