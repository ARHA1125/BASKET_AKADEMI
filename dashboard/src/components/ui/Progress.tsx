import { cx } from "@/lib/utils"
import * as React from "react"



const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cx(
      "relative h-2 w-full overflow-hidden rounded-full bg-gray-900/20 dark:bg-gray-50/20",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gray-900 transition-all dark:bg-gray-50"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
