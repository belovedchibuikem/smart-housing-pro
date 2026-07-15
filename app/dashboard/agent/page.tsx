"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Wallet, LineChart, UserCheck } from "lucide-react"
import { fetchHousingOsFlags } from "@/lib/api/marketplace"

/**
 * Agent CRM shell — builds on existing leads / viewings / commissions tables.
 * Gated by HOUSING_OS_AGENT_CRM_ENABLED.
 */
export default function AgentCrmPage() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHousingOsFlags()
      .then((flags) => setEnabled(Boolean(flags?.agent_crm_enabled)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 animate-pulse h-40 bg-muted rounded-xl" />
  }

  if (!enabled) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-2xl font-bold">Agent CRM</h1>
        <p className="text-muted-foreground mt-2">
          Enable with <code className="text-xs">HOUSING_OS_AGENT_CRM_ENABLED</code> after staging verification.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/dashboard/agent-profile">Agent profile</Link>
        </Button>
      </div>
    )
  }

  const tiles = [
    { href: "/dashboard/agent-profile", label: "My profile & license", icon: UserCheck },
    { href: "/saas/marketplace/agents", label: "Public directory", icon: Users },
    { href: "/super-admin/marketplace-agents", label: "Leads (ops)", icon: Calendar },
    { href: "/dashboard/wallet", label: "Earnings wallet", icon: Wallet },
    { href: "/dashboard", label: "Performance", icon: LineChart },
  ]

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div>
        <Badge className="mb-2">Agent CRM</Badge>
        <h1 className="text-3xl font-bold">Pipeline & appointments</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage leads, viewings, negotiations, commissions, and reviews. Commission recording is wired through
          MarketplaceAgentService when deals close.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Card key={t.href}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <t.icon className="h-5 w-5 text-primary" />
                {t.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
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
