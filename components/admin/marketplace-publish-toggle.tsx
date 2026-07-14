"use client"

import { useEffect, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { apiFetch } from "@/lib/api/client"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import { toast } from "sonner"

type Props = {
  listingId: string
  listingKind: "house" | "land_parcel" | "land_legacy" | "land"
}

export function MarketplacePublishToggle({ listingId, listingKind }: Props) {
  const [requested, setRequested] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch<{
          success: boolean
          data: { marketplace_requested?: boolean; verification_status?: string } | null
        }>(`/admin/marketplace/status?listing_id=${listingId}&listing_kind=${listingKind}`)
        if (cancelled) return
        setRequested(Boolean(res.data?.marketplace_requested))
        setStatus(res.data?.verification_status || null)
      } catch {
        // Column/API may not be ready on older tenants
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [listingId, listingKind])

  const onToggle = async (next: boolean) => {
    setSaving(true)
    try {
      const res = await apiFetch<{
        success: boolean
        message: string
        data: { marketplace_requested?: boolean; verification_status?: string } | null
      }>("/admin/marketplace/request-publish", {
        method: "POST",
        body: {
          listing_id: listingId,
          listing_kind: listingKind,
          marketplace_requested: next,
        },
      })
      setRequested(Boolean(res.data?.marketplace_requested ?? next))
      setStatus(res.data?.verification_status || (next ? "pending" : status))
      toast.success(res.message || (next ? "Submitted for marketplace review" : "Withdrawn from marketplace"))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update marketplace status")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return null

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label htmlFor="marketplace-publish" className="font-medium">
            Publish to Smart Housing Marketplace
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Request platform verification. Listings appear publicly only after super-admin approval.
          </p>
        </div>
        <Switch
          id="marketplace-publish"
          checked={requested}
          disabled={saving}
          onCheckedChange={onToggle}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {status ? <VerificationBadge status={status} /> : <Badge variant="outline">Not submitted</Badge>}
      </div>
    </div>
  )
}
