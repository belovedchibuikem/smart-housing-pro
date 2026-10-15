"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Calendar, CheckCircle2, Download, Loader2, MapPinned, Pencil, Search } from "lucide-react"
import { LandAnalyticsPanel } from "@/components/admin/land-analytics-panel"
import { PropertyOwnershipPanel } from "@/components/admin/property-ownership-panel"
import { SimilarLands, type SimilarLandItem } from "@/components/lands/similar-lands"
import { LandDocuments } from "@/components/properties/land-documents"
import { PropertyPriceBreakdown } from "@/components/properties/property-price-breakdown"
import { PropertyTypePriceRow } from "@/components/properties/property-type-price-row"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { resolveStorageUrl } from "@/lib/api/config"
import { formatNaira } from "@/lib/properties/pricing"

interface LandDetail {
  id: string
  land_code?: string | null
  land_title?: string | null
  land_description?: string | null
  land_size?: string | null
  cost?: number | string | null
  price_per_slot?: number | null
  total_listing_cost?: number | null
  cost_includes_infrastructure?: boolean
  suitable_for?: string | null
  infrastructure_plan?: string[] | null
  land_features?: string[] | null
  title_documents?: string[] | null
  images?: string[] | null
  location?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  status?: string | null
  subscriptions_count?: number
  total_slots?: number | null
  slots_used?: number
  slots_available?: number | null
  created_at?: string | null
  updated_at?: string | null
}

interface LandPayment {
  id: string
  amount: number
  paid_on?: string | null
  description?: string | null
  reference?: string | null
  status?: string
}

interface LandSubscriber {
  id: string
  member_id?: string | null
  member_name: string
  member_number?: string | null
  staff_id?: string | null
  email?: string | null
  allocated_land_size?: string | null
  total_cost: number
  amount_paid: number
  outstanding: number
  tenure_status?: string | null
  created_at?: string | null
  payments?: LandPayment[]
}

const TAB_VALUES = ["details", "ownership", "analytics", "subscriptions", "documents", "journey", "similar"]

