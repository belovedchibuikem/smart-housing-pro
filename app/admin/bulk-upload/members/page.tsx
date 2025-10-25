"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface MemberData {
  firstName: string
  lastName: string
  email: string
  phone: string
  staffId: string
  department: string
  rank: string
}

export default function BulkUploadMembersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<MemberData[]>([])
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

      const data: MemberData[] = []
      const parseErrors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim())
          if (values.length === headers.length) {
            data.push({
              firstName: values[0],
              lastName: values[1],
              email: values[2],
              phone: values[3],
              staffId: values[4],
              department: values[5],
              rank: values[6],
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
      "First Name,Last Name,Email,Phone,Staff ID,Department,Rank\nJohn,Doe,john.doe@frsc.gov.ng,08012345678,FRSC/2024/001,Operations,Inspector\nJane,Smith,jane.smith@frsc.gov.ng,08087654321,FRSC/2024/002,Admin,Assistant Inspector"
    const blob = new Blob([template], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "members_upload_template.csv"
    a.click()
  }

  const handleUpload = async () => {
    setUploading(true)
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setUploading(false)
    setUploadComplete(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Members</h1>
        <p className="text-muted-foreground">Upload multiple members at once using a CSV file</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>Follow these steps to upload members in bulk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">Step 1: Download Template</h3>
            <p className="text-sm text-muted-foreground">
              Download the CSV template to ensure your data is in the correct format
            </p>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Step 2: Fill in Member Data</h3>
            <p className="text-sm text-muted-foreground">
              Open the template in Excel or any spreadsheet software and fill in the member details
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>First Name, Last Name, Email, Phone are required</li>
              <li>Staff ID must be unique</li>
              <li>Use valid FRSC departments and ranks</li>
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
            <CardTitle>Preview Data ({previewData.length} members)</CardTitle>
            <CardDescription>Review the data before uploading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{member.firstName}</TableCell>
                      <TableCell>{member.lastName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.staffId}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>{member.rank}</TableCell>
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
                {uploading ? "Uploading..." : `Upload ${previewData.length} Members`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadComplete && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Successfully uploaded {previewData.length} members. They will be reviewed and approved by the admin.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
