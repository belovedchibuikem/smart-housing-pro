"use client"

import Link from "next/link"
import { MapPin, Ruler, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type LandDetailsTabProps = {
  land?: {
    id?: string
    land_title?: string
    land_code?: string
    status?: string
    location?: string
    land_size?: string | null
    cost?: number | null
    land_description?: string | null
    land_features?: string[] | null
    infrastructure_plan?: string[] | null
    created_at?: string | null
    interestStatus?: string | null
  } | null
}

function formatCurrency(amount?: number | null) {
  if (!amount && amount !== 0) return "—"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString()
}

export function LandDetailsTab({ land }: LandDetailsTabProps) {
  if (!land) return null

  const features = Array.isArray(land.land_features) ? land.land_features.filter(Boolean) : []
  const infra = Array.isArray(land.infrastructure_plan) ? land.infrastructure_plan.filter(Boolean) : []
  const statusLabel = land.status?.replace(/_/g, " ") ?? "Available"
  const interestStatus = land.interestStatus?.toLowerCase()
  const interestDisabled = interestStatus === "pending" || interestStatus === "approved"

  return (
    <div className="space-y-6">
      <Card className="border border-emerald-100 shadow-sm">
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{land.land_title ?? "Land parcel"}</h2>
              {land.land_code ? (
                <p className="font-mono text-sm text-muted-foreground">{land.land_code}</p>
              ) : null}
              {land.location && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {land.location}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(Number(land.cost ?? 0))}</p>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 capitalize">
                {statusLabel}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Ruler className="h-4 w-4 text-emerald-600" />
                Size
              </span>
              <span className="text-sm font-semibold">{land.land_size ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                Listed
              </span>
              <span className="text-sm font-semibold">{formatDate(land.created_at)}</span>
            </div>
          </div>

          {land.land_description && (
            <div>
              <h4 className="mb-2 text-lg font-semibold">Description</h4>
              <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{land.land_description}</p>
            </div>
          )}

          {infra.length > 0 && (
            <div>
              <h4 className="mb-3 text-lg font-semibold">Infrastructure plan</h4>
              <div className="flex flex-wrap gap-2">
                {infra.map((item) => (
                  <Badge key={item} variant="outline">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {features.length > 0 && (
            <div>
              <h4 className="mb-3 text-lg font-semibold">Land features</h4>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <Button
              asChild
              disabled={interestDisabled}
              className="h-12 w-full rounded-md bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
              variant={interestDisabled ? "secondary" : "default"}
            >
              <Link href={land.id ? `/dashboard/lands/${land.id}/subscribe` : "#"}>
                {interestDisabled ? "Interest Submitted" : "Express Interest in This Land"}
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {interestDisabled
                ? "You have already submitted an expression of interest for this land parcel."
                : "Complete the Expression of Interest form to begin your land subscription journey."}
            </p>
            {interestStatus && (
              <p className="text-center text-xs text-muted-foreground">
                Current status: <span className="font-semibold capitalize">{interestStatus}</span>
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
