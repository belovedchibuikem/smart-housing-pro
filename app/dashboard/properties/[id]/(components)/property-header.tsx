"use client"

import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type PropertyHeaderProps = {
  property?: {
    id: string
    title?: string
    location?: string
    status?: string
  } | null
  loading?: boolean
}

export function PropertyHeader({ property, loading }: PropertyHeaderProps) {
  const statusLabel = property?.status?.replace("_", " ")

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="icon">
          <Link href="/dashboard/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {loading ? <span className="opacity-50">Loading property…</span> : property?.title ?? "Property"}
          </h1>
          {property?.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {property.location}
            </p>
          )}
        </div>
      </div>
      {statusLabel && <Badge className="capitalize">{statusLabel}</Badge>}
    </div>
  )
}

