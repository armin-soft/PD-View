import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ModernSwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  variant?: 'default' | 'gradient' | 'minimal' | 'premium';
  size?: 'sm' | 'md' | 'lg';
}

const switchVariants = {
  size: {
    sm: {
      root: "h-5 w-9",
      thumb: "h-4 w-4 data-[state=checked]:translate-x-4"
    },
    md: {
      root: "h-6 w-11", 
      thumb: "h-5 w-5 data-[state=checked]:translate-x-5"
    },
    lg: {
      root: "h-7 w-13",
      thumb: "h-6 w-6 data-[state=checked]:translate-x-6"
    }
  },
  variant: {
    default: {
      root: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700 border-2 border-transparent data-[state=checked]:shadow-lg data-[state=checked]:shadow-blue-500/25",
      thumb: "bg-white shadow-lg drop-shadow-sm"
    },
    gradient: {
      root: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-teal-600 data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-gray-200 data-[state=unchecked]:to-gray-300 dark:data-[state=unchecked]:from-gray-700 dark:data-[state=unchecked]:to-gray-600 border-2 border-transparent data-[state=checked]:shadow-xl data-[state=checked]:shadow-green-500/30",
      thumb: "bg-white shadow-xl drop-shadow-md"
    },
    minimal: {
      root: "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600 border border-gray-300 dark:border-gray-600 data-[state=checked]:border-blue-600",
      thumb: "bg-white shadow-md"
    },
    premium: {
      root: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:via-pink-500 data-[state=checked]:to-rose-500 data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-gray-100 data-[state=unchecked]:to-gray-200 dark:data-[state=unchecked]:from-gray-800 dark:data-[state=unchecked]:to-gray-700 border-2 data-[state=checked]:border-purple-300 data-[state=unchecked]:border-gray-300 dark:data-[state=unchecked]:border-gray-600 data-[state=checked]:shadow-2xl data-[state=checked]:shadow-purple-500/40 relative overflow-hidden",
      thumb: "bg-gradient-to-br from-white to-gray-50 shadow-2xl drop-shadow-lg border border-white/50"
    }
  }
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  ModernSwitchProps
>(({ className, variant = 'default', size = 'md', ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 hover:scale-105 active:scale-95",
      switchVariants.size[size].root,
      switchVariants.variant[variant].root,
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block rounded-full ring-0 transition-all duration-300 ease-in-out data-[state=unchecked]:translate-x-0",
        switchVariants.size[size].thumb,
        switchVariants.variant[variant].thumb
      )}
    />
    
    { }
    {variant === 'premium' && (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${20 + i * 25}%`,
              top: '50%',
              transform: 'translateY(-50%)'
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
    )}
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
