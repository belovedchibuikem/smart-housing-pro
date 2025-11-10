"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api/client"
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  CreditCard,
  Loader2,
  Upload,
  Wallet,
  Trash2,
} from "lucide-react"

type PaymentMethod = {
  id: string
  name: string
  description: string
  icon?: string
  configuration?: Record<string, any>
  is_enabled?: boolean
}

type ManualBankAccount = {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  is_primary?: boolean
}

type ManualConfig = {
  require_payer_name: boolean
  require_payer_phone: boolean
  require_transaction_reference: boolean
  require_payment_evidence: boolean
  bank_accounts: ManualBankAccount[]
}

type ManualDetails = {
  accountId: string
  payerName: string
  payerPhone: string
  transactionReference: string
  evidenceFiles: File[]
}

const quickAmounts = [5000, 10000, 25000, 50000, 100000]

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
})

const iconsByMethod: Record<string, JSX.Element> = {
  paystack: <CreditCard className="h-5 w-5 text-primary" />,
  remita: <Wallet className="h-5 w-5 text-primary" />,
  stripe: <CreditCard className="h-5 w-5 text-primary" />,
  manual: <Building2 className="h-5 w-5 text-primary" />,
  bank_transfer: <Building2 className="h-5 w-5 text-primary" />,
}

function normalizeManualConfig(config?: Record<string, any>): ManualConfig {
  const defaults: ManualConfig = {
    require_payer_name: true,
    require_payer_phone: false,
    require_transaction_reference: true,
    require_payment_evidence: true,
    bank_accounts: [],
  }

  const merged = {
    ...defaults,
    ...(config || {}),
  }

  if (!Array.isArray(merged.bank_accounts)) {
    merged.bank_accounts = []
  } else {
    merged.bank_accounts = merged.bank_accounts.map((account: ManualBankAccount) => ({
      ...account,
      id:
        account.id ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    }))
  }

  return merged
}

const methodDisplayName = (method: PaymentMethod) => {
  switch (method.id) {
    case "paystack":
      return "Debit/Credit Card (Paystack)"
    case "remita":
      return "Remita"
    case "manual":
    case "bank_transfer":
      return "Manual Bank Transfer"
    case "stripe":
      return "Stripe"
    default:
      return method.name ?? method.id
  }
}

