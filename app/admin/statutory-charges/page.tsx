"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download, Plus } from "lucide-react"
import Link from "next/link"

export default function StatutoryChargesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const charges = [
    {
      id: "SC-2024-001",
      property: "3 Bedroom Duplex - Abuja",
      owner: "John Adebayo",
      chargeType: "Development Levy",
      amount: "₦50,000",
      dueDate: "2024-03-15",
      status: "paid",
      paymentDate: "2024-03-10",
    },
    {
      id: "SC-2024-002",
      property: "2 Bedroom Flat - Lagos",
      owner: "Sarah Okonkwo",
      chargeType: "Service Charge",
      amount: "₦35,000",
      dueDate: "2024-03-20",
      status: "pending",
      paymentDate: null,
    },
    {
      id: "SC-2024-003",
      property: "Land - Port Harcourt",
      owner: "Michael Bello",
      chargeType: "Ground Rent",
      amount: "₦25,000",
      dueDate: "2024-02-28",
      status: "overdue",
      paymentDate: null,
    },
  ]

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Statutory Charges</h1>
            <p className="text-muted-foreground mt-1">View and manage all statutory charges on properties</p>
          </div>
          <Link href="/admin/statutory-charges/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Charge
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Charges</CardDescription>
              <CardTitle className="text-3xl">₦2.5M</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Across all properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Paid</CardDescription>
              <CardTitle className="text-3xl text-green-600">₦1.8M</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">72% collection rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">₦500K</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">45 pending payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Overdue</CardDescription>
              <CardTitle className="text-3xl text-red-600">₦200K</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">12 overdue charges</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Statutory Charges</CardTitle>
                <CardDescription>Complete list of property charges</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search charges..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Charge ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Charge Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell className="font-medium">{charge.id}</TableCell>
                    <TableCell>{charge.property}</TableCell>
                    <TableCell>{charge.owner}</TableCell>
                    <TableCell>{charge.chargeType}</TableCell>
                    <TableCell className="font-semibold">{charge.amount}</TableCell>
                    <TableCell className="text-sm">{charge.dueDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          charge.status === "paid"
                            ? "default"
                            : charge.status === "pending"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {charge.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
