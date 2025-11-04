"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getStatutoryChargePayments } from "@/lib/api/client"

interface Payment {
  id: string
  statutory_charge_id: string
  statutory_charge?: {
    id: string
    type: string
    member?: {
      user?: {
        first_name: string
        last_name: string
      }
    }
  }
  amount: number
  payment_method: string
  reference?: string
  status: string
  paid_at: string
}

export default function PaymentRecordsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await getStatutoryChargePayments({})
      if (response.success) {
        setPayments(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payment records",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      payment.id.toLowerCase().includes(search) ||
      payment.reference?.toLowerCase().includes(search) ||
      payment.payment_method.toLowerCase().includes(search) ||
      payment.statutory_charge?.type.toLowerCase().includes(search) ||
      `${payment.statutory_charge?.member?.user?.first_name} ${payment.statutory_charge?.member?.user?.last_name}`.toLowerCase().includes(search)
    )
  })

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
                <Input 
                  placeholder="Search payments..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No payment records found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Charge Type</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id.substring(0, 8)}...</TableCell>
                      <TableCell>{payment.statutory_charge?.type || '—'}</TableCell>
                      <TableCell>
                        {payment.statutory_charge?.member?.user 
                          ? `${payment.statutory_charge.member.user.first_name} ${payment.statutory_charge.member.user.last_name}`
                          : '—'}
                      </TableCell>
                      <TableCell className="font-semibold">₦{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.payment_method}</TableCell>
                      <TableCell>{payment.reference || '—'}</TableCell>
                      <TableCell className="text-sm">
                        {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'pending' ? 'secondary' : 'destructive'}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/statutory-charges/${payment.statutory_charge_id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
