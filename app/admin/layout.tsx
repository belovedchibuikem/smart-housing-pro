"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminLoadingProvider } from "@/components/admin/admin-loading-context"
import { AdminRoutePermissionGate } from "@/components/admin/admin-route-permission-gate"
import { AuthGuard } from "@/lib/tenant/auth-guard"
import type { UserRole } from "@/lib/roles"
import { getUserData } from "@/lib/auth/auth-utils"
import { useSubscriptionGuard } from "@/lib/hooks/use-subscription"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>("admin")
  const [permissions, setPermissions] = useState<string[]>([])
  const [roleNames, setRoleNames] = useState<string[]>([])

  // Check tenant subscription status and handle redirects
  const { isLoading } = useSubscriptionGuard(true)

  useEffect(() => {
    const userData = getUserData()
    if (userData) {
      const role = (userData.role || (userData.roles && userData.roles[0]) || "admin") as UserRole
      setUserRole(role)
      setPermissions(Array.isArray(userData.permissions) ? userData.permissions : [])
      setRoleNames(Array.isArray(userData.roles) ? (userData.roles as string[]) : [])
    }
  }, [])

  // Show loading while checking subscription
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard requireStaffDashboardAccess>
      <div className="min-h-screen bg-background">
        <AdminHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex">
          <AdminSidebar
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            userRole={userRole}
            permissions={permissions}
            roleNames={roleNames}
          />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <AdminLoadingProvider>
              <AdminRoutePermissionGate>{children}</AdminRoutePermissionGate>
            </AdminLoadingProvider>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
