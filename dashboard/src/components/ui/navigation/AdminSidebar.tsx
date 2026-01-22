"use client"
import { Divider } from "@/components/Divider"
import { Input } from "@/components/Input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSubLink,
} from "@/components/Sidebar"
import { SidebarHeader } from "@/components/ui/SidebarHeader"
import { cx, focusRing } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import { BookText, House, PackageSearch } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import * as React from "react"
import { UserProfile } from "./UserProfile"

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: House,
    notifications: false,
  },
  {
    name: "Inbox",
    href: "#",
    icon: PackageSearch,
    notifications: 2,
  },
] as const

const navigation2 = [
  {
    name: "Data",
    href: "#",
    icon: BookText,
    children: [
      {
        name: "Manage Data User",
        href: "/admin/members?tab=students",
      },
      {
        name: "User Credentials",
        href: "/admin/users",
      },
    ],
  },

  {
    name: "Admin",
    href: "#",
    icon: PackageSearch,
    children: [
      {
        name: "Notifications",
        href: "/admin/notifications",
        icon: BookText,
        notifications: false,
      },
      {
        name: "Whatsapp Server",
        href: "/admin/waha",
        icon: BookText,
        notifications: false,
      },
      
    ],
  },
] as const

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = React.useState<string[]>([
    navigation2[0].name,
    navigation2[1].name,
  ])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev: string[]) =>
      prev.includes(name)
        ? prev.filter((item: string) => item !== name)
        : [...prev, name],
    )
  }

  const searchParams = useSearchParams()
  const isActiveLink = (href: string) => {
    const [path, query] = href.split("?")
    if (path === "/" && pathname === "/") return true

    if (path !== "#" && pathname === path) {
      if (query) {
        const tab = new URLSearchParams(query).get("tab")
        const currentTab = searchParams.get("tab") || "students"
        return tab === currentTab
      }
      return true
    }
    return false
  }

  return (
    <Sidebar {...props} className="bg-gray-50 dark:bg-gray-925">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Input
              type="search"
              placeholder="Search items..."
              className="[&>input]:sm:py-1.5"
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={isActiveLink(item.href)}
                    icon={item.icon}
                    notifications={item.notifications}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {navigation2.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cx(
                      "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base text-gray-900 transition hover:bg-gray-200/50 sm:text-sm dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-gray-50",
                      focusRing,
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className="size-[18px] shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                    <RiArrowDownSFill
                      className={cx(
                        openMenus.includes(item.name)
                          ? "rotate-0"
                          : "-rotate-90",
                        "size-5 shrink-0 transform text-gray-400 transition-transform duration-150 ease-in-out dark:text-gray-600",
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  {item.children && openMenus.includes(item.name) && (
                    <SidebarMenuSub>
                      <div className="absolute inset-y-0 left-4 w-px bg-gray-300 dark:bg-gray-800" />
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.name}>
                          <SidebarSubLink
                            href={child.href}
                            isActive={isActiveLink(child.href)}
                          >
                            {child.name}
                          </SidebarSubLink>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  )}
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
