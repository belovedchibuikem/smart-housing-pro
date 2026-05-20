"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { PropertyGallery } from "@/app/dashboard/properties/[id]/(components)/property-gallery"
import { LandDetailsTab } from "@/components/lands/land-details-tab"
import { LandDocuments } from "@/components/properties/land-documents"
import { LandPaymentTab } from "@/components/lands/land-payment-tab"
import { LandPaymentJourney } from "@/components/lands/land-payment-journey"
import { SimilarLands, type SimilarLandItem } from "@/components/lands/similar-lands"
import {
  apiFetch,
  getLandDetail,
  getMemberLandPortfolio,
  type MemberLandSubscriptionRow,
  type PropertyImage,
} from "@/lib/api/client"

export default function TenantLandDetailPage() {
  const params = useParams<{ id: string }>()
  const landId = params?.id
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [land, setLand] = useState<Record<string, unknown> | null>(null)
  const [portfolio, setPortfolio] = useState<MemberLandSubscriptionRow[]>([])
  const [similarLands, setSimilarLands] = useState<SimilarLandItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>(() => searchParams?.get("tab") ?? "details")

  useEffect(() => {
    if (!landId) return
    let mounted = true
    void (async () => {
      try {
        setLoading(true)
        const [detailRes, portfolioRes, listRes] = await Promise.allSettled([
          getLandDetail(landId),
          getMemberLandPortfolio(),
          apiFetch<{ success: boolean; lands: SimilarLandItem[] }>("/lands?per_page=24"),
        ])

        if (!mounted) return

        if (detailRes.status === "fulfilled" && detailRes.value.success) {
          setLand(detailRes.value.land ?? null)
        } else {
          toast({
            title: "Unable to load land",
            description: "We could not load this land parcel.",
            variant: "destructive",
          })
          router.replace("/dashboard/properties?listing=land")
        }

        if (portfolioRes.status === "fulfilled" && portfolioRes.value.success) {
          setPortfolio(portfolioRes.value.data ?? [])
        }

        if (listRes.status === "fulfilled" && listRes.value.lands) {
          setSimilarLands(listRes.value.lands)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [landId, router, toast])

  useEffect(() => {
    setActiveTab(searchParams?.get("tab") ?? "details")
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (!landId) return
    const currentParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    currentParams.set("tab", value)
    router.replace(`/dashboard/lands/${landId}?${currentParams.toString()}`, { scroll: false })
  }

  const activeSubscription = useMemo(
    () => portfolio.find((row) => row.land_id === landId) ?? null,
    [portfolio, landId],
  )

  const hasAccess = Boolean(activeSubscription)

  const memberContext = land?.member_context as
    | { interest_status?: string; subscription_id?: string; has_subscription?: boolean }
    | undefined

  const interestStatus =
    memberContext?.interest_status ??
    (hasAccess ? "approved" : null)

  const galleryImages: PropertyImage[] = useMemo(() => {
    const raw = land?.images
    if (!Array.isArray(raw)) return []
    return raw
      .filter((u): u is string => typeof u === "string" && u.length > 0)
      .map((url, index) => ({ id: String(index), url, is_primary: index === 0, caption: null }))
  }, [land?.images])

  const detailsProps = useMemo(() => {
    if (!land) return undefined
    return {
      id: String(land.id ?? landId),
      land_title: String(land.land_title ?? "Land parcel"),
      land_code: land.land_code ? String(land.land_code) : undefined,
      status: land.status ? String(land.status) : undefined,
      location: land.location ? String(land.location) : undefined,
      land_size: land.land_size ? String(land.land_size) : null,
      cost: Number(land.cost ?? 0),
      land_description: land.land_description ? String(land.land_description) : null,
      land_features: (land.land_features as string[]) ?? null,
      infrastructure_plan: (land.infrastructure_plan as string[]) ?? null,
      created_at: land.created_at ? String(land.created_at) : null,
      interestStatus,
    }
  }, [land, landId, interestStatus])

  const title = String(land?.land_title ?? "Land parcel")

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon">
            <Link href="/dashboard/properties?listing=land">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{loading ? "Loading land…" : title}</h1>
            {land?.location ? (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {String(land.location)}
              </p>
            ) : null}
          </div>
        </div>
        <Badge variant="outline">🌍 Land parcel</Badge>
      </div>

      <PropertyGallery images={galleryImages} />

      {hasAccess && activeSubscription && (
        <div className="grid gap-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Total cost</p>
            <p className="text-lg font-bold">₦{activeSubscription.total_cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="text-lg font-bold">₦{activeSubscription.amount_paid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <p className="text-lg font-bold text-emerald-700">
              ₦{activeSubscription.outstanding_balance.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="details">Land Details</TabsTrigger>
          <TabsTrigger value="payments" disabled={!hasAccess}>
            Payments
          </TabsTrigger>
          <TabsTrigger value="documents" disabled={!hasAccess}>
            Documents
          </TabsTrigger>
          <TabsTrigger value="journey">Payment Journey</TabsTrigger>
          <TabsTrigger value="similar">Similar Lands</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <LandDetailsTab land={detailsProps} />
        </TabsContent>

        <TabsContent value="payments">
          {hasAccess ? (
            <LandPaymentTab subscription={activeSubscription} />
          ) : (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              Payments are available after your expression of interest is approved.
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          {hasAccess && landId ? (
            <LandDocuments landId={landId} />
          ) : (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              Documents are available once you have an active land subscription.
            </div>
          )}
        </TabsContent>

        <TabsContent value="journey">
          <LandPaymentJourney
            subscriptionId={activeSubscription?.subscription_id ?? memberContext?.subscription_id ?? null}
            summary={activeSubscription}
          />
        </TabsContent>

        <TabsContent value="similar">
          <SimilarLands lands={similarLands} currentLandId={landId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
