"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

export default function BulkUploadPropertySubscribersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [uploadResult, setUploadResult] = useState<{
    total?: number
    successful?: number
    failed?: number
    errors?: string[]
  } | null>(null)
  const { toast } = useToast()

  const downloadTemplate = async () => {
    try {
      const response = await apiFetch<{ success: boolean; template: string; filename: string }>(
        "/admin/bulk/property-subscribers/template"
      )
      if (!response.success) throw new Error("Failed to download template")
      const blob = new Blob([response.template], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.filename || "property_subscribers_template.csv"
      a.click()
      window.URL.revokeObjectURL(url)
      toast({ title: "Template downloaded", description: "Replace the sample Property ID with a real property UUID." })
    } catch {
      toast({ title: "Download failed", variant: "destructive" })
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setErrors([])
    setUploadResult(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
      const tenantSlug = typeof window !== "undefined" ? localStorage.getItem("tenant_slug") : null
      const res = await fetch("/api/admin/bulk/property-subscribers/upload", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
        },
        body: formData,
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        const errList = (result.errors as string[] | undefined) || []
        setErrors(errList.length ? errList : [result.message || "Upload failed"])
        if (result.data) setUploadResult(result.data)
        toast({ title: "Import failed", description: result.message || "Check errors below", variant: "destructive" })
        return
      }
      setUploadResult(result.data)
      toast({
        title: result.has_errors ? "Completed with errors" : "Import successful",
        description: result.message,
      })
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Upload failed"])
      toast({ title: "Upload failed", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Property Subscribers</h1>
        <p className="text-muted-foreground">Link members who paid offline to a property (approved EOI + allocation). Requires existing member accounts.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Each row creates an approved expression of interest and a completed allocation. Slots must be available if the property has a total slot limit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Step 1: Download template</h3>
            <Button variant="outline" type="button" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV template
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Step 2: Fill Property ID, Member Number, Email</h3>
            <p className="text-sm text-muted-foreground">
              Copy the property UUID from Admin → Property detail. Member must exist (match by member number or email).
            </p>
          </div>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              id="property-sub-upload"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor="property-sub-upload" className="cursor-pointer">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-2">{file ? file.name : "Click to select CSV or Excel"}</p>
              <p className="text-xs text-muted-foreground">Max 5MB</p>
            </label>
          </div>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Importing…" : "Upload & import"}
          </Button>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {uploadResult && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Total: {uploadResult.total ?? "—"} · Success: {uploadResult.successful ?? "—"} · Failed: {uploadResult.failed ?? "—"}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
