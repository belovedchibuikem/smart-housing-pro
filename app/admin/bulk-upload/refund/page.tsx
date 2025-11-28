"use client"

import type React from "react"
import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { parseFile } from "@/lib/utils/file-parser"

export default function BulkUploadRefundPage() {
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
        
        // Map parsed data to refund format - check for template headers first
        const mappedData = result.data.map((row: any) => ({
          memberId: row['Member ID (UUID, Staff ID, or IPPIS)']
            || row['Member ID (UUID or Staff ID)'] 
            || row['member_id_uuid_staff_id_or_ippis']
            || row['member_id_uuid_or_staff_id']
            || row['Member ID'] 
            || row['memberId'] 
            || row['member_id'] 
            || row['Member Number']
            || row['member_number']
            || row['Staff ID']
            || row['staff_id']
            || row['IPPIS Number']
            || row['ippis_number']
            || row['IPPIS']
            || '',
          amount: row['Amount'] || row['amount'] || '',
          source: row['Source (contribution/investment_return/investment)'] 
            || row['source_contribution_investment_return_investment']
            || row['Source'] 
            || row['source'] 
            || '',
          reason: row['Reason'] || row['reason'] || '',
          notes: row['Notes'] || row['notes'] || '',
        }))
        
        // Validate required fields
        const validationErrors: string[] = []
        mappedData.forEach((refund, index) => {
          if (!refund.memberId) validationErrors.push(`Row ${index + 2}: Member ID is required`)
          if (!refund.amount) validationErrors.push(`Row ${index + 2}: Amount is required`)
          if (isNaN(parseFloat(refund.amount))) validationErrors.push(`Row ${index + 2}: Amount must be a valid number`)
          if (!refund.source) validationErrors.push(`Row ${index + 2}: Source is required`)
          if (!refund.reason) validationErrors.push(`Row ${index + 2}: Reason is required`)
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

  const downloadTemplate = async () => {
    try {
      const response = await apiFetch<{ success: boolean; template: string; filename: string }>(
        '/admin/bulk/refund/template'
      )

      if (!response.success) {
        throw new Error('Failed to download template')
      }

      const blob = new Blob([response.template], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.filename || "refunds_upload_template.csv"
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Template Downloaded",
        description: "CSV template has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      })
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
      
      const response = await fetch('/api/admin/bulk/refund/upload', {
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
        let errorDescription = result.message || 'Failed to upload refunds'
        
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
          errorDescription = 'All refund records failed to process. Please check the error details below.'
        } else if (errorType === 'empty_data') {
          errorTitle = 'Empty File'
          errorDescription = 'The file contains no valid refund data.'
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
          description: `Successfully processed ${successCount} refunds. ${failedCount} failed.`,
        })
      } else {
        toast({
          title: "Upload Successful",
          description: `Successfully processed ${successCount} refund(s).`,
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload refunds. Please try again."
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
        <h1 className="text-3xl font-bold">Bulk Refund</h1>
        <p className="text-muted-foreground">Process multiple refunds at once using a CSV file</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>Follow these steps to process refunds in bulk</CardDescription>
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
            <h3 className="font-medium">Step 2: Fill in Refund Data</h3>
            <p className="text-sm text-muted-foreground">
              Open the template and fill in the refund details. Source must be: contribution, investment_return, or investment
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
            <CardTitle>Preview Data ({previewData.length} refunds)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((refund, index) => (
                    <TableRow key={index}>
                      <TableCell>{refund.memberId}</TableCell>
                      <TableCell>₦{parseFloat(refund.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{refund.source}</TableCell>
                      <TableCell>{refund.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => { setFile(null); setPreviewData([]); setErrors([]) }}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || errors.length > 0 || parsing}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Processing..." : `Process ${previewData.length} Refunds`}
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
              Processing Complete
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
                <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-red-50">
                  {uploadResult.errors.map((error: string, index: number) => (
                    <div key={index} className="text-sm text-red-600 py-1 border-b border-red-200 last:border-0">
                      {error}
                    </div>
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