export default function AddFundsPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentMethod, setPaymentMethod] = useState("")
  const [methodsLoading, setMethodsLoading] = useState(true)
  const stages = ["details", "review", "confirm"] as const
  const [stage, setStage] = useState<typeof stages[number]>("details")
  const [submitting, setSubmitting] = useState(false)
  const [manualDetails, setManualDetails] = useState<ManualDetails>({
    accountId: "",
    payerName: "",
    payerPhone: "",
    transactionReference: "",
    evidenceFiles: [],
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)

  useEffect(() => {
    const loadMethods = async () => {
      try {
        setMethodsLoading(true)
        const response = await apiFetch<{ payment_methods: PaymentMethod[] }>("/user/wallet/payment-methods")
        const methods = (response.payment_methods || []).filter((method) => method.id !== "wallet")
        setPaymentMethods(methods)
        if (methods.length > 0) {
          setPaymentMethod((prev) => prev || methods[0].id)
        }
      } catch (error: any) {
        console.error("Failed to load payment methods:", error)
        toast.error(error?.message || "Failed to load payment methods")
      } finally {
        setMethodsLoading(false)
      }
    }

    loadMethods()
  }, [])

  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.id === paymentMethod),
    [paymentMethod, paymentMethods],
  )

  const manualConfig = useMemo(() => {
    if (!selectedMethod) return null
    if (selectedMethod.id === "manual" || selectedMethod.id === "bank_transfer") {
      return normalizeManualConfig(selectedMethod.configuration)
    }
    return null
  }, [selectedMethod])

  useEffect(() => {
    if (!manualConfig) {
      setManualDetails((prev) => ({
        ...prev,
        accountId: "",
      }))
      return
    }

    if (!manualConfig.bank_accounts.length) {
      setManualDetails((prev) => ({ ...prev, accountId: "" }))
      return
    }

    setManualDetails((prev) => {
      if (prev.accountId && manualConfig.bank_accounts.some((account) => account.id === prev.accountId)) {
        return prev
      }
      const primaryAccount = manualConfig.bank_accounts.find((account) => account.is_primary)
      return {
        ...prev,
        accountId: (primaryAccount ?? manualConfig.bank_accounts[0]).id,
      }
    })
  }, [manualConfig])

  useEffect(() => {
    if (selectedMethod && selectedMethod.id !== "manual" && selectedMethod.id !== "bank_transfer") {
      setManualDetails({
        accountId: "",
        payerName: "",
        payerPhone: "",
        transactionReference: "",
        evidenceFiles: [],
      })
    }
  }, [selectedMethod])

  const selectedManualAccount = useMemo(() => {
    if (!manualConfig) return null
    return manualConfig.bank_accounts.find((account) => account.id === manualDetails.accountId) ?? null
  }, [manualConfig, manualDetails.accountId])

  const copyToClipboard = (value: string, label: string) => {
    if (!value) return
    navigator.clipboard.writeText(value)
    setCopiedField(label)
    toast.success(`${label} copied to clipboard`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleEvidenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setManualDetails((prev) => ({
      ...prev,
      evidenceFiles: [...prev.evidenceFiles, ...Array.from(files)],
    }))

    event.target.value = ""
  }

  const removeEvidenceFile = (index: number) => {
    setManualDetails((prev) => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, fileIndex) => fileIndex !== index),
    }))
  }

  const nextStage = () => {
    setStage((current) => {
      const index = stages.indexOf(current)
      return stages[index + 1] ?? current
    })
  }

  const previousStage = () => {
    setStage((current) => {
      const index = stages.indexOf(current)
      return stages[index - 1] ?? current
    })
  }

  const validatePaymentDetails = () => {
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount < 100) {
      toast.error("Please enter an amount of at least ₦100")
      return false
    }

    if (!selectedMethod) {
      toast.error("Please select a payment method")
      return false
    }

    if (selectedMethod.id === "manual" || selectedMethod.id === "bank_transfer") {
      if (!manualConfig) {
        toast.error("Manual payment has not been configured yet. Please contact support.")
        return false
      }

      if (manualConfig.bank_accounts.length > 0 && !selectedManualAccount) {
        toast.error("Please select a bank account for your transfer")
        return false
      }

      if ((manualConfig.require_payer_name ?? true) && !manualDetails.payerName.trim()) {
        toast.error("Please enter the payer's full name")
        return false
      }

      if ((manualConfig.require_payer_phone ?? false) && !manualDetails.payerPhone.trim()) {
        toast.error("Please enter the payer's phone number")
        return false
      }

      if ((manualConfig.require_transaction_reference ?? true) && !manualDetails.transactionReference.trim()) {
        toast.error("Please enter the bank transfer reference/transaction ID")
        return false
      }

      if ((manualConfig.require_payment_evidence ?? true) && manualDetails.evidenceFiles.length === 0) {
        toast.error("Please upload at least one proof of payment")
        return false
      }
    }

    return true
  }

  const handleProceedFromDetails = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validatePaymentDetails()) {
      return
    }
    nextStage()
  }

  const handleProceedFromReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    nextStage()
  }

  const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    if (!validatePaymentDetails()) {
      setStage("details")
      return
    }

    if (!selectedMethod) {
      toast.error("Please select a payment method")
      return
    }

    setSubmitting(true)

    try {
      const numericAmount = Number(amount)
      const formattedAmount = currencyFormatter.format(numericAmount)

      if (selectedMethod.id === "manual" || selectedMethod.id === "bank_transfer") {
        if (!manualConfig) {
          toast.error("Manual payment has not been configured yet. Please contact support.")
          return
        }

        const formData = new FormData()
        formData.append("amount", numericAmount.toString())
        formData.append("payment_method", "manual")
        formData.append("description", `Wallet funding of ${formattedAmount}`)
        if (manualDetails.payerName) formData.append("payer_name", manualDetails.payerName.trim())
        if (manualDetails.payerPhone) formData.append("payer_phone", manualDetails.payerPhone.trim())
        if (manualDetails.transactionReference) {
          formData.append("transaction_reference", manualDetails.transactionReference.trim())
        }
        if (selectedManualAccount?.id) {
          formData.append("bank_account_id", selectedManualAccount.id)
        }

        manualDetails.evidenceFiles.forEach((file) => {
          formData.append("payment_evidence[]", file)
        })

        const response = await apiFetch<{
          success: boolean
          message: string
          data?: { reference?: string; status?: string }
        }>("/user/wallet/fund", {
          method: "POST",
          body: formData,
        })

        if (response.success) {
          toast.success(
            response.message || "Manual payment submitted. Awaiting verification from accounts team.",
          )
          router.push("/dashboard/wallet?pending=true")
          return
        }

        toast.error(response.message || "Failed to submit manual payment")
        return
      }

      const backendMethod = selectedMethod.id
      const response = await apiFetch<{
        success: boolean
        message: string
        data?: {
          reference?: string
          payment_url?: string
          rrr?: string
          status?: string
          bank_details?: {
            bank_name: string
            account_number: string
            account_name: string
          }
        }
      }>("/user/wallet/fund", {
        method: "POST",
        body: {
          amount: numericAmount,
          payment_method: backendMethod,
          description: `Wallet funding of ${formattedAmount}`,
        },
      })

      if (!response.success || !response.data) {
        toast.error(response.message || "Failed to initialize payment")
        return
      }

      if (backendMethod === "paystack" && response.data.payment_url) {
        window.location.href = response.data.payment_url
        return
      }

      if (backendMethod === "remita" && response.data.rrr) {
        toast.info(`Your Remita RRR is ${response.data.rrr}. Please complete payment using this RRR.`)
        router.push("/dashboard/wallet?pending=true")
        return
      }

      toast.success(response.message || "Payment initialized successfully")
      router.push("/dashboard/wallet")
    } catch (error: any) {
      console.error("Payment initialization error:", error)
      toast.error(error?.message || "An error occurred while processing your payment")
    } finally {
      setSubmitting(false)
    }
  }

  const Header = () => (
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Wallet
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add Fund</h1>
        <p className="text-muted-foreground mt-2">Top up your wallet balance</p>
      </div>
  )

  if (methodsLoading) {
    return (
      <div className="space-y-6 w-full max-w-2xl mx-auto px-4">
        <Header />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
            Loading payment methods...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentMethods.length) {
    return (
      <div className="space-y-6 w-full max-w-2xl mx-auto px-4">
        <Header />
        <Alert>
          <AlertDescription>
            No payment methods are currently available. Please contact your administrator to configure payment gateways.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (stage === "review") {
    const numericAmount = Number(amount) || 0
    const formattedAmount = currencyFormatter.format(numericAmount)

    return (
      <div className="space-y-6 w-full max-w-2xl mx-auto px-4">
        <Header />
        <form onSubmit={handleProceedFromReview} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Wallet Funding</CardTitle>
              <CardDescription>Confirm the details before you proceed to the final step.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-semibold">{formattedAmount}</p>
                </div>
                <Badge variant="outline">Amount</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="text-lg font-medium">
                    {selectedMethod ? methodDisplayName(selectedMethod) : "Not selected"}
                  </p>
                </div>
                <Badge variant="outline">{selectedMethod?.id ?? "method"}</Badge>
              </div>
              {selectedMethod?.description && (
                <p className="text-sm text-muted-foreground">{selectedMethod.description}</p>
              )}
            </CardContent>
          </Card>

          {(selectedMethod?.id === "manual" || selectedMethod?.id === "bank_transfer") && manualConfig && (
            <Card>
              <CardHeader>
                <CardTitle>Manual Transfer Summary</CardTitle>
                <CardDescription>
                  These details will be sent to the accounts team to verify your transfer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedManualAccount ? (
                  <div className="rounded-lg border p-4 space-y-2 text-sm">
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
                    <AlertDescription>No bank account selected.</AlertDescription>
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

                {manualDetails.evidenceFiles.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploaded Evidence</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {manualDetails.evidenceFiles.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="truncate">
                          • {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  (manualConfig.require_payment_evidence ?? true) && (
                    <Alert>
                      <AlertDescription>No payment evidence attached yet.</AlertDescription>
                    </Alert>
                  )
                )}
              </CardContent>
            </Card>
          )}

          <Alert>
            <AlertDescription>
              If you need to make changes, go back to the previous step. Otherwise continue to confirm your payment.
            </AlertDescription>
          </Alert>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={previousStage}>
              Back
            </Button>
            <Button type="submit">Proceed to Confirmation</Button>
          </div>
        </form>
      </div>
    )
  }

  if (stage === "confirm") {
    const numericAmount = Number(amount) || 0
    const formattedAmount = currencyFormatter.format(numericAmount)

    return (
      <div className="space-y-6 w-full max-w-2xl mx-auto px-4">
        <Header />
        <form onSubmit={submitPayment} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confirm &amp; Pay</CardTitle>
              <CardDescription>We&apos;ll finalize your wallet funding with the details below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-lg font-semibold">{formattedAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">
                    {selectedMethod ? methodDisplayName(selectedMethod) : "Not selected"}
                  </span>
                </div>
                {(selectedMethod?.id === "manual" || selectedMethod?.id === "bank_transfer") && selectedManualAccount && (
                  <div className="flex flex-col gap-1 pt-2 border-t">
                    <span className="text-xs uppercase text-muted-foreground">Transfer To</span>
                    <span className="font-medium">{selectedManualAccount.bank_name}</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedManualAccount.account_name} • {selectedManualAccount.account_number}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                By clicking confirm, you authorize this wallet funding and acknowledge the selected payment method.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={previousStage}>
              Back
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto px-4">
      <Header />

      <form onSubmit={handleProceedFromDetails} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enter Amount</CardTitle>
            <CardDescription>How much would you like to add to your wallet?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                min="100"
                required
              />
            </div>

            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">Quick Select</Label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant={amount === quickAmount.toString() ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                  >
                    ₦{quickAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select how you want to fund your wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const icon = iconsByMethod[method.id] ?? <CreditCard className="h-5 w-5 text-primary" />
                  return (
                    <div
                      key={method.id}
                      className="flex items-center space-x-3 p-4 rounded-lg border cursor-pointer hover:bg-muted/50"
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={`method-${method.id}`} />
                      <Label htmlFor={`method-${method.id}`} className="flex items-center gap-3 cursor-pointer flex-1">
                        {icon}
                    <div>
                          <p className="font-medium">{methodDisplayName(method)}</p>
                          {method.description && (
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          )}
                        </div>
                      </Label>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {(selectedMethod?.id === "manual" || selectedMethod?.id === "bank_transfer") && manualConfig && (
          <Card>
            <CardHeader>
              <CardTitle>Manual Transfer Details</CardTitle>
              <CardDescription>
                Provide your transfer information so our accounts team can verify your payment quickly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {manualConfig.bank_accounts.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select the account you paid into</Label>
                  <RadioGroup
                    value={manualDetails.accountId}
                    onValueChange={(value) => setManualDetails((prev) => ({ ...prev, accountId: value }))}
                    className="space-y-3"
                  >
                    {manualConfig.bank_accounts.map((account) => (
                      <div key={account.id} className="rounded-lg border p-4 hover:border-primary transition-colors">
                        <div className="flex items-start gap-3">
                          <RadioGroupItem value={account.id} id={`account-${account.id}`} />
                          <Label htmlFor={`account-${account.id}`} className="flex-1 cursor-pointer space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{account.bank_name}</span>
                              {account.is_primary && <Badge variant="outline">Primary</Badge>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center justify-between rounded bg-muted px-3 py-2">
                                <span>{account.account_name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    copyToClipboard(account.account_name, "Account Name")
                                  }}
                                >
                                  {copiedField === "Account Name" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                              <div className="flex items-center justify-between rounded bg-muted px-3 py-2">
                                <span>{account.account_number}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={(event) => {
                                    event.preventDefault()
                                    event.stopPropagation()
                                    copyToClipboard(account.account_number, "Account Number")
                                  }}
                                >
                                  {copiedField === "Account Number" ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                    </div>
                  </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No manual bank accounts have been configured yet. Please contact your administrator before proceeding.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payerName">
                    Payer Name
                    {manualConfig.require_payer_name && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id="payerName"
                    placeholder="Name of sender"
                    value={manualDetails.payerName}
                    onChange={(event) => setManualDetails((prev) => ({ ...prev, payerName: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payerPhone">
                    Payer Phone
                    {manualConfig.require_payer_phone && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id="payerPhone"
                    placeholder="Contact phone number"
                    value={manualDetails.payerPhone}
                    onChange={(event) => setManualDetails((prev) => ({ ...prev, payerPhone: event.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="transactionReference">
                    Bank Transfer Reference / Transaction ID
                    {manualConfig.require_transaction_reference && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    id="transactionReference"
                    placeholder="Enter the reference shown on your transfer receipt"
                    value={manualDetails.transactionReference}
                    onChange={(event) =>
                      setManualDetails((prev) => ({ ...prev, transactionReference: event.target.value }))
                    }
                  />
                </div>
                </div>

              <div className="space-y-2">
                <Label>
                  Upload Payment Evidence
                  {manualConfig.require_payment_evidence && <span className="text-destructive ml-1">*</span>}
                </Label>
                <div className="rounded-lg border border-dashed px-4 py-6 text-center">
                  <Upload className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Upload a screenshot or PDF of your transfer receipt (max 5MB each).
                  </p>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleEvidenceChange}
                    className="mt-3 cursor-pointer text-sm"
                  />
                  {manualDetails.evidenceFiles.length > 0 && (
                    <div className="mt-4 space-y-2 text-left">
                      {manualDetails.evidenceFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                        >
                          <span className="truncate pr-3">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEvidenceFile(index)}
                            title="Remove file"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  Once you submit this form our accounts team will review your evidence and credit your wallet after
                  verifying the transfer.
                </AlertDescription>
              </Alert>
          </CardContent>
        </Card>
        )}

        <Alert>
          <AlertDescription>
            Payments are processed securely. Wallet credits will appear once the payment gateway confirms your
            transaction or an administrator verifies your manual transfer.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            Review Payment
          </Button>
        </div>
      </form>
    </div>
  )
}

