"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface PropertyImage {
  id?: string
  url: string
  is_primary?: boolean
  preview?: string
  name?: string
}

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const propertyId = params?.id
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "house",
    location: "",
    address: "",
    city: "",
    state: "",
    price: "",
    size: "",
    bedrooms: "",
    bathrooms: "",
    features: "",
    status: "available",
  })
  const [images, setImages] = useState<PropertyImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (!propertyId) return
    let isMounted = true

    const fetchProperty = async () => {
      try {
        setFetching(true)
        const response = await apiFetch<{ success: boolean; data: any }>(`/admin/properties/${propertyId}`)
        if (response.success && response.data && isMounted) {
          const property = response.data
          const featuresArray = Array.isArray(property.features) ? property.features : []

          setFormData({
            title: property.title || "",
            description: property.description || "",
            type: property.type || property.property_type || "house",
            location: property.location || "",
            address: property.address || "",
            city: property.city || "",
            state: property.state || "",
            price: property.price?.toString() || "",
            size: property.size?.toString() || "",
            bedrooms: property.bedrooms?.toString() || "",
            bathrooms: property.bathrooms?.toString() || "",
            features: featuresArray.join(", "),
            status: property.status || "available",
          })

          const propertyImages: PropertyImage[] = Array.isArray(property.images)
            ? property.images.map((image: PropertyImage) => ({
                id: image.id,
                url: image.url,
                is_primary: image.is_primary,
                preview: undefined,
                name: image.url?.split("/").pop() ?? "",
              }))
            : []

          setImages(propertyImages)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to load property",
          variant: "destructive",
        })
        router.push("/admin/properties")
      } finally {
        if (isMounted) setFetching(false)
      }
    }

    fetchProperty()

    return () => {
      isMounted = false
      images.forEach((image) => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId])

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return
    }

    setUploadError(null)
    setUploadingImages(true)

    const fileArray = Array.from(files)

    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Unsupported file type. Please upload image files only.")
        continue
      }

      const previewUrl = URL.createObjectURL(file)

      try {
        const formPayload = new FormData()
        formPayload.append("image", file)
        if (propertyId) {
          formPayload.append("property_id", propertyId)
        }

        const response = await apiFetch<{
          success: boolean
          url?: string
          image?: PropertyImage
          message?: string
        }>("/admin/properties/upload-image", {
          method: "POST",
          body: formPayload,
        })

        if (response?.success && response.url) {
          setImages((prev) => [
            ...prev,
            {
              id: response.image?.id,
              url: response.url,
              is_primary: response.image?.is_primary ?? false,
              preview: previewUrl,
              name: file.name,
            },
          ])
        } else {
          URL.revokeObjectURL(previewUrl)
          setUploadError(response?.message || "Failed to upload image. Please try again.")
        }
      } catch (error: any) {
        URL.revokeObjectURL(previewUrl)
        console.error("Image upload failed", error)
        setUploadError(error?.message || "Failed to upload image. Please try again.")
      }
    }

    setUploadingImages(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files?.length) {
      void handleFilesUpload(files)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return next
    })
  }

  const triggerFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.location || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Location, Price)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const submitData: any = {
        title: formData.title,
        description: formData.description || "",
        type: formData.type,
        property_type: formData.type,
        location: formData.location,
        address: formData.address || formData.location,
        city: formData.city || "",
        state: formData.state || "",
        price: parseFloat(formData.price),
        status: formData.status,
      }

      if (formData.size) submitData.size = parseFloat(formData.size)
      if (formData.bedrooms) submitData.bedrooms = parseInt(formData.bedrooms)
      if (formData.bathrooms) submitData.bathrooms = parseInt(formData.bathrooms)
      if (formData.features) {
        submitData.features = formData.features
          .split(",")
          .map((feature) => feature.trim())
          .filter((feature) => feature)
      }
      if (images.length > 0) {
        submitData.images = images.map((image) => image.url)
      }

      const response = await apiFetch<{ success: boolean; message?: string; data?: any }>(
        `/admin/properties/${propertyId}`,
        {
          method: "PUT",
          body: submitData,
        },
      )

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Property updated successfully",
        })
        router.push("/admin/properties?flash=property_updated")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update property",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const imageGrid = useMemo(
    () => (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {images.map((image, index) => (
          <div key={`${image.url}-${index}`} className="group relative flex flex-col overflow-hidden rounded-lg border">
            {image.preview || image.url ? (
              <img
                src={image.preview || image.url || "/placeholder.svg"}
                alt={image.name || `Property image ${index + 1}`}
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-muted/40 text-muted-foreground">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t bg-background px-3 py-2 text-xs">
              <span className="truncate font-medium">{image.name || `Image ${index + 1}`}</span>
              <button
                type="button"
                className="rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition group-hover:opacity-100"
                onClick={() => removeImage(index)}
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    ),
    [images],
  )

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/admin/properties">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Property</h1>
        <p className="text-muted-foreground mt-1">Update property information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>Update the details of the property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Property Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Luxury 3-Bedroom Apartment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">
                  Property Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="duplex">Duplex</SelectItem>
                    <SelectItem value="bungalow">Bungalow</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the property features, amenities, and location benefits..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Maitama, Abuja"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., No. 123 Street Name"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Abuja"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g., FCT"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (₦) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 25000000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="allocated">Allocated</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type !== "land" && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sqm)</Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
              </div>
            )}

            {formData.type === "land" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size (sqm)</Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="features">Features & Amenities (comma-separated)</Label>
              <Input
                id="features"
                placeholder="e.g., 24/7 Security, Parking Space, Generator"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Property Images</Label>
              <div
                className="group relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/40 p-8 text-center transition hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={triggerFileDialog}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    triggerFileDialog()
                  }
                }}
              >
                <Upload className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each. Upload multiple images.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => handleFilesUpload(event.target.files)}
                />
                {uploadingImages && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/80 backdrop-blur">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Uploading images...</p>
                  </div>
                )}
              </div>
              {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
              {imageGrid}
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Property
              </Button>
              <Link href="/admin/properties">
                <Button type="button" variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}