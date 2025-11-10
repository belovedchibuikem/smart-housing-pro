"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminLoadingProvider } from "@/components/admin/admin-loading-context"
import { AuthGuard } from "@/lib/tenant/auth-guard"
import type { UserRole } from "@/lib/roles"
import { getUserData } from "@/lib/auth/auth-utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>("admin")

  useEffect(() => {
    // Get user role from localStorage
    const userData = getUserData()
    if (userData) {
      const role = userData.role || (userData.roles && userData.roles[0]) || "admin"
      setUserRole(role as UserRole)
    }
  }, [])

  return (
    <AuthGuard requiredRole={["admin", "super-admin", "super_admin"]}>
      <div className="min-h-screen bg-background">
        <AdminHeader mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        <div className="flex">
          <AdminSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} userRole={userRole} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <AdminLoadingProvider>
              {children}
            </AdminLoadingProvider>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
