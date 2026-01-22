import { SidebarProvider, SidebarTrigger } from "@/components/Sidebar"
import { DashboardOverview } from "@/components/features/dashboard/DashboardOverview"
import { AdminSidebar } from "@/components/ui/navigation/AdminSidebar"
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs"
import { cookies } from "next/headers"

export default async function Home() {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"
  const role = cookieStore.get("role")?.value?.toLowerCase()

  if (role === 'parent') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <meta httpEquiv="refresh" content="0;url=/parent" />
      </div>
    )
  }
  if (role === 'student') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <meta httpEquiv="refresh" content="0;url=/student" />
      </div>
    )
  }


  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AdminSidebar />
      <div className="w-full">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
          <SidebarTrigger className="-ml-1" />
          <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
          <Breadcrumbs />
        </header>
        <main className="p-4">
             <DashboardOverview />
        </main>
      </div>
    </SidebarProvider>
  )
}
