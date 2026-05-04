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

export default function BulkLandPaymentsPage() {
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
        if (!(row.member_id ?? "").trim()) localErrs.push(`Row ${idx + 2}: member_id required`)
        if (!(row.land_id ?? "").trim()) localErrs.push(`Row ${idx + 2}: land_id required`)
        if (!(row.amount ?? "").toString().trim()) localErrs.push(`Row ${idx + 2}: amount required`)
      })
      setErrors(localErrs)
    } catch (err) {
      setErrors([`Error parsing file: ${err instanceof Error ? err.message : "Unknown"}`])
    } finally {
      setParsing(false)
    }
  }

  const downloadTemplate = async () => {
    try {
      const blob = await apiFetchBlob("/admin/bulk/land-payments/template?format=file")
      const text = await blob.text()
      if (text.trim().startsWith("{")) {
        const p = JSON.parse(text) as { template?: string; filename?: string }
        if (p.template) triggerCsvDownload(p.template, p.filename || "land_additional_payments_template.csv")
      } else {
        triggerCsvDownload(text, "land_additional_payments_template.csv")
      }
    } catch {
      const res = await apiFetch<{ template: string; filename: string }>("/admin/bulk/land-payments/template")
      triggerCsvDownload(res.template, res.filename || "land_additional_payments_template.csv")
    }
    toast({ title: "Template downloaded" })
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
      const res = await fetch("/api/admin/bulk/land-payments/upload", {
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
        setErrors(Array.isArray(result.errors) ? result.errors : [result.message || "Failed"])
        toast({ variant: "destructive", title: "Upload failed" })
        setUploadComplete(true)
        return
      }
      setUploadResult({
        successful: dataBlock.successful,
        failed: dataBlock.failed,
        errors: dataBlock.errors ?? [],
      })
      if (dataBlock.errors?.length) setErrors(dataBlock.errors)
      setUploadComplete(true)
      toast({ title: "Payments recorded" })
    } catch (e) {
      setErrors([e instanceof Error ? e.message : "Error"])
      toast({ variant: "destructive", title: "Upload failed" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk land payments</h1>
        <p className="text-muted-foreground mt-1">Additional installments after subscription (member_id + Land ID)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Template</CardTitle>
          <CardDescription>member_id, land_id, amount, payment_date (YYYY-MM-DD), payment_description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <div className="rounded-lg border-2 border-dashed p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="land-pay-bulk"
              disabled={parsing}
            />
            <label htmlFor="land-pay-bulk" className={parsing ? "opacity-50" : "cursor-pointer"}>
              <FileSpreadsheet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">{parsing ? "Parsing…" : file?.name ?? "Select file"}</p>
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
          <AlertDescription>
            <ul className="list-inside list-disc text-sm">
              {errors.slice(0, 40).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {previewData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>member_id</TableHead>
                    <TableHead>land_id</TableHead>
                    <TableHead>amount</TableHead>
                    <TableHead>payment_date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 25).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.member_id}</TableCell>
                      <TableCell className="font-mono">{row.land_id}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>{row.payment_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setFile(null); setPreviewData([]); setErrors([]) }}>
                Clear
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
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
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-4 text-center text-2xl font-bold text-green-700">
              {uploadResult.successful ?? 0}
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center text-2xl font-bold text-red-700">
              {uploadResult.failed ?? 0}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
