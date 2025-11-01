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

export default function BulkUploadContributionsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [uploadResult, setUploadResult] = useState<any>(null)
  const { toast } = useToast()

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
      const headers = lines[0].split(",").map((h) => h.trim())

      const data: any[] = []
      const parseErrors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim())
          if (values.length === headers.length) {
            data.push({
              memberId: values[0],
              amount: values[1],
              type: values[2],
              paymentMethod: values[3],
              paymentDate: values[4],
              notes: values[5],
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

  const downloadTemplate = async () => {
    try {
      const response = await apiFetch<{ success: boolean; template: string; filename: string }>(
        '/admin/bulk/contributions/template'
      )

      if (!response.success) {
        throw new Error('Failed to download template')
      }

      const blob = new Blob([response.template], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.filename || "contributions_upload_template.csv"
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

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api'}/admin/bulk/contributions/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed')
      }

      setUploadResult(result.data)
      setUploadComplete(true)
      
      toast({
        title: "Upload Successful",
        description: `Successfully processed ${result.data.successful} contributions. ${result.data.failed} failed.`,
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload contributions",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Contributions</h1>
        <p className="text-muted-foreground">Upload multiple contributions at once using a CSV file</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>Follow these steps to upload contributions in bulk</CardDescription>
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
            <h3 className="font-medium">Step 2: Fill in Contribution Data</h3>
            <p className="text-sm text-muted-foreground">
              Open the template and fill in the contribution details
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Step 3: Upload File</h3>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-2">{file ? file.name : "Click to upload CSV or Excel file"}</p>
                <p className="text-xs text-muted-foreground">CSV, XLSX, or XLS files only, max 5MB</p>
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
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Data ({previewData.length} contributions)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Payment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((contribution, index) => (
                    <TableRow key={index}>
                      <TableCell>{contribution.memberId}</TableCell>
                      <TableCell>₦{parseFloat(contribution.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>{contribution.type}</TableCell>
                      <TableCell>{contribution.paymentMethod}</TableCell>
                      <TableCell>{contribution.paymentDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => { setFile(null); setPreviewData([]); setErrors([]) }}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || errors.length > 0}>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : `Upload ${previewData.length} Contributions`}
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
