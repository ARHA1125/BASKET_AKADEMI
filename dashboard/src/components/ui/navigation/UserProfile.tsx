"use client"

import { Button } from "@/components/Button"
import { cx, focusRing } from "@/lib/utils"
import { ChevronsUpDown } from "lucide-react"

import { useUser } from "@/hooks/use-user"
import { DropdownUserProfile } from "./DropdownUserProfile"

export function UserProfile() {
  const { user, loading } = useUser()
  
  if (loading) {
     return <div className="h-10 w-full animate-pulse rounded-md bg-gray-100 dark:bg-gray-800" />
  }

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const photoUrl = user?.photo_url 
    ? `${process.env.NEXT_PUBLIC_API_URL}${user.photo_url}`
    : null;

  return (
    <DropdownUserProfile userEmail={displayEmail} userName={displayName}>
      <Button
        aria-label="User settings"
        variant="ghost"
        className={cx(
          "group flex w-full items-center justify-between rounded-md px-1 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50 hover:dark:bg-gray-800/50 data-[state=open]:dark:bg-gray-900",
          focusRing,
        )}
      >
        <span className="flex items-center gap-3">
          {photoUrl ? (
             <img 
               src={photoUrl} 
               alt={displayName} 
               className="size-8 shrink-0 rounded-full border border-gray-300 dark:border-gray-800 object-cover"
             />
          ) : (
            <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                aria-hidden="true"
            >
                {initials}
            </span>
          )}
          <span className="truncate max-w-[120px]">{displayName}</span>
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400"
          aria-hidden="true"
        />
      </Button>
    </DropdownUserProfile>
  )
}
