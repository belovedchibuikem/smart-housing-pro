"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Download, Eye, Upload, FileText, ImageIcon, File } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminDocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const { toast } = useToast()

  const documents = [
    {
      id: "DOC-2024-001",
      name: "KYC Document - John Adebayo",
      type: "KYC",
      member: "John Adebayo",
      memberId: "FRSC/HMS/2024/001",
      uploadDate: "May 1, 2024",
      status: "verified",
      fileType: "PDF",
      size: "2.5 MB",
    },
    {
      id: "DOC-2024-002",
      name: "Property Title - Lekki Phase 2",
      type: "Property",
      member: "Sarah Okonkwo",
      memberId: "FRSC/HMS/2024/015",
      uploadDate: "May 3, 2024",
      status: "pending",
      fileType: "PDF",
      size: "5.1 MB",
    },
    {
      id: "DOC-2024-003",
      name: "Loan Agreement - MORT-2024-001",
      type: "Loan",
      member: "Michael Bello",
      memberId: "FRSC/HMS/2024/032",
      uploadDate: "May 5, 2024",
      status: "verified",
      fileType: "PDF",
      size: "1.8 MB",
    },
  ]

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || doc.type.toLowerCase() === typeFilter
    return matchesSearch && matchesType
  })

  const getFileIcon = (fileType: string) => {
    if (fileType === "PDF") return <FileText className="h-4 w-4" />
    if (fileType.includes("Image")) return <ImageIcon className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Document Uploaded",
      description: "The document has been uploaded successfully.",
    })
    setUploadDialogOpen(false)
  }

  const handleViewDocument = (docId: string) => {
    toast({
      title: "Opening Document",
      description: `Opening document ${docId}...`,
    })
  }

  const handleDownloadDocument = (docId: string) => {
    toast({
      title: "Downloading Document",
      description: `Downloading document ${docId}...`,
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all system documents</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Upload a new document to the system</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentName">Document Name</Label>
                <Input id="documentName" placeholder="Enter document name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type</Label>
                <Select required>
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kyc">KYC Document</SelectItem>
                    <SelectItem value="property">Property Document</SelectItem>
                    <SelectItem value="loan">Loan Document</SelectItem>
                    <SelectItem value="investment">Investment Document</SelectItem>
                    <SelectItem value="legal">Legal Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberId">Member ID (Optional)</Label>
                <Input id="memberId" placeholder="FRSC/HMS/2024/001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input id="file" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" required />
                <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
                <Button type="button" variant="outline" onClick={() => setUploadDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">All documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,189</div>
            <p className="text-xs text-green-600 mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2 GB</div>
            <p className="text-xs text-muted-foreground mt-1">Of 100 GB</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>View and manage uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by document name, member, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="kyc">KYC</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document ID</TableHead>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFileIcon(doc.fileType)}
                        <span>{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{doc.member}</div>
                        <div className="text-sm text-muted-foreground">{doc.memberId}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{doc.uploadDate}</TableCell>
                    <TableCell className="text-sm">{doc.size}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === "verified" ? "default" : "secondary"}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDocument(doc.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
