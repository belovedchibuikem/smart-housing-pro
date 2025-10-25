"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Plus } from "lucide-react"

export default function DepartmentAllocationPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const allocations = [
    {
      id: 1,
      department: "Engineering Department",
      chargeType: "Development Levy",
      allocationPercentage: "60%",
      totalAllocated: "₦1.2M",
      status: "active",
    },
    {
      id: 2,
      department: "Maintenance Department",
      chargeType: "Service Charge",
      allocationPercentage: "80%",
      totalAllocated: "₦800K",
      status: "active",
    },
    {
      id: 3,
      department: "Legal Department",
      chargeType: "Ground Rent",
      allocationPercentage: "100%",
      totalAllocated: "₦500K",
      status: "active",
    },
  ]

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Department Allocation</h1>
            <p className="text-muted-foreground mt-1">Manage charge allocation to departments</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Allocation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Department Allocations</CardTitle>
                <CardDescription>Charge distribution across departments</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search allocations..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Charge Type</TableHead>
                  <TableHead>Allocation %</TableHead>
                  <TableHead>Total Allocated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell className="font-medium">{allocation.department}</TableCell>
                    <TableCell>{allocation.chargeType}</TableCell>
                    <TableCell className="font-semibold">{allocation.allocationPercentage}</TableCell>
                    <TableCell className="font-semibold text-green-600">{allocation.totalAllocated}</TableCell>
                    <TableCell>
                      <Badge variant="default">{allocation.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
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
