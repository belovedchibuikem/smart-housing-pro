"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, FileText, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AdminMortgagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

  const mortgages = [
    {
      id: "MORT-2024-001",
      member: "John Adebayo",
      memberId: "FRSC/HMS/2024/001",
      property: "3 Bedroom Duplex - Abuja",
      amount: 15000000,
      downPayment: 3000000,
      monthlyPayment: 250000,
      tenure: "20 years",
      startDate: "Jan 1, 2024",
      status: "active",
    },
    {
      id: "MORT-2024-002",
      member: "Sarah Okonkwo",
      memberId: "FRSC/HMS/2024/015",
      property: "2 Bedroom Flat - Lagos",
      amount: 8000000,
      downPayment: 2000000,
      monthlyPayment: 150000,
      tenure: "15 years",
      startDate: "Feb 15, 2024",
      status: "active",
    },
    {
      id: "MORT-2024-003",
      member: "Michael Bello",
      memberId: "FRSC/HMS/2024/032",
      property: "Land - Port Harcourt",
      amount: 5000000,
      downPayment: 1500000,
      monthlyPayment: 100000,
      tenure: "10 years",
      startDate: "Mar 10, 2024",
      status: "pending",
    },
  ]

  const filteredMortgages = mortgages.filter((mortgage) => {
    const matchesSearch =
      mortgage.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mortgage.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mortgage.memberId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || mortgage.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewMortgage = (id: string) => {
    router.push(`/admin/mortgages/${id}`)
  }

  const handleViewDocument = (id: string) => {
    toast({
      title: "Opening Document",
      description: `Opening mortgage agreement for ${id}...`,
    })
  }

  const handleDownloadDocument = (id: string) => {
    toast({
      title: "Downloading Document",
      description: `Downloading mortgage agreement for ${id}...`,
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mortgage Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage housing mortgage agreements</p>
        </div>
        <Link href="/admin/mortgages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Mortgage
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mortgages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦28M</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦500K</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Mortgages</CardTitle>
          <CardDescription>View and manage all mortgage agreements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name, ID, or mortgage ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mortgage ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Monthly</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMortgages.map((mortgage) => (
                  <TableRow key={mortgage.id}>
                    <TableCell className="font-medium">{mortgage.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{mortgage.member}</div>
                        <div className="text-sm text-muted-foreground">{mortgage.memberId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{mortgage.property}</TableCell>
                    <TableCell className="text-right">₦{(mortgage.amount / 1000000).toFixed(1)}M</TableCell>
                    <TableCell className="text-right">₦{(mortgage.monthlyPayment / 1000).toFixed(0)}K</TableCell>
                    <TableCell>{mortgage.tenure}</TableCell>
                    <TableCell>
                      <Badge variant={mortgage.status === "active" ? "default" : "secondary"}>{mortgage.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewMortgage(mortgage.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleViewDocument(mortgage.id)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(mortgage.id)}>
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
