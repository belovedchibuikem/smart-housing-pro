"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { parseFile } from "@/lib/utils/file-parser"

type PreviewKind = "mandatory" | "optional_details"

interface FieldConfig {
	success?: boolean
	mandatory_file_headers: string[]
	required_new_member_file_headers: string[]
	additional_details_headers: string[]
}

interface BulkErrorRow {
	line: number | null
	name?: string
	message: string
	code?: string
}

function normHeaderKey(k: string): string {
	return k
		.toLowerCase()
		.trim()
		.replace(/_/g, " ")
}

function sortedCanonicalFromHeaders(headers: string[]): string {
	return [...new Set(headers.map(normHeaderKey).filter(Boolean))].sort().join("|")
}

function getCellByHeader(row: Record<string, unknown>, header: string): string {
	const target = normHeaderKey(header)
	for (const k of Object.keys(row)) {
		if (normHeaderKey(k) === target) {
			const v = row[k]
			if (v != null && String(v).trim() !== "") return String(v).trim()
		}
	}
	return ""
}

function detectKind(
	fileHeaderKeys: string[],
	config: FieldConfig | null,
): PreviewKind | null {
	const keysNorm = new Set(fileHeaderKeys.map(normHeaderKey).filter(Boolean))

	if (config?.mandatory_file_headers?.length && config?.additional_details_headers?.length) {
		const expM = sortedCanonicalFromHeaders(config.mandatory_file_headers)
		const got = sortedCanonicalFromHeaders(fileHeaderKeys)
		if (expM === got) {
			return "mandatory"
		}
		if (!keysNorm.has(normHeaderKey("Email")) || keysNorm.has(normHeaderKey("First Name"))) {
			return null
		}
		const allowed = new Set(config.additional_details_headers.map(normHeaderKey))
		for (const k of keysNorm) {
			if (!allowed.has(k)) {
				return null
			}
		}
		return "optional_details"
	}

	// Fallback (before config loads): match default new-members template (no extra mandatory profile columns)
	const fallbackMandatoryExpected = sortedCanonicalFromHeaders([
		"First Name",
		"Last Name",
		"Email",
		"Phone",
		"IPPIS Number",
		"FRSC PIN",
	])
	if (sortedCanonicalFromHeaders(fileHeaderKeys) === fallbackMandatoryExpected) {
		return "mandatory"
	}
	if (keysNorm.has("email") && !keysNorm.has("first name")) {
		return "optional_details"
	}
	return null
}

