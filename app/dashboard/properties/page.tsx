"use client"

import { useEffect, useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { PropertyListings } from "@/components/properties/property-listings"
import { MyHouses } from "@/components/properties/my-houses"
import { PropertiesSummary } from "@/components/properties/investment-summary"
import { getAvailableProperties, getMemberProperties, type AvailableProperty, type MemberHouse, type MemberPropertiesSummary } from "@/lib/api/client"

export default function PropertiesPage() {
  const { toast } = useToast()
  const [availableProperties, setAvailableProperties] = useState<AvailableProperty[]>([])
  const [houses, setHouses] = useState<MemberHouse[]>([])
  const [summary, setSummary] = useState<MemberPropertiesSummary | null>(null)
  const [loadingAvailable, setLoadingAvailable] = useState<boolean>(true)
  const [loadingHouses, setLoadingHouses] = useState<boolean>(true)

  const loadAvailableProperties = useCallback(async () => {
    try {
      setLoadingAvailable(true)
      const response = await getAvailableProperties()
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
        title: "Unable to load properties",
        description: error?.message || "We could not load available properties. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoadingAvailable(false)
    }
  }, [toast])

  const loadMemberHouses = useCallback(async () => {
    try {
      setLoadingHouses(true)
      const response = await getMemberProperties()
      if (response.success) {
        setSummary(response.summary)
        setHouses(
          (response.properties ?? []).map((house) => ({
            ...house,
            price: Number(house.price ?? 0),
            total_paid: Number(house.total_paid ?? 0),
            current_value: Number(house.current_value ?? 0),
            predictive_value: Number(house.predictive_value ?? 0),
            progress: Number(house.progress ?? 0),
            images: (house.images ?? []).map((image) => ({
              ...image,
              url: image.url ?? (image as any).image_url ?? "",
            })),
          })),
        )
      } else {
        setSummary(null)
        setHouses([])
      }
    } catch (error: any) {
      toast({
        title: "Unable to load your houses",
        description: error?.message || "We could not load your house information. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoadingHouses(false)
    }
  }, [toast])

  useEffect(() => {
    void loadAvailableProperties()
    void loadMemberHouses()
  }, [loadAvailableProperties, loadMemberHouses])

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Properties</h1>
        <p className="mt-1 text-muted-foreground">Browse available homes and track your journey to ownership.</p>
      </div>

      <PropertiesSummary summary={summary} loading={loadingHouses} />

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Properties</TabsTrigger>
          <TabsTrigger value="houses">My Houses</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          <PropertyListings properties={availableProperties} loading={loadingAvailable} />
        </TabsContent>

        <TabsContent value="houses">
          <MyHouses houses={houses} loading={loadingHouses} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
