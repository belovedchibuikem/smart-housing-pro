"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast as sonnerToast } from "sonner"
import { downloadMortgageRepaymentTemplate } from "@/lib/api/client"
import { parseFile } from "@/lib/utils/file-parser"

interface RepaymentData {
	mortgageId: string
	amount: string
	principalPaid: string
	interestPaid: string
	dueDate: string
	paymentMethod: string
	notes?: string
}

export default function BulkUploadMortgageRepaymentsPage() {
	const [file, setFile] = useState<File | null>(null)
	const [previewData, setPreviewData] = useState<RepaymentData[]>([])
	const [uploading, setUploading] = useState(false)
	const [uploadComplete, setUploadComplete] = useState(false)
	const [errors, setErrors] = useState<string[]>([])
	const [uploadResult, setUploadResult] = useState<any>(null)
	const [parsing, setParsing] = useState(false)

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0]
		if (selectedFile) {
			setFile(selectedFile)
			setParsing(true)
			setErrors([])
			setPreviewData([])
			
			try {
				const result = await parseFile(selectedFile)
				
				// Map parsed data to repayment format
				const mappedData = result.data.map((row: any) => ({
					mortgageId: row['Mortgage ID'] || row['mortgageId'] || row['mortgage_id'] || '',
					amount: row['Amount'] || row['amount'] || '',
					principalPaid: row['Principal Paid'] || row['principalPaid'] || row['principal_paid'] || '',
					interestPaid: row['Interest Paid'] || row['interestPaid'] || row['interest_paid'] || '',
					dueDate: row['Due Date'] || row['dueDate'] || row['due_date'] || '',
					paymentMethod: row['Payment Method'] || row['paymentMethod'] || row['payment_method'] || 'monthly',
					notes: row['Notes'] || row['notes'] || '',
				}))
				
				// Validate required fields
				const validationErrors: string[] = []
				mappedData.forEach((repayment, index) => {
					if (!repayment.mortgageId) validationErrors.push(`Row ${index + 2}: Mortgage ID is required`)
					if (!repayment.amount) validationErrors.push(`Row ${index + 2}: Amount is required`)
					const amount = parseFloat(repayment.amount)
					const principalPaid = parseFloat(repayment.principalPaid || '0')
					const interestPaid = parseFloat(repayment.interestPaid || '0')
					
					if (isNaN(amount) || amount <= 0) {
						validationErrors.push(`Row ${index + 2}: Amount must be a valid positive number`)
					}
					if (isNaN(principalPaid) || principalPaid < 0) {
						validationErrors.push(`Row ${index + 2}: Principal Paid must be a valid non-negative number`)
					}
					if (isNaN(interestPaid) || interestPaid < 0) {
						validationErrors.push(`Row ${index + 2}: Interest Paid must be a valid non-negative number`)
					}
					if (Math.abs(principalPaid + interestPaid - amount) > 0.01) {
						validationErrors.push(`Row ${index + 2}: Principal + Interest must equal total amount`)
					}
					if (!repayment.dueDate) validationErrors.push(`Row ${index + 2}: Due Date is required`)
				})
				
				setPreviewData(mappedData)
				setErrors([...result.errors, ...validationErrors])
			} catch (error) {
				setErrors([`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`])
			} finally {
				setParsing(false)
			}
		}
	}

	const handleDownloadTemplate = async () => {
		try {
			await downloadMortgageRepaymentTemplate()
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
		setErrors([])

		try {
			const formData = new FormData()
			formData.append('file', file)

			const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
			const tenantSlug = localStorage.getItem('tenant_slug')
			
			const response = await fetch('/api/admin/bulk/mortgage-repayments/upload', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					...(tenantSlug && { 'X-Tenant-Slug': tenantSlug }),
				},
				body: formData,
			})

			const result = await response.json()

			if (!response.ok) {
				const errorMessages = result.errors || []
				const errorType = result.error_type || 'unknown_error'
				
				let errorTitle = 'Upload Failed'
				let errorDescription = result.message || 'Failed to upload mortgage repayments'
				
				if (errorType === 'file_validation') {
					errorTitle = 'File Validation Failed'
					errorDescription = 'The uploaded file does not meet the requirements. Please check the file format and size.'
				} else if (errorType === 'parsing_error') {
					errorTitle = 'File Parsing Failed'
					errorDescription = 'Unable to read the file. Please ensure it is a valid CSV or Excel file.'
				} else if (errorType === 'data_validation') {
					errorTitle = 'Data Validation Errors'
					errorDescription = `Found ${result.error_count || errorMessages.length} validation error(s) in the file. Please fix the errors and try again.`
				} else if (errorType === 'processing_error') {
					errorTitle = 'Processing Failed'
					errorDescription = 'All mortgage repayment records failed to process. Please check the error details below.'
				} else if (errorType === 'empty_data') {
					errorTitle = 'Empty File'
					errorDescription = 'The file contains no valid mortgage repayment data.'
				}

				if (errorMessages.length > 0) {
					setErrors(errorMessages)
				} else if (result.message) {
					setErrors([result.message])
				} else {
					setErrors([errorDescription])
				}

				sonnerToast.error(errorTitle, {
					description: errorDescription,
				})

				if (result.data) {
					setUploadResult(result.data)
					setUploadComplete(true)
				}

				return
			}

			if (!result.success) {
				const errorMessages = result.errors || []
				if (errorMessages.length > 0) {
					setErrors(errorMessages)
				}

				if (result.data) {
					setUploadResult(result.data)
					setUploadComplete(true)
				}

				sonnerToast.warning(result.has_errors ? "Upload Completed with Errors" : "Upload Failed", {
					description: result.message || 'Upload completed with some issues',
				})
				return
			}

			setUploadComplete(true)
			const successful = result.data?.successful ?? previewData.length
			const failed = result.data?.failed ?? 0
			
			if (failed > 0) {
				const errorMessages = result.data?.errors || []
				if (errorMessages.length > 0) {
					setErrors(errorMessages)
				}
				
				sonnerToast.warning("Upload Completed with Errors", {
					description: `Successfully processed ${successful} repayments. ${failed} failed.`,
				})
			} else {
				sonnerToast.success("Upload Completed", {
					description: `Successfully processed ${successful} repayment(s).`,
				})
			}
		} catch (error: any) {
			console.error("Error uploading repayments:", error)
			const errorMessage = error.message || "Failed to upload mortgage repayments. Please try again."
			setErrors([errorMessage])
			
			sonnerToast.error("Upload Failed", {
				description: errorMessage,
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
				<h1 className="text-3xl font-bold">Bulk Upload Mortgage Repayments</h1>
				<p className="text-muted-foreground">Upload multiple mortgage repayments at once using a CSV file</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Upload Instructions</CardTitle>
					<CardDescription>Follow these steps to upload mortgage repayments in bulk</CardDescription>
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
							<li>Mortgage ID must match existing approved/active mortgages</li>
							<li>Amount must be a valid number (Principal + Interest)</li>
							<li>Principal Paid: Amount that counts toward property progress</li>
							<li>Interest Paid: Interest portion (does not count toward property progress)</li>
							<li>Due Date format: YYYY-MM-DD (e.g., 2025-01-15)</li>
							<li>Payment Method: monthly, yearly, or bi-yearly</li>
							<li>Notes: Optional additional information</li>
						</ul>
					</div>

					<div className="space-y-2">
						<h3 className="font-medium">Step 3: Upload File</h3>
						<div className="border-2 border-dashed rounded-lg p-8 text-center">
							<input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="csv-upload" disabled={parsing} />
							<label htmlFor="csv-upload" className={`cursor-pointer ${parsing ? 'opacity-50 cursor-not-allowed' : ''}`}>
								<FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
								<p className="text-sm font-medium mb-2">
									{parsing ? 'Parsing file...' : file ? file.name : "Click to upload CSV or Excel file"}
								</p>
								<p className="text-xs text-muted-foreground">CSV, XLSX, or XLS files only, max 10MB</p>
							</label>
						</div>
					</div>
				</CardContent>
			</Card>

			{parsing && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>Parsing file, please wait...</AlertDescription>
				</Alert>
			)}

			{errors.length > 0 && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<p className="font-medium mb-2">Errors found in file:</p>
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
										<TableHead>Mortgage ID</TableHead>
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
											<TableCell className="font-mono text-xs">{repayment.mortgageId}</TableCell>
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
							<Button onClick={handleUpload} disabled={uploading || errors.length > 0 || parsing}>
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
						Successfully uploaded {previewData.length} mortgage repayments totaling ₦{totalAmount.toLocaleString()}.
					</AlertDescription>
				</Alert>
			)}
		</div>
	)
}