export default function BulkUploadMembersPage() {
	const [file, setFile] = useState<File | null>(null)
	const [fieldConfig, setFieldConfig] = useState<FieldConfig | null>(null)
	const [previewKind, setPreviewKind] = useState<PreviewKind | null>(null)
	const [previewColumns, setPreviewColumns] = useState<string[]>([])
	const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([])
	const [uploading, setUploading] = useState(false)
	const [uploadComplete, setUploadComplete] = useState(false)
	const [errors, setErrors] = useState<string[]>([])
	const [uploadResult, setUploadResult] = useState<Record<string, unknown> | null>(null)
	const [parsing, setParsing] = useState(false)
	const { toast } = useToast()

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
				const tenantSlug = localStorage.getItem("tenant_slug")
				const res = await fetch("/api/bulk/members/field-config", {
					headers: {
						Authorization: `Bearer ${token}`,
						...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
					},
				})
				const data = await res.json()
				if (!cancelled && data?.success && data.mandatory_file_headers && data.additional_details_headers) {
					setFieldConfig({
						mandatory_file_headers: data.mandatory_file_headers,
						required_new_member_file_headers: Array.isArray(data.required_new_member_file_headers)
							? data.required_new_member_file_headers
							: ["First Name", "Last Name"],
						additional_details_headers: data.additional_details_headers,
					})
				}
			} catch {
				// templates still work with API defaults on download
			}
		})()
		return () => {
			cancelled = true
		}
	}, [])

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (!selectedFile) return
		setFile(selectedFile)
		setParsing(true)
		setErrors([])
		setPreviewRows([])
		setPreviewColumns([])
		setPreviewKind(null)

		try {
			let cfg = fieldConfig
			if (!cfg?.mandatory_file_headers?.length) {
				try {
					const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
					const tenantSlug = localStorage.getItem("tenant_slug")
					const res = await fetch("/api/bulk/members/field-config", {
						headers: {
							Authorization: `Bearer ${token}`,
							...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
						},
					})
					const data = await res.json()
					if (data?.success && data.mandatory_file_headers && data.additional_details_headers) {
						cfg = {
							mandatory_file_headers: data.mandatory_file_headers,
							required_new_member_file_headers: Array.isArray(data.required_new_member_file_headers)
								? data.required_new_member_file_headers
								: ["First Name", "Last Name"],
							additional_details_headers: data.additional_details_headers,
						}
						setFieldConfig(cfg)
					}
				} catch {
					// detectKind fallback
				}
			}

			const result = await parseFile(selectedFile)
			const rows = result.data as Record<string, unknown>[]
			if (!rows.length) {
				setErrors(["No rows found in file."])
				return
			}

			const fileKeys = Object.keys(rows[0] || {})
			const kind = detectKind(fileKeys, cfg)
			const validationErrors: string[] = [...result.errors]

			if (kind === "mandatory") {
				const requiredHeaders =
					cfg?.required_new_member_file_headers?.length &&
					Array.isArray(cfg.required_new_member_file_headers)
						? cfg.required_new_member_file_headers
						: ["First Name", "Last Name"]
				rows.forEach((row, i) => {
					const line = i + 2
					for (const h of requiredHeaders) {
						if (!getCellByHeader(row, h)) {
							validationErrors.push(`Row ${line}: ${h} is required`)
						}
					}
					const em = getCellByHeader(row, "Email")
					if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
						validationErrors.push(`Row ${line}: Invalid email`)
					}
				})
			} else if (kind === "optional_details") {
				rows.forEach((row, i) => {
					if (!getCellByHeader(row, "Email")) {
						validationErrors.push(`Row ${i + 2}: Email is required`)
					}
				})
			} else {
				validationErrors.push(
					"This file does not match your cooperative’s bulk templates. Download the CSV/Excel templates again after checking Bulk member fields in System Settings.",
				)
			}

			const displayRows: Record<string, string>[] = rows.map((row) => {
				const r: Record<string, string> = {}
				for (const k of fileKeys) {
					const v = row[k]
					r[k] = v != null ? String(v).trim() : ""
				}
				return r
			})

			setPreviewColumns(fileKeys)
			setPreviewRows(displayRows)
			setPreviewKind(kind)
			setErrors(validationErrors)
		} catch (error) {
			setErrors([`Error parsing file: ${error instanceof Error ? error.message : "Unknown error"}`])
		} finally {
			setParsing(false)
		}
	}

	const downloadTemplate = async (type: "mandatory" | "optional_details") => {
		try {
			const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
			const tenantSlug = localStorage.getItem("tenant_slug")

			const response = await fetch(`/api/bulk/members/template?type=${encodeURIComponent(type)}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
				},
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ message: "Failed to download template" }))
				throw new Error(errorData.message || errorData.error || "Failed to download template")
			}

			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download =
				type === "mandatory" ? "members_mandatory_template.csv" : "members_additional_details_template.csv"
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			window.URL.revokeObjectURL(url)

			toast({
				title: "Template downloaded",
				description: "Check your downloads folder.",
			})
		} catch (error) {
			console.error("Template download error:", error)
			toast({
				title: "Download failed",
				description: error instanceof Error ? error.message : "Please try again.",
				variant: "destructive",
			})
		}
	}

	const downloadExcelTemplate = async (type: "mandatory" | "optional_details") => {
		try {
			const token = localStorage.getItem("auth_token") || localStorage.getItem("token")
			const tenantSlug = localStorage.getItem("tenant_slug")
			const response = await fetch(
				`/api/bulk/members/excel-template?type=${encodeURIComponent(type)}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
					},
				},
			)

			if (!response.ok) throw new Error("Failed to download Excel template")

			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download =
				type === "mandatory"
					? "members_mandatory_template.xlsx"
					: "members_additional_details_template.xlsx"
			a.click()
			window.URL.revokeObjectURL(url)

			toast({
				title: "Excel template downloaded",
				description: "Check your downloads folder.",
			})
		} catch {
			toast({
				title: "Download failed",
				description: "Could not download Excel template.",
				variant: "destructive",
			})
		}
	}

	const resetPreview = () => {
		setFile(null)
		setPreviewRows([])
		setPreviewColumns([])
		setPreviewKind(null)
		setErrors([])
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

			const response = await fetch("/api/bulk/members/upload", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					...(tenantSlug && { "X-Tenant-Slug": tenantSlug }),
				},
				body: formData,
			})

			const result = await response.json()

			if (!response.ok) {
				const errorMessages: string[] = result.errors || []
				const errorType = result.error_type || "unknown_error"

				let errorTitle = "Upload failed"
				let errorDescription = result.message || "Failed to upload"

				if (errorType === "file_validation") {
					errorTitle = "File validation failed"
					errorDescription = "Check file format and size (max 10MB on server)."
				} else if (errorType === "parsing_error") {
					errorTitle = "Could not read file"
				} else if (errorType === "data_validation") {
					errorTitle = "Validation errors"
					errorDescription = `Found ${result.error_count || errorMessages.length} issue(s) in the file.`
				} else if (errorType === "processing_error") {
					errorTitle = "Processing failed"
				} else if (errorType === "empty_data") {
					errorTitle = "Empty file"
				} else if (errorType === "template_mismatch") {
					errorTitle = "Wrong template"
					errorDescription =
						"Columns must match the downloaded templates for your cooperative (see Bulk member fields in settings)."
				}

				const dataObj =
					result.data && typeof result.data === "object"
						? (result.data as Record<string, unknown>)
						: null
				const rawErrorRows: BulkErrorRow[] = [
					...(Array.isArray(result.error_rows) ? (result.error_rows as BulkErrorRow[]) : []),
					...(Array.isArray(dataObj?.error_rows) ? (dataObj.error_rows as BulkErrorRow[]) : []),
				]
				const structured = rawErrorRows
					.filter((r) => r.line != null && r.message)
					.map(
						(r) =>
							`Line ${r.line}${r.name ? ` (${r.name})` : ""}: ${r.message}${r.code ? ` [${r.code}]` : ""}`,
					)
				const merged =
					errorMessages.length > 0
						? errorMessages
						: structured.length > 0
							? structured
							: result.message
								? [String(result.message)]
								: [errorDescription]
				setErrors(merged)

				toast({
					title: errorTitle,
					description: errorDescription,
					variant: "destructive",
				})

				if (result.data) {
					setUploadResult(result.data)
					setUploadComplete(true)
				}
				return
			}

			if (!result.success) {
				const errorMessages: string[] = result.errors || []
				if (errorMessages.length > 0) setErrors(errorMessages)
				if (result.data) {
					setUploadResult(result.data)
					setUploadComplete(true)
				}
				toast({
					title: result.has_errors ? "Completed with errors" : "Upload failed",
					description: result.message || "",
					variant: result.has_errors ? "default" : "destructive",
				})
				return
			}

			setUploadResult(result.data)
			setUploadComplete(true)

			const successCount = result.data?.successful || 0
			const failedCount = result.data?.failed || 0

			if (failedCount > 0) {
				const errorMessages: string[] = result.data?.errors || []
				if (errorMessages.length > 0) setErrors(errorMessages)
				toast({
					title: "Completed with errors",
					description: `${successCount} ok, ${failedCount} failed.`,
				})
			} else {
				toast({
					title: "Upload successful",
					description: `${successCount} row(s) processed.`,
				})
			}
		} catch (error) {
			console.error("Upload error:", error)
			const errorMessage = error instanceof Error ? error.message : "Upload failed."
			setErrors([errorMessage])
			toast({
				title: "Upload failed",
				description: errorMessage,
				variant: "destructive",
			})
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Bulk upload members</h1>
				<p className="text-muted-foreground">
					Two files: create new members (columns depend on your{" "}
					<a className="underline" href="/admin/settings">
						Bulk member field rules
					</a>
					), then add remaining profile data by email. Cooperative Member IDs are assigned automatically.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>How it works</CardTitle>
					<CardDescription>New members first, then additional details — same flow as before</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<h3 className="font-medium">1. Mandatory file (new members)</h3>
						<p className="text-sm text-muted-foreground">
							Always includes <strong>First Name</strong> and <strong>Last Name</strong> (required),{" "}
							<strong>Email</strong> and <strong>Phone</strong> (optional—leave blank if unknown), plus any fields
							your admin marked <em>Mandatory</em> for bulk upload in
							settings. All of those columns are required in each row.
						</p>
						<div className="flex flex-wrap gap-2">
							<Button type="button" variant="outline" onClick={() => downloadTemplate("mandatory")}>
								<Download className="h-4 w-4 mr-2" />
								CSV (new members)
							</Button>
							<Button type="button" variant="outline" onClick={() => downloadExcelTemplate("mandatory")}>
								<Download className="h-4 w-4 mr-2" />
								Excel (new members)
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="font-medium">2. Additional details (existing members, by email)</h3>
						<p className="text-sm text-muted-foreground">
							<strong>Email</strong> plus <strong>Phone</strong> (optional corrections) and every field marked{" "}
							<em>Optional</em> in settings. No <strong>First Name</strong> column. Use after members exist.
						</p>
						<div className="flex flex-wrap gap-2">
							<Button type="button" variant="outline" onClick={() => downloadTemplate("optional_details")}>
								<Download className="h-4 w-4 mr-2" />
								CSV (details)
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => downloadExcelTemplate("optional_details")}
							>
								<Download className="h-4 w-4 mr-2" />
								Excel (details)
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="font-medium">3. Upload</h3>
						<div className="border-2 border-dashed rounded-lg p-8 text-center">
							<input
								type="file"
								accept=".csv,.xlsx,.xls"
								onChange={handleFileChange}
								className="hidden"
								id="file-upload"
								disabled={parsing}
							/>
							<label
								htmlFor="file-upload"
								className={`cursor-pointer ${parsing ? "opacity-50 cursor-not-allowed" : ""}`}
							>
								<FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p className="text-sm font-medium mb-2">
									{parsing ? "Parsing…" : file ? file.name : "Click to upload CSV or Excel"}
								</p>
								<p className="text-xs text-muted-foreground">CSV, XLSX, or XLS (max size per server limit)</p>
							</label>
						</div>
					</div>
				</CardContent>
			</Card>

			{errors.length > 0 && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<p className="font-medium mb-2">{uploadComplete ? "Processing issues:" : "Fix these issues:"}</p>
						<div className="max-h-64 overflow-y-auto">
							<ul className="list-disc list-inside space-y-1">
								{errors.map((error, index) => (
									<li key={index} className="text-sm">
										{error}
									</li>
								))}
							</ul>
						</div>
					</AlertDescription>
				</Alert>
			)}

			{parsing && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Parsing file…</AlertDescription>
				</Alert>
			)}

			{previewRows.length > 0 && previewKind && (
				<Card>
					<CardHeader>
						<CardTitle>
							Preview ({previewRows.length}{" "}
							{previewKind === "mandatory" ? "new members" : "detail rows"})
						</CardTitle>
						<CardDescription>
							{previewKind === "mandatory"
								? "Creates accounts; required columns match your mandatory file template"
								: "Updates existing profiles matched by email"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="border rounded-lg overflow-auto max-h-96">
							<Table>
								<TableHeader>
									<TableRow>
										{previewColumns.map((col) => (
											<TableHead key={col} className="whitespace-nowrap">
												{col}
											</TableHead>
										))}
									</TableRow>
								</TableHeader>
								<TableBody>
									{previewRows.map((row, index) => (
										<TableRow key={index}>
											{previewColumns.map((col) => (
												<TableCell key={col} className="max-w-[200px] truncate">
													{row[col] || "—"}
												</TableCell>
											))}
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<div className="flex justify-end gap-4 mt-6">
							<Button variant="outline" type="button" onClick={resetPreview}>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={handleUpload}
								disabled={uploading || errors.length > 0 || parsing}
							>
								<Upload className="h-4 w-4 mr-2" />
								{uploading
									? "Uploading…"
									: previewKind === "mandatory"
										? `Create ${previewRows.length} member(s)`
										: `Update ${previewRows.length} row(s)`}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{uploadComplete && uploadResult && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5 text-green-600" />
							Upload complete
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div className="text-center p-4 bg-blue-50 rounded-lg">
								<div className="text-2xl font-bold text-blue-600">{String(uploadResult.total)}</div>
								<div className="text-sm text-blue-600">Total</div>
							</div>
							<div className="text-center p-4 bg-green-50 rounded-lg">
								<div className="text-2xl font-bold text-green-600">{String(uploadResult.successful)}</div>
								<div className="text-sm text-green-600">Successful</div>
							</div>
							<div className="text-center p-4 bg-red-50 rounded-lg">
								<div className="text-2xl font-bold text-red-600">{String(uploadResult.failed)}</div>
								<div className="text-sm text-red-600">Failed</div>
							</div>
						</div>

						{Array.isArray(uploadResult.errors) && uploadResult.errors.length > 0 && (
							<div className="border-t pt-4">
								<h4 className="font-medium text-red-600 mb-2">
									Errors ({uploadResult.errors.length})
								</h4>
								<div className="max-h-72 overflow-y-auto bg-red-50 p-3 rounded-lg">
									<ul className="list-disc list-inside space-y-1">
										{(uploadResult.errors as string[]).map((err, index) => (
											<li key={index} className="text-sm text-red-700 break-words">
												{err}
											</li>
										))}
									</ul>
								</div>
							</div>
						)}

						{Array.isArray(uploadResult.error_rows) &&
							(uploadResult.error_rows as BulkErrorRow[]).length > 0 && (
								<div className="border-t pt-4">
									<h4 className="font-medium text-red-600 mb-2">Error detail by row</h4>
									<div className="max-h-80 overflow-auto border rounded-md">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="w-20">Line</TableHead>
													<TableHead>Name</TableHead>
													<TableHead>Issue</TableHead>
													<TableHead className="w-36">Type</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{(uploadResult.error_rows as BulkErrorRow[]).map((r, index) => (
													<TableRow key={index}>
														<TableCell className="font-mono">
															{r.line != null ? r.line : "—"}
														</TableCell>
														<TableCell className="max-w-[140px] truncate" title={r.name}>
															{r.name || "—"}
														</TableCell>
														<TableCell className="text-sm text-red-800 max-w-md break-words">
															{r.message}
														</TableCell>
														<TableCell className="text-xs text-muted-foreground whitespace-nowrap">
															{r.code || "—"}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</div>
							)}

						<div className="flex justify-end">
							<Button
								type="button"
								onClick={() => {
									resetPreview()
									setUploadComplete(false)
									setUploadResult(null)
								}}
								variant="outline"
							>
								<X className="h-4 w-4 mr-2" />
								Start over
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
