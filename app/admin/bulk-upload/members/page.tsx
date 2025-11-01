"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

interface MemberData {
  firstName: string
  lastName: string
  email: string
  phone: string
  staffId: string
  ippisNumber?: string
  dateOfBirth?: string
  gender?: string
  maritalStatus?: string
  nationality?: string
  stateOfOrigin?: string
  lga?: string
  residentialAddress?: string
  city?: string
  state?: string
  rank: string
  department: string
  commandState?: string
  employmentDate?: string
  yearsOfService?: string
  membershipType?: string
}

export default function BulkUploadMembersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<MemberData[]>([])
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
              ippisNumber: values[5],
              dateOfBirth: values[6],
              gender: values[7],
              maritalStatus: values[8],
              nationality: values[9],
              stateOfOrigin: values[10],
              lga: values[11],
              residentialAddress: values[12],
              city: values[13],
              state: values[14],
              rank: values[15],
              department: values[16],
              commandState: values[17],
              employmentDate: values[18],
              yearsOfService: values[19],
              membershipType: values[20],
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
      const response = await fetch('/api/bulk/members/template', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "members_upload_template.csv"
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

  const downloadExcelTemplate = async () => {
    try {
      const response = await fetch('/api/bulk/members/excel-template', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download Excel template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "members_upload_template.xlsx"
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Excel Template Downloaded",
        description: "Excel template has been downloaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download Excel template. Please try again.",
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

      const response = await fetch('/api/bulk/members/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
        description: `Successfully processed ${result.data.successful} members. ${result.data.failed} failed.`,
      })
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload members",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
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
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
              <Button variant="outline" onClick={downloadExcelTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Excel Template
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Step 2: Fill in Member Data</h3>
            <p className="text-sm text-muted-foreground">
              Open the template in Excel or any spreadsheet software and fill in the member details
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>First Name, Last Name, Email, Phone, Staff ID, Department, Rank are required</li>
              <li>Staff ID must be unique</li>
              <li>Email must be unique and valid format</li>
              <li>Date format should be YYYY-MM-DD</li>
              <li>Gender must be Male or Female</li>
              <li>Marital Status: Single, Married, Divorced, or Widowed</li>
              <li>Membership Type: Regular or Associate</li>
            </ul>
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Staff ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Membership</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((member, index) => (
                    <TableRow key={index}>
                      <TableCell>{member.firstName} {member.lastName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.staffId}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>{member.rank}</TableCell>
                      <TableCell>{member.gender || 'N/A'}</TableCell>
                      <TableCell>{member.membershipType || 'Regular'}</TableCell>
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
                    <div key={index} className="text-sm text-red-600 py-1">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setFile(null)
                  setPreviewData([])
                  setErrors([])
                  setUploadComplete(false)
                  setUploadResult(null)
                }}
                variant="outline"
              >
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
