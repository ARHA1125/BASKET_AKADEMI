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
import { Award, GraduationCap, LayoutDashboard, MessageCircle, Quote, ShoppingBag, Wallet } from "lucide-react"

import { usePathname } from "next/navigation"
import { SidebarHeader } from "./SidebarHeader"

const navigation = [
  {
    name: "Ringkasan",
    href: "/parent",
    icon: LayoutDashboard,
  },
  {
    name: "Keuangan / Tagihan",
    href: "/parent/financials",
    icon: Wallet,
  },
  {
    name: "Laporan Akademik",
    href: "/parent/reports",
    icon: GraduationCap,
  },
  {
    name: "Penghargaan Anak",
    href: "/parent/badges",
    icon: Award,
  },
  {
    name: "Pesan",
    href: "/parent/messages",
    icon: MessageCircle,
  },
  {
    name: "Toko",
    href: "/parent/store",
    icon: ShoppingBag,
  },
  {
    name: "Testimoni",
    href: "/parent/testimonial",
    icon: Quote,
  },
] as const

export function ParentSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
  
  const isActive = (href: string) => {
    if (href === "/parent" && pathname === "/parent") return true;
    if (href !== "/parent" && pathname.startsWith(href)) return true;
    return false;
  }

  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader 
        title="Wirabhakti" 
        subtitle="Portal Orang Tua" 
        logoColor="text-blue-500" 
      />
      <SidebarContent>
         <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 mt-2">Menu Portal</div>
        <SidebarGroup>
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
