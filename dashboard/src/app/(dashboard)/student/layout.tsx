import { SidebarProvider, SidebarTrigger } from "@/components/Sidebar"
import { Breadcrumbs } from "@/components/ui/navigation/Breadcrumbs"
import { StudentSidebar } from "@/components/ui/navigation/StudentSidebar"
import { cookies } from "next/headers"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <StudentSidebar />
      <div className="w-full">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
          <SidebarTrigger className="-ml-1" />
          <div className="mr-2 h-4 w-px bg-gray-200 dark:bg-gray-800" />
          <Breadcrumbs />
        </header>
        <main className="p-4">{children}</main>
      </div>
    </SidebarProvider>
  )
}
