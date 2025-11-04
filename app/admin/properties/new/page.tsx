"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

export default function NewPropertyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [propertyType, setPropertyType] = useState<string>("house")
  const [images, setImages] = useState<string[]>([])
  
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
        submitData.features = formData.features.split(',').map(f => f.trim()).filter(f => f)
      }

      const response = await apiFetch<{ success: boolean; message?: string; data?: any }>(
        "/admin/properties",
        {
          method: "POST",
          body: submitData,
        }
      )

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Property created successfully",
        })
        router.push("/admin/properties")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to create property",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold">Add New Property</h1>
        <p className="text-muted-foreground mt-1">Create a new property listing</p>
      </div>

      <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>Enter the details of the property</CardDescription>
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
                  value={propertyType}
                  onValueChange={(value) => {
                    setPropertyType(value)
                    setFormData({ ...formData, type: value })
                  }}
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

            {propertyType !== "land" && (
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

          {propertyType === "land" && (
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
            <Label>Property Images</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</div>
              <div className="text-xs text-muted-foreground">PNG, JPG up to 10MB (multiple images allowed)</div>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Property ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                      <button
                        type="button"
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                      >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features & Amenities (comma-separated)</Label>
              <Input
                id="features"
                placeholder="e.g., 24/7 Security, Parking Space, Generator"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              />
          </div>

          <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Property
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
