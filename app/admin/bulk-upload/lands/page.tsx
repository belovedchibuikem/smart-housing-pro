"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, apiFetchBlob } from "@/lib/api/client"
import { parseFile } from "@/lib/utils/file-parser"

export default function BulkUploadLandsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<Record<string, string>[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [uploadResult, setUploadResult] = useState<{ successful?: number; failed?: number; errors?: string[] } | null>(null)
  const [parsing, setParsing] = useState(false)
  const { toast } = useToast()

  const triggerCsvDownload = (content: string, filename: string) => {
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setParsing(true)
    setErrors([])
    setPreviewData([])
    try {
      const result = await parseFile(selectedFile)
      const rows = (result.data ?? []) as Record<string, string>[]
      setPreviewData(rows)
      const localErrs: string[] = [...(result.errors ?? [])]
      rows.forEach((row, idx) => {
        const title = row.land_title ?? row["Land Title"]
        const cost = row.cost ?? row.Cost
        if (!title && idx < 500) localErrs.push(`Row ${idx + 2}: land_title missing`)
        if ((cost === undefined || String(cost).trim() === "") && idx < 500) localErrs.push(`Row ${idx + 2}: cost missing`)
      })
      setErrors(localErrs)
    } catch (err) {
      setErrors([`Error parsing file: ${err instanceof Error ? err.message : "Unknown error"}`])
    } finally {
      setParsing(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const blob = await apiFetchBlob("/admin/bulk/lands/template?format=file")
      const text = await blob.text()
      if (text.trim().startsWith("{")) {
        const parsed = JSON.parse(text) as { success?: boolean; template?: string; filename?: string }
        if (parsed?.template) {
          triggerCsvDownload(parsed.template, parsed.filename || "land_upload_template.csv")
        }
      } else {
        triggerCsvDownload(text, "land_upload_template.csv")
      }
      toast({ title: "Template downloaded" })
    } catch {
      const res = await apiFetch<{ success: boolean; template: string; filename: string }>(
        "/admin/bulk/lands/template",
      )
      triggerCsvDownload(res.template, res.filename || "land_upload_template.csv")
      toast({ title: "Template downloaded" })
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setUploadComplete(false)
    setUploadResult(null)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
      const tenantSlug = localStorage.getItem("tenant_slug")
      const res = await fetch("/api/admin/bulk/lands/upload", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(tenantSlug ? { "X-Tenant-Slug": tenantSlug } : {}),
        },
        body: formData,
      })
      const result = await res.json()
      const dataBlock = result.data ?? {}
      if (!res.ok) {
        setErrors(Array.isArray(result.errors) ? result.errors : [result.message || "Upload failed"])
        toast({ title: "Upload failed", variant: "destructive" })
        setUploadResult(dataBlock)
        setUploadComplete(true)
        return
      }
      setUploadResult({
        successful: dataBlock.successful,
        failed: dataBlock.failed,
        errors: dataBlock.errors ?? [],
      })
      setUploadComplete(true)
      if (Array.isArray(dataBlock.errors) && dataBlock.errors.length > 0) {
        setErrors(dataBlock.errors)
      }
      toast({
        title: dataBlock.failed > 0 ? "Completed with errors" : "Upload successful",
        description: `${dataBlock.successful ?? 0} created`,
      })
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Upload error"])
      toast({ variant: "destructive", title: "Upload failed" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk upload land parcels</h1>
        <p className="text-muted-foreground mt-1">CSV / Excel — each row creates a land parcel with an auto-generated Land ID</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Templates &amp; upload</CardTitle>
          <CardDescription>Download the template, then upload here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV template
          </Button>
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="land-bulk-upload"
              disabled={parsing}
            />
            <label
              htmlFor="land-bulk-upload"
              className={parsing ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
            >
              <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">{parsing ? "Parsing…" : file ? file.name : "Click to select file"}</p>
            </label>
          </div>
        </CardContent>
      </Card>

      {parsing && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Parsing…</AlertDescription>
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {errors.slice(0, 50).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {errors.length > 50 ? <li className="text-muted-foreground">…and more</li> : null}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {previewData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Preview ({previewData.length} rows)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Land title</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 20).map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.land_title ?? row["Land Title"] ?? ""}</TableCell>
                      <TableCell>{row.land_size ?? ""}</TableCell>
                      <TableCell>{row.cost ?? ""}</TableCell>
                      <TableCell>{row.location ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setFile(null); setPreviewData([]); setErrors([]) }}>
                Clear
              </Button>
              <Button onClick={handleUpload} disabled={uploading || parsing}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {uploadComplete && uploadResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Result
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Metric label="Successful" val={uploadResult.successful ?? 0} variant="good" />
            <Metric label="Failed" val={uploadResult.failed ?? 0} variant="bad" />
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function Metric({ label, val, variant }: { label: string; val: number; variant: "good" | "bad" }) {
  return (
    <div className={`rounded-lg p-4 text-center ${variant === "good" ? "bg-green-50" : "bg-red-50"}`}>
      <div className={`text-2xl font-bold ${variant === "good" ? "text-green-700" : "text-red-700"}`}>{val}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
