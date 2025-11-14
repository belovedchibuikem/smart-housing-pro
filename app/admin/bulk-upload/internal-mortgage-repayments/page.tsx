"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast as sonnerToast } from "sonner"
import { downloadInternalMortgageRepaymentTemplate, uploadBulkInternalMortgageRepayments } from "@/lib/api/client"

interface RepaymentData {
	planId: string
	amount: string
	principalPaid: string
	interestPaid: string
	dueDate: string
	paymentMethod: string
	notes?: string
}

export default function BulkUploadInternalMortgageRepaymentsPage() {
	const [file, setFile] = useState<File | null>(null)
	const [previewData, setPreviewData] = useState<RepaymentData[]>([])
	const [uploading, setUploading] = useState(false)
	const [uploadComplete, setUploadComplete] = useState(false)
	const [errors, setErrors] = useState<string[]>([])

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (selectedFile) {
			setFile(selectedFile)
			parseCSV(selectedFile)
		}
	}

	const parseCSV = (file: File) => {
		const reader = new FileReader()
		reader.onload = (e) => {
			const text = e.target?.result as string
			const lines = text.split("\n")
			const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

			const data: RepaymentData[] = []
			const parseErrors: string[] = []

			for (let i = 1; i < lines.length; i++) {
				if (lines[i].trim()) {
					const values = lines[i].split(",").map((v) => v.trim())
					if (values.length >= headers.length - 1) {
						const amount = Number.parseFloat(values[1] || "0")
						const principalPaid = Number.parseFloat(values[2] || "0")
						const interestPaid = Number.parseFloat(values[3] || "0")

						if (isNaN(amount) || amount <= 0) {
							parseErrors.push(`Line ${i + 1}: Invalid amount`)
						}
						if (isNaN(principalPaid) || principalPaid < 0) {
							parseErrors.push(`Line ${i + 1}: Invalid principal paid`)
						}
						if (isNaN(interestPaid) || interestPaid < 0) {
							parseErrors.push(`Line ${i + 1}: Invalid interest paid`)
						}
						if (Math.abs(principalPaid + interestPaid - amount) > 0.01) {
							parseErrors.push(`Line ${i + 1}: Principal + Interest must equal total amount`)
						}

						data.push({
							planId: values[0] || "",
							amount: values[1] || "0",
							principalPaid: values[2] || "0",
							interestPaid: values[3] || "0",
							dueDate: values[4] || "",
							paymentMethod: values[5] || "monthly",
							notes: values[6] || "",
						})
					} else {
						parseErrors.push(`Line ${i + 1}: Invalid number of columns`)
					}
				}
			}

			setPreviewData(data)
			setErrors(parseErrors)
		}
		reader.readAsText(file)
	}

	const handleDownloadTemplate = async () => {
		try {
			await downloadInternalMortgageRepaymentTemplate()
			sonnerToast.success("Template Downloaded", {
				description: "CSV template has been downloaded successfully.",
			})
		} catch (error: any) {
			sonnerToast.error("Download Failed", {
				description: error.message || "Failed to download template.",
			})
		}
	}

	const handleUpload = async () => {
		if (!file) return

		setUploading(true)
		setUploadComplete(false)

		try {
			const result = await uploadBulkInternalMortgageRepayments(file)

			if (result.success) {
				setUploadComplete(true)
				const successful = result.data?.successful ?? previewData.length
				const failed = result.data?.failed ?? 0
				sonnerToast.success("Upload Completed", {
					description: `Successfully processed ${successful} repayments. ${failed > 0 ? `${failed} failed.` : ""}`,
				})
			} else {
				throw new Error(result.message || "Upload failed")
			}
		} catch (error: any) {
			console.error("Error uploading repayments:", error)
			sonnerToast.error("Upload Failed", {
				description: error.message || "Failed to upload internal mortgage repayments. Please check the file format and try again.",
			})
		} finally {
			setUploading(false)
		}
	}

	const totalAmount = previewData.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)
	const totalPrincipal = previewData.reduce((sum, item) => sum + Number.parseFloat(item.principalPaid || "0"), 0)
	const totalInterest = previewData.reduce((sum, item) => sum + Number.parseFloat(item.interestPaid || "0"), 0)

	return (
		<div className="p-6 space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Bulk Upload Internal Mortgage Repayments</h1>
				<p className="text-muted-foreground">Upload multiple internal mortgage repayments at once using a CSV file</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Upload Instructions</CardTitle>
					<CardDescription>Follow these steps to upload internal mortgage repayments in bulk</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<h3 className="font-medium">Step 1: Download Template</h3>
						<Button variant="outline" onClick={handleDownloadTemplate}>
							<Download className="h-4 w-4 mr-2" />
							Download CSV Template
						</Button>
					</div>

					<div className="space-y-2">
						<h3 className="font-medium">Step 2: Fill in Repayment Data</h3>
						<ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
							<li>Plan ID must match existing active internal mortgage plans</li>
							<li>Amount must be a valid number (Principal + Interest)</li>
							<li>Principal Paid: Amount that counts toward property progress</li>
							<li>Interest Paid: Interest portion (does not count toward property progress)</li>
							<li>Due Date format: YYYY-MM-DD (e.g., 2025-01-15)</li>
							<li>Payment Method: monthly, yearly, or bi-yearly</li>
							<li>Notes: Optional additional information</li>
						</ul>
					</div>

					<div className="space-y-2">
						<h3 className="font-medium">Step 3: Upload CSV File</h3>
						<div className="border-2 border-dashed rounded-lg p-8 text-center">
							<input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload" />
							<label htmlFor="csv-upload" className="cursor-pointer">
								<FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p className="text-sm font-medium mb-2">{file ? file.name : "Click to upload CSV file"}</p>
								<p className="text-xs text-muted-foreground">CSV files only, max 5MB</p>
							</label>
						</div>
					</div>
				</CardContent>
			</Card>

			{errors.length > 0 && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<p className="font-medium mb-2">Errors found in CSV:</p>
						<ul className="list-disc list-inside space-y-1">
							{errors.map((error, index) => (
								<li key={index} className="text-sm">
									{error}
								</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{previewData.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>
							Preview Data ({previewData.length} repayments)
						</CardTitle>
						<CardDescription>
							Total Amount: ₦{totalAmount.toLocaleString()} • Principal: ₦{totalPrincipal.toLocaleString()} • Interest: ₦
							{totalInterest.toLocaleString()}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="border rounded-lg overflow-auto max-h-96">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Plan ID</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Principal</TableHead>
										<TableHead>Interest</TableHead>
										<TableHead>Due Date</TableHead>
										<TableHead>Frequency</TableHead>
										<TableHead>Notes</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{previewData.map((repayment, index) => (
										<TableRow key={index}>
											<TableCell className="font-mono text-xs">{repayment.planId}</TableCell>
											<TableCell>₦{Number.parseFloat(repayment.amount).toLocaleString()}</TableCell>
											<TableCell className="text-green-600">₦{Number.parseFloat(repayment.principalPaid).toLocaleString()}</TableCell>
											<TableCell className="text-muted-foreground">₦{Number.parseFloat(repayment.interestPaid).toLocaleString()}</TableCell>
											<TableCell>{repayment.dueDate}</TableCell>
											<TableCell className="capitalize">{repayment.paymentMethod}</TableCell>
											<TableCell className="text-xs max-w-xs truncate">{repayment.notes || "—"}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						<div className="flex justify-end gap-4 mt-6">
							<Button
								variant="outline"
								onClick={() => {
									setFile(null)
									setPreviewData([])
									setErrors([])
								}}
							>
								Cancel
							</Button>
							<Button onClick={handleUpload} disabled={uploading || errors.length > 0}>
								{uploading ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Uploading...
									</>
								) : (
									<>
										<Upload className="h-4 w-4 mr-2" />
										Upload {previewData.length} Repayments
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{uploadComplete && (
				<Alert>
					<CheckCircle2 className="h-4 w-4" />
					<AlertDescription>
						Successfully uploaded {previewData.length} internal mortgage repayments totaling ₦{totalAmount.toLocaleString()}.
					</AlertDescription>
				</Alert>
			)}
		</div>
	)
}

