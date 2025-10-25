"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Eye, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function AdminContributionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const { toast } = useToast()

  const contributions = [
    {
      id: "CONT-2024-001",
      member: "John Adebayo",
      memberId: "FRSC/HMS/2024/001",
      amount: 50000,
      month: "May 2024",
      date: "May 1, 2024",
      status: "completed",
      paymentMethod: "Bank Transfer",
    },
    {
      id: "CONT-2024-002",
      member: "Sarah Okonkwo",
      memberId: "FRSC/HMS/2024/015",
      amount: 50000,
      month: "May 2024",
      date: "May 3, 2024",
      status: "pending",
      paymentMethod: "Card",
    },
    {
      id: "CONT-2024-003",
      member: "Michael Bello",
      memberId: "FRSC/HMS/2024/032",
      amount: 75000,
      month: "May 2024",
      date: "May 5, 2024",
      status: "completed",
      paymentMethod: "Paystack",
    },
  ]

  const filteredContributions = contributions.filter((contribution) => {
    const matchesSearch =
      contribution.member.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contribution.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contribution.memberId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || contribution.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewContribution = (id: string) => {
    router.push(`/admin/contributions/${id}`)
  }

  const handleApproveContribution = (id: string) => {
    toast({
      title: "Contribution Approved",
      description: `Contribution ${id} has been approved successfully.`,
    })
  }

  const handleRejectContribution = (id: string) => {
    toast({
      title: "Contribution Rejected",
      description: `Contribution ${id} has been rejected.`,
      variant: "destructive",
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contribution Management</h1>
          <p className="text-muted-foreground mt-1">View and manage member contributions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/bulk-upload/contributions">Bulk Upload</Link>
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦12.5M</div>
            <p className="text-xs text-green-600 mt-1">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total All Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦450M</div>
            <p className="text-xs text-muted-foreground mt-1">Since inception</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contributions</CardTitle>
          <CardDescription>View and verify member contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by member name, ID, or contribution ID..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contribution ID</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell className="font-medium">{contribution.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{contribution.member}</div>
                        <div className="text-sm text-muted-foreground">{contribution.memberId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{contribution.month}</TableCell>
                    <TableCell className="text-right font-semibold">₦{contribution.amount.toLocaleString()}</TableCell>
                    <TableCell>{contribution.paymentMethod}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{contribution.date}</TableCell>
                    <TableCell>
                      <Badge variant={contribution.status === "completed" ? "default" : "secondary"}>
                        {contribution.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewContribution(contribution.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {contribution.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600"
                              onClick={() => handleApproveContribution(contribution.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleRejectContribution(contribution.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
