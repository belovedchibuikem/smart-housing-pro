"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"

export default function RegisterPropertyBlockchainPage() {
  const [formData, setFormData] = useState({
    propertyId: "",
    propertyName: "",
    propertyType: "",
    location: "",
    size: "",
    owners: "",
    titleDocument: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Registering property on blockchain:", formData)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/blockchain">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Register Property on Blockchain</h1>
          <p className="text-muted-foreground mt-1">Create an immutable record of property ownership</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>Enter property details to register on the blockchain</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="propertyId">Property ID *</Label>
                <Input
                  id="propertyId"
                  placeholder="FRSC-PROP-001"
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyName">Property Name *</Label>
                <Input
                  id="propertyName"
                  placeholder="Lekki Phase 2 Apartment"
                  value={formData.propertyName}
                  onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type *</Label>
                <Input
                  id="propertyType"
                  placeholder="Apartment, Land, House"
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size *</Label>
                <Input
                  id="size"
                  placeholder="500 sqm"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Lekki Phase 2, Lagos"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="owners">Owner(s) *</Label>
                <Textarea
                  id="owners"
                  placeholder="Enter owner names and wallet addresses (one per line)"
                  value={formData.owners}
                  onChange={(e) => setFormData({ ...formData, owners: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="titleDocument">Title Document</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="titleDocument"
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setFormData({ ...formData, titleDocument: e.target.files?.[0] || null })}
                  />
                  <Button type="button" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Upload property title document (PDF, JPG, PNG)</p>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Blockchain Registration</h3>
              <p className="text-sm text-muted-foreground">
                This property will be registered on the Ethereum blockchain, creating an immutable record of ownership.
                Transaction fees will apply.
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/blockchain">Cancel</Link>
              </Button>
              <Button type="submit">Register on Blockchain</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
