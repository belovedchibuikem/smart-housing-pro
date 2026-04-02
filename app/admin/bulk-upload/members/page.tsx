"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { parseFile } from "@/lib/utils/file-parser"

type PreviewKind = "mandatory" | "optional_details"

interface MandatoryPreviewRow {
	kind: "mandatory"
	firstName: string
	lastName: string
	email: string
	phone: string
}

interface OptionalPreviewRow {
	kind: "optional_details"
	email: string
	ippis: string
	pin: string
	phone: string
	rank: string
	department: string
}

type PreviewRow = MandatoryPreviewRow | OptionalPreviewRow

function normHeaderKey(k: string): string {
	return k
		.toLowerCase()
		.trim()
		.replace(/_/g, " ")
}

function rowKeysNormalized(row: Record<string, unknown>): Set<string> {
	return new Set(Object.keys(row).map(normHeaderKey))
}

function cell(row: Record<string, unknown>, ...keys: string[]): string {
	for (const k of keys) {
		if (k in row && row[k] != null && String(row[k]).trim() !== "") {
			return String(row[k]).trim()
		}
	}
	return ""
}

export default function BulkUploadMembersPage() {
	const [file, setFile] = useState<File | null>(null)
	const [previewKind, setPreviewKind] = useState<PreviewKind | null>(null)
	const [previewData, setPreviewData] = useState<PreviewRow[]>([])
	const [uploading, setUploading] = useState(false)
	const [uploadComplete, setUploadComplete] = useState(false)
	const [errors, setErrors] = useState<string[]>([])
	const [uploadResult, setUploadResult] = useState<Record<string, unknown> | null>(null)
	const [parsing, setParsing] = useState(false)
	const { toast } = useToast()

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (!selectedFile) return
		setFile(selectedFile)
		setParsing(true)
		setErrors([])
		setPreviewData([])
		setPreviewKind(null)

		try {
			const result = await parseFile(selectedFile)
			const rows = result.data as Record<string, unknown>[]
			if (!rows.length) {
				setErrors(["No rows found in file."])
				return
			}

			const keys = rowKeysNormalized(rows[0])
			const isMandatory =
				keys.has("first name") &&
				keys.has("last name") &&
				keys.has("email") &&
				keys.has("phone") &&
				keys.size === 4
			const isOptional = keys.has("email") && !keys.has("first name")

			const validationErrors: string[] = [...result.errors]

			if (isMandatory) {
				const mapped: MandatoryPreviewRow[] = rows.map((row) => ({
					kind: "mandatory",
					firstName: cell(row, "First Name", "first_name", "first name"),
					lastName: cell(row, "Last Name", "last_name", "last name"),
					email: cell(row, "Email", "email"),
					phone: cell(row, "Phone", "phone"),
				}))
				mapped.forEach((m, i) => {
					if (!m.firstName) validationErrors.push(`Row ${i + 2}: First Name is required`)
					if (!m.lastName) validationErrors.push(`Row ${i + 2}: Last Name is required`)
					if (!m.email) validationErrors.push(`Row ${i + 2}: Email is required`)
					if (!m.phone) validationErrors.push(`Row ${i + 2}: Phone is required`)
				})
				setPreviewKind("mandatory")
				setPreviewData(mapped)
			} else if (isOptional) {
				const mapped: OptionalPreviewRow[] = rows.map((row) => ({
					kind: "optional_details",
					email: cell(row, "Email", "email"),
					ippis: cell(row, "IPPIS Number", "ippis_number"),
					pin: cell(row, "FRSC PIN", "frsc_pin", "PIN"),
					phone: cell(row, "Phone", "phone"),
					rank: cell(row, "Rank", "rank"),
					department: cell(row, "Department", "department"),
				}))
				mapped.forEach((m, i) => {
					if (!m.email) validationErrors.push(`Row ${i + 2}: Email is required`)
				})
				setPreviewKind("optional_details")
				setPreviewData(mapped)
			} else {
				validationErrors.push(
					"This file does not match either template. New members: exactly 4 columns (First Name, Last Name, Email, Phone). Additional details: use the details template starting with Email and no First Name column.",
				)
			}

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
		setPreviewData([])
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
					errorDescription = "Check file format and size (max 5MB on server)."
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
						"Use the mandatory 4-column file for new members, or the additional-details file (Email column, no First Name) for existing members."
				}

				if (errorMessages.length > 0) setErrors(errorMessages)
				else if (result.message) setErrors([result.message])
				else setErrors([errorDescription])

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
					Create members with a short mandatory file, then optionally add IPPIS, FRSC PIN, and employment
					fields in a second file matched by email.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>How it works</CardTitle>
					<CardDescription>Two steps — new members first, then optional details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<h3 className="font-medium">1. Mandatory file (new members)</h3>
						<p className="text-sm text-muted-foreground">
							Columns only: <strong>First Name</strong>, <strong>Last Name</strong>, <strong>Email</strong>
							, <strong>Phone</strong>. Cooperative <strong>Member ID</strong> (e.g. FSH0001) is assigned
							automatically using your{" "}
							<a className="underline" href="/admin/settings">
								Member ID prefix
							</a>{" "}
							in settings (default FSH).
						</p>
						<div className="flex flex-wrap gap-2">
							<Button type="button" variant="outline" onClick={() => downloadTemplate("mandatory")}>
								<Download className="h-4 w-4 mr-2" />
								CSV (mandatory)
							</Button>
							<Button type="button" variant="outline" onClick={() => downloadExcelTemplate("mandatory")}>
								<Download className="h-4 w-4 mr-2" />
								Excel (mandatory)
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="font-medium">2. Additional details (existing members, by email)</h3>
						<p className="text-sm text-muted-foreground">
							Start with <strong>Email</strong> (must match an existing user). Include any fields you need:{" "}
							<strong>IPPIS number</strong> (civil servants), <strong>FRSC PIN</strong> (FRSC staff), phone,
							dates, rank, department, address, etc. No First Name column — use this file after members
							exist.
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

			{previewData.length > 0 && previewKind && (
				<Card>
					<CardHeader>
						<CardTitle>
							Preview ({previewData.length}{" "}
							{previewKind === "mandatory" ? "new members" : "detail rows"})
						</CardTitle>
						<CardDescription>
							{previewKind === "mandatory"
								? "Creates accounts with auto Member ID"
								: "Updates existing profiles matched by email"}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="border rounded-lg overflow-auto max-h-96">
							<Table>
								<TableHeader>
									<TableRow>
										{previewKind === "mandatory" ? (
											<>
												<TableHead>Name</TableHead>
												<TableHead>Email</TableHead>
												<TableHead>Phone</TableHead>
											</>
										) : (
											<>
												<TableHead>Email</TableHead>
												<TableHead>IPPIS</TableHead>
												<TableHead>FRSC PIN</TableHead>
												<TableHead>Phone</TableHead>
												<TableHead>Department</TableHead>
												<TableHead>Rank</TableHead>
											</>
										)}
									</TableRow>
								</TableHeader>
								<TableBody>
									{previewKind === "mandatory"
										? (previewData as MandatoryPreviewRow[]).map((member, index) => (
												<TableRow key={index}>
													<TableCell>
														{member.firstName} {member.lastName}
													</TableCell>
													<TableCell>{member.email}</TableCell>
													<TableCell>{member.phone}</TableCell>
												</TableRow>
											))
										: (previewData as OptionalPreviewRow[]).map((row, index) => (
												<TableRow key={index}>
													<TableCell>{row.email}</TableCell>
													<TableCell>{row.ippis || "—"}</TableCell>
													<TableCell>{row.pin || "—"}</TableCell>
													<TableCell>{row.phone || "—"}</TableCell>
													<TableCell>{row.department || "—"}</TableCell>
													<TableCell>{row.rank || "—"}</TableCell>
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
										? `Create ${previewData.length} member(s)`
										: `Update ${previewData.length} row(s)`}
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
								<div className="max-h-64 overflow-y-auto bg-red-50 p-3 rounded-lg">
									<ul className="list-disc list-inside space-y-1">
										{(uploadResult.errors as string[]).slice(0, 50).map((err, index) => (
											<li key={index} className="text-sm text-red-700">
												{err}
											</li>
										))}
									</ul>
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
