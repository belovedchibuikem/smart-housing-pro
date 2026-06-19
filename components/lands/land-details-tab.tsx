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
    total_slots?: number | null
    slots_available?: number | null
    accepting_interest?: boolean
    has_pending_interest?: boolean
    approved_interest_count?: number
    can_express_interest?: boolean
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
  const hasPendingInterest = interestStatus === "pending" || land.has_pending_interest === true
  const approvedInterestCount = land.approved_interest_count ?? (interestStatus === "approved" ? 1 : 0)
  const slotsFull =
    land.slots_available === 0 ||
    (land.accepting_interest === false && land.slots_available !== null && land.slots_available !== undefined)
  const canExpressInterest =
    land.can_express_interest ?? (!hasPendingInterest && !slotsFull)
  const subscribeDisabled = !canExpressInterest

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
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 capitalize shrink-0">
                {statusLabel}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-background to-background shadow-sm sm:grid-cols-2">
            <div className="flex flex-col justify-center gap-1 border-b border-emerald-100 p-5 sm:border-b-0 sm:border-r">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Property Type</span>
              <span className="text-xl font-bold capitalize text-foreground">Land</span>
            </div>
            <div className="flex flex-col justify-center gap-1 p-5 sm:items-end sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Property Price</span>
              <span className="text-2xl font-bold text-emerald-700">{formatCurrency(Number(land.cost ?? 0))}</span>
            </div>
          </div>

          <div className="grid gap-4 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4 md:grid-cols-2">
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
              asChild={!subscribeDisabled}
              disabled={subscribeDisabled}
              className="h-12 w-full rounded-md bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
              variant={subscribeDisabled ? "secondary" : "default"}
            >
              {subscribeDisabled ? (
                <span>
                  {hasPendingInterest
                    ? "Interest Pending"
                    : slotsFull
                      ? "All Slots Taken"
                      : "Express Interest in This Land"}
                </span>
              ) : (
                <Link href={land.id ? `/dashboard/lands/${land.id}/subscribe` : "#"}>
                  {approvedInterestCount > 0 ? "Request Another Slot" : "Express Interest in This Land"}
                </Link>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {hasPendingInterest
                ? "You have a pending expression of interest. Wait for approval before requesting another slot."
                : slotsFull
                  ? "This land parcel remains visible, but every slot has been assigned."
                  : approvedInterestCount > 0
                    ? `You have ${approvedInterestCount} approved slot${approvedInterestCount === 1 ? "" : "s"}. Request another while slots remain.`
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
