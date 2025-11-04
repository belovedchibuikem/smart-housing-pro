"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Search, Download, Eye, Upload, FileText, ImageIcon, File, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getDocuments, uploadDocument, viewDocument, downloadDocument, approveDocument, rejectDocument, deleteDocument, getUsers } from "@/lib/api/client"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, CheckCircle, XCircle } from "lucide-react"

export default function AdminDocumentsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    storage_used: "0 B",
  })
  const [members, setMembers] = useState<any[]>([])
  const [memberSearch, setMemberSearch] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
    member_id: "",
    file: null as File | null,
  })

  useEffect(() => {
    fetchDocuments()
  }, [searchQuery, typeFilter, statusFilter])

  useEffect(() => {
    if (memberSearch.length >= 2) {
      loadMembers()
    }
  }, [memberSearch])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await getDocuments({
        search: searchQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        per_page: 50,
      })
      if (response.success) {
        setDocuments(response.data || [])
        if (response.stats) {
          setStats(response.stats)
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load documents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    try {
      const response = await getUsers({
        search: memberSearch,
        status: 'active',
        per_page: 10,
      })
      // Handle both response formats: { success: true, data: [] } or { users: [] }
      const membersList = (response as any).data || (response as any).users || []
      setMembers(membersList)
    } catch (error) {
      // Silently fail member search
    }
  }

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.file || !formData.title || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.file)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('type', formData.type)
      if (formData.description) {
        formDataToSend.append('description', formData.description)
      }
      if (formData.member_id) {
        formDataToSend.append('member_id', formData.member_id)
      }

      const response = await uploadDocument(formDataToSend)
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Document uploaded successfully",
        })
        setUploadDialogOpen(false)
        setFormData({
          title: "",
          type: "",
          description: "",
          member_id: "",
          file: null,
        })
        fetchDocuments()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleViewDocument = async (docId: string) => {
    try {
      const response = await viewDocument(docId)
      if (response.success && response.data.view_url) {
        window.open(response.data.view_url, '_blank')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to view document",
        variant: "destructive",
      })
    }
  }

  const handleDownloadDocument = async (docId: string) => {
    try {
      const response = await downloadDocument(docId)
      if (response.success && response.data.download_url) {
        const link = document.createElement('a')
        link.href = response.data.download_url
        link.download = response.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download document",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (docId: string) => {
    try {
      const response = await approveDocument(docId)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Document approved",
        })
        fetchDocuments()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve document",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (docId: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return

    try {
      const response = await rejectDocument(docId, reason)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Document rejected",
        })
        fetchDocuments()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject document",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await deleteDocument(docId)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Document deleted",
        })
        fetchDocuments()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType === "PDF" || fileType.toLowerCase().includes("pdf")) return <FileText className="h-4 w-4" />
    if (fileType.includes("Image") || fileType.toLowerCase().includes("image")) return <ImageIcon className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
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
                <Label htmlFor="documentName">Document Name *</Label>
                <Input 
                  id="documentName" 
                  placeholder="Enter document name" 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select 
                  required 
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="documentType">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KYC">KYC Document</SelectItem>
                    <SelectItem value="property">Property Document</SelectItem>
                    <SelectItem value="loan">Loan Document</SelectItem>
                    <SelectItem value="investment">Investment Document</SelectItem>
                    <SelectItem value="legal">Legal Document</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter document description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberSearch">Member (Optional)</Label>
                <div className="relative">
                  <Input 
                    id="memberSearch" 
                    placeholder="Search by member name or email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  {formData.member_id && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => {
                        setFormData({ ...formData, member_id: "" })
                        setMemberSearch("")
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {memberSearch.length >= 2 && members.length > 0 && (
                  <div className="border rounded-lg mt-1 max-h-40 overflow-auto">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="p-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setFormData({ ...formData, member_id: member.id })
                          setMemberSearch(`${member.first_name} ${member.last_name}`)
                        }}
                      >
                        <div className="font-medium">{member.first_name} {member.last_name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Select File *</Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                  required 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, file: e.target.files[0] })
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
                {formData.file && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={uploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setUploadDialogOpen(false)
                    setFormData({
                      title: "",
                      type: "",
                      description: "",
                      member_id: "",
                      file: null,
                    })
                    setMemberSearch("")
                  }} 
                  className="flex-1"
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-green-600 mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.storage_used}</div>
            <p className="text-xs text-muted-foreground mt-1">Total storage</p>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
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
                <SelectItem value="KYC">KYC</SelectItem>
                <SelectItem value="property">Property</SelectItem>
                <SelectItem value="loan">Loan</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="legal">Legal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No documents found</div>
          ) : (
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
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        <Link href={`/admin/documents/${doc.id}`} className="hover:underline">
                          {doc.id.substring(0, 8)}...
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.file_type)}
                          <span>{doc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doc.member}</div>
                          <div className="text-sm text-muted-foreground">{doc.member_id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.upload_date}</TableCell>
                      <TableCell className="text-sm">{doc.size}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(doc.status)}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewDocument(doc.id)}
                            title="View document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDownloadDocument(doc.id)}
                            title="Download document"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {doc.status === 'pending' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleApprove(doc.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(doc.id)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-destructive">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
