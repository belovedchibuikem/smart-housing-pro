"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchMarketplaceAgent } from "@/lib/api/marketplace"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import { ArrowLeft, MapPin, UserRound } from "lucide-react"

export default function MarketplaceAgentDetailPage() {
  const params = useParams<{ id: string }>()
  const [agent, setAgent] = useState<Awaited<ReturnType<typeof fetchMarketplaceAgent>>>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!params.id) return
    fetchMarketplaceAgent(params.id).then(setAgent).finally(() => setLoading(false))
  }, [params.id])

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Button asChild variant="ghost" className="mb-4 gap-2">
          <Link href="/saas/marketplace/agents">
            <ArrowLeft className="h-4 w-4" /> All agents
          </Link>
        </Button>

        {loading ? (
          <div className="h-64 rounded-xl bg-muted animate-pulse" />
        ) : !agent ? (
          <p className="text-muted-foreground">Agent not found.</p>
        ) : (
          <Card>
            <CardContent className="p-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <UserRound className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{agent.display_name}</h1>
                  {agent.rea_license_number && (
                    <p className="text-sm text-muted-foreground">License: {agent.rea_license_number}</p>
                  )}
                  <div className="mt-2"><VerificationBadge status="verified" /></div>
                </div>
              </div>
              {agent.bio && <p className="text-muted-foreground whitespace-pre-wrap">{agent.bio}</p>}
              {agent.service_areas && agent.service_areas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {agent.service_areas.map((area) => (
                    <Badge key={area} variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" /> {area}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {agent.active_listings ?? 0} active marketplace listings · {agent.closed_deals_count ?? 0} closed deals
              </p>
              <Button asChild>
                <Link href="/saas/marketplace">Browse listings</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
