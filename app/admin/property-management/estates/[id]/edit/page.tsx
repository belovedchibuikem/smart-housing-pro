"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getPropertyEstate, updatePropertyEstate } from "@/lib/api/client"

export default function EditEstatePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [mounted, setMounted] = useState(false)
  const estateId = params?.id as string

  useEffect(() => {
    setMounted(true)
  }, [])
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    city: "",
    state: "",
    description: "",
  })

  useEffect(() => {
    if (estateId) {
      fetchEstate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estateId])

  const fetchEstate = async () => {
    try {
      setFetching(true)
      const response = await getPropertyEstate(estateId)
      if (response.success && response.data) {
        const estate = response.data
        setFormData({
          name: estate.name || estate.title?.replace(' Estate', '') || "",
          location: estate.location || "",
          city: estate.city || "",
          state: estate.state || "",
          description: estate.description || "",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load estate",
        variant: "destructive",
      })
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.city || !formData.state) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await updatePropertyEstate(estateId, formData)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Estate updated successfully",
        })
        router.push("/admin/property-management/estates")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update estate",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/property-management/estates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Estate</h1>
          <p className="text-muted-foreground mt-1">Update estate information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Estate Information</CardTitle>
            <CardDescription>Update the details of the estate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Estate Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., FRSC Estate Phase 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location/Address</Label>
                <Input
                  id="location"
                  placeholder="e.g., Gwarinpa, Abuja"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="e.g., Abuja"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  placeholder="e.g., FCT"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter estate description, amenities, and other details..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/property-management/estates">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Estate
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

