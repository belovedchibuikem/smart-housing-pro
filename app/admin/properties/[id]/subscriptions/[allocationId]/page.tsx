"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, DollarSign, Home, User, FileText, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getPropertySubscription, generatePropertySubscriptionCertificate } from "@/lib/api/client"

interface SubscriptionDetail {
  allocation: {
    id: string
    property_id: string
    member_id: string
    status: string
    allocation_date: string | null
    notes: string | null
    created_at: string
  }
  property: {
    id: string
    title: string
    address: string
    city: string | null
    state: string | null
    price: number
    size: number | null
    bedrooms: number | null
    bathrooms: number | null
    features: string[] | null
    images: Array<{ id: string; url: string; is_primary: boolean }>
  }
  member: {
    id: string
    member_id: string | null
    staff_id: string | null
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
  }
  payment_summary: {
    total_price: number
    amount_paid: number
    balance: number
    completion_percentage: number
  }
  payment_plan: {
    id: string
    status: string
    total_amount: number
    initial_balance: number
    remaining_balance: number
    funding_option: string
    selected_methods: string[]
    starts_on: string | null
    ends_on: string | null
    schedule: any[]
  } | null
  payment_history: Array<{
    id: string
    amount: number
    source: string
    status: string
    reference: string
    paid_at: string | null
    payment_reference: string | null
  }>
}

export default function SubscriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const allocationId = params.allocationId as string
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<SubscriptionDetail | null>(null)

  useEffect(() => {
    fetchSubscriptionDetails()
  }, [allocationId])

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true)
      const response = await getPropertySubscription(allocationId)
      if (response.success && response.data) {
        setData(response.data)
      } else {
        throw new Error('Failed to fetch subscription details')
      }
    } catch (error: any) {
      console.error('Failed to fetch subscription details:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load subscription details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCertificate = async () => {
    try {
      const response = await generatePropertySubscriptionCertificate(allocationId)
      
      if (response.success) {
        toast({
          title: "Certificate Generated",
          description: `Certificate ${response.certificate?.certificate_number || ''} has been generated successfully.`,
        })
      } else {
        throw new Error(response.message || 'Failed to generate certificate')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Subscription not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Subscription Details</h1>
            <p className="text-muted-foreground">View complete subscription information</p>
          </div>
        </div>
        {data.payment_summary.balance <= 0 && (
          <Button onClick={handleGenerateCertificate}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Certificate
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.payment_summary.total_price)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(data.payment_summary.amount_paid)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {data.payment_summary.completion_percentage.toFixed(1)}% completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(data.payment_summary.balance)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Property Title</div>
                  <div className="font-medium">{data.property.title}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium">{data.property.address}</div>
                  {(data.property.city || data.property.state) && (
                    <div className="text-sm text-muted-foreground">
                      {[data.property.city, data.property.state].filter(Boolean).join(', ')}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {data.property.size && (
                    <div>
                      <div className="text-sm text-muted-foreground">Size</div>
                      <div className="font-medium">{data.property.size} sqft</div>
                    </div>
                  )}
                  {data.property.bedrooms && (
                    <div>
                      <div className="text-sm text-muted-foreground">Bedrooms</div>
                      <div className="font-medium">{data.property.bedrooms}</div>
                    </div>
                  )}
                </div>
                {data.property.features && data.property.features.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Features</div>
                    <div className="flex flex-wrap gap-2">
                      {data.property.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Member Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Member Name</div>
                  <div className="font-medium">
                    {data.member.first_name} {data.member.last_name}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Member Number</div>
                  <div className="font-medium">{data.member.member_id || data.member.staff_id || '—'}</div>
                </div>
                {data.member.email && (
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{data.member.email}</div>
                  </div>
                )}
                {data.member.phone && (
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-medium">{data.member.phone}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Allocation Date</div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(data.allocation.allocation_date)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant={data.allocation.status === 'approved' ? 'default' : 'secondary'}>
                    {data.allocation.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {data.payment_plan && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Plan</CardTitle>
                <CardDescription>Payment plan details and schedule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Plan Status</div>
                    <Badge variant={data.payment_plan.status === 'completed' ? 'default' : 'secondary'}>
                      {data.payment_plan.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                    <div className="font-medium">{formatCurrency(data.payment_plan.total_amount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Remaining Balance</div>
                    <div className="font-medium">{formatCurrency(data.payment_plan.remaining_balance)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Funding Option</div>
                    <div className="font-medium capitalize">{data.payment_plan.funding_option}</div>
                  </div>
                </div>
                {data.payment_plan.selected_methods && data.payment_plan.selected_methods.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Payment Methods</div>
                    <div className="flex flex-wrap gap-2">
                      {data.payment_plan.selected_methods.map((method, index) => (
                        <Badge key={index} variant="outline">{method}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payments made for this subscription</CardDescription>
            </CardHeader>
            <CardContent>
              {data.payment_history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payment history available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.payment_history.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDate(payment.paid_at)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="capitalize">{payment.source}</TableCell>
                        <TableCell className="font-mono text-xs">{payment.reference || payment.payment_reference || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>Upcoming and completed payment schedule</CardDescription>
            </CardHeader>
            <CardContent>
              {data.payment_plan && data.payment_plan.schedule && data.payment_plan.schedule.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.payment_plan.schedule.map((scheduleItem: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(scheduleItem.due_date || scheduleItem.date)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(scheduleItem.amount || 0)}</TableCell>
                        <TableCell>
                          <Badge variant={scheduleItem.status === 'paid' ? 'default' : 'secondary'}>
                            {scheduleItem.status || 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payment schedule available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

