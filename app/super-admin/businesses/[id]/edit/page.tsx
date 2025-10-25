"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface BusinessFormData {
  name: string
  slug: string
  contact_email: string
  contact_phone: string
  address: string
  primary_color: string
  secondary_color: string
}

export default function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { isLoading, data, error, loadData } = usePageLoading<{ business: BusinessFormData }>()
  const [formData, setFormData] = useState<BusinessFormData>({
    name: "",
    slug: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    primary_color: "#000000",
    secondary_color: "#000000",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ business: BusinessFormData }>(`/super-admin/businesses/${resolvedParams.id}`)
      return response
    })
  }, [loadData, resolvedParams.id])

  useEffect(() => {
    if (data?.business) {
      setFormData(data.business)
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiFetch(`/super-admin/businesses/${resolvedParams.id}`, {
        method: 'PUT',
        body: formData
      })
      // Redirect back to business details
      window.location.href = `/super-admin/businesses/${resolvedParams.id}`
    } catch (error) {
      console.error('Failed to update business:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading) return <div className="p-6">Loading business data...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/super-admin/businesses/${resolvedParams.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Business</h1>
          <p className="text-muted-foreground mt-1">Update business information</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Business Name</Label>
            <Input
              id="name"
              placeholder="Enter business name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Subdomain Slug</Label>
            <Input
              id="slug"
              placeholder="business-slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
            <p className="text-sm text-muted-foreground">
              Business will be accessible at: {formData.slug}.yourplatform.com
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@business.com"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone</Label>
            <Input
              id="phone"
              placeholder="+234 800 000 0000"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter business address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#FDB11E"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#276254"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Business"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/super-admin/businesses/${resolvedParams.id}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
