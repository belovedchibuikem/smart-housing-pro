"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

export default function PendingApprovalsPage() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pendingTransactions, setPendingTransactions] = useState<Array<{
    id: string
    memberName: string
    memberId: string
    type: string
    amount: number
    method: string
    accountNumber?: string
    bankName?: string
    date: string
    reference: string
  }>>([])

  const fetchPendingTransactions = async () => {
    setLoading(true)
    try {
      const res = await apiFetch<any>('/admin/wallets/pending').catch(() => ({ transactions: [], data: [] }))
      const list: any[] = Array.isArray(res?.transactions) ? res.transactions : (Array.isArray(res?.data) ? res.data : [])
      
      const normalized = list.map((t) => {
        const member = t.member || t.user || {}
        const amountNum = Number(t.amount ?? 0)
        const createdAt = t.created_at || t.date || t.timestamp
        const dateObj = createdAt ? new Date(createdAt) : null
        return {
          id: String(t.id ?? t.withdrawal_id ?? Math.random()),
          memberName: (member.name ?? member.full_name ?? `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()) || 'Unknown',
          memberId: member.member_id ?? member.staff_id ?? member.code ?? '—',
          type: 'withdrawal',
          amount: Math.abs(isFinite(amountNum) ? amountNum : 0),
          method: t.method ?? t.payment_method ?? 'Bank Transfer',
          accountNumber: t.account_number ?? t.account ?? undefined,
          bankName: t.bank_name ?? t.bank ?? undefined,
          date: dateObj ? dateObj.toLocaleString() : (t.date ?? ''),
          reference: t.reference ?? t.ref ?? t.transaction_ref ?? t.id ?? 'N/A',
        }
      })
      setPendingTransactions(normalized)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load pending transactions')
      setPendingTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingTransactions()
  }, [])

  const handleApprove = (transaction: any) => {
    setSelectedTransaction(transaction)
    setShowDialog(true)
  }

  const confirmApproval = async () => {
    if (!selectedTransaction) return

    try {
      await apiFetch<any>(`/admin/wallets/withdrawals/${selectedTransaction.id}/approve`, {
        method: 'POST',
        body: { approved: true, notes: 'Approved via admin panel' },
      })

      toast.success('Withdrawal approved successfully')
      setShowDialog(false)
      setSelectedTransaction(null)
      fetchPendingTransactions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve withdrawal')
    }
  }

  const handleReject = async (transaction: any) => {
    if (!confirm('Are you sure you want to reject this withdrawal request?')) return

    try {
      await apiFetch<any>(`/admin/wallets/withdrawals/${transaction.id}/reject`, {
        method: 'POST',
        body: { notes: 'Rejected via admin panel' },
      })

      toast.success('Withdrawal rejected')
      fetchPendingTransactions()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject withdrawal')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Refund</h1>
        <p className="text-muted-foreground mt-2">Review and approve withdrawal requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>
            {pendingTransactions.length} pending approval{pendingTransactions.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : pendingTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending withdrawal requests
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-lg">{transaction.memberName}</p>
                          <p className="text-sm text-muted-foreground">{transaction.memberId}</p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-semibold text-lg">₦{transaction.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Method</p>
                          <p className="font-medium">{transaction.method}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Bank</p>
                          <p className="font-medium">{transaction.bankName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Account Number</p>
                          <p className="font-medium">{transaction.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{transaction.date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Reference</p>
                          <p className="font-mono text-xs">{transaction.reference}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2">
                      <Button variant="outline" size="sm" className="flex-1 lg:flex-none bg-transparent">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 lg:flex-none"
                        onClick={() => handleApprove(transaction)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1 lg:flex-none"
                        onClick={() => handleReject(transaction)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Withdrawal</DialogTitle>
            <DialogDescription>Are you sure you want to approve this withdrawal request?</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-2 py-4">
              <p>
                <span className="font-medium">Member:</span> {selectedTransaction.memberName}
              </p>
              <p>
                <span className="font-medium">Amount:</span> ₦{selectedTransaction.amount.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Bank:</span> {selectedTransaction.bankName}
              </p>
              <p>
                <span className="font-medium">Account:</span> {selectedTransaction.accountNumber}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApproval}>Confirm Approval</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
