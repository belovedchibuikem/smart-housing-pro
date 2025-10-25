"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ContributionData {
  memberId: string
  memberName: string
  amount: string
  month: string
  paymentMethod: string
  transactionRef: string
}

export default function BulkUploadContributionsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ContributionData[]>([])
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

      const data: ContributionData[] = []
      const parseErrors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim())
          if (values.length === headers.length) {
            const amount = Number.parseFloat(values[2])
            if (isNaN(amount) || amount <= 0) {
              parseErrors.push(`Line ${i + 1}: Invalid amount`)
            }
            data.push({
              memberId: values[0],
              memberName: values[1],
              amount: values[2],
              month: values[3],
              paymentMethod: values[4],
              transactionRef: values[5],
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

  const downloadTemplate = () => {
    const template =
      "Member ID,Member Name,Amount,Month,Payment Method,Transaction Reference\nFRSC/HMS/2024/001,John Doe,50000,January 2025,Bank Transfer,TRX123456789\nFRSC/HMS/2024/002,Jane Smith,50000,January 2025,Paystack,PAY987654321"
    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "contributions_upload_template.csv"
    a.click()
  }

  const handleUpload = async () => {
    setUploading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setUploading(false)
    setUploadComplete(true)
  }

  const totalAmount = previewData.reduce((sum, item) => sum + Number.parseFloat(item.amount || "0"), 0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Contributions</h1>
        <p className="text-muted-foreground">Upload multiple member contributions at once using a CSV file</p>
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
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Member ID must match existing members</li>
              <li>Amount must be a valid number</li>
              <li>Month format: "January 2025", "February 2025", etc.</li>
              <li>Payment Method: Bank Transfer, Paystack, Card, etc.</li>
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
              Preview Data ({previewData.length} contributions, Total: ₦{totalAmount.toLocaleString()})
            </CardTitle>
            <CardDescription>Review the data before uploading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member ID</TableHead>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Transaction Ref</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((contribution, index) => (
                    <TableRow key={index}>
                      <TableCell>{contribution.memberId}</TableCell>
                      <TableCell>{contribution.memberName}</TableCell>
                      <TableCell>₦{Number.parseFloat(contribution.amount).toLocaleString()}</TableCell>
                      <TableCell>{contribution.month}</TableCell>
                      <TableCell>{contribution.paymentMethod}</TableCell>
                      <TableCell className="font-mono text-xs">{contribution.transactionRef}</TableCell>
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
                {uploading ? "Uploading..." : `Upload ${previewData.length} Contributions`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadComplete && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Successfully uploaded {previewData.length} contributions totaling ₦{totalAmount.toLocaleString()}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
