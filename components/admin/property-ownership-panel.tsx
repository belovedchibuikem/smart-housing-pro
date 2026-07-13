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
  getAdminLandSlotOwnership,
  getAdminLandSlots,
  getAdminPropertyOwnership,
  getAdminPropertySlotOwnership,
  getAdminPropertySlots,
  type AssetSlotOwnershipDetail,
  type AssetSlotSummary,
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

function formatMoney(value?: number | null) {
  if (value == null) return "—"
  return `₦${Number(value).toLocaleString()}`
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
    case "held":
    case "sold":
      return "default" as const
    case "available":
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
      {entry.hand_label ? (
        <Badge variant="outline" className="text-[10px] font-normal">
          {entry.hand_label}
        </Badge>
      ) : null}
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

function TimelineList({ timeline }: { timeline: PropertyOwnershipTimelineEntry[] }) {
  if (timeline.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
        No ownership history recorded for this slot yet.
      </div>
    )
  }

  return (
    <div className="relative space-y-4">
      {timeline.map((entry, index) => {
        const isOwnerLike =
          entry.entry_type === "owner" || (entry as { entry_type?: string }).entry_type === "sold"
        return (
          <div key={`${entry.entry_type}-${index}`} className="relative pl-8">
            {index < timeline.length - 1 ? (
              <span className="absolute left-[11px] top-8 h-[calc(100%+8px)] w-px bg-border" />
            ) : null}
            <span
              className={`absolute left-0 top-3 h-[22px] w-[22px] rounded-full border-2 ${
                isOwnerLike && "is_current" in entry && entry.is_current
                  ? "border-primary bg-primary"
                  : entry.entry_type === "transfer"
                    ? "border-amber-500 bg-amber-100 dark:bg-amber-950"
                    : "border-muted-foreground/40 bg-background"
              }`}
            />
            {isOwnerLike ? (
              <OwnerTimelineCard entry={entry as PropertyOwnershipOwnerEntry} />
            ) : entry.entry_type === "reallocation" ? (
              <ReallocationTimelineCard entry={entry} />
            ) : (
              <TransferTimelineCard entry={entry as Extract<PropertyOwnershipTimelineEntry, { entry_type: "transfer" }>} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function PropertyOwnershipPanel({ assetType, assetId }: PropertyOwnershipPanelProps) {
  const [slots, setSlots] = useState<AssetSlotSummary[]>([])
  const [slotsMeta, setSlotsMeta] = useState<{ total?: number | null; available?: number | null }>({})
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [slotOwnership, setSlotOwnership] = useState<AssetSlotOwnershipDetail | null>(null)
  const [legacyDetail, setLegacyDetail] = useState<PropertyOwnershipDetail | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(true)
  const [loadingOwnership, setLoadingOwnership] = useState(false)

  const loadSlots = useCallback(async () => {
    try {
      setLoadingSlots(true)
      const response =
        assetType === "house"
          ? await getAdminPropertySlots(assetId)
          : await getAdminLandSlots(assetId)

      if (response.success) {
        const list = response.data.slots ?? []
        setSlots(list)
        setSlotsMeta({
          total: response.data.total_slots,
          available: response.data.slots_available,
        })
        setSelectedSlotId((prev) => {
          if (prev && list.some((slot) => slot.id === prev)) return prev
          const preferred =
            list.find((slot) => slot.status === "held" || slot.status === "sold") ?? list[0] ?? null
          return preferred?.id ?? null
        })
        if (list.length === 0) {
          // Fall back to asset-level ownership when no slots inventory exists
          try {
            const legacy =
              assetType === "house"
                ? await getAdminPropertyOwnership(assetId)
                : await getAdminLandOwnership(assetId)
            if (legacy.success) setLegacyDetail(legacy.data)
          } catch {
            setLegacyDetail(null)
          }
        } else {
          setLegacyDetail(null)
        }
      }
    } catch {
      toast.error("Failed to load slots")
      setSlots([])
      try {
        const legacy =
          assetType === "house"
            ? await getAdminPropertyOwnership(assetId)
            : await getAdminLandOwnership(assetId)
        if (legacy.success) setLegacyDetail(legacy.data)
      } catch {
        toast.error("Failed to load ownership history")
        setLegacyDetail(null)
      }
    } finally {
      setLoadingSlots(false)
    }
  }, [assetId, assetType])

  useEffect(() => {
    void loadSlots()
  }, [loadSlots])

  useEffect(() => {
    if (!selectedSlotId) {
      setSlotOwnership(null)
      return
    }

    let cancelled = false
    const loadOwnership = async () => {
      try {
        setLoadingOwnership(true)
        const response =
          assetType === "house"
            ? await getAdminPropertySlotOwnership(selectedSlotId)
            : await getAdminLandSlotOwnership(selectedSlotId)
        if (!cancelled && response.success) {
          setSlotOwnership(response.data)
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load slot ownership")
          setSlotOwnership(null)
        }
      } finally {
        if (!cancelled) setLoadingOwnership(false)
      }
    }

    void loadOwnership()
    return () => {
      cancelled = true
    }
  }, [assetType, selectedSlotId])

  const Icon = assetType === "land" ? LandPlot : Home

  if (loadingSlots) {
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

  // Legacy asset-level view when no slots
  if (slots.length === 0 && legacyDetail) {
    const { summary, timeline, current_owners } = legacyDetail
    const register = legacyDetail.allocations_register ?? legacyDetail.subscriptions_register ?? []

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              Ownership overview
            </CardTitle>
            <CardDescription>
              Complete ownership chain for this {assetType === "land" ? "land parcel" : "property"}.
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
          </CardHeader>
          <CardContent>
            <TimelineList timeline={timeline} />
          </CardContent>
        </Card>

        {register.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                {assetType === "house" ? "Allocation register" : "Subscription register"}
              </CardTitle>
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

  if (slots.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Unable to load ownership information.
        </CardContent>
      </Card>
    )
  }

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? null
  const currentOwners = (slotOwnership?.owner_periods ?? []).filter((period) => period.is_current)
  const timeline = (slotOwnership?.timeline ?? []) as PropertyOwnershipTimelineEntry[]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Slot inventory
          </CardTitle>
          <CardDescription>
            Ownership is tracked per slot. Select a slot to view its tenure timeline.
            {slotsMeta.total != null
              ? ` ${slotsMeta.available ?? 0} of ${slotsMeta.total} slots available.`
              : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current allottee</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slots.map((slot) => {
                const progress =
                  slot.payment_progress_percent != null
                    ? Math.round(Number(slot.payment_progress_percent))
                    : null
                const isSelected = slot.id === selectedSlotId
                return (
                  <TableRow
                    key={slot.id}
                    className={isSelected ? "bg-primary/5" : undefined}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    <TableCell>
                      <div className="font-medium">{slot.label}</div>
                      <div className="text-xs text-muted-foreground">#{slot.slot_number}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(slot.status)} className="capitalize">
                        {slot.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {slot.current_member ? (
                        <div>
                          <div className="font-medium">{slot.current_member.name}</div>
                          {slot.current_member.member_number ? (
                            <div className="text-xs text-muted-foreground">
                              {slot.current_member.member_number}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Vacant</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {slot.current_member ? (
                        <div className="text-sm">
                          <div className="font-medium">{progress != null ? `${progress}%` : "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            Paid {formatMoney(slot.amount_paid)} · Out {formatMoney(slot.outstanding)}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setSelectedSlotId(slot.id)}
                      >
                        {isSelected ? "Selected" : "View history"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedSlot ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                {selectedSlot.label}
                <Badge variant="outline" className="capitalize font-normal">
                  #{selectedSlot.slot_number}
                </Badge>
              </CardTitle>
              <CardDescription>
                Current tenure and payment for this slot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOwnership ? (
                <Skeleton className="h-24 w-full" />
              ) : slotOwnership?.current_tenure ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Sale price</p>
                    <p className="text-xl font-bold">
                      {formatMoney(
                        (slotOwnership.current_tenure.sale_price as number | undefined) ??
                          selectedSlot.sale_price
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Amount paid</p>
                    <p className="text-xl font-bold">
                      {formatMoney(
                        (slotOwnership.current_tenure.amount_paid as number | undefined) ??
                          selectedSlot.amount_paid
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Outstanding</p>
                    <p className="text-xl font-bold">
                      {formatMoney(
                        (slotOwnership.current_tenure.outstanding as number | undefined) ??
                          selectedSlot.outstanding
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Progress</p>
                    <p className="text-xl font-bold">
                      {Math.round(
                        Number(
                          slotOwnership.current_tenure.payment_progress_percent ??
                            selectedSlot.payment_progress_percent ??
                            0
                        )
                      )}
                      %
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">This slot is currently vacant.</p>
              )}

              {currentOwners.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {currentOwners.map((owner) => (
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
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Slot ownership timeline
              </CardTitle>
              <CardDescription>
                Chronological chain for {selectedSlot.label} only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOwnership ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <TimelineList timeline={timeline} />
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
