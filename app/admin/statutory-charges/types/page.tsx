"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ChargeTypesPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toast } = useToast()

  const chargeTypes = [
    {
      id: 1,
      name: "Development Levy",
      description: "Levy for estate development and infrastructure",
      defaultAmount: "₦50,000",
      frequency: "Annual",
      status: "active",
    },
    {
      id: 2,
      name: "Service Charge",
      description: "Monthly service and maintenance charge",
      defaultAmount: "₦35,000",
      frequency: "Monthly",
      status: "active",
    },
    {
      id: 3,
      name: "Ground Rent",
      description: "Annual ground rent payment",
      defaultAmount: "₦25,000",
      frequency: "Annual",
      status: "active",
    },
  ]

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manage Charge Types</h1>
            <p className="text-muted-foreground mt-1">Configure statutory charge types and default amounts</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Charge Type
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Charge Types</CardTitle>
                <CardDescription>All configured statutory charge types</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search charge types..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Charge Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Default Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chargeTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">{type.description}</TableCell>
                    <TableCell className="font-semibold">{type.defaultAmount}</TableCell>
                    <TableCell>{type.frequency}</TableCell>
                    <TableCell>
                      <Badge variant="default">{type.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
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
