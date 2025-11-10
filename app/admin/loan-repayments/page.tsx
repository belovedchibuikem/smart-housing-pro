"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { Loader2, Search, User, Wallet, CheckCircle2, History } from "lucide-react"

interface MemberSummary {
  id: string
  member_number: string | null
  name: string
  email?: string | null
  phone_number?: string | null
  active_loans: number
  outstanding_balance: number
}

interface LoanSummary {
  id: string
  status: string
  product?: string | null
  amount: number
  total_amount: number
  interest_rate: number
  duration_months: number
  total_repaid: number
  balance: number
  monthly_payment: number
  approved_at?: string | null
  last_repayment_at?: string | null
}

interface MemberDetail {
  id: string
  member_number: string | null
  name: string
  email?: string | null
  phone_number?: string | null
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
})

const paymentMethodOptions = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "wallet", label: "Wallet" },
  { value: "paystack", label: "Paystack" },
  { value: "manual", label: "Manual Entry" },
]

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  active: "default",
  completed: "default",
  rejected: "destructive",
  overdue: "destructive",
}

export default function AdminLoanRepaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [memberResults, setMemberResults] = useState<MemberSummary[]>([])
  const [searchingMembers, setSearchingMembers] = useState(false)
  const [selectedMember, setSelectedMember] = useState<MemberDetail | null>(null)
  const [memberLoans, setMemberLoans] = useState<LoanSummary[]>([])
  const [loadingLoans, setLoadingLoans] = useState(false)
  const [selectedLoanId, setSelectedLoanId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("bank_transfer")
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [reference, setReference] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setMemberResults([])
      return
    }

    let active = true
    setSearchingMembers(true)

    ;(async () => {
      try {
        const response = await apiFetch<{ success: boolean; data: MemberSummary[]; message?: string }>(
          `/admin/loan-repayments/members?query=${encodeURIComponent(trimmed)}`,
        )

        if (!active) return

        if (response.success) {
          setMemberResults(response.data ?? [])
        } else {
          setMemberResults([])
          if (response.message) {
            sonnerToast.error(response.message)
          }
        }
      } catch (error: any) {
        if (!active) return
        console.error("Failed to search members:", error)
        sonnerToast.error("Unable to search members", {
          description: error?.message || "Please try again later.",
        })
      } finally {
        if (active) {
          setSearchingMembers(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [searchQuery])

  const selectedLoan = useMemo(
    () => memberLoans.find((loan) => loan.id === selectedLoanId) ?? null,
    [memberLoans, selectedLoanId],
  )

  const stats = useMemo(() => {
    const outstanding = memberLoans.reduce((sum, loan) => sum + (loan.balance || 0), 0)
    const pending = memberLoans.filter((loan) => ["pending", "approved", "active"].includes(loan.status)).length
    const approved = memberLoans.filter((loan) => loan.status === "completed").length
    const totalAllTime = memberLoans.reduce((sum, loan) => sum + (loan.total_amount || 0), 0)

    return {
      outstanding,
      pending,
      approved,
      totalAllTime,
    }
  }, [memberLoans])

  const handleSelectMember = async (memberId: string) => {
    try {
      setSelectedMember(null)
      setMemberLoans([])
      setSelectedLoanId("")
      setAmount("")
      setReference("")
      setLoadingLoans(true)

      const response = await apiFetch<{
        success: boolean
        member: MemberDetail
        loans: LoanSummary[]
      }>(`/admin/loan-repayments/members/${memberId}/loans`)

      if (response.success) {
        setSelectedMember(response.member)
        setMemberLoans(response.loans ?? [])

        const preferredLoan =
          response.loans?.find((loan) => loan.balance > 0) ??
          response.loans?.find((loan) => ["approved", "active"].includes(loan.status)) ??
          response.loans?.[0]

        if (preferredLoan) {
          setSelectedLoanId(preferredLoan.id)
          const defaultAmount =
            preferredLoan.balance > 0
              ? Math.min(preferredLoan.balance, preferredLoan.monthly_payment || preferredLoan.balance)
              : preferredLoan.monthly_payment || preferredLoan.amount
          setAmount(defaultAmount > 0 ? String(Number(defaultAmount.toFixed(2))) : "")
        }
      }
    } catch (error: any) {
      console.error("Failed to load member loans:", error)
      sonnerToast.error("Unable to load member loans", {
        description: error?.message || "Please try again later.",
      })
    } finally {
      setLoadingLoans(false)
    }
  }

  const handleSubmitRepayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedMember) {
      sonnerToast.error("Select a member first", {
        description: "Search and select a member to continue.",
      })
      return
    }

    if (!selectedLoan) {
      sonnerToast.error("Select a loan", {
        description: "Choose the loan you want to record repayment for.",
      })
      return
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      sonnerToast.error("Invalid amount", {
        description: "Enter a valid repayment amount.",
      })
      return
    }

    if (selectedLoan.balance > 0 && numericAmount > selectedLoan.balance) {
      sonnerToast.error("Amount exceeds balance", {
        description: `Maximum repayable amount is ${currencyFormatter.format(selectedLoan.balance)}.`,
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await apiFetch<{
        success: boolean
        message?: string
        data?: {
          loan: { balance: number; status: string; total_repaid: number }
        }
        error?: string
      }>("/admin/loan-repayments", {
        method: "POST",
        body: {
          member_id: selectedMember.id,
          loan_id: selectedLoan.id,
          amount: numericAmount,
          payment_method: paymentMethod,
          payment_date: paymentDate || undefined,
          reference: reference || undefined,
        },
      })

      if (!response.success) {
        sonnerToast.error("Repayment failed", {
          description: response.message || response.error || "Unable to record loan repayment.",
        })
        return
      }

      sonnerToast.success("Loan repayment recorded", {
        description: response.message || "The repayment has been saved successfully.",
      })

      await handleSelectMember(selectedMember.id)
      setReference("")
    } catch (error: any) {
      console.error("Failed to submit repayment:", error)
      sonnerToast.error("Unable to record repayment", {
        description: error?.message || "Please try again later.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Individual Loan Repayment</h1>
          <p className="text-muted-foreground mt-1">
            Search for a member, review their loan balance, and record repayments on their behalf.
          </p>
        </div>
        {selectedMember && (
          <Card className="border-primary/40 bg-primary/5 shadow-none">
            <CardContent className="flex items-center gap-3 py-4">
              <User className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Selected Member</p>
                <p className="font-semibold text-lg">{selectedMember.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMember.member_number ?? "Member ID unavailable"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding Balance</CardDescription>
            <CardTitle className="text-2xl tabular-nums font-semibold break-words">
              {currencyFormatter.format(stats.outstanding || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-2xl font-semibold">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-2xl font-semibold">{stats.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total All Time</CardDescription>
            <CardTitle className="text-2xl tabular-nums font-semibold break-words">
              {currencyFormatter.format(stats.totalAllTime || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Members</CardTitle>
          <CardDescription>Find a member by name, email, phone number, or member ID.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Type at least two characters to search..."
              className="pl-10"
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Member ID</TableHead>
                  <TableHead>Active Loans</TableHead>
                  <TableHead>Outstanding Balance</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchingMembers ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Searching members...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : memberResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                      No members found. Adjust your search term to try again.
                    </TableCell>
                  </TableRow>
                ) : (
                  memberResults.map((member) => (
                    <TableRow
                      key={member.id}
                      className={cn(
                        "transition-colors",
                        selectedMember?.id === member.id ? "bg-primary/5" : undefined,
                      )}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.name}</span>
                          <span className="text-xs text-muted-foreground">{member.email ?? member.phone_number}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.member_number ?? "—"}</TableCell>
                      <TableCell>{member.active_loans}</TableCell>
                      <TableCell className="tabular-nums">
                        {currencyFormatter.format(member.outstanding_balance || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={selectedMember?.id === member.id ? "secondary" : "outline"}
                          onClick={() => handleSelectMember(member.id)}
                          disabled={loadingLoans && selectedMember?.id === member.id}
                        >
                          {loadingLoans && selectedMember?.id === member.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : selectedMember?.id === member.id ? (
                            "Selected"
                          ) : (
                            "Select"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Member Loans</CardTitle>
            <CardDescription>Select a loan to view balance and record repayment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingLoans ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading loans...
              </div>
            ) : memberLoans.length === 0 ? (
              <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground">
                {selectedMember
                  ? "This member has no loans available for repayment."
                  : "Select a member to view their loans."}
              </div>
            ) : (
              <div className="space-y-2">
                {memberLoans.map((loan) => (
                  <button
                    key={loan.id}
                    type="button"
                    onClick={() => {
                      setSelectedLoanId(loan.id)
                      const defaultValue =
                        loan.balance > 0
                          ? Math.min(loan.balance, loan.monthly_payment || loan.balance)
                          : loan.monthly_payment || loan.amount
                      setAmount(defaultValue > 0 ? String(Number(defaultValue.toFixed(2))) : "")
                    }}
                    className={cn(
                      "w-full text-left border rounded-lg p-4 transition-colors",
                      selectedLoanId === loan.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariantMap[loan.status] || "outline"} className="capitalize">
                            {loan.status.replace("_", " ")}
                          </Badge>
                          {loan.product && <span className="text-sm text-muted-foreground">{loan.product}</span>}
                        </div>
                        <p className="font-semibold text-lg tabular-nums">
                          {currencyFormatter.format(loan.total_amount)}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            <Wallet className="inline h-3 w-3 mr-1" />
                            Outstanding:{" "}
                            <span className="font-medium text-foreground">
                              {currencyFormatter.format(loan.balance)}
                            </span>
                          </p>
                          <p>
                            <History className="inline h-3 w-3 mr-1" />
                            Repaid: {currencyFormatter.format(loan.total_repaid)}
                          </p>
                          {loan.monthly_payment > 0 && (
                            <p>Expected installment: {currencyFormatter.format(loan.monthly_payment)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground space-y-1">
                        {loan.approved_at && <p>Approved: {new Date(loan.approved_at).toLocaleDateString()}</p>}
                        {loan.last_repayment_at && (
                          <p>Last payment: {new Date(loan.last_repayment_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Record Repayment</CardTitle>
            <CardDescription>Enter repayment details and confirm to update the loan balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmitRepayment}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Repayment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="e.g. 250000"
                    disabled={!selectedLoan}
                  />
                  {selectedLoan && (
                    <p className="text-xs text-muted-foreground">
                      Outstanding balance:{" "}
                      <span className="font-medium text-foreground">
                        {currencyFormatter.format(selectedLoan.balance)}
                      </span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!selectedLoan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={paymentDate}
                    onChange={(event) => setPaymentDate(event.target.value)}
                    disabled={!selectedLoan}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference (optional)</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(event) => setReference(event.target.value)}
                    placeholder="Transaction reference or receipt number"
                    disabled={!selectedLoan}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={submitting || !selectedLoan || !selectedMember}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Record Repayment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

