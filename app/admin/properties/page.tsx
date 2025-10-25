"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Home, MapPin, DollarSign, Users, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")

  // Mock data
  const properties = [
    {
      id: 1,
      name: "Luxury 3-Bedroom Apartment",
      type: "House",
      location: "Maitama, Abuja",
      price: 25000000,
      status: "Available",
      subscribers: 3,
      image: "/modern-apartment-living.png",
    },
    {
      id: 2,
      name: "500 SQM Residential Land",
      type: "Land",
      location: "Gwarinpa, Abuja",
      price: 15000000,
      status: "Available",
      subscribers: 5,
      image: "/residential-land.png",
    },
    {
      id: 3,
      name: "4-Bedroom Duplex",
      type: "House",
      location: "Asokoro, Abuja",
      price: 45000000,
      status: "Sold Out",
      subscribers: 1,
      image: "/duplex-house.jpg",
    },
  ]

  const subscriptions = [
    {
      id: 1,
      memberName: "John Doe",
      memberNo: "MEM-001",
      property: "Luxury 3-Bedroom Apartment",
      totalPrice: 25000000,
      amountPaid: 20000000,
      balance: 5000000,
      paymentMethod: "Mixed (Cash + Cooperative)",
      status: "In Progress",
    },
    {
      id: 2,
      memberName: "Jane Smith",
      memberNo: "MEM-002",
      property: "500 SQM Residential Land",
      totalPrice: 15000000,
      amountPaid: 15000000,
      balance: 0,
      paymentMethod: "Cash",
      status: "Completed",
    },
  ]

  const pendingPayments = [
    {
      id: "PAY001",
      memberName: "John Doe",
      memberNo: "MEM-001",
      property: "Luxury 3-Bedroom Apartment",
      amount: 5000000,
      paymentMethod: "Bank Transfer",
      date: "2024-03-15",
      evidence: "receipt_001.pdf",
      status: "Pending",
    },
    {
      id: "PAY002",
      memberName: "Mike Johnson",
      memberNo: "MEM-003",
      property: "500 SQM Residential Land",
      amount: 7500000,
      paymentMethod: "Bank Transfer",
      date: "2024-03-14",
      evidence: "receipt_002.pdf",
      status: "Pending",
    },
    {
      id: "PAY003",
      memberName: "Sarah Williams",
      memberNo: "MEM-004",
      property: "4-Bedroom Duplex",
      amount: 10000000,
      paymentMethod: "Cash",
      date: "2024-03-13",
      evidence: "receipt_003.pdf",
      status: "Verified",
    },
  ]

  const handleVerifyPayment = (paymentId: string, action: "approve" | "reject") => {
    // TODO: Implement actual payment verification with database
    alert(`Payment ${paymentId} ${action === "approve" ? "approved" : "rejected"}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Management</h1>
          <p className="text-muted-foreground mt-1">Manage properties and subscriptions</p>
        </div>
        <Link href="/admin/properties/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Properties</div>
                <div className="text-2xl font-bold">24</div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Active Subscriptions</div>
                <div className="text-2xl font-bold">18</div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-2xl font-bold">₦450M</div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold">12</div>
              </div>
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="payments">Payment Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Properties</CardTitle>
                  <CardDescription>Manage your property listings</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search properties..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-[300px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden">
                    <img
                      src={property.image || "/placeholder.svg"}
                      alt={property.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <div className="font-semibold">{property.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {property.location}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">₦{(property.price / 1000000).toFixed(1)}M</div>
                        <Badge variant={property.status === "Available" ? "default" : "secondary"}>
                          {property.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{property.subscribers} subscriber(s)</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Subscriptions</CardTitle>
              <CardDescription>View and manage all property subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{sub.memberName}</div>
                        <div className="text-sm text-muted-foreground">{sub.memberNo}</div>
                      </div>
                      <Badge variant={sub.status === "Completed" ? "default" : "secondary"}>{sub.status}</Badge>
                    </div>
                    <div className="text-sm font-medium">{sub.property}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total Price</div>
                        <div className="font-semibold">₦{sub.totalPrice.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Amount Paid</div>
                        <div className="font-semibold text-green-600">₦{sub.amountPaid.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Balance</div>
                        <div className="font-semibold text-orange-600">₦{sub.balance.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Payment Method: {sub.paymentMethod}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        View Payments
                      </Button>
                      <Button variant="outline" size="sm">
                        Issue Certificate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Verification</CardTitle>
                  <CardDescription>Review and verify property payments</CardDescription>
                </div>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Member</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Evidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments
                      .filter((payment) => paymentFilter === "all" || payment.status.toLowerCase() === paymentFilter)
                      .map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{payment.memberName}</div>
                              <div className="text-sm text-muted-foreground">{payment.memberNo}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">{payment.property}</TableCell>
                          <TableCell className="text-right font-semibold">₦{payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.paymentMethod}</TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>
                            <Button variant="link" size="sm" className="p-0 h-auto">
                              View Evidence
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.status === "Verified"
                                  ? "default"
                                  : payment.status === "Pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.status === "Pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent"
                                  onClick={() => handleVerifyPayment(payment.id, "approve")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent"
                                  onClick={() => handleVerifyPayment(payment.id, "reject")}
                                >
                                  <XCircle className="h-4 w-4 mr-1 text-red-600" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
