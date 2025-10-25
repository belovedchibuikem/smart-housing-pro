"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Download } from "lucide-react"

export default function PaymentRecordsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const payments = [
    {
      id: "PAY-2024-001",
      chargeId: "SC-2024-001",
      property: "3 Bedroom Duplex - Abuja",
      owner: "John Adebayo",
      amount: "₦50,000",
      paymentMethod: "Bank Transfer",
      paymentDate: "2024-03-10",
      status: "verified",
    },
    {
      id: "PAY-2024-002",
      chargeId: "SC-2024-004",
      property: "4 Bedroom Bungalow - Kano",
      owner: "Fatima Yusuf",
      amount: "₦35,000",
      paymentMethod: "Card",
      paymentDate: "2024-03-12",
      status: "verified",
    },
  ]

  return (
    <main className="flex-1 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Payment Records</h1>
          <p className="text-muted-foreground mt-1">View all statutory charge payment records</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Payment Records</CardTitle>
                <CardDescription>Complete payment history for statutory charges</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search payments..." className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Charge ID</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.chargeId}</TableCell>
                    <TableCell>{payment.property}</TableCell>
                    <TableCell>{payment.owner}</TableCell>
                    <TableCell className="font-semibold">{payment.amount}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell className="text-sm">{payment.paymentDate}</TableCell>
                    <TableCell>
                      <Badge variant="default">{payment.status}</Badge>
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
