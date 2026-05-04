"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Home, MapPin, DollarSign, Users, Eye, Edit, Trash2, CheckCircle, XCircle, Loader2, Building2, MapPinned, Layers } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  apiFetch,
  getPropertySubscriptions,
  generatePropertySubscriptionCertificate,
  fetchAdminPropertyStatistics,
  recalculateAdminPropertyStatistics,
  type AdminPropertyStatistics,
} from "@/lib/api/client"
import { resolveStorageUrl } from "@/lib/api/config"
import { getUserData } from "@/lib/auth/auth-utils"
import type { AuthUser } from "@/lib/auth/types"

interface Property {
  id: string
  title?: string
  description?: string
  address?: string
  city?: string
  state?: string
  type?: string
  property_type?: string
  price?: number
  status?: string
  images?: Array<{ url: string }>
  allocations?: Array<{ member: unknown }>
}

interface LandParcel {
  id: string
  land_code?: string | null
  land_title?: string | null
  land_size?: string | null
  cost?: number | string | null
  location?: string | null
  status?: string | null
}

export default function AdminPropertiesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const flash = searchParams.get("flash")
  const searchParamsString = searchParams.toString()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [listingSegment, setListingSegment] = useState<"houses" | "land">("houses")
  const [landParcels, setLandParcels] = useState<LandParcel[]>([])
  const [propertyStats, setPropertyStats] = useState<AdminPropertyStatistics | null>(null)
  const [housePaginationTotal, setHousePaginationTotal] = useState(0)
  const [landPaginationTotal, setLandPaginationTotal] = useState(0)
  const [recalculating, setRecalculating] = useState(false)
  const [canRecalculateStats, setCanRecalculateStats] = useState(false)

  useEffect(() => {
    const u = getUserData() as AuthUser | null
    setCanRecalculateStats(Boolean(u?.permissions?.includes("property-statistics")))
  }, [])

  useEffect(() => {
    fetchAdminPropertyStatistics()
      .then((r) => {
        if (r.success && r.data) setPropertyStats(r.data)
      })
      .catch(() => setPropertyStats(null))
  }, [])

  useEffect(() => {
    fetchSubscriptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchPendingPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFilter])

  useEffect(() => {
    if (!flash) return

    if (flash === "property_created") {
      toast({
        title: "Property Created",
        description: "The property has been added successfully.",
      })
    } else if (flash === "property_updated") {
      toast({
        title: "Property Updated",
        description: "Changes to the property were saved.",
      })
    }

    const params = new URLSearchParams(searchParamsString)
    params.delete("flash")
    const queryString = params.toString()
    router.replace(queryString ? `/admin/properties?${queryString}` : "/admin/properties", { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash, searchParamsString])

  useEffect(() => {
    if (listingSegment === "houses") {
      void fetchProperties()
    } else {
      void fetchLandParcels()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, listingSegment])

  const fetchLandParcels = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      params.append("per_page", "100")
      const response = await apiFetch<{
        success: boolean
        data: LandParcel[]
        pagination?: { total?: number }
      }>(`/admin/lands?${params.toString()}`)
      if (response.success && Array.isArray(response.data)) {
        setLandParcels(response.data)
        setLandPaginationTotal(response.pagination?.total ?? response.data.length)
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch land parcels",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      const response = await apiFetch<{
        success: boolean
        data: Property[]
        pagination?: { total: number }
      }>(`/admin/properties?${params.toString()}`)
      if (response.success) {
        setProperties(response.data)
        setHousePaginationTotal(response.pagination?.total ?? response.data.length)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      // Fetch subscriptions from dedicated endpoint
      const response = await getPropertySubscriptions({ per_page: 100 })
      if (response.success && response.data) {
        const subs = response.data.map((sub) => ({
          id: sub.id,
          property_id: sub.property_id,
          member_id: sub.member_id,
          memberName: sub.member_name || '—',
          memberNo: sub.member_number || '—',
          property: sub.property_title || sub.property_address || '—',
          totalPrice: sub.total_price || sub.property_price || 0,
          amountPaid: sub.amount_paid || 0,
          balance: sub.balance || 0,
          paymentMethod: sub.payment_method || 'Not specified',
          status: sub.status || 'In Progress',
          allocation: { 
            id: sub.allocation_id,
            property_id: sub.property_id, 
            member_id: sub.member_id 
          },
          hasCertificate: sub.has_certificate || false,
        }))
        setSubscriptions(subs)
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
      toast({
        title: "Error",
        description: "Failed to fetch subscriptions",
        variant: "destructive",
      })
    }
  }

  const fetchPendingPayments = async () => {
    try {
      // This would typically come from a payment verification endpoint
      // For now, we'll use wallet transactions or create an endpoint
      const response = await apiFetch<{ success?: boolean; transactions?: { data: any[] }; data?: any[] }>("/admin/wallets/transactions?type=deposit&status=pending")
      const transactionsData = response.success ? (response.data || []) : (response.transactions?.data || [])
      const payments = transactionsData.map((tx: any, index: number) => ({
        id: tx.id || `PAY${String(index + 1).padStart(3, '0')}`,
        memberName: tx.member?.name || 'Unknown',
        memberNo: tx.member?.member_id || '—',
        property: 'Property Payment',
        amount: tx.amount || 0,
        paymentMethod: tx.method || 'Bank Transfer',
        date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        evidence: tx.reference || 'N/A',
        status: tx.status === 'completed' ? 'Verified' : tx.status === 'failed' ? 'Rejected' : 'Pending',
        transaction: tx,
      }))
      setPendingPayments(payments)
    } catch (error) {
      console.error('Failed to fetch pending payments:', error)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return
    
    try {
      await apiFetch(`/admin/properties/${id}`, { method: "DELETE" })
      toast({
        title: "Success",
        description: "Property deleted successfully",
      })
      fetchProperties()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  const handleViewProperty = (id: string) => {
    router.push(`/admin/properties/${id}`)
  }

  const handleEditProperty = (id: string) => {
    router.push(`/admin/properties/${id}/edit`)
  }

  const handleViewSubscriptionDetails = (subscription: any) => {
    // Use the allocation_id from the subscription data
    const propertyId = subscription.property_id || subscription.allocation?.property_id
    const allocationId = subscription.allocation?.id || subscription.id
    if (propertyId && allocationId) {
      router.push(`/admin/properties/${propertyId}/subscriptions/${allocationId}`)
    } else {
      toast({
        title: "Error",
        description: "Unable to navigate to subscription details",
        variant: "destructive",
      })
    }
  }

  const handleViewSubscriptionPayments = (subscription: any) => {
    router.push(`/admin/wallets/transactions?member=${subscription.allocation?.member_id}`)
  }

  const handleIssueCertificate = async (subscription: any) => {
    try {
      const response = await generatePropertySubscriptionCertificate(subscription.id)
      
      if (response.success && response.certificate) {
        toast({
          title: "Certificate Generated",
          description: `Certificate ${response.certificate.certificate_number} has been generated successfully.`,
        })
        // Optionally download or show certificate
      } else {
        throw new Error(response.message || 'Failed to generate certificate')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      })
    }
  }

  const handleVerifyPayment = async (payment: { id: string }, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await apiFetch(`/admin/wallets/withdrawals/${payment.id}/approve`, { method: "POST" })
      } else {
        await apiFetch(`/admin/wallets/withdrawals/${payment.id}/reject`, { method: "POST" })
      }
      toast({
        title: "Success",
        description: `Payment ${action === "approve" ? "approved" : "rejected"} successfully`,
      })
      fetchPendingPayments()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} payment`,
        variant: "destructive",
      })
    }
  }

  const handleRecalculateStats = async () => {
    if (!canRecalculateStats) return
    try {
      setRecalculating(true)
      const res = await recalculateAdminPropertyStatistics()
      if (res.success && res.data) setPropertyStats(res.data)
      toast({ title: "Statistics updated", description: res.message ?? "Totals refreshed from database." })
    } catch {
      toast({ title: "Error", variant: "destructive", description: "Could not recalculate." })
    } finally {
      setRecalculating(false)
    }
  }

  const subscriptionStats = {
    activeSubscriptions: subscriptions.filter((s) => s.status === "In Progress").length,
    completed: subscriptions.filter((s) => s.status === "Completed").length,
  }

  const formatCurrencyApprox = (n: number | undefined) => {
    if (n === undefined || n === null || !Number.isFinite(n)) return "₦0"
    if (Math.abs(n) >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
    return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(n)
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property management</h1>
          <p className="text-muted-foreground mt-1">
            Houses/buildings vs land parcels — upload entry points split by type
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canRecalculateStats ? (
            <Button variant="outline" disabled={recalculating} onClick={handleRecalculateStats}>
              {recalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing…
                </>
              ) : (
                "Recalculate totals"
              )}
            </Button>
          ) : null}
          <Button variant="outline" asChild>
            <Link href="/admin/bulk-upload/properties">Bulk houses</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/bulk-upload/lands">Bulk land</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/lands/new">Upload land</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Upload house/building
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats — separated house vs land totals (authoritative snapshots from `/admin/property-statistics`) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Total houses</div>
                <div className="text-2xl font-bold">{propertyStats?.total_houses ?? housePaginationTotal}</div>
                <div className="text-xs text-muted-foreground mt-1">Listed (house module)</div>
              </div>
              <Building2 className="h-8 w-8 shrink-0 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Total units</div>
                <div className="text-2xl font-bold">{propertyStats?.total_house_units ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Across house/building uploads</div>
              </div>
              <Home className="h-8 w-8 shrink-0 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Land parcels</div>
                <div className="text-2xl font-bold">{propertyStats?.total_land_parcels ?? landPaginationTotal}</div>
                <div className="text-xs text-muted-foreground mt-1">Dedicated land catalog</div>
              </div>
              <MapPinned className="h-8 w-8 shrink-0 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Combined listings</div>
                <div className="text-2xl font-bold">{propertyStats?.combined_listing_count ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Houses + land + legacy rows</div>
              </div>
              <Layers className="h-8 w-8 shrink-0 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-muted-foreground">Portfolio costs</div>
                <div className="text-lg font-bold whitespace-nowrap md:whitespace-normal">
                  Houses {formatCurrencyApprox(propertyStats?.total_house_cost)} · Land{" "}
                  {formatCurrencyApprox(propertyStats?.total_land_cost)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">DB sums (exc. legacy land rows counted separately)</div>
              </div>
              <DollarSign className="h-8 w-8 shrink-0 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Active subscriptions</div>
                <div className="text-2xl font-bold">{subscriptionStats.activeSubscriptions}</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold">{subscriptionStats.completed}</div>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Legacy land as property rows</div>
                <div className="text-2xl font-bold">{propertyStats?.legacy_land_as_property_count ?? 0}</div>
              </div>
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={listingSegment === "houses" ? "default" : "outline"}
                      className={listingSegment === "houses" ? "" : "bg-transparent"}
                      onClick={() => setListingSegment("houses")}
                    >
                      🏡 Houses / Buildings
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={listingSegment === "land" ? "default" : "outline"}
                      className={listingSegment === "land" ? "" : "bg-transparent"}
                      onClick={() => setListingSegment("land")}
                    >
                      🌍 Land parcels
                    </Button>
                  </div>
                  <CardTitle>
                    {listingSegment === "houses" ? "House & building listings" : "Land parcels (module)"}
                  </CardTitle>
                  <CardDescription>
                    {listingSegment === "houses"
                      ? "New uploads exclude land-type rows — use the Land tab or Land menu for parcels."
                      : "Managed under Land — IDs are stable for subscriptions and payments."}
                  </CardDescription>
                </div>
                <div className="relative w-full min-w-[200px] max-w-xs lg:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder={listingSegment === "houses" ? "Search houses…" : "Search land…"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground">
                    Loading {listingSegment === "houses" ? "houses…" : "land parcels…"}
                  </p>
                </div>
              ) : listingSegment === "houses" ? (
                properties.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">No house listings found.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                      <Card key={property.id} className="overflow-hidden">
                        <img
                          src={
                            property.images?.[0]?.url
                              ? resolveStorageUrl(property.images[0].url) || "/placeholder.svg"
                              : "/placeholder.svg"
                          }
                          alt={property.title || "Property"}
                          className="h-48 w-full object-cover"
                        />
                        <CardContent className="space-y-3 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-normal">
                              🏡 House / Building
                            </Badge>
                            {property.type ? (
                              <span className="text-xs capitalize text-muted-foreground">{property.type}</span>
                            ) : null}
                          </div>
                          <div>
                            <div className="font-semibold">{property.title || "Untitled property"}</div>
                            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {property.address || property.city || property.state || "No location"}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-lg font-bold text-primary">
                              ₦{((property.price || 0) / 1000000).toFixed(1)}M
                            </div>
                            <Badge variant={property.status === "available" ? "default" : "secondary"}>
                              {property.status || "N/A"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{property.allocations?.length ?? 0} subscriber(s)</div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={() => handleViewProperty(property.id)}
                            >
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 bg-transparent"
                              onClick={() => handleEditProperty(property.id)}
                            >
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteProperty(property.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
              ) : landParcels.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No land parcels yet.{" "}
                  <Link href="/admin/lands/new" className="underline">
                    Upload land
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {landParcels.map((land) => (
                    <Card key={land.id} className="overflow-hidden">
                      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3">
                        <Badge variant="secondary" className="font-normal">
                          🌍 Land
                        </Badge>
                        <span className="ml-auto font-mono text-xs text-muted-foreground">{land.land_code || "—"}</span>
                      </div>
                      <CardContent className="space-y-3 p-4">
                        <div className="font-semibold leading-snug">{land.land_title || "Untitled"}</div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {land.location || "—"}
                        </div>
                        {land.land_size ? (
                          <Badge variant="outline" className="font-normal">
                            {land.land_size}
                          </Badge>
                        ) : null}
                        <div className="text-lg font-bold text-primary">
                          ₦{((Number(land.cost || 0) || 0) / 1000000).toFixed(1)}M
                        </div>
                        <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                          <Link href={`/admin/lands/${land.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Subscriptions</CardTitle>
              <CardDescription>View and manage all property subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{sub.memberName}</div>
                        <div className="text-sm text-muted-foreground">{sub.memberNo}</div>
                      </div>
                      <Badge variant={sub.status === "Completed" ? "default" : "secondary"}>{sub.status}</Badge>
                    </div>
                    <div className="text-sm font-medium">{sub.property}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Price</div>
                        <div className="font-semibold">₦{sub.totalPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Amount Paid</div>
                        <div className="font-semibold text-green-600">₦{sub.amountPaid.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Balance</div>
                        <div className="font-semibold text-orange-600">₦{sub.balance.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Payment Method: {sub.paymentMethod}</div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSubscriptionDetails(sub)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSubscriptionPayments(sub)}
                      >
                        View Payments
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleIssueCertificate(sub)}
                        disabled={sub.status !== "Completed"}
                      >
                        Issue Certificate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Verification</CardTitle>
                  <CardDescription>Review and verify property payments</CardDescription>
                </div>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments
                      .filter((payment) => paymentFilter === "all" || payment.status.toLowerCase() === paymentFilter)
                      .map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.memberName}</div>
                              <div className="text-sm text-muted-foreground">{payment.memberNo}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">{payment.property}</TableCell>
                          <TableCell className="text-right font-semibold">₦{payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>
                            <Button variant="link" size="sm" className="p-0 h-auto">
                              View Evidence
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "Verified"
                                  ? "default"
                                  : payment.status === "Pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.status === "Pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent"
                                  onClick={() => handleVerifyPayment(payment, "approve")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent"
                                  onClick={() => handleVerifyPayment(payment, "reject")}
                                >
                                  <XCircle className="h-4 w-4 mr-1 text-red-600" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
