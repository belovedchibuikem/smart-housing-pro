"use client"

import { Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NotificationDropdown } from "./notification-dropdown"

interface SuperAdminHeaderProps {
  onMenuClick: () => void
}

interface UserData {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  roles: string[]
  permissions: string[]
  status: string
  created_at: string
  updated_at: string
}

export function SuperAdminHeader({ onMenuClick }: SuperAdminHeaderProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user data from localStorage
    const storedUserData = localStorage.getItem('user_data')
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData)
        setUserData(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleLogout = () => {
    // Clear user data and token from localStorage
    localStorage.removeItem('user_data')
    localStorage.removeItem('auth_token')
    // Redirect to login page
    router.push('/login')
  }
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/super-admin" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            SA
          </div>
          <span className="hidden sm:inline">Super Admin</span>
        </Link>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search businesses, packages..." className="pl-9" />
          </div>
        </div>

        <NotificationDropdown />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium truncate" title={userData ? `${userData.first_name} ${userData.last_name}`.trim() || 'Super Admin' : 'Super Admin'}>
                  {userData ? `${userData.first_name} ${userData.last_name}`.trim() || 'Super Admin' : 'Super Admin'}
                </p>
                <p className="text-xs text-muted-foreground truncate" title={userData?.email || 'admin@platform.com'}>
                  {userData?.email || 'admin@platform.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/super-admin/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/super-admin/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
