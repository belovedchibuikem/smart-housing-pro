"use client"

import type React from "react"
import { useState } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminLoadingProvider } from "@/components/admin/admin-loading-context"
import type { UserRole } from "@/lib/roles"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // For now, defaulting to super_admin. Replace with actual user role from auth
  const [userRole] = useState<UserRole>("super_admin")

  return (
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
  )
}
