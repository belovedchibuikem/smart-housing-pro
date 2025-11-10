"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  getContributionPaymentMethods,
  getContributionPlans,
  getWallet,
  initializeContributionPayment,
  uploadPaymentEvidence,
} from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { Building2, CreditCard, Info, Loader2, Receipt, Wallet as WalletIcon } from "lucide-react"

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
})

const frequencyToDays: Record<string, number> = {
  monthly: 30,
  quarterly: 90,
  annually: 365,
  one_time: 0,
}

type ContributionPlanSummary = {
  id: string
  name: string
  description: string | null
  amount: number
  minimum_amount: number
  frequency: string
  is_mandatory: boolean
}

type MemberPlanSummary = {
  plan: ContributionPlanSummary
  started_at: string | null
  last_contribution_at: string | null
  contributions_count: number
  total_contributed: number
}

type ManualAccount = {
  id: string
  bank_name?: string
  account_name?: string
  account_number?: string
  instructions?: string
  is_primary?: boolean
}

type ManualConfig = {
  require_payer_name?: boolean
  require_payer_phone?: boolean
  require_transaction_reference?: boolean
  require_payment_evidence?: boolean
  bank_accounts?: ManualAccount[]
}

type TenantPaymentMethod = {
  id: string
  name: string
  description: string
  icon: string
  is_enabled: boolean
  configuration?: ManualConfig
}

type SubmissionInfo = {
  message?: string
  reference?: string
  manualInstructions?: {
    account?: Record<string, unknown>
    requires_payment_evidence?: boolean
    message?: string
  }
  paymentMethod?: string
}

type Stage = "details" | "review" | "confirm"

const methodIconMap: Record<string, JSX.Element> = {
  wallet: <WalletIcon className="h-5 w-5 text-primary" />,
  paystack: <CreditCard className="h-5 w-5 text-primary" />,
  remita: <CreditCard className="h-5 w-5 text-primary" />,
  stripe: <CreditCard className="h-5 w-5 text-primary" />,
  manual: <Receipt className="h-5 w-5 text-primary" />,
  bank_transfer: <Building2 className="h-5 w-5 text-primary" />,
}

function computeNextDueDate(plan: ContributionPlanSummary | null, lastContribution: string | null): string | null {
  if (!plan) return null
  const days = frequencyToDays[plan.frequency] ?? 0
  if (!days) return null
  const base = lastContribution ? new Date(lastContribution) : new Date()
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
}

