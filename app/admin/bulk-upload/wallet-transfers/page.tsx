"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react"
import { useBulkUploadPermission } from "@/lib/admin/bulk-upload-permissions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"
import { parseFile } from "@/lib/utils/file-parser"

export default function BulkUploadWalletTransfersPage() {
	const canUpload = useBulkUploadPermission("wallet-transfers")
	const [file, setFile] = useState<File | null>(null)
	const [previewData, setPreviewData] = useState<any[]>([])
	const [uploading, setUploading] = useState(false)
	const [parsing, setParsing] = useState(false)
	const [errors, setErrors] = useState<string[]>([])
	const [uploadComplete, setUploadComplete] = useState(false)
	const [uploadResult, setUploadResult] = useState<any>(null)

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (!selectedFile) return
		setFile(selectedFile)
		setParsing(true)
		setErrors([])
		setPreviewData([])

		try {
			const result = await parseFile(selectedFile)
			const mapped = result.data.map((row: any) => ({
				memberId:
					row["Member ID (UUID, Member Number, Staff ID, IPPIS, or FRSC PIN)"] ||
					row["Member ID"] ||
					row["member_id"] ||
					row["member_number"] ||
					row["staff_id"] ||
					row["ippis_number"] ||
					row["IPPIS"] ||
					row["IPPIS Number"] ||
					row["ippis"] ||
					row["frsc_pin"] ||
					row["FRSC PIN"] ||
					"",
				fromAccount:
					(row["Source Account (wallet/contribution/equity)"] ||
						row["Source Account"] ||
						row["from_account"] ||
						row["source_account"] ||
						row["source"] ||
						""
					).toString().toLowerCase(),
				toAccount:
					(row["Destination Account (wallet/contribution/equity)"] ||
						row["Destination Account"] ||
						row["to_account"] ||
						row["destination_account"] ||
						row["destination"] ||
						""
					).toString().toLowerCase(),
				amount: row["Amount"] || row["amount"] || "",
				note: row["Note"] || row["Notes"] || row["note"] || row["notes"] || "",
			}))

			const validationErrors: string[] = []
			const validAccounts = ["wallet", "contribution", "equity", "equity_wallet"]
			mapped.forEach((item, index) => {
				if (!item.memberId) validationErrors.push(`Row ${index + 2}: Member identifier is required`)
				if (!item.fromAccount) validationErrors.push(`Row ${index + 2}: Source account is required`)
				if (!item.toAccount) validationErrors.push(`Row ${index + 2}: Destination account is required`)
				if (item.fromAccount && !validAccounts.includes(item.fromAccount)) {
					validationErrors.push(`Row ${index + 2}: Invalid source account '${item.fromAccount}'`)
				}
				if (item.toAccount && !validAccounts.includes(item.toAccount)) {
					validationErrors.push(`Row ${index + 2}: Invalid destination account '${item.toAccount}'`)
				}
				if (item.fromAccount && item.toAccount && item.fromAccount === item.toAccount) {
					validationErrors.push(`Row ${index + 2}: Source and destination must differ`)
				}
				if (!Number.isFinite(Number(item.amount)) || Number(item.amount) <= 0) {
					validationErrors.push(`Row ${index + 2}: Amount must be a valid number greater than 0`)
				}
			})

			setPreviewData(mapped)
			setErrors([...(result.errors || []), ...validationErrors])
		} catch (error: any) {
			setErrors([error?.message || "Error parsing file"])
		} finally {
			setParsing(false)
		}
	}

	const downloadTemplate = async () => {
		try {
			const response = await apiFetch<{ success: boolean; template: string; filename: string }>(
				"/admin/bulk/wallet-transfers/template"
			)
			if (!response.success) throw new Error("Failed to download template")
			const blob = new Blob([response.template], { type: "text/csv" })
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = response.filename || "wallet_transfers_upload_template.csv"
			a.click()
			window.URL.revokeObjectURL(url)
			sonnerToast.success("Template downloaded")
		} catch (error: any) {
			sonnerToast.error(error?.message || "Failed to download template")
		}
	}

	const handleUpload = async () => {
		if (!file) return
		setUploading(true)
		setUploadComplete(false)
		setUploadResult(null)
		setErrors([])
		try {
			const formData = new FormData()
			formData.append("file", file)
			const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
			const tenantSlug = localStorage.getItem("tenant_slug")
			const response = await fetch("/api/admin/bulk/wallet-transfers/upload", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
				},
				body: formData,
			})
			const result = await response.json()
			if (!response.ok) {
				setErrors(result?.errors || [result?.message || "Upload failed"])
				setUploadResult(result?.data || null)
				setUploadComplete(true)
				return
			}
			setUploadResult(result?.data || null)
			setUploadComplete(true)
			if (result?.has_errors) {
				setErrors(result?.data?.errors || [])
				sonnerToast.warning(result?.message || "Upload completed with errors")
			} else {
				sonnerToast.success(result?.message || "Upload completed")
			}
		} catch (error: any) {
			setErrors([error?.message || "Upload failed"])
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Bulk Upload Wallet Transfers</h1>
				<p className="text-muted-foreground">
					Upload member internal transfers. Identify members by member number, staff ID, IPPIS, FRSC PIN, or UUID.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Instructions</CardTitle>
					<CardDescription>Download template, fill rows, preview, then upload.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button variant="outline" onClick={downloadTemplate}>
						<Download className="h-4 w-4 mr-2" />
						Download CSV Template
					</Button>
					<div className="border-2 border-dashed rounded-lg p-8 text-center">
						<input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="wallet-transfer-file" disabled={parsing} />
						<label htmlFor="wallet-transfer-file" className={`cursor-pointer ${parsing ? "opacity-50 cursor-not-allowed" : ""}`}>
							<FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
							<p className="text-sm font-medium mb-2">{parsing ? "Parsing file..." : file ? file.name : "Click to upload CSV or Excel file"}</p>
							<p className="text-xs text-muted-foreground">CSV, XLSX, XLS up to 10MB</p>
						</label>
					</div>
				</CardContent>
			</Card>

			{errors.length > 0 && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<ul className="list-disc list-inside space-y-1">
							{errors.map((error, idx) => (
								<li key={idx} className="text-sm">{error}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{previewData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Preview ({previewData.length})</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="border rounded-lg overflow-auto max-h-96">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Member ID</TableHead>
										<TableHead>From</TableHead>
										<TableHead>To</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Note</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{previewData.map((row, idx) => (
										<TableRow key={idx}>
											<TableCell>{row.memberId}</TableCell>
											<TableCell>{row.fromAccount}</TableCell>
											<TableCell>{row.toAccount}</TableCell>
											<TableCell>₦{Number(row.amount || 0).toLocaleString()}</TableCell>
											<TableCell>{row.note || "—"}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
						<div className="flex justify-end gap-3 mt-6">
							<Button variant="outline" onClick={() => { setFile(null); setPreviewData([]); setErrors([]) }}>
								Cancel
							</Button>
							{canUpload && (
								<Button onClick={handleUpload} disabled={uploading || errors.length > 0 || parsing}>
									<Upload className="h-4 w-4 mr-2" />
									{uploading ? "Uploading..." : `Upload ${previewData.length} Transfers`}
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
							Upload Result
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div className="text-center p-4 bg-blue-50 rounded-lg">
								<div className="text-2xl font-bold text-blue-600">{uploadResult.total ?? 0}</div>
								<div className="text-sm text-blue-600">Total</div>
							</div>
							<div className="text-center p-4 bg-green-50 rounded-lg">
								<div className="text-2xl font-bold text-green-600">{uploadResult.successful ?? 0}</div>
								<div className="text-sm text-green-600">Successful</div>
							</div>
							<div className="text-center p-4 bg-red-50 rounded-lg">
								<div className="text-2xl font-bold text-red-600">{uploadResult.failed ?? 0}</div>
								<div className="text-sm text-red-600">Failed</div>
							</div>
						</div>
						<div className="flex justify-end">
							<Button variant="outline" onClick={() => { setFile(null); setPreviewData([]); setErrors([]); setUploadComplete(false); setUploadResult(null) }}>
								<X className="h-4 w-4 mr-2" />
								Start New Upload
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
