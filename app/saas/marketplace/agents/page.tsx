"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchMarketplaceAgents, type MarketplaceAgent } from "@/lib/api/marketplace"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import { Search, UserRound, MapPin } from "lucide-react"

export default function MarketplaceAgentsPage() {
  const [q, setQ] = useState("")
  const [agents, setAgents] = useState<MarketplaceAgent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true)
      const data = await fetchMarketplaceAgents({ q: q || undefined, limit: 60 })
      setAgents(data)
      setLoading(false)
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Verified agents</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Licensed real-estate agents on Smart Housing. Every agent is verified before appearing in the directory.
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or license…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No verified agents found yet. Check back soon or browse listings directly.
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <UserRound className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold truncate">{agent.display_name}</h2>
                      {agent.rea_license_number && (
                        <p className="text-xs text-muted-foreground">REA {agent.rea_license_number}</p>
                      )}
                      <div className="mt-1">
                        <VerificationBadge status="verified" />
                      </div>
                    </div>
                  </div>
                  {agent.bio && <p className="text-sm text-muted-foreground line-clamp-3">{agent.bio}</p>}
                  {agent.service_areas && agent.service_areas.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {agent.service_areas.slice(0, 4).map((area) => (
                        <Badge key={area} variant="outline" className="text-xs gap-1">
                          <MapPin className="h-3 w-3" /> {area}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>{agent.closed_deals_count ?? 0} closed deals</span>
                    <Button asChild variant="link" className="h-auto p-0">
                      <Link href={`/saas/marketplace/agents/${agent.id}`}>View profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button asChild variant="outline">
          <Link href="/saas/marketplace">Browse listings</Link>
        </Button>
      </div>
    </div>
  )
}
