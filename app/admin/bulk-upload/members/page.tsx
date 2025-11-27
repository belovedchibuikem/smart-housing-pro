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
        
        // Map parsed data to MemberData format
        const mappedData: MemberData[] = result.data.map((row: any) => ({
          firstName: row['First Name'] || row['firstName'] || row['first_name'] || '',
          lastName: row['Last Name'] || row['lastName'] || row['last_name'] || '',
          email: row['Email'] || row['email'] || '',
          phone: row['Phone'] || row['phone'] || '',
          staffId: row['Staff ID'] || row['staffId'] || row['staff_id'] || '',
          ippisNumber: row['IPPS Number'] || row['ippisNumber'] || row['ippis_number'] || '',
          dateOfBirth: row['Date of Birth'] || row['dateOfBirth'] || row['date_of_birth'] || '',
          gender: row['Gender'] || row['gender'] || '',
          maritalStatus: row['Marital Status'] || row['maritalStatus'] || row['marital_status'] || '',
          nationality: row['Nationality'] || row['nationality'] || '',
          stateOfOrigin: row['State of Origin'] || row['stateOfOrigin'] || row['state_of_origin'] || '',
          lga: row['LGA'] || row['lga'] || '',
          residentialAddress: row['Residential Address'] || row['residentialAddress'] || row['residential_address'] || '',
          city: row['City'] || row['city'] || '',
          state: row['State'] || row['state'] || '',
          rank: row['Rank'] || row['rank'] || '',
          department: row['Department'] || row['department'] || '',
          commandState: row['Command State'] || row['commandState'] || row['command_state'] || '',
          employmentDate: row['Employment Date'] || row['employmentDate'] || row['employment_date'] || '',
          yearsOfService: row['Years of Service'] || row['yearsOfService'] || row['years_of_service'] || '',
          membershipType: row['Membership Type'] || row['membershipType'] || row['membership_type'] || '',
        }))
        
        // Validate required fields
        const validationErrors: string[] = []
        mappedData.forEach((member, index) => {
          if (!member.firstName) validationErrors.push(`Row ${index + 2}: First Name is required`)
          if (!member.lastName) validationErrors.push(`Row ${index + 2}: Last Name is required`)
          if (!member.email) validationErrors.push(`Row ${index + 2}: Email is required`)
          if (!member.phone) validationErrors.push(`Row ${index + 2}: Phone is required`)
          if (!member.staffId) validationErrors.push(`Row ${index + 2}: Staff ID is required`)
          if (!member.rank) validationErrors.push(`Row ${index + 2}: Rank is required`)
          if (!member.department) validationErrors.push(`Row ${index + 2}: Department is required`)
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
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const tenantSlug = localStorage.getItem('tenant_slug')
      
      const response = await fetch('/api/bulk/members/template', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(tenantSlug && { 'X-Tenant-Slug': tenantSlug }),
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to download template' }))
        throw new Error(errorData.message || errorData.error || 'Failed to download template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "members_upload_template.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "Template Downloaded",
        description: "CSV template has been downloaded successfully.",
      })
    } catch (error) {
      console.error('Template download error:', error)
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadExcelTemplate = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const response = await fetch('/api/bulk/members/excel-template', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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
    setErrors([])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      const response = await fetch('/api/bulk/members/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle different error types
        const errorMessages = result.errors || []
        const errorType = result.error_type || 'unknown_error'
        
        let errorTitle = 'Upload Failed'
        let errorDescription = result.message || 'Failed to upload members'
        
        // Set specific error messages based on error type
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
          errorDescription = 'All member records failed to process. Please check the error details below.'
        } else if (errorType === 'empty_data') {
          errorTitle = 'Empty File'
          errorDescription = 'The file contains no valid member data.'
        }

        // Set errors for display
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

        // If there's data with errors, still show it
        if (result.data) {
          setUploadResult(result.data)
          setUploadComplete(true)
        }

        return
      }

      // Success response
      if (!result.success) {
        // Handle partial success or other non-success responses
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

      // Full success
      setUploadResult(result.data)
      setUploadComplete(true)
      
      const successCount = result.data?.successful || 0
      const failedCount = result.data?.failed || 0
      
      if (failedCount > 0) {
        // Partial success - show errors
        const errorMessages = result.data?.errors || []
        if (errorMessages.length > 0) {
          setErrors(errorMessages)
        }
        
        toast({
          title: "Upload Completed with Errors",
          description: `Successfully processed ${successCount} members. ${failedCount} failed.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Upload Successful",
          description: `Successfully processed ${successCount} member(s).`,
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload members. Please try again."
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
              <li>Date format: YYYY-MM-DD, DD-MM-YYYY, or DD/MM/YYYY (e.g., 2024-01-15, 15-01-2024, or 15/01/2024)</li>
              <li>Gender must be Male or Female</li>
              <li>Marital Status: Single, Married, Divorced, or Widowed</li>
              <li>Membership Type: Regular or Associate</li>
            </ul>
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

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">
              {uploadComplete ? 'Errors during processing:' : 'Errors found:'}
            </p>
            <div className="max-h-64 overflow-y-auto">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
            {errors.length > 10 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing first {Math.min(errors.length, 50)} errors. Total: {errors.length}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {parsing && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Parsing file, please wait...</AlertDescription>
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
              <Button onClick={handleUpload} disabled={uploading || errors.length > 0 || parsing}>
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
              <div className="border-t pt-4">
                <h4 className="font-medium text-red-600 mb-2">
                  Processing Errors ({uploadResult.errors.length}):
                </h4>
                <div className="max-h-64 overflow-y-auto bg-red-50 p-3 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    {uploadResult.errors.slice(0, 50).map((error: string, index: number) => (
                      <li key={index} className="text-sm text-red-700">
                        {error}
                      </li>
                    ))}
                  </ul>
                  {uploadResult.errors.length > 50 && (
                    <p className="text-xs text-red-600 mt-2">
                      Showing first 50 errors. Total: {uploadResult.errors.length}
                    </p>
                  )}
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
