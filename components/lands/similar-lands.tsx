"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import { resolveStorageUrl } from "@/lib/api/config"

export type SimilarLandItem = {
  id: string
  land_title?: string
  land_code?: string
  location?: string
  cost?: number
  land_size?: string
  status?: string
  images?: string[] | null
}

export function SimilarLands({ lands, currentLandId }: { lands: SimilarLandItem[]; currentLandId?: string }) {
  const filtered = lands.filter((l) => l.id !== currentLandId)

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        No other land parcels to show right now.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((land) => {
        const img =
          Array.isArray(land.images) && land.images.length > 0
            ? resolveStorageUrl(land.images[0]) || "/placeholder.svg"
            : "/placeholder.svg"
        return (
          <Link key={land.id} href={`/dashboard/lands/${land.id}`}>
            <Card className="overflow-hidden transition hover:shadow-md">
              <img src={img} alt={land.land_title ?? "Land"} className="h-40 w-full object-cover" />
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">{land.land_title ?? "Land parcel"}</h3>
                  <Badge variant="outline" className="shrink-0">
                    🌍
                  </Badge>
                </div>
                {land.location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {land.location}
                  </p>
                )}
                <p className="text-sm font-bold text-emerald-700">
                  ₦{Number(land.cost ?? 0).toLocaleString()}
                  {land.land_size ? ` · ${land.land_size}` : ""}
                </p>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
