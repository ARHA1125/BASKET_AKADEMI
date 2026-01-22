"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/Sidebar"
import { UserProfile } from "@/components/ui/navigation/UserProfile"
import { BarChart3, BookOpen, Calendar, LayoutDashboard, ShoppingBag } from "lucide-react"
import { usePathname } from "next/navigation"
import { SidebarHeader } from "./SidebarHeader"

const navigation = [
  {
    name: "Dashboard",
    href: "/student",
    icon: LayoutDashboard,
  },
  {
    name: "My Training",
    href: "/student/training",
    icon: BookOpen,
  },
  {
    name: "Schedule",
    href: "/student/schedule",
    icon: Calendar,
  },
  {
    name: "Performance",
    href: "/student/performance",
    icon: BarChart3,
  },
  {
    name: "Store",
    href: "/student/store",
    icon: ShoppingBag,
  },
] as const

export function StudentSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  
  const isActive = (href: string) => {
    if (href === "/student" && pathname === "/student") return true;
    if (href !== "/student" && pathname.startsWith(href)) return true;
    return false;
  }

  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader 
        title="Wirabhakti" 
        subtitle="Student Portal" 
        logoColor="text-blue-500" 
      />
      <SidebarContent>
        <SidebarGroup>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 mt-2">LMS & Training</div>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={isActive(item.href)}
                    icon={item.icon}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-gray-200 dark:border-gray-800" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}
