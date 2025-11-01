"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, DollarSign, User, Wallet, TrendingUp, CreditCard, Loader2, AlertCircle } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Member {
  id: string
  name: string
  member_id: string
  wallet_balance: number
  contribution_balance?: number
  investment_balance?: number
}

export default function RefundMemberPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Refund form data
  const [refundData, setRefundData] = useState({
    source: "contribution", // contribution, investment_return, investment
    amount: "",
    reason: "",
    notes: "",
  })

  const searchMembers = async () => {
    if (!searchQuery.trim()) {
      setMembers([])
      setSelectedMember(null)
      return
    }

    setSearching(true)
    try {
      const res = await apiFetch<any>(`/admin/members?search=${encodeURIComponent(searchQuery)}`).catch(() => ({ members: [], data: [] }))
      const list: any[] = Array.isArray(res?.members) ? res.members : (Array.isArray(res?.data) ? res.data : [])

      const normalized = list.map((m) => {
        const user = m.user || {}
        const wallet = m.wallet || {}
        return {
          id: String(m.id ?? user.id ?? ''),
          name: (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.name ?? user.full_name ?? 'Unknown').trim(),
          member_id: m.member_id ?? m.staff_id ?? m.code ?? '—',
          wallet_balance: Number(wallet.balance ?? wallet.current_balance ?? 0) || 0,
          contribution_balance: Number(m.contribution_balance ?? m.total_contributions ?? 0) || 0,
          investment_balance: Number(m.investment_balance ?? m.total_investments ?? 0) || 0,
        }
      })
      setMembers(normalized)
      if (normalized.length === 1) {
        setSelectedMember(normalized[0])
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to search members')
      setMembers([])
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMembers()
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleSubmitRefund = async () => {
    if (!selectedMember) {
      toast.error('Please select a member')
      return
    }

    const amount = parseFloat(refundData.amount)
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    // Check if member has sufficient balance based on source
    if (refundData.source === 'contribution' && amount > (selectedMember.contribution_balance || 0)) {
      toast.error('Insufficient contribution balance')
      return
    }

    if (refundData.source === 'investment' && amount > (selectedMember.investment_balance || 0)) {
      toast.error('Insufficient investment balance')
      return
    }

    if (amount > selectedMember.wallet_balance) {
      toast.error('Insufficient wallet balance')
      return
    }

    setShowConfirmDialog(true)
  }

  const confirmRefund = async () => {
    if (!selectedMember) return

    setSubmitting(true)
    try {
      const payload = {
        member_id: selectedMember.id,
        source: refundData.source,
        amount: parseFloat(refundData.amount),
        reason: refundData.reason,
        notes: refundData.notes,
        auto_approve: true, // Automatically approved
      }

      await apiFetch<any>('/admin/refund-member', {
        method: 'POST',
        body: payload,
      })

      toast.success('Refund processed successfully')
      setRefundData({ source: "contribution", amount: "", reason: "", notes: "" })
      setSelectedMember(null)
      setSearchQuery("")
      setMembers([])
      setShowConfirmDialog(false)
      
      // Refresh member data if still selected
      if (selectedMember) {
        searchMembers()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process refund')
    } finally {
      setSubmitting(false)
    }
  }

  const getMaxAmount = () => {
    if (!selectedMember) return 0
    if (refundData.source === 'contribution') return selectedMember.contribution_balance || 0
    if (refundData.source === 'investment') return selectedMember.investment_balance || 0
    return selectedMember.wallet_balance || 0
  }

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'contribution':
        return 'Contribution'
      case 'investment_return':
        return 'Investment Return'
      case 'investment':
        return 'Investment'
      default:
        return source
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Refund Member</h1>
        <p className="text-muted-foreground mt-2">Process refunds from contributions, investment returns, or investments on behalf of members</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Member Search */}
        <Card>
          <CardHeader>
            <CardTitle>Select Member</CardTitle>
            <CardDescription>Search for a member to process refund</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or member ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!searching && members.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    className={`cursor-pointer transition-colors ${
                      selectedMember?.id === member.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.member_id}</p>
                        </div>
                        <Badge variant="secondary">₦{member.wallet_balance.toLocaleString()}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!searching && searchQuery && members.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                No members found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Member Info */}
        {selectedMember && (
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Member Name</Label>
                <p className="font-medium">{selectedMember.name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Member ID</Label>
                <p className="font-medium">{selectedMember.member_id}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-blue-500" />
                    <Label className="text-xs text-muted-foreground">Wallet</Label>
                  </div>
                  <p className="font-semibold">₦{selectedMember.wallet_balance.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <Label className="text-xs text-muted-foreground">Contributions</Label>
                  </div>
                  <p className="font-semibold">₦{(selectedMember.contribution_balance || 0).toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <Label className="text-xs text-muted-foreground">Investments</Label>
                  </div>
                  <p className="font-semibold">₦{(selectedMember.investment_balance || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refund Form */}
      {selectedMember && (
        <Card>
          <CardHeader>
            <CardTitle>Refund Details</CardTitle>
            <CardDescription>Enter refund information. This will be automatically approved and processed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="source">Refund Source *</Label>
                <Select
                  value={refundData.source}
                  onValueChange={(value) => setRefundData({ ...refundData, source: value })}
                >
                  <SelectTrigger id="source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contribution">Contribution</SelectItem>
                    <SelectItem value="investment_return">Investment Return</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: ₦{getMaxAmount().toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount (₦) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={refundData.amount}
                  onChange={(e) => setRefundData({ ...refundData, amount: e.target.value })}
                  min="0"
                  max={getMaxAmount()}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum: ₦{getMaxAmount().toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="reason">Reason for Refund *</Label>
              <Input
                id="reason"
                placeholder="e.g., Overpayment, Error correction, etc."
                value={refundData.reason}
                onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                rows={3}
                value={refundData.notes}
                onChange={(e) => setRefundData({ ...refundData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setRefundData({ source: "contribution", amount: "", reason: "", notes: "" })
                  setSelectedMember(null)
                  setSearchQuery("")
                  setMembers([])
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitRefund} disabled={submitting || !refundData.amount || !refundData.reason}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Refund
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to process this refund? This action will be automatically approved and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Member:</span>
                <span className="font-medium">{selectedMember.name} ({selectedMember.member_id})</span>
                <span className="text-muted-foreground">Source:</span>
                <span className="font-medium">{getSourceLabel(refundData.source)}</span>
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium text-lg">₦{parseFloat(refundData.amount || '0').toLocaleString()}</span>
                <span className="text-muted-foreground">Reason:</span>
                <span className="font-medium">{refundData.reason}</span>
              </div>
              {refundData.notes && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                  <p className="text-sm">{refundData.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={confirmRefund} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Process'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

