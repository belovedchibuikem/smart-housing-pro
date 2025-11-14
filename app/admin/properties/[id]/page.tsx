"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { PropertyDocuments } from "@/components/properties/property-documents"

interface PropertyAllocation {
  id: string
  status?: string
  amount_paid?: number
  member?: {
    id: string
    member_id?: string | null
    staff_id?: string | null
    user?: {
      first_name?: string | null
      last_name?: string | null
      email?: string | null
      phone?: string | null
    } | null
  } | null
  created_at?: string | null
}

interface PropertyImage {
  id: string
  url: string
  is_primary?: boolean
}

interface PropertyDetail {
  id: string
  title?: string
  description?: string
  type?: string
  property_type?: string
  location?: string
  address?: string
  city?: string
  state?: string
  price?: number
  size?: number
  bedrooms?: number
  bathrooms?: number
  features?: string[] | null
  status?: string
  created_at?: string
  updated_at?: string
  images?: PropertyImage[]
  allocations?: PropertyAllocation[]
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>()
  const propertyId = params?.id
  const router = useRouter()
  const { toast } = useToast()

  const [property, setProperty] = useState<PropertyDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!propertyId) return
    let isMounted = true

    const fetchProperty = async () => {
      try {
        setLoading(true)
        const response = await apiFetch<{ success: boolean; data: PropertyDetail }>(`/admin/properties/${propertyId}`)
        if (response.success && isMounted) {
          const propertyData = response.data
          if (propertyData && Array.isArray(propertyData.features)) {
            propertyData.features = propertyData.features.filter((feature) => Boolean(feature))
          }
          setProperty(propertyData)
        }
      } catch (error: any) {
        console.error("Failed to load property", error)
        toast({
          title: "Error",
          description: error?.message || "Failed to load property details.",
          variant: "destructive",
        })
        router.push("/admin/properties")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProperty()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId])

  const imageList = useMemo(() => {
    if (!property?.images || property.images.length === 0) return []
    return property.images
  }, [property?.images])

  const [activeIndex, setActiveIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const features = useMemo(() => {
    return Array.isArray(property?.features) ? property.features : []
  }, [property?.features])

  const allocations = useMemo(() => {
    return Array.isArray(property?.allocations) ? property.allocations : []
  }, [property?.allocations])

  const documentMemberOptions = useMemo(
    () =>
      allocations
        .filter((allocation) => allocation.member?.id)
        .map((allocation) => ({
          id: allocation.member!.id,
          label:
            `${allocation.member?.user?.first_name ?? ""} ${allocation.member?.user?.last_name ?? ""}`.trim() ||
            allocation.member?.member_id ||
            "Member",
        })),
    [allocations],
  )

  useEffect(() => {
    if (imageList.length === 0) {
      setActiveIndex(0)
      return
    }
    const primaryIndex = imageList.findIndex((image) => image.is_primary)
    if (primaryIndex >= 0) {
      setActiveIndex(primaryIndex)
    } else {
      setActiveIndex(0)
    }
  }, [imageList])

  const currentImage = imageList[activeIndex]

  const showPrev = () => {
    if (imageList.length === 0) return
    setActiveIndex((prev) => (prev - 1 + imageList.length) % imageList.length)
  }

  const showNext = () => {
    if (imageList.length === 0) return
    setActiveIndex((prev) => (prev + 1) % imageList.length)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!property) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/properties">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-3xl font-bold">{property.title || "Property"}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {property.address || property.location || property.city || property.state || "No location provided"}
          </p>
        </div>
        {property.status && <Badge className="capitalize">{property.status}</Badge>}
        <Link href={`/admin/properties/${property.id}/edit`}>
          <Button>Edit Property</Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative group rounded-t-lg overflow-hidden">
                {currentImage ? (
                  <Image
                    src={currentImage.url || "/placeholder.svg"}
                    alt={property.title || "Property image"}
                    width={1280}
                    height={720}
                    className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in"
                    onClick={() => setIsViewerOpen(true)}
                  />
                ) : (
                  <div className="flex h-96 w-full items-center justify-center bg-muted text-muted-foreground">
                    <ImageIcon className="h-10 w-10" />
                  </div>
                )}
                {imageList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPrev}
                      className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 group-hover:flex"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 group-hover:flex"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                {imageList.length > 0 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1">
                    {imageList.map((image, index) => (
                      <button
                        key={image.id ?? image.url}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`h-2 w-2 rounded-full transition ${index === activeIndex ? "bg-white" : "bg-white/40"}`}
                        aria-label={`Go to image ${index + 1}`}
                  />
                ))}
                  </div>
                )}
              </div>
              {imageList.length > 1 && (
                <div className="grid grid-cols-3 gap-2 p-4">
                  {imageList.map((image, index) => (
                    <button
                      key={image.id ?? image.url}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`overflow-hidden rounded border ${index === activeIndex ? "border-primary" : "border-transparent"}`}
                    >
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt=""
                        width={400}
                        height={300}
                        className="h-24 w-full object-cover transition hover:opacity-80"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                  <CardDescription>Complete property information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <Bed className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.bedrooms ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <Bath className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.bathrooms ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">Bathrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-4">
                      <Square className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.size ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">Square Metres</p>
                      </div>
                    </div>
                  </div>

                  {property.description && (
                  <div>
                      <h3 className="mb-2 font-semibold">Description</h3>
                      <p className="whitespace-pre-line text-muted-foreground">{property.description}</p>
                  </div>
                  )}

                  {features.length > 0 && (
                  <div>
                      <h3 className="mb-3 font-semibold">Features & Amenities</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Allocations</CardTitle>
                  <CardDescription>Members who have subscribed to this property</CardDescription>
                </CardHeader>
                <CardContent>
                  {allocations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No allocations recorded for this property yet.</p>
                  ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                          <TableHead>Membership ID</TableHead>
                          <TableHead className="text-right">Amount Paid</TableHead>
                          <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allocations.map((allocation) => {
                          const memberName = `${allocation.member?.user?.first_name ?? ""} ${allocation.member?.user?.last_name ?? ""}`.trim() || "Unknown Member"
                          const membershipId = allocation.member?.member_id || allocation.member?.staff_id || "—"
                          return (
                            <TableRow key={allocation.id}>
                              <TableCell className="font-medium">{memberName}</TableCell>
                              <TableCell>{membershipId}</TableCell>
                              <TableCell className="text-right">
                                ₦{Number(allocation.amount_paid ?? 0).toLocaleString()}
                              </TableCell>
                          <TableCell>
                                <Badge variant={allocation.status === "completed" ? "default" : "secondary"}>
                                  {allocation.status ?? "pending"}
                                </Badge>
                          </TableCell>
                          <TableCell>
                                {allocation.created_at
                                  ? new Date(allocation.created_at).toLocaleDateString()
                                  : "—"}
                          </TableCell>
                        </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <PropertyDocuments
                propertyId={property.id}
                canUpload
                allowDelete
                role="admin"
                memberOptions={documentMemberOptions}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Property Value</label>
                <p className="text-3xl font-bold">
                  ₦{Number(property.price ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Property Type</label>
                <p className="text-xl font-semibold capitalize">
                  {property.type || property.property_type || "Not specified"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.status && (
              <div>
                <label className="text-sm text-muted-foreground">Status</label>
                  <p className="font-medium capitalize">{property.status}</p>
              </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground">Date Added</label>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {property.created_at
                    ? new Date(property.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Last Updated</label>
                <p className="font-medium">
                  {property.updated_at
                    ? new Date(property.updated_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isViewerOpen && currentImage && (
        <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
          <DialogContent className="max-w-4xl bg-background/95">
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative w-full overflow-hidden rounded-lg bg-black">
                <Image
                  src={currentImage.url || "/placeholder.svg"}
                  alt={property.title || "Property image"}
                  width={1600}
                  height={900}
                  className="h-[70vh] w-full object-contain"
                />
                {imageList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
              {imageList.length > 1 && (
                <div className="grid w-full grid-cols-4 gap-2">
                  {imageList.map((image, index) => (
                    <button
                      key={image.id ?? image.url}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`overflow-hidden rounded border ${index === activeIndex ? "border-primary" : "border-transparent"}`}
                    >
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt=""
                        width={300}
                        height={200}
                        className="h-20 w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

