"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SuperAdminGuard } from "@/lib/auth/super-admin-guard"
import { TenantProvider } from "@/lib/tenant/tenant-context"
import { fetchCurrentUser, userHasRole } from "@/lib/auth/role-utils"
import { SuperAdminHeader } from "@/components/super-admin/super-admin-header"
import { SuperAdminSidebar } from "@/components/super-admin/super-admin-sidebar"
import { SuperAdminLoadingProvider } from "@/components/super-admin/super-admin-loading-context"

function SuperAdminRoleGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [allowed, setAllowed] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function check() {
            try {
                // For super-admin, we can check the role from the stored user data
                // instead of calling /api/auth/me
                const userData = localStorage.getItem('user_data')
                if (userData) {
                    const user = JSON.parse(userData)
                    if (user.role === 'super-admin' || (user.roles && user.roles.includes('super-admin'))) {
                        if (!cancelled) setAllowed(true)
                    } else {
                        router.replace("/dashboard")
                    }
                } else {
                    router.replace("/login")
                }
            } finally {
                if (!cancelled) setChecking(false)
            }
        }
        check()
        return () => {
            cancelled = true
        }
    }, [router])

    if (checking) return <div className="py-10 text-center text-muted-foreground">Authorizing...</div>
    if (!allowed) return null
    return <>{children}</>
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <SuperAdminGuard>
      <TenantProvider>
        <div className="min-h-screen bg-background">
          <SuperAdminHeader onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
          <div className="flex">
            <SuperAdminSidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
            <main className="flex-1 p-6 lg:p-8">
              <SuperAdminRoleGuard>
                <SuperAdminLoadingProvider>
                  {children}
                </SuperAdminLoadingProvider>
              </SuperAdminRoleGuard>
            </main>
          </div>
        </div>
      </TenantProvider>
    </SuperAdminGuard>
  )
}
