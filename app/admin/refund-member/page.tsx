"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, DollarSign, Loader2, AlertCircle, Coins, X } from "lucide-react"
import { MemberFinancialSummaryGrid } from "@/components/admin/member-financial-summary-grid"
import {
  apiFetch,
  getAdminRefundMemberSummary,
  createAdminRefund,
  type AdminRefundMemberSummary,
  type CreateRefundPayload,
} from "@/lib/api/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const SOURCE_LABELS = {
  wallet: "Wallet",
  contribution: "Contribution",
  investment_return: "Investment Profit",
  equity_wallet: "Equity Wallet",
} as const

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
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [summary, setSummary] = useState<AdminRefundMemberSummary["summary"] | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Refund form data
  const [refundData, setRefundData] = useState({
    source: "wallet",
    amount: "",
    reason: "",
    notes: "",
  })

  const loadMemberSummary = async (memberId: string) => {
    setSummary(null)
    setSummaryLoading(true)
    try {
      const response = await getAdminRefundMemberSummary(memberId)
      if (response?.success) {
        setSummary(response.summary)
      }
    } catch (error: any) {
      console.error("Failed to load refund summary", error)
      toast.error(error?.message || "Failed to load member balances")
    } finally {
      setSummaryLoading(false)
    }
  }

  const searchMembers = async () => {
    if (!searchQuery.trim()) {
      setMembers([])
      setSelectedMember(null)
      setSummary(null)
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
          member_id: m.member_number != null && String(m.member_number) !== '' ? String(m.member_number) : (m.staff_id ?? m.code ?? '—'),
          wallet_balance: Number(wallet.balance ?? wallet.current_balance ?? 0) || 0,
          contribution_balance: Number(m.contribution_balance ?? m.total_contributions ?? 0) || 0,
          investment_balance: Number(m.investment_balance ?? m.total_investments ?? 0) || 0,
        }
      })
      setMembers(normalized)
      if (normalized.length === 1) {
        handleSelectMember(normalized[0])
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to search members')
      setMembers([])
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (selectedMember) {
      return
    }
    const timer = setTimeout(() => {
      searchMembers()
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedMember])

  const formatCurrency = (value?: number | null) => {
    const numeric = Number(value ?? 0)
    if (!Number.isFinite(numeric)) {
      return "₦0"
    }
    return `₦${numeric.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const sourceOptions = useMemo(() => {
    return [
      {
        value: "wallet",
        label: SOURCE_LABELS.wallet,
        available: summary?.wallet.balance ?? 0,
      },
      {
        value: "contribution",
        label: SOURCE_LABELS.contribution,
        available: summary?.contribution.available ?? 0,
      },
      {
        value: "investment_return",
        label: SOURCE_LABELS.investment_return,
        available: summary?.investment_returns.available ?? 0,
      },
      {
        value: "equity_wallet",
        label: SOURCE_LABELS.equity_wallet,
        available: summary?.equity_wallet.available ?? summary?.equity_wallet.balance ?? 0,
      },
    ]
  }, [summary])

  const handleSelectMember = (member: Member) => {
    setMembers([])
    setSelectedMember(member)
    setRefundData({ source: "wallet", amount: "", reason: "", notes: "" })
    loadMemberSummary(member.id)
  }

  const clearMemberSelection = () => {
    setSelectedMember(null)
    setSummary(null)
    setMembers([])
    setSearchQuery("")
  }

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

    const maxAvailable = getMaxAmount()
    if (!summary || maxAvailable <= 0) {
      toast.error('Insufficient balance for the selected source')
      return
    }

    if (amount > maxAvailable) {
      toast.error(`Amount exceeds available balance (${maxAvailable.toLocaleString(undefined, { minimumFractionDigits: 0 })})`)
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
        source: refundData.source as CreateRefundPayload['source'],
        amount: parseFloat(refundData.amount),
        reason: refundData.reason,
        notes: refundData.notes,
        auto_approve: true,
      }

      const response = await createAdminRefund(payload)

      if (!response.success) {
        throw new Error(response.message || 'Refund failed')
      }

      toast.success(response.message || 'Refund processed successfully')
      setRefundData({ source: refundData.source, amount: "", reason: "", notes: "" })
      if (response.data?.summary) {
        setSummary(response.data.summary)
      } else if (selectedMember) {
        await loadMemberSummary(selectedMember.id)
      }
      setShowConfirmDialog(false)
      
      if (selectedMember) {
        await loadMemberSummary(selectedMember.id)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to process refund')
    } finally {
      setSubmitting(false)
    }
  }

  const getMaxAmount = () => {
    if (!summary) return 0
    switch (refundData.source) {
      case "wallet":
        return summary.wallet.balance || 0
      case "contribution":
        return summary.contribution.available || 0
      case "investment_return":
        return summary.investment_returns.available || 0
      case "equity_wallet":
        return (summary.equity_wallet.available ?? summary.equity_wallet.balance) ?? 0
      default:
        return 0
    }
  }

  const getSourceLabel = (source: string) => {
    return SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] ?? source
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Refund Member</h1>
        <p className="text-muted-foreground mt-2">
          Process refunds from wallet balances, contributions, investment returns, or equity wallet on behalf of members.
          Refunds are recorded automatically and deducted from the selected source.
        </p>
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
                disabled={!!selectedMember}
                className="pl-10"
              />
            </div>

            {selectedMember && (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Selected member</p>
                  <p className="font-medium truncate">{selectedMember.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMember.member_id}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" className="shrink-0" onClick={clearMemberSelection}>
                  <X className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
            )}

            {searching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {!searching && !selectedMember && members.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {members.map((member) => (
                  <Card
                    key={member.id}
                    className="cursor-pointer transition-colors hover:border-primary/40"
                    onClick={() => handleSelectMember(member)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.member_id}</p>
                        </div>
                        <Badge variant="secondary">
                          {formatCurrency(member.wallet_balance)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!searching && !selectedMember && searchQuery && members.length === 0 && (
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
              <div className="space-y-3 pt-4 border-t">
                <MemberFinancialSummaryGrid summary={summary} loading={summaryLoading} />
              </div>
              {!summaryLoading && !summary && (
                <Alert variant="default">
                  <AlertTitle>Balances unavailable</AlertTitle>
                  <AlertDescription>
                    Select a member to load wallet, contribution, investment, and equity balances.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {summary && summary.loans.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Loan Overview
            </CardTitle>
            <CardDescription>
              Total outstanding across loans: {formatCurrency(summary.loans.outstanding_total)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="text-left">
                    <th className="pb-2 font-medium">Loan ID</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Principal</th>
                    <th className="pb-2 font-medium text-right">Repaid</th>
                    <th className="pb-2 font-medium text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {summary.loans.items.map((loan) => (
                    <tr key={loan.id} className="hover:bg-muted/50">
                      <td className="py-2 font-medium">{loan.id}</td>
                      <td className="py-2 capitalize">{loan.status.replace(/_/g, " ")}</td>
                      <td className="py-2 text-right">{formatCurrency(loan.principal)}</td>
                      <td className="py-2 text-right text-green-600">{formatCurrency(loan.repaid)}</td>
                      <td className="py-2 text-right font-semibold text-blue-600">{formatCurrency(loan.outstanding)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

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
                  onValueChange={(value: "wallet" | "contribution" | "investment_return" | "equity_wallet") =>
                    setRefundData({ ...refundData, source: value })
                  }
                >
                  <SelectTrigger id="source">
                      <SelectValue placeholder="Select refund source" />
                  </SelectTrigger>
                  <SelectContent>
                      {sourceOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={!summary || option.available <= 0}
                        >
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">
                              Available: {formatCurrency(option.available)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary
                    ? `Available: ${formatCurrency(getMaxAmount())}`
                    : "Balances appear once member data loads"}
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
                  setRefundData({ source: "wallet", amount: "", reason: "", notes: "" })
                  setSummaryLoading(false)
                  clearMemberSelection()
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
                <span className="font-medium text-lg">{formatCurrency(parseFloat(refundData.amount || "0"))}</span>
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

