"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, MapPinned } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface LandDetail {
  id: string
  land_code?: string | null
  land_title?: string | null
  land_description?: string | null
  land_size?: string | null
  cost?: number | string | null
  cost_includes_infrastructure?: boolean
  suitable_for?: string | null
  infrastructure_plan?: string[] | null
  land_features?: string[] | null
  title_documents?: string[] | null
  location?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  status?: string | null
  subscriptions_count?: number
}

export default function AdminLandDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ""
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [land, setLand] = useState<LandDetail | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{ success: boolean; data: LandDetail }>(`/admin/lands/${id}`)
        if (!cancelled && res.success && res.data) setLand(res.data)
      } catch (e: unknown) {
        if (!cancelled) {
          toast({
            title: "Error",
            description: e instanceof Error ? e.message : "Failed to load land",
            variant: "destructive",
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, toast])

  const money = (n: number | string | null | undefined) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
      Number(n || 0) || 0,
    )

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        Loading land…
      </div>
    )
  }

  if (!land) {
    return (
      <div className="p-6">
        <Link href="/admin/lands" className="text-sm text-muted-foreground hover:underline">
          ← Back to list
        </Link>
        <p className="mt-8 text-muted-foreground">Land not found.</p>
      </div>
    )
  }

  const listInline = (arr: string[] | null | undefined) =>
    Array.isArray(arr) && arr.length ? arr.join(" · ") : "—"

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Link href="/admin/lands" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All land parcels
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">🌍 Land</Badge>
            <span className="font-mono text-sm text-muted-foreground">{land.land_code}</span>
          </div>
          <h1 className="text-3xl font-bold">{land.land_title}</h1>
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <MapPinned className="h-4 w-4" />
            {land.location || [land.city, land.state].filter(Boolean).join(", ") || "—"}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm text-muted-foreground">Parcel cost</div>
          <div className="text-2xl font-bold text-primary">{money(land.cost)}</div>
          {land.cost_includes_infrastructure ? (
            <Badge className="mt-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Incl. infrastructure</Badge>
          ) : (
            <Badge variant="outline" className="mt-2 font-normal">
              Infrastructure excl.
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {land.land_description?.trim() || "No description."}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Size &amp; use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Land size" value={land.land_size || "—"} />
            <Row label="Suitable for" value={land.suitable_for || "—"} />
            <Row label="Subscriptions" value={String(land.subscriptions_count ?? "—")} />
            <Row label="Status" value={land.status || "—"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Infrastructure &amp; features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Infrastructure plan" value={listInline(land.infrastructure_plan)} wrap />
            <Row label="Land features" value={listInline(land.land_features)} wrap />
            <Row label="Title documents" value={listInline(land.title_documents)} wrap />
          </CardContent>
        </Card>
      </div>

      {land.address ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">{land.address}</CardContent>
        </Card>
      ) : null}

      <Button variant="outline" asChild>
        <Link href="/admin/bulk-upload/land-subscriptions">Bulk subscribe members</Link>
      </Button>
    </div>
  )
}

function Row({ label, value, wrap }: { label: string; value: string; wrap?: boolean }) {
  return (
    <div className={`flex gap-3 ${wrap ? "flex-col sm:flex-row sm:items-start" : "justify-between"}`}>
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`font-medium text-right sm:text-right ${wrap ? "text-left sm:max-w-[70%]" : ""}`}>{value}</span>
    </div>
  )
}
