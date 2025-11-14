"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, CreditCard, Building2, FileText, Wallet, Loader2, AlertCircle, Search, Check, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  createAndPayStatutoryCharge,
  getStatutoryChargePaymentMethods,
  getMemberStatutoryChargeTypes,
  getMemberProperties,
  getWallet,
  uploadPaymentEvidence,
} from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"
import { cn } from "@/lib/utils"

interface ChargeType {
  type: string
  description?: string
  default_amount?: number | null
  frequency?: string
  frequency_display?: string
}

interface MemberProperty {
  id: string
  title: string
  location?: string
  property_type?: string
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon?: string
  is_enabled: boolean
  configuration?: Record<string, unknown>
}

interface ManualBankAccount {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  is_primary?: boolean
  instructions?: string | null
}

interface ManualConfig {
  require_payer_name?: boolean
  require_payer_phone?: boolean
  require_transaction_reference?: boolean
  require_payment_evidence?: boolean
  bank_accounts?: ManualBankAccount[]
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
})

type Stage = "details" | "review" | "confirm"

const methodIconMap: Record<string, React.ReactElement> = {
  paystack: <CreditCard className="h-5 w-5 text-primary" />,
  remita: <Building2 className="h-5 w-5 text-primary" />,
  stripe: <CreditCard className="h-5 w-5 text-primary" />,
  manual: <Wallet className="h-5 w-5 text-primary" />,
  bank_transfer: <Building2 className="h-5 w-5 text-primary" />,
  wallet: <Wallet className="h-5 w-5 text-primary" />,
}

