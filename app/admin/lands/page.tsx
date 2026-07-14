"use client"

import { useEffect, useState, type ComponentType } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Plus,
  Search,
  MapPin,
  DollarSign,
  Users,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  MapPinned,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Upload,
  ClipboardList,
  UserCheck,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  fetchAdminPropertyStatistics,
  recalculateAdminPropertyStatistics,
  getPropertyLocationFilterOptions,
  getLandSubscriptions,
  type AdminPropertyStatistics,
} from "@/lib/api/client"
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
import { formatCompactNaira } from "@/lib/utils/currency"

interface LandParcel {
  id: string
  land_code?: string | null
  land_title?: string | null
  land_size?: string | null
  cost?: number | string | null
  location?: string | null
  city?: string | null
  state?: string | null
  address?: string | null
  status?: string | null
  images?: string[] | null
  documents_count?: number
  total_slots?: number | null
  slots_available?: number | null
  subscriptions_count?: number
}

type LandSubRow = {
  id: string
  land_id: string
  member_id: string
  memberName: string
  memberNo: string
  landTitle: string
  landCode: string | null
  location: string
  slotLabel: string | null
  totalPrice: number
  amountPaid: number
  balance: number
  status: string
}

export default function AdminLandManagementPage() {
  const { can } = useTenantPermissions()
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [landParcels, setLandParcels] = useState<LandParcel[]>([])
  const [subscriptions, setSubscriptions] = useState<LandSubRow[]>([])
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [subscriptionSearchQuery, setSubscriptionSearchQuery] = useState("")
  const [workspaceTab, setWorkspaceTab] = useState("parcels")
  const [showEstateOverview, setShowEstateOverview] = useState(false)
  const [locationFilters, setLocationFilters] = useState<PropertyLocationFilterValues>(() =>
    locationFiltersFromSearchParams(searchParams),
  )
  const [filterOptions, setFilterOptions] = useState<LocationFilterOptions | null>(null)
  const [propertyStats, setPropertyStats] = useState<AdminPropertyStatistics | null>(null)
  const [landPaginationTotal, setLandPaginationTotal] = useState(0)
  const [recalculating, setRecalculating] = useState(false)
  const canRecalculateStats = can("manage_property_estates|create_properties|edit_properties")

  useEffect(() => {
    fetchAdminPropertyStatistics()
      .then((r) => {
        if (r.success && r.data) setPropertyStats(r.data)
      })
      .catch(() => setPropertyStats(null))
  }, [])

  useEffect(() => {
    getPropertyLocationFilterOptions()
      .then((r) => {
        if (r.success && r.data) setFilterOptions(r.data)
      })
      .catch(() => setFilterOptions(null))
  }, [])

  useEffect(() => {
    setLocationFilters(locationFiltersFromSearchParams(searchParams))
  }, [searchParamsString])

  const syncLocationFiltersToUrl = (filters: PropertyLocationFilterValues) => {
    const params = new URLSearchParams()
    appendLocationFilters(params, filters)
    const qs = params.toString()
    router.replace(qs ? `/admin/lands?${qs}` : "/admin/lands", { scroll: false })
  }

  const handleLocationFiltersChange = (filters: PropertyLocationFilterValues) => {
    setLocationFilters(filters)
    syncLocationFiltersToUrl(filters)
  }

  useEffect(() => {
    void fetchLandParcels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, locationFilters])

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

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true)
      const response = await getLandSubscriptions({
        per_page: 100,
        search: subscriptionSearchQuery.trim() || undefined,
        location: locationFilters.location || undefined,
        city: locationFilters.city || undefined,
        state: locationFilters.state || undefined,
        estate_id: locationFilters.estateId || undefined,
      })
      if (response.success && response.data) {
        setSubscriptions(
          response.data.map((sub) => ({
            id: sub.id,
            land_id: sub.land_id,
            member_id: sub.member_id,
            memberName: sub.member_name || "—",
            memberNo: sub.member_number || "—",
            landTitle: sub.land_title || "—",
            landCode: sub.land_code,
            location: sub.land_location || "—",
            slotLabel: sub.slot_label,
            totalPrice: sub.total_price || 0,
            amountPaid: sub.amount_paid || 0,
            balance: sub.balance || 0,
            status: sub.status || "In Progress",
          })),
        )
      }
    } catch (error) {
      console.error("Failed to fetch land subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to fetch land subscriptions",
        variant: "destructive",
      })
    } finally {
      setLoadingSubscriptions(false)
    }
  }

  const handleDeleteLand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this land parcel?")) return
    try {
      await apiFetch(`/admin/lands/${id}`, { method: "DELETE" })
      toast({ title: "Success", description: "Land parcel deleted successfully" })
      fetchLandParcels()
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete land parcel",
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
    active: subscriptions.filter((s) => s.status === "In Progress").length,
    completed: subscriptions.filter((s) => s.status === "Completed").length,
  }

  return (
    <div className="space-y-5 pb-8">
      <header className="flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Daily operations · Land only
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Land management</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Parcels, land subscriptions, and assignment tools — separate from houses/buildings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/admin/properties">
              <Home className="mr-2 h-4 w-4" />
              Houses workspace
            </Link>
          </Button>

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
                More tools
                <ChevronDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Land operations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Can permission="bulk_upload_properties|create_properties">
                <DropdownMenuItem asChild>
                  <Link href="/admin/bulk-upload/lands">Bulk land parcels</Link>
                </DropdownMenuItem>
              </Can>
              <Can permission="manage_property_allottees|approve_allotments">
                <DropdownMenuItem asChild>
                  <Link href="/admin/bulk-upload/land-subscriptions">Bulk land subscriptions</Link>
                </DropdownMenuItem>
              </Can>
              <Can permission="manage_property_allottees|manage_payments">
                <DropdownMenuItem asChild>
                  <Link href="/admin/bulk-upload/land-payments">Bulk land payments</Link>
                </DropdownMenuItem>
              </Can>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/admin/land-eoi-forms">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Land EOI forms
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/land-subscriptions/new">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Assign land to member
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/reports/land">Land reports</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Can permission="create_properties">
            <Button asChild>
              <Link href="/admin/lands/new">
                <Plus className="mr-2 h-4 w-4" />
                Upload land
              </Link>
            </Button>
          </Can>
        </div>
      </header>

      <section aria-label="Land portfolio overview" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-y border-b sm:grid-cols-3 xl:grid-cols-4 xl:divide-y-0">
          <KpiCell
            label="Land parcels"
            value={String(propertyStats?.total_land_parcels ?? landPaginationTotal)}
            hint="Dedicated land catalog"
            icon={MapPinned}
            iconClass="text-emerald-600"
          />
          <KpiCell
            label="Shown in list"
            value={String(landParcels.length)}
            hint="After current filters"
            icon={Layers}
          />
          <KpiCell
            label="Land portfolio cost"
            value={formatCompactNaira(propertyStats?.total_land_cost ?? 0)}
            hint="DB sum of land costs"
            icon={DollarSign}
            compactValue
          />
          <KpiCell
            label="Legacy land rows"
            value={String(propertyStats?.legacy_land_as_property_count ?? 0)}
            hint="Pre-module land in properties table"
            icon={MapPin}
          />
        </div>
        <div className="grid grid-cols-1 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <KpiCell
            label="Active land subscriptions"
            value={String(subscriptionStats.active)}
            hint="In-progress payments"
            icon={Users}
            quiet
          />
          <KpiCell
            label="Completed"
            value={String(subscriptionStats.completed)}
            hint="Fully paid land subscriptions"
            icon={CheckCircle}
            quiet
          />
        </div>
      </section>

      <Tabs value={workspaceTab} onValueChange={setWorkspaceTab} className="space-y-4">
        <div className="sticky top-0 z-20 -mx-1 rounded-xl border bg-background/95 px-1 py-1 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-muted/50 p-1 sm:grid-cols-3">
            <TabsTrigger value="parcels" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              <MapPinned className="hidden h-3.5 w-3.5 sm:block" />
              Land parcels
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
            <TabsTrigger value="tools" className="gap-1.5 py-2.5 text-xs sm:text-sm">
              Quick tools
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="parcels" className="mt-0 space-y-4 focus-visible:outline-none">
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold">Land parcel listings</h2>
                <p className="text-xs text-muted-foreground">
                  Copy Land ID from each card for subscription CSV import.
                </p>
              </div>
              <div className="relative w-full min-w-[200px] max-w-sm lg:ml-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search land…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 bg-background pl-9"
                />
              </div>
            </div>

            <div className="space-y-1 border-b px-4 py-3 sm:px-5">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="text-xs text-muted-foreground">Filter by estate / location</span>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {landParcels.length} shown
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
                  <p className="text-sm text-muted-foreground">Loading land parcels…</p>
                </div>
              ) : landParcels.length === 0 ? (
                <EmptyState
                  title="No land parcels found"
                  description="Try clearing filters or upload a new land parcel."
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
                            {[land.location, land.city, land.state].filter(Boolean).join(", ") ||
                              land.address ||
                              "No location"}
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
                            <p>{land.subscriptions_count ?? 0} subscriber(s)</p>
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
                <h2 className="text-base font-semibold">Land subscriptions</h2>
                <p className="text-xs text-muted-foreground">
                  Track plot allocations and payment progress for land subscribers.
                </p>
              </div>
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search member, ID, land…"
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
                  title="No land subscriptions match your filters"
                  description="Assign land to a member or adjust filters."
                  actionHref="/admin/land-subscriptions/new"
                  actionLabel="Assign land"
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
                        <div className="text-sm font-medium text-foreground/90">
                          {sub.landTitle}
                          {sub.landCode ? (
                            <span className="ml-2 font-mono text-xs text-muted-foreground">{sub.landCode}</span>
                          ) : null}
                        </div>
                        {sub.slotLabel ? (
                          <div className="text-xs text-muted-foreground">Plot / slot: {sub.slotLabel}</div>
                        ) : null}
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
                        <div className="text-xs text-muted-foreground">{sub.location}</div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/admin/lands/${sub.land_id}?tab=ownership`}>View land</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/lands/${sub.land_id}?tab=ownership`}>View payments</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-0 focus-visible:outline-none">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ToolCard
              title="Land EOI forms"
              description="Review and approve land expressions of interest."
              href="/admin/land-eoi-forms"
              icon={ClipboardList}
            />
            <ToolCard
              title="Assign land to member"
              description="Create a land subscription for a member plot."
              href="/admin/land-subscriptions/new"
              icon={UserCheck}
            />
            <ToolCard
              title="Bulk land parcels"
              description="Import many parcels from CSV."
              href="/admin/bulk-upload/lands"
              icon={Upload}
            />
            <ToolCard
              title="Bulk land subscriptions"
              description="Assign many members to land via CSV."
              href="/admin/bulk-upload/land-subscriptions"
              icon={Upload}
            />
            <ToolCard
              title="Bulk land payments"
              description="Post land repayment records in bulk."
              href="/admin/bulk-upload/land-payments"
              icon={DollarSign}
            />
            <ToolCard
              title="Land reports"
              description="Portfolio and subscription reporting for land."
              href="/admin/reports/land"
              icon={Layers}
            />
          </div>
        </TabsContent>
      </Tabs>

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
              Estate-level accountability — land parcels, subscriptions, and collections.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {showEstateOverview ? "Hide" : "Show"}
            {showEstateOverview ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
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

function ToolCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string
  description: string
  href: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-semibold group-hover:text-primary">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </Link>
  )
}
