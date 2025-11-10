"use client"

import type React from "react"
import { useState } from "react"
import { AuthGuard } from "@/lib/tenant/auth-guard"
import { TenantProvider } from "@/lib/tenant/tenant-context"
import { SuperAdminHeader } from "@/components/super-admin/super-admin-header"
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar"
import { SuperAdminLoadingProvider } from "@/components/super-admin/super-admin-loading-context"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <AuthGuard requiredRole="super-admin" redirectTo="/login">
      <TenantProvider>
        <div className="min-h-screen bg-background">
          <SuperAdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <div className="flex">
            <SuperAdminSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
            <main className="flex-1 p-6 lg:p-8">
              <SuperAdminLoadingProvider>
                {children}
              </SuperAdminLoadingProvider>
            </main>
          </div>
        </div>
      </TenantProvider>
    </AuthGuard>
  )
}
