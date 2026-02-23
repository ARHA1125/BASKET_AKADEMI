import { cx } from "@/lib/utils"
import * as React from "react"
// import { type VariantProps } from "class-variance-authority"

import { useSpring, animated } from "@react-spring/web"

// Simplified Badge without CVA for now to avoid dependency checks, or match shadcn styles
const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "error" | "neutral" | "blue" | "orange" | "purple" | "gold" }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/80",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
    destructive: "border-transparent bg-red-500 text-gray-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/80",
    outline: "text-gray-950 dark:text-gray-50",
    success: "border-transparent bg-green-500 text-white hover:bg-green-500/80 dark:bg-green-900 dark:text-green-50 dark:hover:bg-green-900/80",
    warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80 dark:bg-yellow-900 dark:text-yellow-50 dark:hover:bg-yellow-900/80",
    error: "border-transparent bg-red-500 text-white hover:bg-red-500/80 dark:bg-red-900 dark:text-red-50 dark:hover:bg-red-900/80",
    neutral: "border-transparent bg-gray-200 text-gray-600 hover:bg-gray-200/80 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/80",
    blue: "border-transparent bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50",
    orange: "border-transparent bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-200 dark:hover:bg-orange-900/50",
    purple: "border-transparent bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-200 dark:hover:bg-purple-900/50",
    gold: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:hover:bg-yellow-900/50",
  }

  const [hoverProps, api] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 15 },
  }))

  return (
    <animated.div
      ref={ref}
      style={{ ...hoverProps, ...(props.style as object) }}
      onMouseEnter={(e: any) => {
        api.start({ scale: 1.05 })
        if (props.onMouseEnter) props.onMouseEnter(e)
      }}
      onMouseLeave={(e: any) => {
        api.start({ scale: 1 })
        if (props.onMouseLeave) props.onMouseLeave(e)
      }}
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:border-gray-800 dark:focus:ring-gray-300 cursor-default",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }

