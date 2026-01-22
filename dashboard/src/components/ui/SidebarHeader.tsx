import { Logo } from "@/components/Logo"
import { SidebarHeader as SidebarHeaderLayout } from "@/components/Sidebar"

export function SidebarHeader({ className }: { className?: string }) {
  return (
    <SidebarHeaderLayout className={className}>
      <div className="flex items-center gap-3">
        <span className="size-24 flex items-center justify-center rounded-md bg-white p-1 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <Logo className="size-full" />
        </span>
        <div>
          <span className="block text-sm font-semibold text-gray-900 dark:text-gray-50">
            WIRABHAKTI
          </span>
          <span className="block text-xs text-gray-900 dark:text-gray-50">
            BASKETBALL CLUB
          </span>
        </div>
      </div>
    </SidebarHeaderLayout>
  )
}
