"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, Loader2, X } from "lucide-react"
import Link from "next/link"
import { createMaintenanceRequest, getMyPropertiesForMaintenance, type MemberProperty } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

export default function NewMaintenanceRequestPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    property_id: "",
    issue_type: "",
    priority: "",
    title: "",
    description: "",
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [properties, setProperties] = useState<MemberProperty[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true)
        const response = await getMyPropertiesForMaintenance()
        if (response.success) {
          setProperties(response.properties)
        } else {
          sonnerToast.error("Failed to load properties")
        }
      } catch (error: any) {
        console.error("Error fetching properties:", error)
        sonnerToast.error("Failed to load properties", {
          description: error?.message || "Please try again later",
        })
      } finally {
        setLoadingProperties(false)
      }
    }

    fetchProperties()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      // Filter files that are <= 5MB
      const validFiles = fileArray.filter((file) => file.size <= 5 * 1024 * 1024)
      if (validFiles.length !== fileArray.length) {
        sonnerToast.error("Some files were too large", {
          description: "Maximum file size is 5MB per file",
        })
      }
      setAttachments((prev) => [...prev, ...validFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.property_id || !formData.issue_type || !formData.priority || !formData.title || !formData.description) {
      sonnerToast.error("Please fill in all required fields")
      return
    }

    try {
      setSubmitting(true)
      const response = await createMaintenanceRequest({
        property_id: formData.property_id,
        issue_type: formData.issue_type,
        priority: formData.priority,
        title: formData.title,
        description: formData.description,
        attachments: attachments.length > 0 ? attachments : undefined,
      })

      if (response.success) {
        sonnerToast.success("Maintenance request submitted successfully", {
          description: response.message || "Your request has been received and will be reviewed soon.",
        })
        router.push("/dashboard/property-management/maintenance")
      } else {
        throw new Error(response.message || "Failed to submit request")
      }
    } catch (error: any) {
      console.error("Error submitting maintenance request:", error)
      sonnerToast.error("Failed to submit request", {
        description: error?.message || "Please try again later",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/property-management/maintenance">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Maintenance Request</h1>
          <p className="text-muted-foreground mt-1">Submit a new maintenance request for your property</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Provide details about the maintenance issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">Property *</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                disabled={loadingProperties}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProperties ? "Loading properties..." : "Select property"} />
                </SelectTrigger>
                <SelectContent>
                  {properties.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {loadingProperties ? "Loading..." : "No properties available"}
                    </div>
                  ) : (
                    properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.location}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.issue_type}
                  onValueChange={(value) => setFormData({ ...formData, issue_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="carpentry">Carpentry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the maintenance issue"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <div className="space-y-2">
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">Images or documents (Max 5MB each)</p>
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/dashboard/property-management/maintenance">Cancel</Link>
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={
              submitting ||
              !formData.property_id ||
              !formData.issue_type ||
              !formData.priority ||
              !formData.title ||
              !formData.description
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
