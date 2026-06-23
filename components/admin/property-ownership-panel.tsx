"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRightLeft,
  Calendar,
  Clock,
  History,
  Home,
  LandPlot,
  Mail,
  Phone,
  User,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import {
  getAdminLandOwnership,
  getAdminPropertyOwnership,
  type PropertyOwnershipDetail,
  type PropertyOwnershipOwnerEntry,
  type PropertyOwnershipTimelineEntry,
} from "@/lib/api/client"

interface PropertyOwnershipPanelProps {
  assetType: "house" | "land"
  assetId: string
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

function formatTenure(days?: number | null, isCurrent?: boolean) {
  if (days == null) return isCurrent ? "Ongoing" : "—"
  if (days === 0) return isCurrent ? "Less than 1 day (ongoing)" : "Less than 1 day"
  if (isCurrent) return `${days.toLocaleString()} day(s) (ongoing)`
  return `${days.toLocaleString()} day(s)`
}

function statusVariant(status?: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
    case "approved":
    case "subscribed":
    case "active":
      return "default" as const
    case "pending":
      return "secondary" as const
    case "rejected":
    case "deallocated":
    case "cancelled":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

function HandBadge({ entry }: { entry: PropertyOwnershipOwnerEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {entry.is_original ? (
        <Badge className="text-[10px]">Original owner</Badge>
      ) : null}
      <Badge variant="outline" className="text-[10px] font-normal">
        {entry.hand_label}
      </Badge>
      {entry.is_current ? (
        <Badge variant="default" className="text-[10px]">
          Current
        </Badge>
      ) : null}
    </div>
  )
}

function OwnerTimelineCard({ entry }: { entry: PropertyOwnershipOwnerEntry }) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        entry.is_current ? "border-primary/40 bg-primary/5" : "bg-card"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground">{entry.label}</span>
            <HandBadge entry={entry} />
          </div>
          <p className="text-lg font-semibold">{entry.owner_name}</p>
          <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
            {entry.member_number ? <span>Member No: {entry.member_number}</span> : null}
            {entry.staff_id ? <span>Staff ID: {entry.staff_id}</span> : null}
            {entry.ippis_number ? <span>IPPIS: {entry.ippis_number}</span> : null}
            {entry.email ? (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {entry.email}
              </span>
            ) : null}
            {entry.phone ? (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {entry.phone}
              </span>
            ) : null}
          </div>
        </div>
        {entry.member_id ? (
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href={`/admin/members/${entry.member_id}`}>View member</Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Started</p>
          <p className="font-medium flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(entry.started_date)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Ended</p>
          <p className="font-medium">{entry.is_current ? "Present (current)" : formatDate(entry.ended_date)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tenure</p>
          <p className="font-medium flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatTenure(entry.tenure_days, entry.is_current)}
          </p>
        </div>
        {entry.allocation_status ? (
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge variant={statusVariant(entry.allocation_status)} className="capitalize mt-0.5">
              {entry.allocation_status.replace(/_/g, " ")}
            </Badge>
          </div>
        ) : null}
      </div>

      {(entry.unit_address || entry.slots_assigned != null || entry.allocated_land_size || entry.notes) && (
        <div className="mt-4 grid gap-2 rounded-md bg-muted/40 p-3 text-sm">
          {entry.unit_address ? (
            <p>
              <span className="text-muted-foreground">Unit address: </span>
              <span className="font-medium">{entry.unit_address}</span>
            </p>
          ) : null}
          {entry.slots_assigned != null ? (
            <p>
              <span className="text-muted-foreground">Slots assigned: </span>
              <span className="font-medium">{entry.slots_assigned}</span>
            </p>
          ) : null}
          {entry.allocated_land_size ? (
            <p>
              <span className="text-muted-foreground">Allocated size: </span>
              <span className="font-medium">{entry.allocated_land_size}</span>
            </p>
          ) : null}
          {entry.notes ? (
            <p>
              <span className="text-muted-foreground">Notes: </span>
              <span>{entry.notes}</span>
            </p>
          ) : null}
          {entry.rejection_reason ? (
            <p className="text-destructive">
              <span className="font-medium">Rejection reason: </span>
              {entry.rejection_reason}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}

function ReallocationTimelineCard({ entry }: { entry: Extract<PropertyOwnershipTimelineEntry, { entry_type: "reallocation" }> }) {
  return (
    <div className="rounded-lg border border-dashed border-blue-300/60 bg-blue-50/50 p-4 dark:bg-blue-950/20">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <ArrowRightLeft className="h-4 w-4 text-blue-700 dark:text-blue-400" />
        <span className="font-semibold">Admin reallocation</span>
        <Badge variant="outline" className="text-[10px]">
          Allottee change
        </Badge>
      </div>
      <p className="text-sm">
        <span className="font-medium">{entry.from_owner_name ?? "Previous allottee"}</span>
        <span className="mx-2 text-muted-foreground">→</span>
        <span className="font-medium">{entry.to_owner_name ?? "New allottee"}</span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">Date: {formatDate(entry.effective_date)}</p>
    </div>
  )
}

function TransferTimelineCard({ entry }: { entry: Extract<PropertyOwnershipTimelineEntry, { entry_type: "transfer" }> }) {
  return (
    <div className="rounded-lg border border-dashed border-amber-300/60 bg-amber-50/50 p-4 dark:bg-amber-950/20">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <ArrowRightLeft className="h-4 w-4 text-amber-700 dark:text-amber-400" />
        <span className="font-semibold">Ownership transfer</span>
        {entry.transfer_type ? (
          <Badge variant="outline" className="capitalize text-[10px]">
            {entry.transfer_type}
          </Badge>
        ) : null}
        <Badge variant={statusVariant(entry.status)} className="capitalize text-[10px]">
          {entry.status ?? "recorded"}
        </Badge>
      </div>
      <p className="text-sm">
        <span className="font-medium">{entry.from_owner_name ?? "Previous owner"}</span>
        <span className="mx-2 text-muted-foreground">→</span>
        <span className="font-medium">{entry.to_owner_name ?? "New owner"}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Date: {formatDate(entry.effective_date)}</span>
        {entry.from_member_number ? <span>From member No: {entry.from_member_number}</span> : null}
        {entry.to_contact ? <span>Contact: {entry.to_contact}</span> : null}
        {entry.to_email ? <span>Email: {entry.to_email}</span> : null}
      </div>
      {entry.reason ? <p className="mt-2 text-sm text-muted-foreground">Reason: {entry.reason}</p> : null}
    </div>
  )
}

export function PropertyOwnershipPanel({ assetType, assetId }: PropertyOwnershipPanelProps) {
  const [detail, setDetail] = useState<PropertyOwnershipDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const response =
        assetType === "house"
          ? await getAdminPropertyOwnership(assetId)
          : await getAdminLandOwnership(assetId)

      if (response.success) {
        setDetail(response.data)
      }
    } catch {
      toast.error("Failed to load ownership history")
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }, [assetId, assetType])

  useEffect(() => {
    void load()
  }, [load])

  const Icon = assetType === "land" ? LandPlot : Home

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!detail) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Unable to load ownership information.
        </CardContent>
      </Card>
    )
  }

  const { summary, timeline, current_owners } = detail
  const register = detail.allocations_register ?? detail.subscriptions_register ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Ownership overview
          </CardTitle>
          <CardDescription>
            Complete ownership chain for this {assetType === "land" ? "land parcel" : "property"} — all past and
            present allottees, transfers, and tenure periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Total owner periods</p>
              <p className="text-2xl font-bold">{summary.total_owner_periods}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Ownership changes</p>
              <p className="text-2xl font-bold">{summary.ownership_changes}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Recorded transfers</p>
              <p className="text-2xl font-bold">{summary.total_transfers}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Current owner(s)</p>
              <p className="text-2xl font-bold">{summary.current_owner_count}</p>
            </div>
          </div>

          {summary.original_owner ? (
            <div className="mt-4 rounded-lg border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Original allottee</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge>Original owner (1st-hand)</Badge>
                <span className="font-semibold">{summary.original_owner.owner_name}</span>
                {summary.original_owner.member_number ? (
                  <span className="text-sm text-muted-foreground">
                    ({summary.original_owner.member_number})
                  </span>
                ) : null}
                <span className="text-sm text-muted-foreground">
                  · First allocated {formatDate(summary.first_allocation_date)}
                </span>
                {summary.original_owner.member_id ? (
                  <Button variant="link" size="sm" className="h-auto p-0" asChild>
                    <Link href={`/admin/members/${summary.original_owner.member_id}`}>View profile</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {current_owners.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Current owner{current_owners.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {current_owners.map((owner) => (
              <div
                key={owner.allocation_id ?? owner.subscription_id ?? owner.member_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
              >
                <div>
                  <HandBadge entry={owner} />
                  <p className="mt-1 font-semibold">{owner.owner_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Since {formatDate(owner.started_date)}
                    {owner.member_number ? ` · ${owner.member_number}` : ""}
                  </p>
                </div>
                {owner.member_id ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/members/${owner.member_id}`}>Member record</Link>
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Ownership timeline
          </CardTitle>
          <CardDescription>
            Chronological chain from first allottee to present. Transfer events are shown between owner periods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
              No ownership history recorded for this asset yet.
            </div>
          ) : (
            <div className="relative space-y-4">
              {timeline.map((entry, index) => (
                <div key={`${entry.entry_type}-${index}`} className="relative pl-8">
                  {index < timeline.length - 1 ? (
                    <span className="absolute left-[11px] top-8 h-[calc(100%+8px)] w-px bg-border" />
                  ) : null}
                  <span
                    className={`absolute left-0 top-3 h-[22px] w-[22px] rounded-full border-2 ${
                      entry.entry_type === "owner" && entry.is_current
                        ? "border-primary bg-primary"
                        : entry.entry_type === "transfer"
                          ? "border-amber-500 bg-amber-100 dark:bg-amber-950"
                          : "border-muted-foreground/40 bg-background"
                    }`}
                  />
                  {entry.entry_type === "owner" ? (
                    <OwnerTimelineCard entry={entry} />
                  ) : entry.entry_type === "reallocation" ? (
                    <ReallocationTimelineCard entry={entry} />
                  ) : (
                    <TransferTimelineCard entry={entry} />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {register.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              {assetType === "house" ? "Allocation register" : "Subscription register"}
            </CardTitle>
            <CardDescription>All recorded {assetType === "house" ? "allocation" : "subscription"} rows in the system.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  {assetType === "house" ? <TableHead>Unit address</TableHead> : <TableHead>Size</TableHead>}
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {register.map((row) => {
                  const memberId = typeof row.member_id === "string" ? row.member_id : null
                  const date =
                    (typeof row.allocation_date === "string" ? row.allocation_date : null) ??
                    (typeof row.subscribed_at === "string" ? row.subscribed_at : null)
                  return (
                    <TableRow key={String(row.id)}>
                      <TableCell className="font-medium">{String(row.owner_name ?? "—")}</TableCell>
                      <TableCell>{String(row.member_number ?? "—")}</TableCell>
                      <TableCell>{formatDate(date)}</TableCell>
                      <TableCell>
                        {row.status ? (
                          <Badge variant={statusVariant(String(row.status))} className="capitalize">
                            {String(row.status).replace(/_/g, " ")}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {assetType === "house"
                          ? String(row.unit_address ?? "—")
                          : String(row.allocated_land_size ?? "—")}
                      </TableCell>
                      <TableCell className="text-right">
                        {memberId ? (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/members/${memberId}`}>View</Link>
                          </Button>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
