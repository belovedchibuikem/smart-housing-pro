"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import type { MarketplaceListing } from "@/lib/api/marketplace"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const MapInner = dynamic(() => import("./listing-map-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-[360px] w-full rounded-xl" />,
})

type Props = {
  listings: MarketplaceListing[]
  center?: { lat: number; lng: number }
  className?: string
  height?: number
  enabled?: boolean
}

/**
 * OpenStreetMap / Leaflet map — loaded only when enabled (Housing OS map flag).
 */
export function ListingMap({ listings, center, className, height = 360, enabled = true }: Props) {
  const points = useMemo(
    () =>
      listings
        .filter((l) => l.lat != null && l.lng != null)
        .map((l) => ({
          id: `${l.tenant_slug}-${l.id}`,
          lat: l.lat as number,
          lng: l.lng as number,
          title: l.name,
          price: l.price,
          href: `/saas/marketplace/${l.tenant_slug}/${l.listing_kind}/${l.id}`,
        })),
    [listings]
  )

  if (!enabled) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Map search</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Map view is available when Housing OS map search is enabled for this environment.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Map ({points.length} pinned)</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="rounded-xl overflow-hidden border">
          <MapInner points={points} center={center} height={height} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          OpenStreetMap tiles. Google Maps overlay available when API keys are configured.
        </p>
      </CardContent>
    </Card>
  )
}
