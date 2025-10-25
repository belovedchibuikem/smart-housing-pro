"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"

export default function NewPropertyPage() {
  const [propertyType, setPropertyType] = useState<string>("house")
  const [images, setImages] = useState<string[]>([])

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

      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
          <CardDescription>Enter the details of the property</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input id="name" placeholder="e.g., Luxury 3-Bedroom Apartment" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
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
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Maitama, Abuja" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (₦)</Label>
              <Input id="price" type="number" placeholder="e.g., 25000000" />
            </div>
          </div>

          {propertyType === "house" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" type="number" placeholder="e.g., 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" type="number" placeholder="e.g., 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size (sqm)</Label>
                <Input id="size" placeholder="e.g., 150" />
              </div>
            </div>
          )}

          {propertyType === "land" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size (sqm)</Label>
                <Input id="size" placeholder="e.g., 500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plots">Number of Plots</Label>
                <Input id="plots" type="number" placeholder="e.g., 1" />
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
                    <button className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features & Amenities (comma-separated)</Label>
            <Input id="features" placeholder="e.g., 24/7 Security, Parking Space, Generator" />
          </div>

          <div className="flex gap-3">
            <Button className="flex-1">Create Property</Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
