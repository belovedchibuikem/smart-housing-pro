"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AuthGuard } from "@/lib/tenant/auth-guard"
import { SuperAdminHeader } from "@/components/super-admin/super-admin-header"
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar"
import { SuperAdminLoadingProvider } from "@/components/super-admin/super-admin-loading-context"
import { unlockBodyPointerEvents } from "@/lib/ui/unlock-body"
import { IdleSessionGuard } from "@/lib/auth/idle-session"
import { WebPushRegistrar } from "@/components/push/web-push-registrar"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    unlockBodyPointerEvents()
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <AuthGuard requiredRole="super-admin" redirectTo="/login">
      <IdleSessionGuard />
      <WebPushRegistrar />
      <div className="min-h-screen bg-background lg:flex lg:h-dvh lg:min-h-0 lg:flex-col lg:overflow-hidden">
        <div className="shrink-0">
          <SuperAdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
        <div className="flex lg:min-h-0 lg:flex-1 lg:overflow-hidden">
          <SuperAdminSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:overflow-y-auto lg:p-8">
            <SuperAdminLoadingProvider>
              {children}
            </SuperAdminLoadingProvider>
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
