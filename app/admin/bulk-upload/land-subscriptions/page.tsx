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
import { apiFetch, apiFetchBlob } from "@/lib/api/client"
import { parseFile } from "@/lib/utils/file-parser"

function cell(row: Record<string, string>, labels: string[]): string {
	const wanted = new Set(labels.map((label) => label.toLowerCase().replace(/_/g, " ").trim()))
	for (const [key, value] of Object.entries(row)) {
		const normalized = key
			.toLowerCase()
			.replace(/\s*\([^)]*\)\s*/g, "")
			.replace(/_/g, " ")
			.replace(/\s+/g, " ")
			.trim()
		if (wanted.has(normalized) && String(value).trim()) return String(value).trim()
	}
	return ""
}

function memberIdentity(row: Record<string, string>) {
	const memberId = cell(row, ["member id", "member number"])
	const staffId = cell(row, ["staff id"])
	const ippis = cell(row, ["ippis", "ippis number"])
	const frscPin = cell(row, ["frsc pin"])
	const name = [cell(row, ["first name"]), cell(row, ["last name"])].filter(Boolean).join(" ")
	return { memberId, staffId, ippis, frscPin, name }
}

function hasMemberIdentity(row: Record<string, string>): boolean {
	const identity = memberIdentity(row)
	return Boolean(identity.memberId || identity.staffId || identity.ippis || identity.frscPin || identity.name)
}

function isAccountNotice(message: string): boolean {
	return /created account/i.test(message)
}

function isReplayNotice(message: string): boolean {
	return /skipped to avoid a double upload|was not added again/i.test(message)
}

function isSoftNotice(message: string): boolean {
	return isAccountNotice(message) || isReplayNotice(message)
}

export default function BulkLandSubscriptionsPage() {
	const canUpload = useBulkUploadPermission("land-subscriptions")
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
        const landId = cell(row, ["land id"])
        if (!hasMemberIdentity(row)) {
          localErrs.push(`Row ${idx + 2}: provide a member ID, staff ID, IPPIS, FRSC PIN, or full name`)
        }
        if (!landId) localErrs.push(`Row ${idx + 2}: land_id required`)
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
      const blob = await apiFetchBlob("/admin/bulk/land-subscriptions/template?format=file")
      const text = await blob.text()
      if (text.trim().startsWith("{")) {
        const parsed = JSON.parse(text) as { template?: string; filename?: string }
        if (parsed?.template) triggerCsvDownload(parsed.template, parsed.filename || "land_subscription_template.csv")
      } else {
        triggerCsvDownload(text, "land_subscription_template.csv")
      }
    } catch {
      const res = await apiFetch<{ success: boolean; template: string; filename: string }>(
        "/admin/bulk/land-subscriptions/template",
      )
      triggerCsvDownload(res.template, res.filename || "land_subscription_template.csv")
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
      const res = await fetch("/api/admin/bulk/land-subscriptions/upload", {
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
      toast({
        title: dataBlock.failed > 0 ? "Completed with errors" : "Subscriptions imported",
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
        <h1 className="text-3xl font-bold">Bulk land subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          Match each row to a member with any one of member ID, staff ID, IPPIS, or FRSC PIN, then assign the land.
          If nobody matches, the upload creates the account from the name and IDs in that row and continues.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Template</CardTitle>
          <CardDescription>
            Use any member identifier: member_id, staff_id, ippis_number, or frsc_pin. Optional: first_name, last_name, email, phone.
            Land columns: land_title, land_id, land_size, amount_paid, payment_description.
          </CardDescription>
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
              id="land-sub-bulk"
              disabled={parsing}
            />
            <label htmlFor="land-sub-bulk" className={parsing ? "opacity-50" : "cursor-pointer"}>
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
      {errors.filter((message) => !isSoftNotice(message)).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <ul className="list-inside list-disc text-sm">
              {errors.filter((message) => !isSoftNotice(message)).slice(0, 40).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {errors.some(isReplayNotice) && (
        <Alert>
          <AlertDescription>
            <p className="mb-2 text-sm font-medium">Rows already in the system were skipped</p>
            <ul className="list-inside list-disc text-sm">
              {errors.filter(isReplayNotice).slice(0, 40).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {errors.some(isAccountNotice) && (
        <Alert>
          <AlertDescription>
            <p className="mb-2 text-sm font-medium">Accounts created from this file</p>
            <ul className="list-inside list-disc text-sm">
              {errors.filter(isAccountNotice).slice(0, 40).map((e, i) => (
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
                    <TableHead>Member ID</TableHead>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>IPPIS</TableHead>
                    <TableHead>FRSC PIN</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>land_id</TableHead>
                    <TableHead>amount_paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 25).map((row, i) => {
                    const identity = memberIdentity(row)
                    return (
                    <TableRow key={i}>
                      <TableCell>{identity.memberId || "—"}</TableCell>
                      <TableCell>{identity.staffId || "—"}</TableCell>
                      <TableCell>{identity.ippis || "—"}</TableCell>
                      <TableCell>{identity.frscPin || "—"}</TableCell>
                      <TableCell>{identity.name || "—"}</TableCell>
                      <TableCell className="font-mono">{cell(row, ["land id"]) || "—"}</TableCell>
                      <TableCell>{cell(row, ["amount paid"]) || "—"}</TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setFile(null); setPreviewData([]); setErrors([]) }}>
                Clear
              </Button>
              {canUpload && (
                <Button onClick={handleUpload} disabled={uploading || parsing || errors.some((message) => !isSoftNotice(message))}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}
      {uploadComplete && uploadResult ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Done
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{uploadResult.successful ?? 0}</div>
              <div className="text-sm text-muted-foreground">OK</div>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{uploadResult.failed ?? 0}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
