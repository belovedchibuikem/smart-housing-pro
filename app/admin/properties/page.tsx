"use client"

import { useState, useEffect, type ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Home,
  MapPin,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  MapPinned,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Upload,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import {
  apiFetch,
  getPropertySubscriptions,
  generatePropertySubscriptionCertificate,
  fetchAdminPropertyStatistics,
  recalculateAdminPropertyStatistics,
  getPropertyLocationFilterOptions,
  type AdminPropertyStatistics,
} from "@/lib/api/client"
import { openSubscriptionCertificate } from "@/lib/properties/subscription-certificate"
import { resolveStorageUrl } from "@/lib/api/config"
import { Can, useTenantPermissions } from "@/components/admin/can-permission"
import { PropertyLocationFilters } from "@/components/admin/property-location-filters"
import { LocationOverviewPanel } from "@/components/admin/location-overview-panel"
import {
  appendLocationFilters,
  locationFiltersFromSearchParams,
  type LocationFilterOptions,
  type PropertyLocationFilterValues,
} from "@/lib/properties/location-filters"
import { CopyableId } from "@/components/admin/copyable-id"
import { getPropertyTypeLabel } from "@/lib/properties/property-type-label"
import { formatNaira, perSlotAmount, totalListingCost } from "@/lib/properties/pricing"
import { formatCompactNaira, formatHouseLandCompact } from "@/lib/utils/currency"

interface Property {
  id: string
  title?: string
  description?: string
  address?: string
  location?: string
  city?: string
  state?: string
  type?: string
  property_type?: string
  type_label?: string | null
  price?: number
  status?: string
  subscribers_count?: number
  slots_used?: number | null
  total_slots?: number | null
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
  images?: string[] | null
  documents_count?: number
  total_slots?: number | null
  slots_available?: number | null
}

export default function AdminPropertiesPage() {
  const { can } = useTenantPermissions()
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
  const [subscriptionSearchQuery, setSubscriptionSearchQuery] = useState("")
  const [issuingCertificateId, setIssuingCertificateId] = useState<string | null>(null)
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [listingSegment, setListingSegment] = useState<"houses" | "land">(
    searchParams.get("segment") === "land" ? "land" : "houses"
  )
  const [locationFilters, setLocationFilters] = useState<PropertyLocationFilterValues>(() =>
    locationFiltersFromSearchParams(searchParams)
  )
  const [filterOptions, setFilterOptions] = useState<LocationFilterOptions | null>(null)
  const [landParcels, setLandParcels] = useState<LandParcel[]>([])
  const [propertyStats, setPropertyStats] = useState<AdminPropertyStatistics | null>(null)
  const [housePaginationTotal, setHousePaginationTotal] = useState(0)
  const [landPaginationTotal, setLandPaginationTotal] = useState(0)
  const [recalculating, setRecalculating] = useState(false)
  const [showEstateOverview, setShowEstateOverview] = useState(false)
  const [workspaceTab, setWorkspaceTab] = useState("properties")
  const canRecalculateStats = can("manage_property_estates|create_properties|edit_properties")

  useEffect(() => {
    fetchAdminPropertyStatistics()
      .then((r) => {
        if (r.success && r.data) setPropertyStats(r.data)
      })
      .catch(() => setPropertyStats(null))
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
    getPropertyLocationFilterOptions()
      .then((r) => {
        if (r.success && r.data) setFilterOptions(r.data)
      })
      .catch(() => setFilterOptions(null))
  }, [])

  useEffect(() => {
    setLocationFilters(locationFiltersFromSearchParams(searchParams))
    if (searchParams.get("segment") === "land") {
      setListingSegment("land")
    } else if (searchParams.get("segment") === "houses") {
      setListingSegment("houses")
    }
  }, [searchParamsString])

  const syncLocationFiltersToUrl = (filters: PropertyLocationFilterValues, segment = listingSegment) => {
    const params = new URLSearchParams()
    appendLocationFilters(params, filters)
    if (segment === "land") params.set("segment", "land")
    const qs = params.toString()
    router.replace(qs ? `/admin/properties?${qs}` : "/admin/properties", { scroll: false })
  }

  const handleLocationFiltersChange = (filters: PropertyLocationFilterValues) => {
    setLocationFilters(filters)
    syncLocationFiltersToUrl(filters)
  }

  useEffect(() => {
    if (listingSegment === "houses") {
      void fetchProperties()
    } else {
      void fetchLandParcels()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, listingSegment, locationFilters])

  useEffect(() => {
    void fetchSubscriptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationFilters, subscriptionSearchQuery])

  const fetchLandParcels = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      appendLocationFilters(params, locationFilters)
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
      appendLocationFilters(params, locationFilters)
      params.append('per_page', '100')
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
      setLoadingSubscriptions(true)
      const response = await getPropertySubscriptions({
        per_page: 100,
        search: subscriptionSearchQuery.trim() || undefined,
        location: locationFilters.location || undefined,
        city: locationFilters.city || undefined,
        state: locationFilters.state || undefined,
        estate_id: locationFilters.estateId || undefined,
      })
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
    } finally {
      setLoadingSubscriptions(false)
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

  const handleDeleteLand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this land parcel?")) return

    try {
      await apiFetch(`/admin/lands/${id}`, { method: "DELETE" })
      toast({
        title: "Success",
        description: "Land parcel deleted successfully",
      })
      fetchLandParcels()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete land parcel",
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
    const propertyId = subscription.property_id || subscription.allocation?.property_id
    const allocationId = subscription.allocation?.id || subscription.id
    if (propertyId && allocationId) {
      router.push(`/admin/properties/${propertyId}/subscriptions/${allocationId}?tab=payments`)
      return
    }
    toast({
      title: "Unable to open payments",
      description: "Could not find the subscription payment history for this member.",
      variant: "destructive",
    })
  }

  const handleIssueCertificate = async (subscription: any) => {
    const allocationId = subscription.allocation?.id || subscription.id
    if (!allocationId) {
      toast({
        title: "Cannot issue certificate",
        description: "Unable to identify this subscription allocation.",
        variant: "destructive",
      })
      return
    }

    try {
      setIssuingCertificateId(allocationId)
      const response = await generatePropertySubscriptionCertificate(allocationId)

      if (response.success && response.certificate) {
        openSubscriptionCertificate(response.certificate)
        toast({
          title: "Certificate ready",
          description: `Certificate ${response.certificate.certificate_number} opened for print or save as PDF.`,
        })
      } else {
        throw new Error(response.message || "Failed to generate certificate")
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Failed to generate certificate"
      toast({
        title: "Cannot issue certificate",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIssuingCertificateId(null)
    }
  }

  const canIssueCertificate = (sub: { status?: string; balance?: number; hasCertificate?: boolean }) =>
    (sub.status === "Completed" && (sub.balance ?? 0) <= 0.01) ||
    (sub.balance ?? 0) <= 0 ||
    sub.hasCertificate === true

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


  return (
    <div className="space-y-5 pb-8">
      {/* ── Command header ─────────────────────────────────────────── */}
      <header className="flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Daily operations
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Property management</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Listings, subscriptions, and payment checks — houses/buildings and land in one workspace.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canRecalculateStats ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={recalculating}
              onClick={handleRecalculateStats}
              className="text-muted-foreground"
            >
              {recalculating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync totals
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                More uploads
                <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Bulk & land</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Can permission="bulk_upload_properties|create_properties">
                <DropdownMenuItem asChild>
                  <Link href="/admin/bulk-upload/properties">Bulk houses</Link>
                </DropdownMenuItem>
              </Can>
              <Can permission="bulk_upload_properties|create_properties">
                <DropdownMenuItem asChild>
                  <Link href="/admin/bulk-upload/lands">Bulk land</Link>
                </DropdownMenuItem>
              </Can>
              <Can permission="create_properties">
                <DropdownMenuItem asChild>
                  <Link href="/admin/lands/new">Upload land parcel</Link>
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>

          <Can permission="create_properties">
            <Button asChild>
              <Link href="/admin/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Upload house/building
              </Link>
            </Button>
          </Can>
        </div>
      </header>

      {/* ── Portfolio + ops KPI strip (all metrics kept, denser) ───── */}
      <section aria-label="Portfolio overview" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-y border-b sm:grid-cols-3 xl:grid-cols-5 xl:divide-y-0">
          <KpiCell
            label="Total houses"
            value={String(propertyStats?.total_houses ?? housePaginationTotal)}
            hint="Listed (house module)"
            icon={Building2}
            iconClass="text-indigo-500"
          />
          <KpiCell
            label="Total units"
            value={String(propertyStats?.total_house_units ?? 0)}
            hint="Across house/building uploads"
            icon={Home}
          />
          <KpiCell
            label="Land parcels"
            value={String(propertyStats?.total_land_parcels ?? landPaginationTotal)}
            hint="Dedicated land catalog"
            icon={MapPinned}
            iconClass="text-emerald-600"
          />
          <KpiCell
            label="Combined listings"
            value={String(propertyStats?.combined_listing_count ?? 0)}
            hint="Houses + land + legacy rows"
            icon={Layers}
          />
          <KpiCell
            label="Portfolio costs"
            value={formatHouseLandCompact(
              propertyStats?.total_house_cost,
              propertyStats?.total_land_cost,
            )}
            hint="DB sums (excl. legacy land rows)"
            icon={DollarSign}
            compactValue
          />
        </div>
        <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <KpiCell
            label="Active subscriptions"
            value={String(subscriptionStats.activeSubscriptions)}
            hint="In-progress payments"
            icon={Users}
            quiet
          />
          <KpiCell
            label="Completed"
            value={String(subscriptionStats.completed)}
            hint="Fully paid subscriptions"
            icon={CheckCircle}
            quiet
          />
          <KpiCell
            label="Legacy land as property rows"
            value={String(propertyStats?.legacy_land_as_property_count ?? 0)}
            hint="Pre-module land in properties table"
            icon={MapPin}
            quiet
          />
        </div>
      </section>

      {/* ── Primary workspace (daily work first) ───────────────────── */}
      <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="space-y-4">
        <div className="sticky top-0 z-20 -mx-1 rounded-xl border bg-background/95 px-1 py-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-muted/50 p-1">
            <TabsTrigger value="properties" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              <Building2 className="hidden h-3.5 w-3.5 sm:block" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              <Users className="hidden h-3.5 w-3.5 sm:block" />
              Subscriptions
              {subscriptions.length > 0 ? (
                <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1.5 text-[10px]">
                  {subscriptions.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              <DollarSign className="hidden h-3.5 w-3.5 sm:block" />
              Payment verification
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="properties" className="mt-0 space-y-4 focus-visible:outline-none">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex w-fit rounded-lg border bg-background p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => {
                    setListingSegment("houses")
                    syncLocationFiltersToUrl(locationFilters, "houses")
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    listingSegment === "houses"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Home className="h-3.5 w-3.5" />
                  Houses / Buildings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setListingSegment("land")
                    syncLocationFiltersToUrl(locationFilters, "land")
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    listingSegment === "land"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <MapPinned className="h-3.5 w-3.5" />
                  Land parcels
                </button>
              </div>

              <div className="relative w-full min-w-[200px] max-w-sm lg:ml-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={listingSegment === "houses" ? "Search houses…" : "Search land…"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 bg-background pl-9"
                />
              </div>
            </div>

            <div className="space-y-1 border-b px-4 py-3 sm:px-5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">
                    {listingSegment === "houses" ? "House & building listings" : "Land parcels (module)"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {listingSegment === "houses"
                      ? "Copy Property ID from each card for subscriber CSV import."
                      : "Copy Land ID from each card for subscription CSV import."}
                  </p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {listingSegment === "houses"
                    ? `${properties.length} shown`
                    : `${landParcels.length} shown`}
                </span>
              </div>
              <PropertyLocationFilters
                filters={locationFilters}
                options={filterOptions}
                loading={loading}
                onChange={handleLocationFiltersChange}
              />
            </div>

            <div className="p-4 sm:p-5">
              {loading ? (
                <div className="py-16 text-center">
                  <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Loading {listingSegment === "houses" ? "houses…" : "land parcels…"}
                  </p>
                </div>
              ) : listingSegment === "houses" ? (
                properties.length === 0 ? (
                  <EmptyState
                    title="No house listings found"
                    description="Try clearing filters or upload a new house/building."
                    actionHref="/admin/properties/new"
                    actionLabel="Upload house/building"
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {properties.map((property) => (
                      <article
                        key={property.id}
                        className="group flex flex-col overflow-hidden rounded-xl border bg-background transition-shadow hover:shadow-md"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          <img
                            src={
                              property.images?.[0]?.url
                                ? resolveStorageUrl(property.images[0].url) || "/placeholder.svg"
                                : "/placeholder.svg"
                            }
                            alt={property.title || "Property"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                            <Badge className="border-0 bg-background/90 text-foreground shadow-sm backdrop-blur">
                              House / Building
                            </Badge>
                          </div>
                          <Badge
                            variant={property.status === "available" ? "default" : "secondary"}
                            className="absolute right-3 top-3 capitalize shadow-sm"
                          >
                            {property.status || "N/A"}
                          </Badge>
                        </div>

                        <div className="flex flex-1 flex-col gap-3 p-4">
                          <div className="min-w-0">
                            <h3 className="line-clamp-2 font-semibold leading-snug">
                              {property.title || "Untitled property"}
                            </h3>
                            <p className="mt-1 flex items-start gap-1 text-sm text-muted-foreground">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                              <span className="line-clamp-2">
                                {[property.location, property.city, property.state, property.address]
                                  .filter(Boolean)
                                  .join(", ") || "No location"}
                              </span>
                            </p>
                          </div>

                          <CopyableId
                            label="Property ID"
                            value={property.id}
                            hint="Paste into subscriber CSV as Property ID"
                          />

                          <div className="flex items-end justify-between gap-3 border-t border-dashed pt-3">
                            <div className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                {getPropertyTypeLabel(property, "Property")}
                              </p>
                              <p className="font-bold tabular-nums text-primary">
                                {formatNaira(perSlotAmount(property))}
                                <span className="text-xs font-normal text-muted-foreground">/slot</span>
                              </p>
                              {(property.total_slots ?? 0) > 1 ? (
                                <p className="text-xs text-muted-foreground">
                                  {formatNaira(totalListingCost(property))} total · {property.total_slots} slots
                                </p>
                              ) : null}
                            </div>
                            <div className="shrink-0 text-right text-xs text-muted-foreground">
                              <p className="font-medium text-foreground">
                                {property.subscribers_count ??
                                  property.slots_used ??
                                  property.allocations?.length ??
                                  0}{" "}
                                subscriber(s)
                              </p>
                              {property.slots_used != null && property.total_slots != null ? (
                                <p>
                                  {property.slots_used}/{property.total_slots} slots used
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-auto flex gap-2 pt-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleViewProperty(property.id)}
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5" />
                              View
                            </Button>
                            {can("edit_properties") ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEditProperty(property.id)}
                              >
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Button>
                            ) : null}
                            {can("delete_properties") ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )
              ) : landParcels.length === 0 ? (
                <EmptyState
                  title="No land parcels yet"
                  description="Upload a land parcel to begin managing land listings here."
                  actionHref="/admin/lands/new"
                  actionLabel="Upload land"
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {landParcels.map((land) => (
                    <article
                      key={land.id}
                      className="group flex flex-col overflow-hidden rounded-xl border bg-background transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img
                          src={
                            Array.isArray(land.images) && land.images.length > 0
                              ? resolveStorageUrl(land.images[0]) || "/placeholder.svg"
                              : "/placeholder.svg"
                          }
                          alt={land.land_title || "Land"}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          <Badge className="border-0 bg-background/90 text-foreground shadow-sm backdrop-blur">
                            Land parcel
                          </Badge>
                          {land.land_size ? (
                            <Badge variant="secondary" className="shadow-sm">
                              {land.land_size}
                            </Badge>
                          ) : null}
                        </div>
                        <Badge
                          variant={land.status === "available" ? "default" : "secondary"}
                          className="absolute right-3 top-3 capitalize shadow-sm"
                        >
                          {land.status || "N/A"}
                        </Badge>
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div>
                          <h3 className="line-clamp-2 font-semibold leading-snug">
                            {land.land_title || "Untitled land"}
                          </h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {land.location || "No location"}
                          </p>
                        </div>

                        <CopyableId
                          label="Land ID"
                          value={land.land_code}
                          hint="Paste into subscription CSV as land_id"
                          truncate={false}
                        />

                        <div className="flex items-end justify-between gap-3 border-t border-dashed pt-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Cost</p>
                            <p className="text-lg font-bold tabular-nums text-primary">
                              {formatCompactNaira(Number(land.cost || 0))}
                              {(land.total_slots ?? 0) > 1 ? (
                                <span className="text-xs font-normal text-muted-foreground"> /slot</span>
                              ) : null}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <p>{land.documents_count ?? 0} document(s)</p>
                            {land.total_slots != null ? (
                              <p>
                                {land.slots_available ?? 0}/{land.total_slots} slots free
                              </p>
                            ) : (
                              <p>Unlimited slots</p>
                            )}
                          </div>
                        </div>

                        <div className="mt-auto flex gap-2 pt-1">
                          <Button variant="secondary" size="sm" className="flex-1" asChild>
                            <Link href={`/admin/lands/${land.id}`}>
                              <Eye className="mr-1.5 h-3.5 w-3.5" />
                              View
                            </Link>
                          </Button>
                          {can("edit_properties") ? (
                            <Button variant="outline" size="sm" className="flex-1" asChild>
                              <Link href={`/admin/lands/${land.id}/edit`}>
                                <Edit className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Link>
                            </Button>
                          ) : null}
                          {can("delete_properties") ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteLand(land.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-0 space-y-4 focus-visible:outline-none">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">Property subscriptions</h2>
                <p className="text-xs text-muted-foreground">
                  Track payments, open details, or issue certificates for completed members.
                </p>
              </div>
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search member, ID, property…"
                  value={subscriptionSearchQuery}
                  onChange={(e) => setSubscriptionSearchQuery(e.target.value)}
                  className="h-9 bg-background pl-9"
                />
              </div>
            </div>

            <div className="border-b px-4 py-3 sm:px-5">
              <PropertyLocationFilters
                filters={locationFilters}
                options={filterOptions}
                onChange={handleLocationFiltersChange}
                showStatus={false}
              />
            </div>

            <div className="p-4 sm:p-5">
              {loadingSubscriptions ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading subscriptions…
                </div>
              ) : subscriptions.length === 0 ? (
                <EmptyState
                  title="No subscriptions match your filters"
                  description="Adjust location filters or search for a member name / ID."
                />
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="grid gap-4 rounded-xl border bg-background p-4 transition-colors hover:bg-muted/20 lg:grid-cols-[1fr_auto] lg:items-center"
                    >
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold leading-snug">{sub.memberName}</div>
                            <div className="text-sm text-muted-foreground">{sub.memberNo}</div>
                          </div>
                          <Badge variant={sub.status === "Completed" ? "default" : "secondary"}>
                            {sub.status}
                          </Badge>
                        </div>
                        <div className="text-sm font-medium text-foreground/90">{sub.property}</div>
                        <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/40 px-3 py-2.5 text-sm">
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Total</div>
                            <div className="font-semibold tabular-nums">₦{sub.totalPrice.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Paid</div>
                            <div className="font-semibold tabular-nums text-emerald-700">
                              ₦{sub.amountPaid.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Balance</div>
                            <div className="font-semibold tabular-nums text-amber-700">
                              ₦{sub.balance.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">Payment method: {sub.paymentMethod}</div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                        <Button variant="secondary" size="sm" onClick={() => handleViewSubscriptionDetails(sub)}>
                          View details
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleViewSubscriptionPayments(sub)}>
                          View payments
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIssueCertificate(sub)}
                          disabled={
                            !canIssueCertificate(sub) ||
                            issuingCertificateId === (sub.allocation?.id || sub.id)
                          }
                        >
                          {issuingCertificateId === (sub.allocation?.id || sub.id) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Issuing…
                            </>
                          ) : (
                            "Issue certificate"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-0 focus-visible:outline-none">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-base font-semibold">Payment verification</h2>
                <p className="text-xs text-muted-foreground">Review and verify property payment submissions.</p>
              </div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="h-9 w-full bg-background sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto p-1 sm:p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments
                    .filter(
                      (payment) =>
                        paymentFilter === "all" || payment.status.toLowerCase() === paymentFilter,
                    )
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
                        <TableCell className="text-right font-semibold tabular-nums">
                          ₦{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{payment.date}</TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View evidence
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
                          {payment.status === "Pending" && can("manage_payments") ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyPayment(payment, "approve")}
                              >
                                <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleVerifyPayment(payment, "reject")}
                              >
                                <XCircle className="mr-1 h-4 w-4 text-red-600" />
                                Reject
                              </Button>
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {pendingPayments.filter(
                (payment) => paymentFilter === "all" || payment.status.toLowerCase() === paymentFilter,
              ).length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No payments in this filter.
                </div>
              ) : null}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Estate overview (kept, collapsible for daily clarity) ──── */}
      <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setShowEstateOverview((open) => !open)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/30 sm:px-5"
          aria-expanded={showEstateOverview}
        >
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">Location & estate overview</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Accountability snapshot across estates — occupancy, subscriptions, collections, and open maintenance.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {showEstateOverview ? "Hide" : "Show"}
            {showEstateOverview ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </span>
        </button>
        {showEstateOverview ? (
          <div className="border-t px-4 py-5 sm:px-5">
            <LocationOverviewPanel hideHeader onApplyFilters={handleLocationFiltersChange} />
          </div>
        ) : null}
      </section>
    </div>
  )
}

function KpiCell({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
  quiet = false,
  compactValue = false,
}: {
  label: string
  value: string
  hint?: string
  icon: ComponentType<{ className?: string }>
  iconClass?: string
  quiet?: boolean
  compactValue?: boolean
}) {
  return (
    <div className={`flex items-start justify-between gap-3 px-4 py-3.5 ${quiet ? "bg-muted/20" : ""}`}>
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        <div
          className={`mt-1 font-bold tabular-nums leading-snug ${
            compactValue ? "text-sm sm:text-base" : "text-xl sm:text-2xl"
          }`}
        >
          {value}
        </div>
        {hint ? <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass ?? "text-muted-foreground/70"}`} />
    </div>
  )
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-4" size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}
