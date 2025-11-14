 "use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { PropertyHeader } from "./(components)/property-header"
import { PropertyGallery } from "./(components)/property-gallery"
import { PropertyFinancials } from "./(components)/property-financials"
import { PropertyPaymentJourney } from "./(components)/property-payment-journey"
import { PropertyDetailsTab } from "@/components/properties/property-details-tab"
import { MyProperties } from "@/components/properties/my-properties"
import { PropertyDocuments } from "@/components/properties/property-documents"
import { PropertyPaymentTab } from "@/components/properties/property-payment-tab"
import {
  getMemberProperties,
  getAvailableProperties,
  type MemberHouse,
  type AvailableProperty,
} from "@/lib/api/client"

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>()
  const propertyId = params?.id

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [houses, setHouses] = useState<MemberHouse[]>([])
  const [availableProperty, setAvailableProperty] = useState<AvailableProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>(() => searchParams?.get("tab") ?? "details")

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        // First, get the property to determine its type
        const availableResult = await Promise.allSettled([getAvailableProperties()])
        let propertyType: "house" | "land" | undefined = undefined
        
        if (availableResult[0].status === "fulfilled") {
          const property = availableResult[0].value?.properties?.find((prop) => prop.id === propertyId) ?? null
          if (property) {
            propertyType = property.type?.toLowerCase() === "land" ? "land" : "house"
            setAvailableProperty(
              {
                ...property,
                images: (property.images ?? []).map((image) => ({
                  ...image,
                  url: image.url ?? (image as any).image_url ?? "",
                })),
              }
            )
          }
        }

        // Load member properties filtered by type
        const memberResult = await Promise.allSettled([
          propertyType ? getMemberProperties(propertyType) : getMemberProperties()
        ])

        if (!isMounted) return

        if (memberResult[0].status === "fulfilled" && memberResult[0].value.success) {
          setHouses(memberResult[0].value.properties ?? [])
        } else if (memberResult[0].status === "fulfilled" && !memberResult[0].value.success) {
          toast({
            title: "Unable to load your properties",
            description: "We could not load your properties. Please try again later.",
            variant: "destructive",
          })
        } else if (memberResult[0].status === "rejected") {
          toast({
            title: "Unable to load your properties",
            description: memberResult[0].reason?.message || "We could not load your properties. Please try again later.",
            variant: "destructive",
          })
        }

        if (availableResult[0].status === "rejected") {
          toast({
            title: "Unable to load available property",
            description: availableResult[0].reason?.message || "We could not load the property details. Please try again later.",
            variant: "destructive",
          })
        }
      } catch (error: any) {
        if (!isMounted) return
        toast({
          title: "Unable to load property",
          description: error?.message || "We could not load this property. Please try again later.",
          variant: "destructive",
        })
        router.replace("/dashboard/properties")
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (propertyId) {
      void fetchData()
    }

    return () => {
      isMounted = false
    }
  }, [propertyId, router, toast])

  useEffect(() => {
    const tab = searchParams?.get("tab") ?? "details"
    setActiveTab(tab)
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (!propertyId) return
    const currentParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    currentParams.set("tab", value)
    router.replace(`/dashboard/properties/${propertyId}?${currentParams.toString()}`, { scroll: false })
  }

  const activeHouse = useMemo(() => houses.find((house) => house.id === propertyId) ?? null, [houses, propertyId])

  const property = useMemo<AvailableProperty | MemberHouse | undefined>(() => {
    if (activeHouse) return activeHouse
    return availableProperty ?? undefined
  }, [activeHouse, availableProperty])

  const propertyType = useMemo(() => {
    return property?.type?.toLowerCase() === "land" ? "land" : "house"
  }, [property])

  const similarProperties = useMemo(() => {
    return houses.filter((house) => house.id !== propertyId && house.type?.toLowerCase() === propertyType)
  }, [houses, propertyId, propertyType])

  const detailsProps = useMemo(() => {
    if (!property) return undefined

    const description =
      "description" in property
        ? (property as any).description ?? null
        : activeHouse && "description" in activeHouse
          ? (activeHouse as any).description ?? null
          : null

    const features =
      "features" in property
        ? ((property as any).features ?? null)
        : activeHouse && "features" in activeHouse
          ? (activeHouse as any).features ?? null
          : null

    const bedrooms =
      "bedrooms" in property
        ? ((property as any).bedrooms ?? null)
        : activeHouse && "bedrooms" in activeHouse
          ? (activeHouse as any).bedrooms ?? null
          : null

    const listedAtKeys = ["listed_at", "published_at", "available_from", "created_at"]
    let listedAt: string | null = null

    for (const key of listedAtKeys) {
      if (listedAt) break
      if (property && key in property && (property as any)[key]) {
        listedAt = (property as any)[key]
        break
      }
      if (activeHouse && key in activeHouse && (activeHouse as any)[key]) {
        listedAt = (activeHouse as any)[key]
        break
      }
    }

    const size: number | string | null =
      "size" in property && property.size !== undefined
        ? (property as any).size ?? null
        : activeHouse && "size" in activeHouse
          ? (activeHouse as any).size ?? null
          : null

    const computedListedAt = (() => {
      const keys = ["listed_at", "created_at", "updated_at"]
      for (const key of keys) {
        if (property && key in property && (property as any)[key]) {
          return (property as any)[key] as string
        }
        if (activeHouse && key in activeHouse && (activeHouse as any)[key]) {
          return (activeHouse as any)[key] as string
        }
      }
      return null
    })()

    const interestStatus =
      activeHouse?.interest_status ??
      ("interest_status" in property ? ((property as any).interest_status as string | null | undefined) ?? null : null)

    return {
      id: property.id,
      title: property.title,
      type: property.type,
      status: property.status,
      location: property.location,
      size,
      price: "price" in property ? (property as any).price ?? null : activeHouse?.price ?? null,
      bedrooms,
      description,
      features,
      listedAt: computedListedAt,
      interestStatus,
    }
  }, [property, activeHouse])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PropertyHeader property={property} loading={loading} />
      <PropertyGallery images={property?.images} />
      {activeHouse ? <PropertyFinancials house={activeHouse} /> : null}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">{propertyType === "land" ? "Land Details" : "House Details"}</TabsTrigger>
          <TabsTrigger value="payments" disabled={!activeHouse}>Payments</TabsTrigger>
          <TabsTrigger value="documents" disabled={!activeHouse}>Documents</TabsTrigger>
          <TabsTrigger value="journey">Payment Journey</TabsTrigger>
          <TabsTrigger value="similar">{propertyType === "land" ? "Similar Lands" : "Similar Houses"}</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <PropertyDetailsTab property={detailsProps} />
        </TabsContent>

        <TabsContent value="journey">
          {activeHouse ? (
            <PropertyPaymentJourney house={activeHouse} />
          ) : (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              Payment journey is only available for properties you have expressed interest in.
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments">
          {activeHouse ? (
            <PropertyPaymentTab propertyId={activeHouse.id} house={activeHouse} />
          ) : (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              Payment setup is only available for properties you have expressed interest in.
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents">
          {activeHouse ? (
            <PropertyDocuments propertyId={activeHouse.id} canUpload allowDelete={false} role="member" />
          ) : (
            <div className="rounded-lg border p-6 text-sm text-muted-foreground">
              Documents are only available for properties you have subscribed to.
            </div>
          )}
        </TabsContent>

        <TabsContent value="similar">
          <MyProperties properties={similarProperties} propertyType={propertyType} />
        </TabsContent>
      </Tabs>
    </div>
  )
}