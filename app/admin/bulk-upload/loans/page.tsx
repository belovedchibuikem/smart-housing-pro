"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, apiFetchBlob } from "@/lib/api/client"
import { parseFile } from "@/lib/utils/file-parser"

export default function BulkUploadLoansPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [parsing, setParsing] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setParsing(true)
      setErrors([])
      setPreviewData([])
      
      try {
        const result = await parseFile(selectedFile)

        const cell = (row: Record<string, unknown>, keys: string[]) => {
          for (const key of keys) {
            const v = row[key]
            if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim()
          }
          return ""
        }

        const mappedData = result.data.map((row: Record<string, unknown>) => ({
          member_id: cell(row, ["member_id", "Member ID", "member number", "member_number"]),
          loan_amount: cell(row, ["loan_amount", "Loan Amount", "principal"]),
          interest_rate: cell(row, ["interest_rate", "Interest Rate", "rate"]),
          loan_tenure: cell(row, ["loan_tenure", "loan tenure", "tenure", "duration months", "Duration"]),
          disbursement_date: cell(row, ["disbursement_date", "disbursement date", "Disbursement Date"]),
          due_date: cell(row, ["due_date", "due date", "Due Date"]),
          repayment_schedule: cell(row, ["repayment_schedule", "schedule", "Repayment Schedule"]),
          amount_repaid: cell(row, ["amount_repaid", "amount repaid", "Amount Repaid"]),
          loan_purpose: cell(row, ["loan_purpose", "purpose", "loan purpose", "Loan Purpose"]),
          loan_status: cell(row, ["loan_status", "status", "Loan Status"]),
          collateral: cell(row, ["collateral", "Collateral"]),
        }))

        const validationErrors: string[] = []
        mappedData.forEach((loan, index) => {
          if (!loan.member_id) validationErrors.push(`Row ${index + 2}: member_id is required`)
          if (!loan.loan_amount) validationErrors.push(`Row ${index + 2}: loan_amount is required`)
          if (loan.loan_amount && Number.isNaN(Number(loan.loan_amount.replace(/,/g, ""))))
            validationErrors.push(`Row ${index + 2}: loan_amount must be numeric`)
        })

        setPreviewData(mappedData)
        setErrors([...(result.errors ?? []), ...validationErrors])
      } catch (error) {
        setErrors([`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`])
      } finally {
        setParsing(false)
      }
    }
  }

  const downloadTemplate = async () => {
    const triggerCsvDownload = (content: string, filename: string) => {
      const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    }

    try {
      const blob = await apiFetchBlob("/admin/bulk/loans/template?format=file")
      const text = await blob.text()
      if (text.trimStart().startsWith("{")) {
        const parsed = JSON.parse(text) as { success?: boolean; template?: string; filename?: string }
        if (parsed?.template) {
          triggerCsvDownload(parsed.template, parsed.filename || "loans_upload_template.csv")
        }
      } else {
        triggerCsvDownload(text, "loans_upload_template.csv")
      }

      toast({
        title: "Template Downloaded",
        description: "CSV template has been downloaded successfully.",
      })
    } catch (error) {
      try {
        const response = await apiFetch<{ success: boolean; template: string; filename: string }>(
          "/admin/bulk/loans/template",
        )

        if (!response.success) {
          throw new Error("Failed to download template")
        }

        const blob = new Blob([response.template], { type: "text/csv" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = response.filename || "loans_upload_template.csv"
        a.click()
        window.URL.revokeObjectURL(url)

        toast({
          title: "Template Downloaded",
          description: "CSV template has been downloaded successfully.",
        })
      } catch {
        toast({
          title: "Download Failed",
          description: error instanceof Error ? error.message : "Failed to download template. Please try again.",
          variant: "destructive",
        })
      }
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
      formData.append('file', file)

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const tenantSlug = localStorage.getItem('tenant_slug')
      
      const response = await fetch('/api/admin/bulk/loans/upload', {
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
        let errorDescription = result.message || 'Failed to upload loans'
        
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
          errorDescription = 'All loan records failed to process. Please check the error details below.'
        } else if (errorType === 'empty_data') {
          errorTitle = 'Empty File'
          errorDescription = 'The file contains no valid loan data.'
        }

        if (errorMessages.length > 0) {
          setErrors(errorMessages)
        } else if (result.message) {
          setErrors([result.message])
        } else {
          setErrors([errorDescription])
        }

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
        const errorMessages = result.errors || []
        if (errorMessages.length > 0) {
          setErrors(errorMessages)
        }

        if (result.data) {
          setUploadResult(result.data)
          setUploadComplete(true)
        }

        toast({
          title: result.has_errors ? "Upload Completed with Errors" : "Upload Failed",
          description: result.message || 'Upload completed with some issues',
          variant: result.has_errors ? "default" : "destructive",
        })
        return
      }

      setUploadResult(result.data)
      setUploadComplete(true)
      
      const successCount = result.data?.successful || 0
      const failedCount = result.data?.failed || 0
      
      if (failedCount > 0) {
        const errorMessages = result.data?.errors || []
        if (errorMessages.length > 0) {
          setErrors(errorMessages)
        }
        
        toast({
          title: "Upload Completed with Errors",
          description: `Successfully processed ${successCount} loans. ${failedCount} failed.`,
        })
      } else {
        toast({
          title: "Upload Successful",
          description: `Successfully processed ${successCount} loan(s).`,
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload loans. Please try again."
      setErrors([errorMessage])
      
      toast({
        title: "Upload Failed",
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
        <h1 className="text-3xl font-bold">Bulk Upload Loans</h1>
        <p className="text-muted-foreground">Upload multiple loans at once using a CSV file</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>Follow these steps to upload loans in bulk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Step 1: Download Template</h3>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Step 2: Fill in Loan Data</h3>
            <p className="text-sm text-muted-foreground">
              Open the template and fill in the loan details
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Step 3: Upload File</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="file-upload" disabled={parsing} />
              <label htmlFor="file-upload" className={`cursor-pointer ${parsing ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Data ({previewData.length} rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>member_id</TableHead>
                    <TableHead>loan_amount</TableHead>
                    <TableHead>interest_rate</TableHead>
                    <TableHead>loan_tenure</TableHead>
                    <TableHead>disbursement</TableHead>
                    <TableHead>due</TableHead>
                    <TableHead>schedule</TableHead>
                    <TableHead>status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((loan, index) => (
                    <TableRow key={index}>
                      <TableCell>{loan.member_id}</TableCell>
                      <TableCell>{loan.loan_amount}</TableCell>
                      <TableCell>{loan.interest_rate}</TableCell>
                      <TableCell>{loan.loan_tenure}</TableCell>
                      <TableCell>{loan.disbursement_date}</TableCell>
                      <TableCell>{loan.due_date}</TableCell>
                      <TableCell>{loan.repayment_schedule}</TableCell>
                      <TableCell>{loan.loan_status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => { setFile(null); setPreviewData([]); setErrors([]) }}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || parsing}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : `Upload ${previewData.length} Loans`}
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
              Upload Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{uploadResult.total}</div>
                <div className="text-sm text-blue-600">Total Processed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{uploadResult.successful}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{uploadResult.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
            
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-2">Errors:</h4>
                <div className="max-h-32 overflow-y-auto">
                  {uploadResult.errors.map((error: string, index: number) => (
                    <div key={index} className="text-sm text-red-600 py-1">{error}</div>
                  ))}
                </div>
              </div>
            )}
            
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