export function NewContributionForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [plans, setPlans] = useState<ContributionPlanSummary[]>([])
  const [memberPlan, setMemberPlan] = useState<MemberPlanSummary | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<TenantPaymentMethod[]>([])

  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  const [manualConfig, setManualConfig] = useState<ManualConfig | null>(null)
  const [manualDetails, setManualDetails] = useState({
    payerName: "",
    payerPhone: "",
    transactionReference: "",
    bankAccountId: "",
  })
  const [manualEvidence, setManualEvidence] = useState<string[]>([])
  const [evidenceUploading, setEvidenceUploading] = useState(false)

  const [submissionInfo, setSubmissionInfo] = useState<SubmissionInfo | null>(null)
  const [stage, setStage] = useState<Stage>("details")

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const [plansResponse, methodsResponse, walletResponse] = await Promise.all([
          getContributionPlans(),
          getContributionPaymentMethods(),
          getWallet().catch(() => null),
        ])

        if (!active) return

        const fetchedPlans = plansResponse.plans ?? []
        setPlans(fetchedPlans)
        setMemberPlan(plansResponse.member_plan ?? null)

        const defaultPlanId = plansResponse.member_plan?.plan?.id ?? fetchedPlans[0]?.id ?? ""
        if (defaultPlanId) {
          setSelectedPlanId(defaultPlanId)
          const defaultPlan =
            plansResponse.member_plan?.plan ?? fetchedPlans.find((plan) => plan.id === defaultPlanId)
          if (defaultPlan) {
            setAmount(String(defaultPlan.amount))
          }
        }

        const enabledMethods = methodsResponse.payment_methods?.filter((method) => method.is_enabled) ?? []
        setPaymentMethods(enabledMethods)
        if (enabledMethods.length > 0) {
          setPaymentMethod(enabledMethods[0].id)
        }

        const balanceValue = Number(walletResponse?.wallet?.balance ?? NaN)
        setWalletBalance(Number.isFinite(balanceValue) ? balanceValue : null)
      } catch (error: any) {
        toast({
          title: "Unable to load contribution setup",
          description: error?.message || "Please try again later.",
          variant: "destructive",
        })
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [toast])

  const isManualPayment = useMemo(
    () => paymentMethod === "manual" || paymentMethod === "bank_transfer",
    [paymentMethod],
  )

  useEffect(() => {
    const method = paymentMethods.find((item) => item.id === paymentMethod)
    if (method && (method.id === "manual" || method.id === "bank_transfer")) {
      const config = method.configuration ?? {}
      const accounts = Array.isArray(config.bank_accounts)
        ? config.bank_accounts.map((account) => ({
            ...account,
            id: account.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
          }))
        : []
      setManualConfig({ ...config, bank_accounts: accounts })
      const defaultAccount = accounts.find((account) => account.is_primary) ?? accounts[0]
      setManualDetails((prev) => ({ ...prev, bankAccountId: defaultAccount?.id ?? "" }))
    } else {
      setManualConfig(null)
      setManualDetails((prev) => ({ ...prev, bankAccountId: "" }))
      setManualEvidence([])
    }
  }, [paymentMethod, paymentMethods])

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return null
    return plans.find((plan) => plan.id === selectedPlanId) ?? null
  }, [plans, selectedPlanId])

  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.id === paymentMethod) ?? null,
    [paymentMethod, paymentMethods],
  )

  const selectedManualAccount = useMemo(() => {
    if (!manualConfig?.bank_accounts?.length) return null
    if (!manualDetails.bankAccountId) return manualConfig.bank_accounts[0]
    return (
      manualConfig.bank_accounts.find((account) => account.id === manualDetails.bankAccountId) ??
      manualConfig.bank_accounts[0]
    )
  }, [manualConfig, manualDetails.bankAccountId])

  const quickAmounts = useMemo(() => {
    const values = new Set<number>()
    if (selectedPlan?.amount) values.add(Number(selectedPlan.amount))
    if (selectedPlan?.minimum_amount) values.add(Number(selectedPlan.minimum_amount))
    if (memberPlan?.plan?.amount) values.add(Number(memberPlan.plan.amount))
    ;[50000, 100000, 200000].forEach((value) => values.add(value))
    return Array.from(values)
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b)
  }, [selectedPlan, memberPlan])

  const estimatedNextDueDate = useMemo(
    () => computeNextDueDate(selectedPlan, memberPlan?.last_contribution_at ?? null),
    [selectedPlan, memberPlan],
  )

  const handleEvidenceUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    setEvidenceUploading(true)
    try {
      const uploaded = await Promise.all(Array.from(files).map(uploadPaymentEvidence))
      setManualEvidence((prev) => Array.from(new Set([...prev, ...uploaded])))
      toast({
        title: "Evidence uploaded",
        description:
          uploaded.length === 1
            ? "File uploaded successfully."
            : `${uploaded.length} files uploaded successfully.`,
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.message || "Unable to upload payment evidence.",
        variant: "destructive",
      })
    } finally {
      setEvidenceUploading(false)
    }
  }

  const removeEvidence = (url: string) => {
    setManualEvidence((prev) => prev.filter((item) => item !== url))
  }

  const validateInputs = () => {
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Enter a valid contribution amount.",
        variant: "destructive",
      })
      return false
    }

    if (paymentMethod === "wallet" && walletBalance !== null && numericAmount > walletBalance) {
      toast({
        title: "Insufficient wallet balance",
        description: `Available wallet balance is ${currencyFormatter.format(walletBalance)}.`,
        variant: "destructive",
      })
      return false
    }

  if (isManualPayment) {
    if (!manualConfig) {
      toast({
        title: "Manual payment not configured",
        description: "Manual payment settings are missing. Please contact your administrator.",
        variant: "destructive",
      })
      return false
    }

    if ((manualConfig.bank_accounts?.length ?? 0) > 0 && !manualDetails.bankAccountId) {
      toast({
        title: "Select bank account",
        description: "Choose the account you paid into so we can verify your transfer.",
        variant: "destructive",
      })
      return false
    }

    if ((manualConfig.require_payer_name ?? true) && !manualDetails.payerName.trim()) {
      toast({
        title: "Payer name required",
        description: "Please enter the payer's full name.",
        variant: "destructive",
      })
      return false
    }
    if ((manualConfig.require_payer_phone ?? false) && !manualDetails.payerPhone.trim()) {
      toast({
        title: "Payer phone required",
        description: "Please enter the payer's phone number.",
        variant: "destructive",
      })
      return false
    }
    if ((manualConfig.require_transaction_reference ?? true) && !manualDetails.transactionReference.trim()) {
      toast({
        title: "Transaction reference required",
        description: "Provide the bank transfer reference or transaction ID.",
        variant: "destructive",
      })
      return false
    }
    if ((manualConfig.require_payment_evidence ?? true) && manualEvidence.length === 0) {
      toast({
        title: "Payment evidence required",
        description: "Upload at least one proof of payment.",
        variant: "destructive",
      })
      return false
    }

  }

  return true
}

  const handleDetailsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateInputs()) return
    setStage("review")
  }

  const handleReviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStage("confirm")
  }

  const submitContribution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateInputs()) return

    try {
      setSubmitting(true)
      setSubmissionInfo(null)

      const numericAmount = Number(amount)
      const planIdToSend = selectedPlanId || memberPlan?.plan?.id || undefined

      if (isManualPayment) {
        const manualMethodId = selectedMethod?.id === "bank_transfer" ? "bank_transfer" : "manual"
        const formData = new FormData()
        formData.append("amount", String(numericAmount))
        formData.append("payment_method", manualMethodId)
        if (planIdToSend) formData.append("plan_id", planIdToSend)
        if (notes.trim()) formData.append("notes", notes.trim())
        if (manualDetails.payerName.trim()) formData.append("payer_name", manualDetails.payerName.trim())
        if (manualDetails.payerPhone.trim()) formData.append("payer_phone", manualDetails.payerPhone.trim())
        if (manualDetails.transactionReference.trim())
          formData.append("transaction_reference", manualDetails.transactionReference.trim())
        if (manualDetails.bankAccountId) formData.append("bank_account_id", manualDetails.bankAccountId)
        manualEvidence.forEach((url) => formData.append("payment_evidence[]", url))

        const response = await initializeContributionPayment(formData)

        if (!response.success) {
          throw new Error(response.message || "Failed to submit manual contribution.")
        }

        const params = new URLSearchParams()
        params.set("amount", String(numericAmount))
        params.set("method", manualMethodId)

        if (response.reference) {
          params.set("reference", response.reference)
        }

        if (response.requires_approval) {
          params.set("status", "awaiting_approval")
          if (response.message) {
            params.set("info", response.message)
          }
        } else {
          params.set("status", "success")
        }

        router.push(`/dashboard/contributions/success?${params.toString()}`)
        return
      }

      const payload = {
        amount: numericAmount,
        payment_method: paymentMethod,
        plan_id: planIdToSend,
        notes: notes.trim() || undefined,
      }

      const response = await initializeContributionPayment(payload)

      if (!response.success) {
        throw new Error(response.message || "Failed to initialize contribution payment.")
      }

      if (response.payment_method === "paystack" && response.payment_url) {
        toast({
          title: "Redirecting to Paystack",
          description: "Complete your payment in the new tab.",
        })
        window.location.href = response.payment_url
        return
      }

      if (response.requires_approval) {
        toast({
          title: "Payment submitted",
          description: response.message || "Awaiting confirmation from the finance team.",
        })
        setSubmissionInfo({
          message: response.message,
          reference: response.reference,
          manualInstructions: response.manual_instructions,
          paymentMethod: paymentMethod,
        })
        return
      }

      toast({
        title: "Contribution successful",
        description: response.message || "Your contribution has been recorded.",
      })

      if (response.reference) {
        router.push(
          `/dashboard/contributions/success?reference=${encodeURIComponent(response.reference)}&amount=${encodeURIComponent(
            String(numericAmount),
          )}&method=${encodeURIComponent(paymentMethod)}`,
        )
      } else {
        router.push("/dashboard/contributions")
      }
    } catch (error: any) {
      console.error("Contribution payment error:", error)
      toast({
        title: "Unable to process payment",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <CardContent className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading contribution setup...</span>
        </CardContent>
      </Card>
    )
  }

  if (!paymentMethods.length) {
    return (
      <Alert variant="warning">
        <AlertTitle>No payment methods configured</AlertTitle>
        <AlertDescription>
          Payment methods have not been configured for your tenant. Please contact your administrator.
        </AlertDescription>
      </Alert>
    )
  }

  if (stage === "review") {
    return (
      <form onSubmit={handleReviewSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Review Contribution</CardTitle>
            <CardDescription>Confirm the details before you proceed to payment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Contribution Amount</span>
                <span className="text-xl font-semibold">
                  {currencyFormatter.format(Number(amount || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{selectedMethod?.name ?? "Not selected"}</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-2">Contribution Plan</p>
              {selectedPlan ? (
                <div className="space-y-1">
                  <p className="font-medium">{selectedPlan.name}</p>
                  {selectedPlan.description && (
                    <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Frequency: {selectedPlan.frequency.replace("_", " ")}</span>
                    <span>Minimum: {currencyFormatter.format(selectedPlan.minimum_amount)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No plan selected</p>
              )}
            </div>
            <div className="rounded-lg border p-4 bg-muted/30">
              <p className="text-sm font-semibold">What happens next?</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Estimated next due date: {estimatedNextDueDate ?? "Not applicable"}</li>
                <li>• Contribution will be processed via {selectedMethod?.name ?? "your selected method"}</li>
                <li>• You can still go back to make changes before payment.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {isManualPayment && manualConfig && (
          <Card>
            <CardHeader>
              <CardTitle>Manual Payment Summary</CardTitle>
              <CardDescription>Ensure these transfer details are correct before you continue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedManualAccount ? (
                <div className="rounded-lg border p-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-medium">{selectedManualAccount.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="font-medium break-all">{selectedManualAccount.account_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="font-medium">{selectedManualAccount.account_number}</span>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>No manual bank account selected.</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Payer Name</p>
                  <p className="font-medium">{manualDetails.payerName || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payer Phone</p>
                  <p className="font-medium">{manualDetails.payerPhone || "Not provided"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Transaction Reference</p>
                  <p className="font-medium break-all">
                    {manualDetails.transactionReference || "Not provided"}
                  </p>
                </div>
              </div>

              {manualEvidence.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploaded Evidence ({manualEvidence.length})</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {manualEvidence.map((url) => (
                      <li key={url} className="truncate">
                        • {url.split("/").pop()}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                (manualConfig.require_payment_evidence ?? true) && (
                  <Alert variant="warning">
                    <AlertDescription>No payment evidence uploaded.</AlertDescription>
                  </Alert>
                )
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStage("details")}>Back</Button>
          <Button type="submit">Pay Now</Button>
        </div>
      </form>
    )
  }

  if (stage === "confirm") {
    return (
      <form onSubmit={submitContribution} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Confirm Payment</CardTitle>
            <CardDescription>Everything looks good! Complete your contribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="text-2xl font-semibold">
                  {currencyFormatter.format(Number(amount || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{selectedMethod?.name ?? "Not selected"}</span>
              </div>
              {selectedPlan && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlan.name}</span>
                </div>
              )}
            </div>
            {isManualPayment && manualConfig && selectedManualAccount && (
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <p className="text-sm font-semibold">Transfer To</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="font-medium">{selectedManualAccount.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name</span>
                  <span className="font-medium break-all">{selectedManualAccount.account_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-medium">{selectedManualAccount.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-medium break-all">
                    {manualDetails.transactionReference || "Not provided"}
                  </span>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              By clicking confirm, you authorize this contribution and acknowledge that the amount will be charged via the
              selected payment method.
            </p>
            {submissionInfo && (
              <Alert>
                <AlertTitle>Payment Submitted</AlertTitle>
                <AlertDescription>
                  {submissionInfo.message ?? "Your payment has been submitted for review."}
                  {submissionInfo.reference && (
                    <div className="mt-2 text-xs">Reference: {submissionInfo.reference}</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {submissionInfo?.manualInstructions?.account && (
              <div className="rounded-lg border p-4 text-sm space-y-1">
                <p className="font-medium">Transfer Details</p>
                <p>{(submissionInfo.manualInstructions.account as ManualAccount).bank_name}</p>
                <p>{(submissionInfo.manualInstructions.account as ManualAccount).account_name}</p>
                <p>{(submissionInfo.manualInstructions.account as ManualAccount).account_number}</p>
                {submissionInfo.manualInstructions.requires_payment_evidence && (
                  <p className="text-xs text-muted-foreground">
                    Upload proof of payment to speed up verification.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStage("review")}>Back</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Contribution"
            )}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleDetailsSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contribution Details</CardTitle>
          <CardDescription>Select a plan, enter the amount, and choose a payment method.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Contribution Plan</Label>
            <Select
              value={selectedPlanId ? selectedPlanId : "custom"}
              onValueChange={(value) => setSelectedPlanId(value === "custom" ? "" : value)}
            >
              <SelectTrigger id="plan">
                <SelectValue placeholder="Select contribution plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {currencyFormatter.format(plan.amount)} • {plan.frequency.replace("_", " ")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="custom">No plan / Custom contribution</SelectItem>
              </SelectContent>
            </Select>
            {selectedPlan && (
              <p className="text-xs text-muted-foreground">
                Minimum contribution for this plan is {currencyFormatter.format(selectedPlan.minimum_amount)}.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount</Label>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount e.g. 50000"
            />
            {quickAmounts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((value) => (
                  <Button key={value} type="button" variant="outline" size="sm" onClick={() => setAmount(String(value))}>
                    {currencyFormatter.format(value)}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              {paymentMethods.map((method) => {
                const icon = methodIconMap[method.id] ?? <CreditCard className="h-5 w-5 text-primary" />
                return (
                  <div
                    key={method.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-4",
                      paymentMethod === method.id ? "border-primary bg-primary/5" : "border-muted",
                    )}
                  >
                    <RadioGroupItem value={method.id} id={`method-${method.id}`} className="mt-1" />
                    <Label htmlFor={`method-${method.id}`} className="flex flex-1 cursor-pointer items-start gap-3">
                      <span className="mt-1">{icon}</span>
                      <span className="flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{method.name}</span>
                          {method.id === "wallet" && <Badge variant="secondary">Instant</Badge>}
                        </span>
                        <span className="text-sm text-muted-foreground">{method.description}</span>
                      </span>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
            {paymentMethod === "wallet" && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {walletBalance !== null
                    ? `Available wallet balance: ${currencyFormatter.format(walletBalance)}`
                    : "Ensure you have enough wallet balance before you continue."}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {isManualPayment && manualConfig && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="payer_name">Payer Name {manualConfig.require_payer_name ?? true ? "*" : ""}</Label>
                  <Input
                    id="payer_name"
                    value={manualDetails.payerName}
                    onChange={(event) => setManualDetails({ ...manualDetails, payerName: event.target.value })}
                    placeholder="Full name of payer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payer_phone">Payer Phone {manualConfig.require_payer_phone ? "*" : ""}</Label>
                  <Input
                    id="payer_phone"
                    value={manualDetails.payerPhone}
                    onChange={(event) => setManualDetails({ ...manualDetails, payerPhone: event.target.value })}
                    placeholder="Phone number used for transfer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">
                  Transaction Reference {manualConfig.require_transaction_reference ?? true ? "*" : ""}
                </Label>
                <Input
                  id="reference"
                  value={manualDetails.transactionReference}
                  onChange={(event) =>
                    setManualDetails({ ...manualDetails, transactionReference: event.target.value })
                  }
                  placeholder="Bank transfer reference"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account">Bank Account</Label>
                <Select
                  value={manualDetails.bankAccountId}
                  onValueChange={(value) => setManualDetails({ ...manualDetails, bankAccountId: value })}
                >
                  <SelectTrigger id="bank_account">
                    <SelectValue placeholder="Select bank account" />
                  </SelectTrigger>
                  <SelectContent>
                    {manualConfig.bank_accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{account.bank_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {account.account_name} • {account.account_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payment Evidence {manualConfig.require_payment_evidence ?? true ? "*" : ""}</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleEvidenceUpload}
                  disabled={evidenceUploading}
                />
                {evidenceUploading && <p className="text-xs text-muted-foreground">Uploading evidence…</p>}
                {manualEvidence.length > 0 && (
                  <div className="space-y-2">
                    {manualEvidence.map((url) => (
                      <div key={url} className="flex items-center justify-between rounded border p-2 text-sm">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          View evidence
                        </a>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeEvidence(url)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add any notes for the finance team"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Review"
          )}
        </Button>
      </div>
    </form>
  )
}