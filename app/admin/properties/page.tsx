"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Home, MapPin, DollarSign, Users, Eye, Edit, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface Property {
  id: string
  title?: string
  description?: string
  address?: string
  city?: string
  state?: string
  property_type?: string
  price?: number
  status?: string
  images?: Array<{ url: string }>
  allocations?: Array<{ member: any }>
}

export default function AdminPropertiesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState<Property[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")

  useEffect(() => {
    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  useEffect(() => {
    fetchSubscriptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchPendingPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentFilter])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      const response = await apiFetch<{ success: boolean; data: Property[] }>(
        `/admin/properties?${params.toString()}`
      )
      if (response.success) {
        setProperties(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      // Fetch property allocations as subscriptions
      const response = await apiFetch<{ success: boolean; data: any[] }>("/admin/properties?per_page=100")
      const props = (response.success ? response.data : []) || []
      const subs: any[] = []
      props.forEach(prop => {
        if (prop.allocations) {
          prop.allocations.forEach((alloc: any) => {
            subs.push({
              id: alloc.id,
              memberName: `${alloc.member?.user?.first_name || ''} ${alloc.member?.user?.last_name || ''}`.trim(),
              memberNo: alloc.member?.member_id || alloc.member?.staff_id || '—',
              property: prop.title || prop.address || '—',
              totalPrice: prop.price || 0,
              amountPaid: (alloc as any).amount_paid || 0,
              balance: (prop.price || 0) - ((alloc as any).amount_paid || 0),
              paymentMethod: 'Mixed',
              status: alloc.status === 'completed' ? 'Completed' : 'In Progress',
              allocation: alloc,
            })
          })
        }
      })
      setSubscriptions(subs)
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    }
  }

  const fetchPendingPayments = async () => {
    try {
      // This would typically come from a payment verification endpoint
      // For now, we'll use wallet transactions or create an endpoint
      const response = await apiFetch<{ success?: boolean; transactions?: { data: any[] }; data?: any[] }>("/admin/wallets/transactions?type=deposit&status=pending")
      const transactionsData = response.success ? (response.data || []) : (response.transactions?.data || [])
      const payments = transactionsData.map((tx: any, index: number) => ({
        id: tx.id || `PAY${String(index + 1).padStart(3, '0')}`,
        memberName: tx.member?.name || 'Unknown',
        memberNo: tx.member?.member_id || '—',
        property: 'Property Payment',
        amount: tx.amount || 0,
        paymentMethod: tx.method || 'Bank Transfer',
        date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        evidence: tx.reference || 'N/A',
        status: tx.status === 'completed' ? 'Verified' : tx.status === 'failed' ? 'Rejected' : 'Pending',
        transaction: tx,
      }))
      setPendingPayments(payments)
    } catch (error) {
      console.error('Failed to fetch pending payments:', error)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return
    
    try {
      await apiFetch(`/admin/properties/${id}`, { method: "DELETE" })
      toast({
        title: "Success",
        description: "Property deleted successfully",
      })
      fetchProperties()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      })
    }
  }

  const handleViewProperty = (id: string) => {
    router.push(`/admin/properties/${id}`)
  }

  const handleEditProperty = (id: string) => {
    router.push(`/admin/properties/${id}/edit`)
  }

  const handleViewSubscriptionDetails = (subscription: any) => {
    router.push(`/admin/properties/${subscription.allocation?.property_id || ''}/allocations/${subscription.id}`)
  }

  const handleViewSubscriptionPayments = (subscription: any) => {
    router.push(`/admin/wallets/transactions?member=${subscription.allocation?.member_id}`)
  }

  const handleIssueCertificate = async (subscription: any) => {
    toast({
      title: "Certificate",
      description: "Certificate issuance functionality will be implemented",
    })
  }

  const handleVerifyPayment = async (payment: any, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await apiFetch(`/admin/wallets/withdrawals/${payment.id}/approve`, { method: "POST" })
      } else {
        await apiFetch(`/admin/wallets/withdrawals/${payment.id}/reject`, { method: "POST" })
      }
      toast({
        title: "Success",
        description: `Payment ${action === "approve" ? "approved" : "rejected"} successfully`,
      })
      fetchPendingPayments()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} payment`,
        variant: "destructive",
      })
    }
  }

  const stats = {
    totalProperties: properties.length,
    activeSubscriptions: subscriptions.filter(s => s.status === 'In Progress').length,
    totalValue: properties.reduce((sum, p) => sum + (p.price || 0), 0),
    completed: subscriptions.filter(s => s.status === 'Completed').length,
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
                <div className="text-2xl font-bold">{stats.totalProperties}</div>
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
                <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
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
                <div className="text-2xl font-bold">₦{(stats.totalValue / 1000000).toFixed(0)}M</div>
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
                <div className="text-2xl font-bold">{stats.completed}</div>
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
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading properties...</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No properties found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <img
                        src={property.images?.[0]?.url || "/placeholder.svg"}
                        alt={property.title || "Property"}
                        className="w-full h-48 object-cover"
                      />
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <div className="font-semibold">{property.title || "Untitled Property"}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {property.address || property.city || property.state || "No location"}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-primary">₦{((property.price || 0) / 1000000).toFixed(1)}M</div>
                          <Badge variant={property.status === "available" ? "default" : "secondary"}>
                            {property.status || "N/A"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.allocations?.length || 0} subscriber(s)
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-transparent"
                            onClick={() => handleViewProperty(property.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-transparent"
                            onClick={() => handleEditProperty(property.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteProperty(property.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSubscriptionDetails(sub)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSubscriptionPayments(sub)}
                      >
                        View Payments
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleIssueCertificate(sub)}
                        disabled={sub.status !== "Completed"}
                      >
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
                                  onClick={() => handleVerifyPayment(payment, "approve")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent"
                                  onClick={() => handleVerifyPayment(payment, "reject")}
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
