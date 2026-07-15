"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Wrench, CalendarClock, BarChart3, DoorOpen } from "lucide-react"
import { fetchHousingOsFlags } from "@/lib/api/marketplace"

/**
 * Landlord Tenant Admin shell — gated by HOUSING_OS_LANDLORD_DASHBOARD_ENABLED.
 * Reuses existing property-management routes; does not replace cooperative admin.
 */
export default function LandlordDashboardPage() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHousingOsFlags()
      .then((flags) => setEnabled(Boolean(flags?.landlord_dashboard_enabled)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 animate-pulse h-40 bg-muted rounded-xl" />
  }

  if (!enabled) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-2xl font-bold">Landlord dashboard</h1>
        <p className="text-muted-foreground mt-2">
          This module is feature-flagged off in production until staging smoke tests pass. Enable{" "}
          <code className="text-xs">HOUSING_OS_LANDLORD_DASHBOARD_ENABLED</code>.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  const tiles = [
    { href: "/admin/properties", label: "Properties & units", icon: Building2, desc: "Buildings, floors, rental units" },
    { href: "/admin/property-management/allottees", label: "Occupancy", icon: Users, desc: "Tenants & vacancies" },
    { href: "/admin/property-management/maintenance", label: "Maintenance", icon: Wrench, desc: "Tickets & inspections" },
    { href: "/dashboard/property-management/maintenance", label: "Member requests", icon: DoorOpen, desc: "Incoming issues" },
    { href: "/saas/marketplace", label: "Marketplace listings", icon: CalendarClock, desc: "Publish & inspections" },
    { href: "/admin/reports", label: "Revenue reports", icon: BarChart3, desc: "Rent & occupancy analytics" },
  ]

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div>
        <Badge className="mb-2">Landlord · Tenant Admin</Badge>
        <h1 className="text-3xl font-bold">Landlord command center</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage properties, units, tenants, rent, maintenance, waitlists, and marketplace exposure — without leaving
          Smart Housing.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Card key={t.href} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <t.icon className="h-5 w-5 text-primary" />
                {t.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t.desc}</p>
              <Button asChild size="sm" variant="outline">
                <Link href={t.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
