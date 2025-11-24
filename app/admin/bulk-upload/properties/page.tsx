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

export default function BulkUploadPropertiesPage() {
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
        
        // Map parsed data to property format - check for template headers first
        const mappedData = result.data.map((row: any) => ({
          title: row['Title'] || row['title'] || '',
          description: row['Description'] || row['description'] || '',
          location: row['Location'] || row['location'] || '',
          address: row['Address'] || row['address'] || '',
          city: row['City'] || row['city'] || '',
          state: row['State'] || row['state'] || '',
          propertyType: row['Property Type'] 
            || row['property_type']
            || row['PropertyType']
            || row['Type']
            || row['type']
            || '',
          price: row['Price'] || row['price'] || '',
          size: row['Size (sqft)'] 
            || row['size_sqft']
            || row['Size'] 
            || row['size'] 
            || '',
          bedrooms: row['Bedrooms'] || row['bedrooms'] || '',
          bathrooms: row['Bathrooms'] || row['bathrooms'] || '',
          status: row['Status (available/reserved/sold)'] 
            || row['status_available_reserved_sold']
            || row['Status'] 
            || row['status'] 
            || '',
          features: row['Features (comma-separated)'] 
            || row['features_comma_separated']
            || row['Features'] 
            || row['features'] 
            || '',
        }))
        
        // Validate required fields
        const validationErrors: string[] = []
        mappedData.forEach((property, index) => {
          if (!property.title) validationErrors.push(`Row ${index + 2}: Title is required`)
          if (!property.location) validationErrors.push(`Row ${index + 2}: Location is required`)
          if (!property.address) validationErrors.push(`Row ${index + 2}: Address is required`)
          if (!property.price) validationErrors.push(`Row ${index + 2}: Price is required`)
          if (isNaN(parseFloat(property.price))) validationErrors.push(`Row ${index + 2}: Price must be a valid number`)
          if (!property.propertyType) validationErrors.push(`Row ${index + 2}: Property Type is required`)
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
        '/admin/bulk/properties/template'
      )

      if (!response.success) {
        throw new Error('Failed to download template')
      }

      const blob = new Blob([response.template], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = response.filename || "properties_upload_template.csv"
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

      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      const tenantSlug = localStorage.getItem('tenant_slug')
      
      const response = await fetch('/api/admin/bulk/properties/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(tenantSlug && { 'X-Tenant-Slug': tenantSlug }),
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }))
        throw new Error(errorData.message || errorData.error || 'Upload failed')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || result.error || 'Upload failed')
      }

      setUploadResult(result.data)
      setUploadComplete(true)
      
      toast({
        title: "Upload Successful",
        description: `Successfully processed ${result.data?.successful || 0} properties. ${result.data?.failed || 0} failed.`,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload properties",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload Properties</h1>
        <p className="text-muted-foreground">Upload multiple properties at once using a CSV file</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
          <CardDescription>Follow these steps to upload properties in bulk</CardDescription>
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
            <h3 className="font-medium">Step 2: Fill in Property Data</h3>
            <p className="text-sm text-muted-foreground">
              Open the template and fill in the property details
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
            <CardTitle>Preview Data ({previewData.length} properties)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((property, index) => (
                    <TableRow key={index}>
                      <TableCell>{property.title}</TableCell>
                      <TableCell>{property.address}</TableCell>
                      <TableCell>₦{parseFloat(property.price || 0).toLocaleString()}</TableCell>
                      <TableCell>{property.propertyType}</TableCell>
                      <TableCell>{property.status}</TableCell>
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
                {uploading ? "Uploading..." : `Upload ${previewData.length} Properties`}
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

