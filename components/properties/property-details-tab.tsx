"use client"

import Link from "next/link"
import { MapPin, Home, Ruler, BedDouble, CalendarDays } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

type PropertyDetailsTabProps = {
  property?: {
    id?: string
    title?: string
    type?: string
    status?: string
    location?: string
    size?: number | string | null
    price?: number | null
    bedrooms?: number | null
    listedAt?: string | null
    description?: string | null
    features?: string[] | null
    interestStatus?: string | null
  } | null
}

function formatSize(size?: number | string | null) {
  if (!size && size !== 0) return "—"
  const numeric = Number(size)
  if (!Number.isFinite(numeric)) return String(size)
  return `${numeric} sqm`
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
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  })
}

export function PropertyDetailsTab({ property }: PropertyDetailsTabProps) {
  if (!property) return null

  const features = Array.isArray(property.features) ? property.features.filter(Boolean) : []
  const statusLabel = property.status?.replace(/_/g, " ") ?? "Available"
  const interestStatus = property.interestStatus?.toLowerCase()
  const interestDisabled = interestStatus === "pending" || interestStatus === "approved"

  return (
    <div className="space-y-6">
      <Card className="border border-amber-100 shadow-sm">
        <div className="space-y-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{property.title ?? "Property"}</h2>
              {property.location && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-amber-500" />
                  {property.location}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(property.price)}</p>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 capitalize">
                {statusLabel}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-amber-100 bg-amber-50/40 p-4 md:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Home className="h-4 w-4 text-amber-500" />
                Type
              </span>
              <span className="text-sm font-semibold capitalize">{property.type ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <Ruler className="h-4 w-4 text-amber-500" />
                Size
              </span>
              <span className="text-sm font-semibold">{formatSize(property.size)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <BedDouble className="h-4 w-4 text-amber-500" />
                Bedrooms
              </span>
              <span className="text-sm font-semibold">{property.bedrooms ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <CalendarDays className="h-4 w-4 text-amber-500" />
                Listed
              </span>
              <span className="text-sm font-semibold">{formatDate(property.listedAt)}</span>
            </div>
          </div>

          {property.description && (
            <div>
              <h4 className="mb-2 text-lg font-semibold text-foreground">Description</h4>
              <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{property.description}</p>
            </div>
          )}

          {features.length > 0 && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-foreground">Features & Amenities</h4>
              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
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
              className="h-12 w-full rounded-md bg-amber-500 text-sm font-semibold text-white transition hover:bg-amber-600"
              variant={interestDisabled ? "secondary" : "default"}
            >
              <Link href={property.id ? `/dashboard/properties/${property.id}/subscribe` : "#"}>
                {interestDisabled ? "Interest Submitted" : "Subscribe to This Property"}
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {interestDisabled
                ? "You have already submitted an expression of interest for this property."
                : "Fill the Expression of Interest form to begin your property subscription"}
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
