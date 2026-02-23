
import { cx } from "@/lib/utils"
import * as React from "react"

import { useSpring, animated } from "@react-spring/web"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const [hoverProps, api] = useSpring(() => ({
    scale: 1,
    y: 0,
    config: { tension: 300, friction: 20 },
  }))

  return (
    <animated.div
      ref={ref}
      style={{ ...hoverProps, ...(props.style as object) }}
      onMouseEnter={(e: any) => {
        api.start({ scale: 1.01, y: -2 })
        if (props.onMouseEnter) props.onMouseEnter(e)
      }}
      onMouseLeave={(e: any) => {
        api.start({ scale: 1, y: 0 })
        if (props.onMouseLeave) props.onMouseLeave(e)
      }}
      className={cx(
        "rounded-xl border border-gray-200 bg-white text-gray-950 shadow dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 transition-colors duration-200",
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cx("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cx("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardContent, CardHeader, CardTitle }

