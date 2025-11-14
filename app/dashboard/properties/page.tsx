"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { PropertyListings } from "@/components/properties/property-listings"
import { MyProperties } from "@/components/properties/my-properties"
import { PropertiesSummary } from "@/components/properties/investment-summary"
import { getAvailableProperties, getMemberProperties, type AvailableProperty, type MemberHouse, type MemberPropertiesSummary } from "@/lib/api/client"

export default function PropertiesPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const propertyType = useMemo(() => {
    const type = searchParams?.get("type")?.toLowerCase()
    return type === "land" ? "land" : "house"
  }, [searchParams])

  const [activeTab, setActiveTab] = useState<string>("available-houses")
  const [availableProperties, setAvailableProperties] = useState<AvailableProperty[]>([])
  const [memberProperties, setMemberProperties] = useState<MemberHouse[]>([])
  const [summary, setSummary] = useState<MemberPropertiesSummary | null>(null)
  const [loadingAvailable, setLoadingAvailable] = useState<boolean>(true)
  const [loadingMember, setLoadingMember] = useState<boolean>(true)

  const loadAvailableProperties = useCallback(async (type: "house" | "land") => {
    try {
      setLoadingAvailable(true)
      const response = await getAvailableProperties(type)
      const formatted = (response.properties ?? []).map((property) => ({
        ...property,
        price: Number(property.price ?? 0),
        size: property.size !== undefined && property.size !== null ? Number(property.size) : undefined,
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        images: (property.images ?? []).map((image) => ({
          ...image,
          url: image.url ?? (image as any).image_url ?? "",
        })),
      }))
      setAvailableProperties(formatted)
    } catch (error: any) {
      toast({
        title: `Unable to load ${type === "house" ? "houses" : "lands"}`,
        description: error?.message || `We could not load available ${type === "house" ? "houses" : "lands"}. Please try again later.`,
        variant: "destructive",
      })
    } finally {
      setLoadingAvailable(false)
    }
  }, [toast])

  const loadMemberProperties = useCallback(async (type: "house" | "land") => {
    try {
      setLoadingMember(true)
      const response = await getMemberProperties(type)
      if (response.success) {
        const formatted = (response.properties ?? []).map((property) => ({
          ...property,
          price: Number(property.price ?? 0),
          total_paid: Number(property.total_paid ?? 0),
          current_value: Number(property.current_value ?? 0),
          predictive_value: Number(property.predictive_value ?? 0),
          progress: Number(property.progress ?? 0),
          images: (property.images ?? []).map((image) => ({
            ...image,
            url: image.url ?? (image as any).image_url ?? "",
          })),
        }))
        setMemberProperties(formatted)
        setSummary(response.summary)
      } else {
        setMemberProperties([])
      }
    } catch (error: any) {
      toast({
        title: `Unable to load your ${type === "house" ? "houses" : "lands"}`,
        description: error?.message || `We could not load your ${type === "house" ? "house" : "land"} information. Please try again later.`,
        variant: "destructive",
      })
    } finally {
      setLoadingMember(false)
    }
  }, [toast])

  useEffect(() => {
    void loadAvailableProperties(propertyType)
    void loadMemberProperties(propertyType)
  }, [propertyType, loadAvailableProperties, loadMemberProperties])

  useEffect(() => {
    // Set default tab based on type
    setActiveTab(propertyType === "land" ? "available-lands" : "available-houses")
  }, [propertyType])

  const isLand = propertyType === "land"
  const availableTabValue = isLand ? "available-lands" : "available-houses"
  const myTabValue = isLand ? "lands" : "houses"

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{isLand ? "My Lands" : "My Houses"}</h1>
        <p className="mt-1 text-muted-foreground">
          {isLand 
            ? "Browse available lands and track your journey to ownership."
            : "Browse available houses and track your journey to ownership."}
        </p>
      </div>

      <PropertiesSummary summary={summary} loading={loadingAvailable || loadingMember} propertyType={propertyType} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value={availableTabValue}>{isLand ? "Available Lands" : "Available Houses"}</TabsTrigger>
          <TabsTrigger value={myTabValue}>{isLand ? "My Lands" : "My Houses"}</TabsTrigger>
        </TabsList>

        <TabsContent value={availableTabValue}>
          <PropertyListings properties={availableProperties} loading={loadingAvailable} />
        </TabsContent>

        <TabsContent value={myTabValue}>
          <MyProperties properties={memberProperties} loading={loadingMember} propertyType={propertyType} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
