"use client"

import { useBulkUploadPermission } from "@/lib/admin/bulk-upload-permissions"
import type React from "react"
import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { parseFile } from "@/lib/utils/file-parser"

const PREVIEW_COLUMNS = [
  { key: "property_id", label: "Property ID", aliases: ["Property ID", "property_id", "PropertyID"] },
  { key: "member_id", label: "Member ID", aliases: ["Member ID", "member_id", "Member Number", "member_number", "MemberNumber", "MemberID"] },
  { key: "staff_id", label: "Staff ID", aliases: ["Staff ID", "staff_id", "StaffID"] },
  { key: "ippis", label: "IPPIS", aliases: ["IPPIS Number", "ippis_number", "IPPIS", "ippis"] },
  { key: "email", label: "Email (optional)", aliases: ["Email", "email"] },
  { key: "allocation_date", label: "Allocation Date", aliases: ["Allocation Date (YYYY-MM-DD)", "Allocation Date", "allocation_date"] },
  { key: "unit_address", label: "House/Block Address", aliases: ["House/Block Address (optional)", "House/Block Address", "House Block Address", "unit_address", "Unit Address"] },
  { key: "description", label: "Description", aliases: ["description", "Description", "Notes", "notes"] },
] as const

function getCell(row: Record<string, string>, aliases: readonly string[]): string {
  for (const alias of aliases) {
    if (row[alias]?.trim()) return row[alias].trim()
  }
  const normalizedAliases = new Set(aliases.map((a) => a.toLowerCase().trim()))
  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.has(key.toLowerCase().trim()) && String(value).trim()) {
      return String(value).trim()
    }
  }
  return ""
}

export default function BulkUploadPropertySubscribersPage() {
  const canUpload = useBulkUploadPermission("property-subscribers")
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [uploadResult, setUploadResult] = useState<{
    total?: number
    successful?: number
    failed?: number
    errors?: string[]
  } | null>(null)
  const [parsing, setParsing] = useState(false)
  const { toast } = useToast()

  const downloadTemplate = async () => {
    try {
      const response = await apiFetch<{ success: boolean; template: string; filename: string }>(
        "/admin/bulk/property-subscribers/template",
      )
      if (!response.success) throw new Error("Failed to download template")
      const blob = new Blob(["\uFEFF" + response.template], { type: "text/csv;charset=utf-8" })
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setParsing(true)
    setErrors([])
    setPreviewData([])
    setUploadComplete(false)
    setUploadResult(null)

    try {
      const result = await parseFile(selectedFile)
      const rows = (result.data ?? []) as Record<string, string>[]
      setPreviewData(rows)
      const localErrs: string[] = [...(result.errors ?? [])]

      rows.forEach((row, idx) => {
        const line = idx + 2
        const propertyId = getCell(row, PREVIEW_COLUMNS[0].aliases)
        const memberId = getCell(row, PREVIEW_COLUMNS[1].aliases)
        const staffId = getCell(row, PREVIEW_COLUMNS[2].aliases)
        const ippis = getCell(row, PREVIEW_COLUMNS[3].aliases)

        if (!propertyId) {
          localErrs.push(`Row ${line}: Property ID is required`)
        }
        if (!memberId && !staffId && !ippis) {
          localErrs.push(`Row ${line}: Provide at least one member identifier (Member ID, Staff ID, or IPPIS)`)
        }
      })

      if (rows.length === 0 && localErrs.length === 0) {
        localErrs.push("No data rows found in file")
      }

      setErrors(localErrs)
    } catch (err) {
      setErrors([`Error parsing file: ${err instanceof Error ? err.message : "Unknown error"}`])
    } finally {
      setParsing(false)
    }
  }

  const resetPreview = () => {
    setFile(null)
    setPreviewData([])
    setErrors([])
    setUploadComplete(false)
    setUploadResult(null)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setUploadComplete(false)
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
      const dataBlock = result.data ?? {}

      if (!res.ok || !result.success) {
        const errList = (result.errors as string[] | undefined) || []
        setErrors(errList.length ? errList : [result.message || "Upload failed"])
        if (dataBlock && Object.keys(dataBlock).length > 0) {
          setUploadResult(dataBlock)
        }
        setUploadComplete(true)
        toast({ title: "Import failed", description: result.message || "Check errors below", variant: "destructive" })
        return
      }

      setUploadResult(dataBlock)
      if (dataBlock.errors?.length) {
        setErrors(dataBlock.errors)
      }
      setUploadComplete(true)
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Property Subscribers</h1>
        <p className="mt-1 text-muted-foreground">
          Link members who paid offline to a property (approved EOI + allocation). Requires existing member accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
          <CardDescription>
            Each row creates an approved expression of interest and a completed allocation. Slots must be available if the
            property has a total slot limit.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Step 1: Download template</h3>
            <Button variant="outline" type="button" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV template
            </Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">Step 2: Fill property and member identifiers</h3>
            <p className="text-sm text-muted-foreground">
              Copy the Property ID from Admin → Property management (house listings) using the copy button on each card.
              Optionally add a House/Block Address column (e.g. C17A, Jagua Crescent, 3rd Avenue) for the member&apos;s
              unit. Member must exist — provide at least one of Member ID, Staff ID, or IPPIS (email is optional).
            </p>
          </div>
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              id="property-sub-upload"
              onChange={handleFileChange}
              disabled={parsing}
            />
            <label htmlFor="property-sub-upload" className={parsing ? "opacity-50" : "cursor-pointer"}>
              <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                {parsing ? "Parsing file…" : file ? file.name : "Click to select CSV or Excel"}
              </p>
              <p className="text-xs text-muted-foreground">Max 5MB</p>
            </label>
          </div>
        </CardContent>
      </Card>

      {parsing && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Parsing file…</AlertDescription>
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {errors.slice(0, 40).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({previewData.length} row{previewData.length === 1 ? "" : "s"})</CardTitle>
            <CardDescription>Review rows before importing. Showing up to 25 rows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {PREVIEW_COLUMNS.map((col) => (
                      <TableHead key={col.key} className="whitespace-nowrap">
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 25).map((row, i) => (
                    <TableRow key={i}>
                      {PREVIEW_COLUMNS.map((col) => (
                        <TableCell key={col.key} className="max-w-[200px] truncate">
                          {getCell(row, col.aliases) || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={resetPreview}>
                Cancel
              </Button>
              {canUpload && (
                <Button type="button" onClick={handleUpload} disabled={uploading || parsing || errors.length > 0}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Importing…" : `Upload ${previewData.length} subscriber(s)`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {uploadComplete && uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Import complete
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted p-4 text-center">
              <div className="text-2xl font-bold">{uploadResult.total ?? previewData.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{uploadResult.successful ?? 0}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{uploadResult.failed ?? 0}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
