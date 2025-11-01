"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, Download, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { useRouter } from "next/navigation"

interface EoiForm {
  id: string
  member: {
    user: {
      first_name: string
      last_name: string
    }
    staff_id?: string
    member_id?: string
    rank?: string
  }
  property: {
    title?: string
    address?: string
  }
  interest_type: string
  status: string
  message?: string
  created_at: string
}

export default function EOIFormsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [eoiForms, setEoiForms] = useState<EoiForm[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchEOIForms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const fetchEOIForms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      const response = await apiFetch<{ success: boolean; data: EoiForm[] }>(
        `/admin/eoi-forms?${params.toString()}`
      )
      if (response.success) {
        setEoiForms(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch EOI forms",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewForm = (id: string) => {
    router.push(`/admin/eoi-forms/${id}`)
  }

  const handleDownloadForm = async (id: string) => {
    try {
      const response = await apiFetch<{ success: boolean; data: any }>(
        `/admin/eoi-forms/${id}/download`
      )
      if (response.success && response.data) {
        // Create a blob and download
        const data = JSON.stringify(response.data, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `eoi-form-${id}.json`
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast({
          title: "Success",
          description: "EOI form downloaded successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download EOI form",
        variant: "destructive",
      })
    }
  }

  const stats = {
    total: eoiForms.length,
    pending: eoiForms.filter(f => f.status === 'pending' || f.status === 'under_review').length,
    approved: eoiForms.filter(f => f.status === 'approved').length,
    rejected: eoiForms.filter(f => f.status === 'rejected').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expression of Interest Forms</h1>
        <p className="text-muted-foreground">Review and manage property subscription applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Submissions</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All EOI Forms</CardTitle>
          <CardDescription>Search and filter expression of interest submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, PIN, or property..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* EOI Forms List */}
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading EOI forms...</p>
            </div>
          ) : eoiForms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No EOI forms found</div>
          ) : (
            <div className="space-y-4">
              {eoiForms.map((form) => (
                <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {form.member?.user?.first_name} {form.member?.user?.last_name}
                        {form.member?.rank && ` (${form.member.rank})`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        PIN: {form.member?.staff_id || form.member?.member_id || '—'} • {form.property?.title || form.property?.address || '—'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(form.created_at).toLocaleDateString()} • Type: {form.interest_type || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        form.status === "approved"
                          ? "default"
                          : form.status === "pending" || form.status === "under_review"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {form.status}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleViewForm(form.id)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadForm(form.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
