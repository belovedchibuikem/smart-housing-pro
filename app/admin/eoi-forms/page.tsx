"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EOIFormsPage() {
  const { toast } = useToast()

  // Mock data
  const eoiForms = [
    {
      id: 1,
      name: "John Doe",
      rank: "Inspector",
      pin: "12345",
      property: "Luxury 3-Bedroom Apartment",
      fundingType: "Mix Funding",
      status: "Pending Review",
      submittedDate: "2024-03-15",
    },
    {
      id: 2,
      name: "Jane Smith",
      rank: "Sergeant",
      pin: "67890",
      property: "2-Bedroom Bungalow",
      fundingType: "100% Cash",
      status: "Approved",
      submittedDate: "2024-03-14",
    },
    {
      id: 3,
      name: "Mike Johnson",
      rank: "Corporal",
      pin: "11223",
      property: "Land Plot - 700sqm",
      fundingType: "100% Loan",
      status: "Under Review",
      submittedDate: "2024-03-13",
    },
  ]

  const handleViewForm = (id: number) => {
    toast({
      title: "Opening EOI Form",
      description: `Opening form for ${eoiForms.find((f) => f.id === id)?.name}...`,
    })
  }

  const handleDownloadForm = (id: number) => {
    toast({
      title: "Downloading Form",
      description: `Downloading EOI form for ${eoiForms.find((f) => f.id === id)?.name}...`,
    })
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
            <CardTitle className="text-3xl">156</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Review</CardDescription>
            <CardTitle className="text-3xl text-orange-600">23</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">118</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-red-600">15</CardTitle>
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
              <Input placeholder="Search by name, PIN, or property..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>

          {/* EOI Forms List */}
          <div className="space-y-4">
            {eoiForms.map((form) => (
              <div key={form.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {form.name} ({form.rank})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      PIN: {form.pin} • {form.property}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Submitted: {new Date(form.submittedDate).toLocaleDateString()} • Funding: {form.fundingType}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      form.status === "Approved"
                        ? "default"
                        : form.status === "Pending Review"
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
        </CardContent>
      </Card>
    </div>
  )
}