export default function PayStatutoryChargePage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [stage, setStage] = useState<Stage>("details")
  const [chargeTypes, setChargeTypes] = useState<ChargeType[]>([])
  const [selectedChargeType, setSelectedChargeType] = useState<ChargeType | null>(null)
  const [chargeTypeSearchQuery, setChargeTypeSearchQuery] = useState("")
  const [chargeTypeSearchOpen, setChargeTypeSearchOpen] = useState(false)
  
  const [properties, setProperties] = useState<MemberProperty[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [selectedProperty, setSelectedProperty] = useState<MemberProperty | null>(null)
  const [propertySearchQuery, setPropertySearchQuery] = useState("")
  const [propertySearchOpen, setPropertySearchOpen] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  
  const [manualConfig, setManualConfig] = useState<ManualConfig | null>(null)
  const [manualDetails, setManualDetails] = useState({
    bankAccountId: "",
    payerName: "",
    payerPhone: "",
    transactionReference: "",
  })
  const [manualEvidence, setManualEvidence] = useState<string[]>([])
  const [evidenceUploading, setEvidenceUploading] = useState(false)

  const isManualPayment = paymentMethod === "manual" || paymentMethod === "bank_transfer"

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedChargeType && selectedChargeType.default_amount) {
      // Amount is automatically set from charge type's default_amount
    }
  }, [selectedChargeType])

  useEffect(() => {
    if (!isManualPayment) {
      setManualConfig(null)
      setManualDetails({
        bankAccountId: "",
        payerName: "",
        payerPhone: "",
        transactionReference: "",
      })
      setManualEvidence([])
      return
    }

    const configSource =
      paymentMethod === "bank_transfer"
        ? paymentMethods.find((method) => method.id === "manual") ??
          paymentMethods.find((method) => method.id === "bank_transfer")
        : paymentMethods.find((method) => method.id === paymentMethod)

    if (!configSource) {
      setManualConfig(null)
      return
    }

    const configuration = normalizeManualConfig(configSource.configuration)
    setManualConfig(configuration)

    if (configuration.bank_accounts && configuration.bank_accounts.length > 0) {
      setManualDetails((prev) => {
        const bankAccounts = configuration.bank_accounts!
        if (prev.bankAccountId && bankAccounts.some((account) => account.id === prev.bankAccountId)) {
          return prev
        }
        const primary = bankAccounts.find((account) => account.is_primary) ?? bankAccounts[0]
        return {
          ...prev,
          bankAccountId: primary?.id ?? "",
        }
      })
    }
  }, [isManualPayment, paymentMethods, paymentMethod])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [typesResponse, propertiesResponse, methodsResponse, walletResponse] = await Promise.all([
        getMemberStatutoryChargeTypes().catch(() => ({ success: false, data: [] })),
        getMemberProperties().catch(() => ({ success: false, properties: [] })),
        getStatutoryChargePaymentMethods().catch(() => ({ success: false, payment_methods: [] })),
        getWallet().catch(() => null),
      ])

      if (typesResponse.success && Array.isArray(typesResponse.data)) {
        setChargeTypes(typesResponse.data)
      }

      if (propertiesResponse.success && Array.isArray(propertiesResponse.properties)) {
        setProperties(propertiesResponse.properties)
      }

      if (methodsResponse.success && Array.isArray(methodsResponse.payment_methods)) {
        const allowedIds = new Set(["paystack", "remita", "stripe", "manual", "bank_transfer", "wallet"])
        const enabledMethods = methodsResponse.payment_methods.filter(
          (method) => method.is_enabled && allowedIds.has(method.id),
        )
        setPaymentMethods(enabledMethods)
      }

      if (walletResponse?.wallet) {
        setWalletBalance(Number(walletResponse.wallet.balance) || 0)
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      sonnerToast.error("Failed to load data", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const normalizeManualConfig = (config: unknown): ManualConfig => {
    if (!config || typeof config !== "object") {
      return {
        require_payer_name: true,
        require_payer_phone: false,
        require_transaction_reference: true,
        require_payment_evidence: true,
        bank_accounts: [],
      }
    }

    const cfg = config as Record<string, unknown>
    return {
      require_payer_name: typeof cfg.require_payer_name === "boolean" ? cfg.require_payer_name : true,
      require_payer_phone: typeof cfg.require_payer_phone === "boolean" ? cfg.require_payer_phone : false,
      require_transaction_reference: typeof cfg.require_transaction_reference === "boolean" ? cfg.require_transaction_reference : true,
      require_payment_evidence: typeof cfg.require_payment_evidence === "boolean" ? cfg.require_payment_evidence : true,
      bank_accounts: Array.isArray(cfg.bank_accounts) ? cfg.bank_accounts as ManualBankAccount[] : [],
    }
  }

  const selectedManualAccount = useMemo(() => {
    if (!manualConfig?.bank_accounts?.length) return null
    if (!manualDetails.bankAccountId) return manualConfig.bank_accounts[0]
    return (
      manualConfig.bank_accounts.find((account) => account.id === manualDetails.bankAccountId) ??
      manualConfig.bank_accounts[0]
    )
  }, [manualConfig, manualDetails.bankAccountId])

  // Filter charge types and properties based on search
  const filteredChargeTypes = useMemo(() => {
    if (!chargeTypeSearchQuery) return chargeTypes
    const query = chargeTypeSearchQuery.toLowerCase()
    return chargeTypes.filter((type) =>
      type.type.toLowerCase().includes(query) ||
      (type.description && type.description.toLowerCase().includes(query))
    )
  }, [chargeTypes, chargeTypeSearchQuery])

  const filteredProperties = useMemo(() => {
    if (!propertySearchQuery) return properties
    const query = propertySearchQuery.toLowerCase()
    return properties.filter((property) =>
      property.title.toLowerCase().includes(query) ||
      (property.location && property.location.toLowerCase().includes(query))
    )
  }, [properties, propertySearchQuery])

  // Handle charge type selection
  const handleSelectChargeType = (type: ChargeType) => {
    setSelectedChargeType(type)
    setChargeTypeSearchQuery(type.type)
    setChargeTypeSearchOpen(false)
  }

  // Handle property selection
  const handleSelectProperty = (property: MemberProperty) => {
    setSelectedProperty(property)
    setSelectedPropertyId(property.id)
    setPropertySearchQuery(`${property.title}${property.location ? ` - ${property.location}` : ""}`)
    setPropertySearchOpen(false)
  }

  // Handle property deselection
  const handleDeselectProperty = () => {
    setSelectedProperty(null)
    setSelectedPropertyId("")
    setPropertySearchQuery("")
  }

  const validateInputs = () => {
    if (!selectedChargeType) {
      sonnerToast.error("Select charge type", {
        description: "Please select a charge type to pay.",
      })
      return false
    }

    const numericAmount = selectedChargeType.default_amount ? Number(selectedChargeType.default_amount) : 0
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      sonnerToast.error("Invalid amount", {
        description: "Selected charge type does not have a valid default amount.",
      })
      return false
    }

    if (paymentMethod === "wallet" && walletBalance !== null && numericAmount > walletBalance) {
      sonnerToast.error("Insufficient wallet balance", {
        description: `Available wallet balance is ${currencyFormatter.format(walletBalance)}.`,
      })
      return false
    }

    if (!paymentMethod) {
      sonnerToast.error("Select payment method", {
        description: "Choose how you would like to pay.",
      })
      return false
    }

    if (isManualPayment) {
      if (!manualConfig) {
        sonnerToast.error("Manual payment not configured", {
          description: "Manual payment has not been configured yet. Please contact your administrator.",
        })
        return false
      }

      if (manualConfig.bank_accounts && manualConfig.bank_accounts.length > 1 && !manualDetails.bankAccountId) {
        sonnerToast.error("Select bank account", {
          description: "Choose the destination bank account for your transfer.",
        })
        return false
      }

      if ((manualConfig.require_payer_name ?? true) && !manualDetails.payerName.trim()) {
        sonnerToast.error("Payer name required", {
          description: "Please provide the payer's full name.",
        })
        return false
      }

      if ((manualConfig.require_payer_phone ?? false) && !manualDetails.payerPhone.trim()) {
        sonnerToast.error("Payer phone required", {
          description: "Please provide the payer's phone number.",
        })
        return false
      }

      if ((manualConfig.require_transaction_reference ?? true) && !manualDetails.transactionReference.trim()) {
        sonnerToast.error("Transaction reference required", {
          description: "Enter the bank transfer reference or transaction ID.",
        })
        return false
      }

      if ((manualConfig.require_payment_evidence ?? true) && manualEvidence.length === 0) {
        sonnerToast.error("Payment evidence required", {
          description: "Upload at least one proof of payment.",
        })
        return false
      }
    }

    return true
  }

  const handleEvidenceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files?.length) return

    setEvidenceUploading(true)
    try {
      const uploads = await Promise.all(Array.from(files).map((file) => uploadPaymentEvidence(file)))
      setManualEvidence((prev) => Array.from(new Set([...prev, ...uploads])))
      sonnerToast.success(uploads.length > 1 ? `${uploads.length} files uploaded successfully.` : "Evidence uploaded")
    } catch (error: any) {
      sonnerToast.error("Upload failed", {
        description: error?.message || "Unable to upload payment evidence.",
      })
    } finally {
      setEvidenceUploading(false)
      event.target.value = ""
    }
  }

  const removeEvidence = (url: string) => {
    setManualEvidence((prev) => prev.filter((item) => item !== url))
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInputs()) return
    setStage("review")
  }

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStage("confirm")
  }

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateInputs() || !selectedChargeType) return

    try {
      setSubmitting(true)

      const amount = selectedChargeType.default_amount ? Number(selectedChargeType.default_amount) : 0

      const response = await createAndPayStatutoryCharge({
        charge_type: selectedChargeType.type,
        amount: amount,
        payment_method: paymentMethod,
        property_id: selectedPropertyId || undefined,
        description: description || undefined,
        reference: manualDetails.transactionReference || undefined,
      })

      if (response.success) {
        // If payment URL is provided (for gateway payments), redirect
        if (response.payment_url) {
          window.location.href = response.payment_url
          return
        }

        // For manual payments or completed wallet payments
        if (response.requires_approval) {
          sonnerToast.success("Payment submitted successfully", {
            description: "Your payment is pending approval. You will be notified once it's processed.",
          })
        } else {
          sonnerToast.success("Payment completed successfully", {
            description: response.message || "Your payment has been processed.",
          })
        }
        
    router.push("/dashboard/statutory-charges/history")
      } else {
        throw new Error(response.message || "Payment failed")
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      sonnerToast.error("Payment failed", {
        description: error?.message || "Unable to process payment. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex justify-center min-h-screen py-8">
      <div className="space-y-6 max-w-3xl w-full px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/statutory-charges">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Pay Statutory Charge</h1>
          <p className="text-muted-foreground mt-1">Complete payment for statutory charges</p>
        </div>
      </div>

      {stage === "review" && (
        <form onSubmit={handleReviewSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Payment</CardTitle>
              <CardDescription>Confirm the details before you proceed to payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Charge Type</span>
                  <span className="font-medium">{selectedChargeType?.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount to Pay</span>
                  <span className="text-xl font-semibold">
                    {selectedChargeType?.default_amount ? currencyFormatter.format(Number(selectedChargeType.default_amount)) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{paymentMethods.find(m => m.id === paymentMethod)?.name ?? "Not selected"}</span>
                </div>
                {selectedProperty && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium">{selectedProperty.title}</span>
                  </div>
                )}
                {description && (
                  <div className="flex items-start justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium text-right max-w-md">{description}</span>
                  </div>
                )}
              </div>
              {paymentMethod === "wallet" && walletBalance !== null && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Available wallet balance: {currencyFormatter.format(walletBalance)}
                    {selectedChargeType?.default_amount && Number(selectedChargeType.default_amount) > walletBalance && (
                      <span className="block mt-1 text-destructive font-medium">
                        Insufficient balance. Please top up your wallet.
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStage("details")}>Back</Button>
            <Button type="submit">Continue to Confirmation</Button>
          </div>
        </form>
      )}

      {stage === "confirm" && (
        <form onSubmit={handleConfirmSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confirm Payment</CardTitle>
              <CardDescription>Everything looks good! Complete your payment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Charge Type</span>
                  <span className="font-medium">{selectedChargeType?.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-2xl font-semibold">
                    {selectedChargeType?.default_amount ? currencyFormatter.format(Number(selectedChargeType.default_amount)) : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{paymentMethods.find(m => m.id === paymentMethod)?.name ?? "Not selected"}</span>
                </div>
                {selectedProperty && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Property</span>
                    <span className="font-medium">{selectedProperty.title}</span>
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
                  {manualDetails.transactionReference && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-medium break-all">{manualDetails.transactionReference}</span>
                    </div>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                By clicking confirm, you authorize this payment and acknowledge that the amount will be charged via the selected payment method.
              </p>
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
                "Confirm Payment"
              )}
            </Button>
          </div>
        </form>
      )}

      {stage === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Charge Details</CardTitle>
            <CardDescription>Select the type of charge you want to pay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chargeType">Charge Type *</Label>
              <Popover open={chargeTypeSearchOpen} onOpenChange={setChargeTypeSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !selectedChargeType && "text-muted-foreground"
                      )}
                    >
                      {selectedChargeType
                        ? `${selectedChargeType.type}${selectedChargeType.default_amount ? ` - ${currencyFormatter.format(Number(selectedChargeType.default_amount))}` : ""}`
                        : "Select a charge type"}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search charge types..."
                        value={chargeTypeSearchQuery}
                        onChange={(e) => setChargeTypeSearchQuery(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div className="max-h-[300px] overflow-auto">
                      {filteredChargeTypes.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                          {chargeTypeSearchQuery ? "No charge types found" : "No charge types available"}
                        </div>
                      ) : (
                        filteredChargeTypes.map((type) => (
                          <div
                            key={type.type}
                            onClick={() => handleSelectChargeType(type)}
                            className={cn(
                              "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                              selectedChargeType?.type === type.type && "bg-accent"
                            )}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedChargeType?.type === type.type ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{type.type}</div>
                              {type.description && (
                                <div className="text-xs text-muted-foreground">{type.description}</div>
                              )}
                              {type.default_amount && (
                                <div className="text-xs font-semibold text-primary">
                                  {currencyFormatter.format(Number(type.default_amount))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

            {selectedChargeType && selectedChargeType.default_amount && (
              <div className="space-y-2">
                <Label>Amount to Pay</Label>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-orange-600">
                      {currencyFormatter.format(Number(selectedChargeType.default_amount))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="propertyId">Property ID (Optional)</Label>
              <Popover open={propertySearchOpen} onOpenChange={setPropertySearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !selectedProperty && "text-muted-foreground"
                    )}
                  >
                    {selectedProperty
                      ? `${selectedProperty.title}${selectedProperty.location ? ` - ${selectedProperty.location}` : ""}`
                      : "Select property if applicable"}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                      placeholder="Search properties..."
                      value={propertySearchQuery}
                      onChange={(e) => setPropertySearchQuery(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-auto">
                    {selectedProperty && (
                      <div
                        onClick={handleDeselectProperty}
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="flex-1 text-muted-foreground">None (Clear selection)</div>
                      </div>
                    )}
                    {filteredProperties.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                        {propertySearchQuery ? "No properties found" : "No properties available"}
                      </div>
                    ) : (
                      filteredProperties.map((property) => (
                        <div
                          key={property.id}
                          onClick={() => handleSelectProperty(property)}
                          className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                            selectedProperty?.id === property.id && "bg-accent"
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProperty?.id === property.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{property.title}</div>
                            {property.location && (
                              <div className="text-xs text-muted-foreground">{property.location}</div>
                            )}
                            {property.property_type && (
                              <div className="text-xs text-muted-foreground capitalize">
                                {property.property_type}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any additional notes"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how you want to pay</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No payment methods available</p>
              </div>
            ) : (
              <>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1">
                        {methodIconMap[method.id] || <CreditCard className="h-5 w-5" />}
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                        {method.id === "wallet" && <Badge variant="secondary">Instant</Badge>}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                {paymentMethod === "wallet" && (
                  <Alert className={`mt-4 ${walletBalance !== null && selectedChargeType?.default_amount && Number(selectedChargeType.default_amount) > walletBalance ? "border-destructive" : ""}`}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Wallet Balance</AlertTitle>
                    <AlertDescription className="space-y-2">
                      {walletBalance !== null ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Available Balance:</span>
                            <span className="text-lg font-semibold">{currencyFormatter.format(walletBalance)}</span>
                          </div>
                          {selectedChargeType?.default_amount && (
                            <>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <span className="font-medium">Amount Required:</span>
                                <span className="text-lg font-semibold">{currencyFormatter.format(Number(selectedChargeType.default_amount))}</span>
                              </div>
                              {Number(selectedChargeType.default_amount) > walletBalance ? (
                                <div className="pt-2 text-destructive font-medium">
                                  ⚠️ Insufficient balance. Please top up your wallet to proceed.
                                </div>
                              ) : (
                                <div className="pt-2 text-green-600 font-medium">
                                  ✓ Sufficient balance available
                                </div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <span>Loading wallet balance...</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {isManualPayment && manualConfig && (
          <Card>
            <CardHeader>
              <CardTitle>Manual Payment Details</CardTitle>
              <CardDescription>Provide payment information for bank transfer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {manualConfig.bank_accounts && manualConfig.bank_accounts.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Destination Bank Account *</Label>
                  <Select
                    value={manualDetails.bankAccountId}
                    onValueChange={(value) => setManualDetails({ ...manualDetails, bankAccountId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank account" />
                    </SelectTrigger>
                    <SelectContent>
                      {manualConfig.bank_accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.bank_name} - {account.account_number} ({account.account_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              )}

              {selectedManualAccount && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2">Transfer Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Bank:</span> {selectedManualAccount.bank_name}</p>
                    <p><span className="font-medium">Account Number:</span> {selectedManualAccount.account_number}</p>
                    <p><span className="font-medium">Account Name:</span> {selectedManualAccount.account_name}</p>
                    {selectedManualAccount.instructions && (
                      <p className="mt-2 text-muted-foreground">{selectedManualAccount.instructions}</p>
                    )}
                  </div>
                </div>
              )}

              {(manualConfig.require_payer_name ?? true) && (
                <div className="space-y-2">
                  <Label htmlFor="payerName">Payer Name *</Label>
                  <Input
                    id="payerName"
                    value={manualDetails.payerName}
                    onChange={(e) => setManualDetails({ ...manualDetails, payerName: e.target.value })}
                    placeholder="Enter payer's full name"
                    required
                  />
                </div>
              )}

              {(manualConfig.require_payer_phone ?? false) && (
                <div className="space-y-2">
                  <Label htmlFor="payerPhone">Payer Phone *</Label>
                  <Input
                    id="payerPhone"
                    value={manualDetails.payerPhone}
                    onChange={(e) => setManualDetails({ ...manualDetails, payerPhone: e.target.value })}
                    placeholder="Enter payer's phone number"
                    required
                  />
                </div>
              )}

              {(manualConfig.require_transaction_reference ?? true) && (
                <div className="space-y-2">
                  <Label htmlFor="transactionReference">Transaction Reference *</Label>
                  <Input
                    id="transactionReference"
                    value={manualDetails.transactionReference}
                    onChange={(e) => setManualDetails({ ...manualDetails, transactionReference: e.target.value })}
                    placeholder="Enter bank transfer reference"
                    required
                  />
              </div>
              )}

              {(manualConfig.require_payment_evidence ?? true) && (
                <div className="space-y-2">
                  <Label>Payment Evidence *</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleEvidenceUpload}
                      disabled={evidenceUploading}
                      multiple
                    />
                    {evidenceUploading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                    {manualEvidence.length > 0 && (
                      <div className="space-y-2">
                        {manualEvidence.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm truncate flex-1">{url}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEvidence(url)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              </div>
              )}
          </CardContent>
        </Card>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/dashboard/statutory-charges">Cancel</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={!selectedChargeType || !paymentMethod || submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Review Payment"
            )}
          </Button>
        </div>
      </form>
      )}
      </div>
    </div>
  )
}