export default function AdminLandDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = params?.id ?? ""
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [land, setLand] = useState<LandDetail | null>(null)
  const [subscribers, setSubscribers] = useState<LandSubscriber[]>([])
  const [similarLands, setSimilarLands] = useState<SimilarLandItem[]>([])
  const [subscriberSearch, setSubscriberSearch] = useState("")
  const [journeyId, setJourneyId] = useState("")
  const requestedTab = searchParams.get("tab") || ""
  const initialTab = TAB_VALUES.includes(requestedTab) ? requestedTab : "details"
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const res = await apiFetch<{
          success: boolean
          data: LandDetail
          subscribers?: LandSubscriber[]
          similar?: SimilarLandItem[]
        }>(`/admin/lands/${id}`)
        if (!cancelled && res.success && res.data) {
          setLand(res.data)
          setSubscribers(Array.isArray(res.subscribers) ? res.subscribers : [])
          setSimilarLands(Array.isArray(res.similar) ? res.similar : [])
        }
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

  const staffLabel = (subscriber: LandSubscriber) =>
    subscriber.member_number?.trim() || subscriber.staff_id?.trim() || "—"

  const filteredSubscribers = useMemo(() => {
    const q = subscriberSearch.trim().toLowerCase()
    if (!q) return subscribers
    return subscribers.filter((subscriber) => {
      const name = subscriber.member_name.toLowerCase()
      const staff = staffLabel(subscriber).toLowerCase()
      const email = subscriber.email?.toLowerCase() ?? ""
      return name.includes(q) || staff.includes(q) || email.includes(q)
    })
  }, [subscribers, subscriberSearch])

  const journeySubscriber = useMemo(() => {
    if (subscribers.length === 0) return null
    return subscribers.find((subscriber) => subscriber.id === journeyId) ?? subscribers[0]
  }, [subscribers, journeyId])

  const exportSubscribersCsv = () => {
    if (!land?.id || filteredSubscribers.length === 0) return
    const escapeCsv = (value: string | number) => {
      const str = String(value ?? "")
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }
    const headers = [
      "Land ID",
      "Member Name",
      "Staff ID",
      "Land Size",
      "Total Cost",
      "Amount Paid",
      "Balance",
      "Status",
      "Subscription Date",
    ]
    const rows = filteredSubscribers.map((subscriber) => [
      land.land_code || land.id,
      subscriber.member_name,
      staffLabel(subscriber),
      subscriber.allocated_land_size || "",
      String(subscriber.total_cost ?? 0),
      String(subscriber.amount_paid ?? 0),
      String(subscriber.outstanding ?? 0),
      subscriber.tenure_status ?? "",
      subscriber.created_at ? new Date(subscriber.created_at).toISOString().slice(0, 10) : "",
    ])
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `land_subscribers_${land.land_code || land.id.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.csv`
    anchor.click()
    window.URL.revokeObjectURL(url)
    toast({ title: "Export downloaded", description: `${filteredSubscribers.length} subscriber(s) exported.` })
  }

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

  const journeyPaid = Number(journeySubscriber?.amount_paid ?? 0)
  const journeyTotal = Number(journeySubscriber?.total_cost ?? 0)
  const journeyOutstanding = Number(journeySubscriber?.outstanding ?? 0)
  const journeyProgress = journeyTotal > 0 ? Math.min(100, Math.round((journeyPaid / journeyTotal) * 100)) : 0
  const journeyPayments = [...(journeySubscriber?.payments ?? [])].sort((a, b) =>
    String(b.paid_on ?? "").localeCompare(String(a.paid_on ?? "")),
  )

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <Link href="/admin/lands" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        All land parcels
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{land.land_code}</span>
            {land.status ? <Badge className="capitalize">{land.status.replace(/_/g, " ")}</Badge> : null}
          </div>
          <h1 className="text-3xl font-bold">{land.land_title}</h1>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinned className="h-4 w-4" />
            {land.location || [land.city, land.state].filter(Boolean).join(", ") || "—"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/lands/${land.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit land
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <PropertyPriceBreakdown
          source={{
            cost: land.cost,
            price_per_slot: land.price_per_slot,
            total_slots: land.total_slots,
            total_listing_cost: land.total_listing_cost,
          }}
          variant="emerald"
        />
        <PropertyTypePriceRow typeLabel="Land" priceHeading="Cost per slot" price={money(land.price_per_slot ?? land.cost)} />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTab(value)
          const qs = new URLSearchParams(searchParams.toString())
          if (value === "details") qs.delete("tab")
          else qs.set("tab", value)
          const next = qs.toString()
          router.replace(next ? `?${next}` : "?", { scroll: false })
        }}
        className="space-y-6"
      >
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="journey">Payment Journey</TabsTrigger>
          <TabsTrigger value="similar">Similar Lands</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
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
                <Row label="Subscriptions" value={String(land.subscriptions_count ?? subscribers.length)} />
                <Row label="Total slots" value={land.total_slots == null ? "Unlimited" : String(land.total_slots)} />
                <Row label="Slots used" value={String(land.slots_used ?? land.subscriptions_count ?? 0)} />
                <Row
                  label="Slots available"
                  value={land.total_slots == null ? "Unlimited" : String(land.slots_available ?? 0)}
                />
                <Row label="Status" value={land.status || "—"} />
                <Row
                  label="Date added"
                  value={land.created_at ? new Date(land.created_at).toLocaleDateString() : "—"}
                />
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

          {Array.isArray(land.images) && land.images.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Land images</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {land.images.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={resolveStorageUrl(url)}
                    alt={`Land image ${index + 1}`}
                    className="h-36 w-full rounded-md border object-cover"
                  />
                ))}
              </CardContent>
            </Card>
          ) : null}

          {land.address ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">{land.address}</CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button variant="default" asChild>
              <Link href={`/admin/land-subscriptions/new?land_id=${land.id}`}>Assign member to this land</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/bulk-upload/land-subscriptions">Bulk subscribe members</Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ownership" className="space-y-6">
          <PropertyOwnershipPanel assetType="land" assetId={land.id} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <LandAnalyticsPanel landId={land.id} />
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Land subscribers</CardTitle>
                  <CardDescription>
                    {subscribers.length} member(s) subscribed
                    {subscriberSearch.trim() ? ` · ${filteredSubscribers.length} shown` : ""}
                  </CardDescription>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search name or staff ID…"
                      value={subscriberSearch}
                      onChange={(e) => setSubscriberSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={exportSubscribersCsv} disabled={filteredSubscribers.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground">No subscriptions recorded for this land yet.</p>
              ) : filteredSubscribers.length === 0 ? (
                <p className="py-6 text-center text-muted-foreground">No subscribers match your search.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Staff ID</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Total cost</TableHead>
                      <TableHead className="text-right">Amount paid</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>
                          {subscriber.member_id ? (
                            <Link href={`/admin/members/${subscriber.member_id}`} className="font-medium hover:underline">
                              {subscriber.member_name}
                            </Link>
                          ) : (
                            <span className="font-medium">{subscriber.member_name}</span>
                          )}
                          {subscriber.email ? <div className="text-xs text-muted-foreground">{subscriber.email}</div> : null}
                        </TableCell>
                        <TableCell>{staffLabel(subscriber)}</TableCell>
                        <TableCell>{subscriber.allocated_land_size || "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatNaira(subscriber.total_cost)}</TableCell>
                        <TableCell className="text-right tabular-nums text-green-600">{formatNaira(subscriber.amount_paid)}</TableCell>
                        <TableCell className="text-right tabular-nums text-orange-600">{formatNaira(subscriber.outstanding)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {(subscriber.tenure_status || "allocation").replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscriber.created_at ? new Date(subscriber.created_at).toLocaleDateString() : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <LandDocuments landId={land.id} />
        </TabsContent>

        <TabsContent value="journey" className="space-y-6">
          {!journeySubscriber ? (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              Payment journey appears after a member is subscribed to this land.
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Payment journey</CardTitle>
                    <CardDescription>
                      {journeySubscriber.member_name} · {staffLabel(journeySubscriber)}
                    </CardDescription>
                  </div>
                  {subscribers.length > 1 ? (
                    <Select value={journeySubscriber.id} onValueChange={setJourneyId}>
                      <SelectTrigger className="w-full sm:w-72">
                        <SelectValue placeholder="Choose a subscriber" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscribers.map((subscriber) => (
                          <SelectItem key={subscriber.id} value={subscriber.id}>
                            {subscriber.member_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatNaira(journeyPaid)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-2xl font-semibold text-orange-600">{formatNaira(journeyOutstanding)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{formatNaira(journeyTotal)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{journeyProgress}%</span>
                  </div>
                  <Progress value={journeyProgress} className="h-3" />
                </div>
                {journeyPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {journeyPayments.map((payment) => (
                      <div key={payment.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                          <div>
                            <p className="font-medium">{payment.description || "Land payment"}</p>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {payment.paid_on ? new Date(payment.paid_on).toLocaleDateString() : "—"}
                              {payment.reference ? ` · ${payment.reference}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold tabular-nums">{formatNaira(payment.amount)}</p>
                          <p className="text-xs capitalize text-muted-foreground">{payment.status || "completed"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="similar" className="space-y-6">
          <SimilarLands lands={similarLands} currentLandId={land.id} linkPrefix="/admin/lands" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Row({ label, value, wrap }: { label: string; value: string; wrap?: boolean }) {
  return (
    <div className={`flex gap-3 ${wrap ? "flex-col sm:flex-row sm:items-start" : "justify-between"}`}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={`text-right font-medium ${wrap ? "text-left sm:max-w-[70%]" : ""}`}>{value}</span>
    </div>
  )
}
