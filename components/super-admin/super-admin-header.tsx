"use client"

import { useState, useEffect } from "react"
import { Bell, Menu, Search, User, Settings, LogOut, UserCircle } from "lucide-react"
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
import { NotificationDropdown } from "./notification-dropdown"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SuperAdminHeaderProps {
  onMenuClick: () => void
}

interface UserData {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
  role: string
}

export function SuperAdminHeader({ onMenuClick }: SuperAdminHeaderProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get user data from localStorage (set during login)
    const storedUserData = localStorage.getItem('user_data')
    if (storedUserData) {
      try {
        const user = JSON.parse(storedUserData)
        setUserData(user)
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST'
      })
      
      // Clear local storage
      localStorage.removeItem('user_data')
      localStorage.removeItem('auth_token')
      
      toast.success('Logged out successfully')
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('user_data')
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
  }
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Left side - Mobile menu and logo */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/super-admin" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            SA
          </div>
          <span className="hidden sm:inline">Super Admin</span>
        </Link>

        {/* Center - Search bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search businesses, packages..." className="pl-9" />
          </div>
        </div>

        {/* Right side - Notifications and Profile */}
        <div className="flex items-center gap-2">
          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                {userData?.avatar_url ? (
                  <img 
                    src={userData.avatar_url} 
                    alt="Profile" 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {userData ? `${userData.first_name} ${userData.last_name}` : 'Super Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userData?.email || 'admin@platform.com'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userData?.role || 'super-admin'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/super-admin/profile" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/super-admin/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
