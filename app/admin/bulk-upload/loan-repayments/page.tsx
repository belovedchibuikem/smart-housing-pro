"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

interface RepaymentData {
  loanId: string
  memberId: string
  memberName: string
  amount: string
  paymentDate: string
  paymentMethod: string
  transactionRef: string
}

export default function BulkUploadLoanRepaymentsPage() {
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
      const headers = lines[0].split(",").map((h) => h.trim())

      const data: RepaymentData[] = []
      const parseErrors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim())
          if (values.length === headers.length) {
            const amount = Number.parseFloat(values[3])
            if (isNaN(amount) || amount <= 0) {
              parseErrors.push(`Line ${i + 1}: Invalid amount`)
            }
            data.push({
              loanId: values[0],
              memberId: values[1],
              memberName: values[2],
              amount: values[3],
              paymentDate: values[4],
              paymentMethod: values[5],
              transactionRef: values[6],
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
      // For now, create template locally. You can add an API endpoint later if needed
    const template =
      "Loan ID,Member ID,Member Name,Amount,Payment Date,Payment Method,Transaction Reference\nLOAN-2024-001,FRSC/HMS/2024/001,John Doe,100000,2025-01-15,Bank Transfer,TRX123456789\nLOAN-2024-002,FRSC/HMS/2024/002,Jane Smith,150000,2025-01-15,Paystack,PAY987654321"
    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "loan_repayments_upload_template.csv"
    a.click()
      window.URL.revokeObjectURL(url)
      
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
      const formData = new FormData()
      formData.append('file', file)

      // Note: You may need to create a bulk repayment upload endpoint
      // For now, this is a placeholder implementation
      const result = await apiFetch<{ success: boolean; message?: string; data?: any }>(
        '/admin/bulk/loan-repayments/upload',
        {
          method: 'POST',
          body: formData,
        }
      )

      if (result.success) {
        setUploadComplete(true)
        sonnerToast.success("Upload Successful", {
          description: result.message || "Loan repayments uploaded successfully",
        })
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error: any) {
      console.error('Error uploading repayments:', error)
      sonnerToast.error("Upload Failed", {
        description: error.message || "Failed to upload loan repayments. Please check the file format and try again.",
      })
    } finally {
    setUploading(false)
    }
  }

  const totalAmount = previewData.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Loan Repayments</h1>
        <p className="text-muted-foreground">Upload multiple loan repayments at once using a CSV file</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>Follow these steps to upload loan repayments in bulk</CardDescription>
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
            <h3 className="font-medium">Step 2: Fill in Repayment Data</h3>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Loan ID must match existing active loans</li>
              <li>Member ID must match the loan borrower</li>
              <li>Amount must be a valid number</li>
              <li>Payment Date format: YYYY-MM-DD (e.g., 2025-01-15)</li>
              <li>Payment Method: Bank Transfer, Paystack, Card, Cash, etc.</li>
              <li>Transaction Reference is required for verification</li>
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
              Preview Data ({previewData.length} repayments, Total: ₦{totalAmount.toLocaleString()})
            </CardTitle>
            <CardDescription>Review the data before uploading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Transaction Ref</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((repayment, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{repayment.loanId}</TableCell>
                      <TableCell>{repayment.memberId}</TableCell>
                      <TableCell>{repayment.memberName}</TableCell>
                      <TableCell>₦{Number.parseFloat(repayment.amount).toLocaleString()}</TableCell>
                      <TableCell>{repayment.paymentDate}</TableCell>
                      <TableCell>{repayment.paymentMethod}</TableCell>
                      <TableCell className="font-mono text-xs">{repayment.transactionRef}</TableCell>
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
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : `Upload ${previewData.length} Repayments`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadComplete && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Successfully uploaded {previewData.length} loan repayments totaling ₦{totalAmount.toLocaleString()}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
