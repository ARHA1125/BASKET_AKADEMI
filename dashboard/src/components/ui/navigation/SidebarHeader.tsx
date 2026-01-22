"use client"

import { Logo } from "@/components/Logo";
import { SidebarHeader as BaseSidebarHeader } from "@/components/Sidebar";
import { cx } from "@/lib/utils";

interface SidebarHeaderProps {
  title: string
  subtitle: string
  logoColor?: string 
  className?: string
}

export function SidebarHeader({ title, subtitle, logoColor = "text-blue-500", className }: SidebarHeaderProps) {
  return (
    <BaseSidebarHeader className={cx("px-3 py-4", className)}>
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <Logo className={cx("size-6", logoColor)} />
        </span>
        <div>
          <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
            {title}
          </span>
          <span className="block text-xs text-gray-900 dark:text-gray-50">
            {subtitle}
          </span>
        </div>
      </div>
    </BaseSidebarHeader>
  )
}
