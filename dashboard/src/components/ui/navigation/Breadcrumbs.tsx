"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"


const routeMapping: Record<string, string> = {
  admin: "Admin",
  notifications: "Notifications",
  "whatsapp-server": "Whatsapp Server",
  suppliers: "Suppliers",
  sales: "Sales",
  quotes: "Quotes",
  orders: "Orders",
  "insights-reports": "Insights & Reports",
  inbox: "Inbox",
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter((item) => item !== "")

  return (
    <nav aria-label="Breadcrumb" className="ml-2">
      <ol role="list" className="flex items-center space-x-3 text-sm">
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`
          const isLast = index === segments.length - 1

          const title = routeMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

          return (
            <React.Fragment key={href}>
              <ChevronRight
                className="size-4 shrink-0 text-gray-600 dark:text-gray-400"
                aria-hidden="true"
              />
              <li className="flex">
                <Link
                  href={href}
                  className={`${
                    isLast
                      ? "text-gray-900 font-medium dark:text-gray-50 pointer-events-none"
                      : "text-gray-500 transition hover:text-gray-700 dark:text-gray-400 hover:dark:text-gray-300"
                  }`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {title}
                </Link>
              </li>
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}