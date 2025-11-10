"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Check, CreditCard, Wallet, Building2, AlertCircle, ArrowLeft, Upload, X, Receipt } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { getWalletPaymentMethods, initializeWalletFunding, uploadPaymentEvidence } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { useToast } from "@/hooks/use-toast"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function WalletFundPage() {
  const router = useRouter()
  const { isLoading, loadData } = usePageLoading()
  const { toast } = useToast()
  
  const [amount, setAmount] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    id: string
    name: string
    description: string
    icon: string
    is_enabled: boolean
    configuration?: any
  }>>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Manual payment fields
  const [payerName, setPayerName] = useState("")
  const [payerPhone, setPayerPhone] = useState("")
  const [accountDetails, setAccountDetails] = useState("")
  const [paymentEvidence, setPaymentEvidence] = useState<File[]>([])
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  
  const quickAmounts = [5000, 10000, 25000, 50000, 100000]
  
  // Get selected payment method configuration
  const selectedMethodConfig = paymentMethods.find(m => m.id === selectedPaymentMethod)
  const isManualPayment = selectedPaymentMethod === 'manual'
  const manualConfig = selectedMethodConfig?.configuration as any

  useEffect(() => {
    loadData(async () => {
      try {
        const paymentMethodsRes = await getWalletPaymentMethods()
        const enabledMethods = paymentMethodsRes.payment_methods.filter((m: any) => m.is_enabled)
        setPaymentMethods(enabledMethods)
        
        // Auto-select first payment method
        if (enabledMethods.length > 0) {
          setSelectedPaymentMethod(enabledMethods[0].id)
        }
      } catch (err: any) {
        console.error("Error loading payment methods:", err)
        setError(err.message || "Failed to load payment methods")
      }
    })
  }, [loadData])

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingEvidence(true)
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const url = await uploadPaymentEvidence(file)
        return { file, url }
      })

      const results = await Promise.all(uploadPromises)
      const newFiles = results.map(r => r.file)
      const newUrls = results.map(r => r.url)

      setPaymentEvidence(prev => [...prev, ...newFiles])
      setEvidenceUrls(prev => [...prev, ...newUrls])

      toast({
        title: "Success",
        description: `${files.length} file(s) uploaded successfully`,
      })
    } catch (err: any) {
      console.error("Error uploading files:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setUploadingEvidence(false)
    }
  }

  const removeEvidence = (index: number) => {
    setPaymentEvidence(prev => prev.filter((_, i) => i !== index))
    setEvidenceUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleFund = async () => {
    if (!amount || !selectedPaymentMethod) {
      setError("Please enter an amount and select a payment method")
      return
    }

    const numericAmount = Number(amount)

    // Validate manual payment fields
    if (isManualPayment) {
      if (manualConfig?.require_payer_name && !payerName.trim()) {
        setError("Payer name is required")
        return
      }
      if (manualConfig?.require_payer_phone && !payerPhone.trim()) {
        setError("Payer phone is required")
        return
      }
      if (manualConfig?.require_account_details && !accountDetails.trim()) {
        setError("Account details are required")
        return
      }
      if (manualConfig?.require_payment_evidence && evidenceUrls.length === 0) {
        setError("Payment evidence is required. Please upload at least one file.")
        return
      }
    }

    setIsProcessing(true)
    setError(null)

    try {
      const requestData: any = {
        amount: parseFloat(amount),
        payment_method: selectedPaymentMethod,
      }

      // Add manual payment fields if applicable
      if (isManualPayment) {
        if (payerName) requestData.payer_name = payerName
        if (payerPhone) requestData.payer_phone = payerPhone
        if (accountDetails) requestData.account_details = accountDetails
        if (evidenceUrls.length > 0) requestData.payment_evidence = evidenceUrls
      }

      // For gateway payments, redirect to checkout page
      if (['paystack', 'remita', 'stripe'].includes(selectedPaymentMethod)) {
        router.push(`/dashboard/wallet/fund/checkout?amount=${amount}&method=${selectedPaymentMethod}`)
        return
      }

      const response = await initializeWalletFunding(requestData)

      if (response.success) {
        // For wallet payments or manual payments, redirect to success page
        if (selectedPaymentMethod === 'wallet' || selectedPaymentMethod === 'manual' || response.requires_approval) {
          const params = new URLSearchParams()
          params.set("reference", (response.reference || "manual") as string)
          params.set("provider", selectedPaymentMethod)
          if (Number.isFinite(numericAmount) && numericAmount > 0) {
            params.set("amount", String(numericAmount))
          }
          router.push(`/dashboard/wallet/fund/success?${params.toString()}`)
        } else if (response.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = response.paymentUrl
        } else {
          setError("Payment initialization failed. Please try again.")
        }
      } else {
        setError(response.message || "Failed to initialize payment")
      }
    } catch (err: any) {
      console.error("Error initializing wallet funding:", err)
      setError(err.message || "Failed to process wallet funding")
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return CreditCard
      case 'wallet':
        return Wallet
      case 'bank':
        return Building2
      case 'receipt':
        return Receipt
      default:
        return CreditCard
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/dashboard/wallet">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wallet
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Fund Your Wallet</h1>
        <p className="text-muted-foreground">Add funds to your wallet for contributions and payments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Amount Input */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Amount</CardTitle>
            <CardDescription>How much would you like to add?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-32" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="100"
                    required
                  />
                </div>

                {/* Quick Amount Buttons */}
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
                        {formatCurrency(quickAmount)}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how you want to pay</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && paymentMethods.length === 0 ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = getPaymentIcon(method.icon)
                  const isSelected = selectedPaymentMethod === method.id
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full p-4 border rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-muted-foreground">{method.description}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Manual Payment Fields */}
            {isManualPayment && (
              <div className="mt-6 space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-4">
                  <Receipt className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Manual Payment Details</h3>
                </div>

                {manualConfig?.account_details && (
                  <div className="p-3 bg-white rounded border">
                    <Label className="text-sm font-medium mb-2 block">Payment Instructions</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{manualConfig.account_details}</p>
                  </div>
                )}

                {manualConfig?.require_payer_name !== false && (
                  <div className="space-y-2">
                    <Label htmlFor="payer-name">
                      Payer Name {manualConfig?.require_payer_name && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="payer-name"
                      placeholder="Enter payer's full name"
                      value={payerName}
                      onChange={(e) => setPayerName(e.target.value)}
                      required={manualConfig?.require_payer_name}
                    />
                  </div>
                )}

                {manualConfig?.require_payer_phone !== false && (
                  <div className="space-y-2">
                    <Label htmlFor="payer-phone">
                      Payer Phone {manualConfig?.require_payer_phone && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="payer-phone"
                      type="tel"
                      placeholder="Enter payer's phone number"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      required={manualConfig?.require_payer_phone}
                    />
                  </div>
                )}

                {manualConfig?.require_account_details && (
                  <div className="space-y-2">
                    <Label htmlFor="account-details">
                      Account Details <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="account-details"
                      placeholder="Enter bank account details or payment reference"
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>
                )}

                {manualConfig?.require_payment_evidence !== false && (
                  <div className="space-y-2">
                    <Label>
                      Payment Evidence {manualConfig?.require_payment_evidence && <span className="text-red-500">*</span>}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Upload proof of payment (receipt, screenshot, etc.)
                    </p>
                    
                    {/* Uploaded Evidence Preview */}
                    {evidenceUrls.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {evidenceUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Evidence ${index + 1}`}
                              className="w-full h-24 object-cover rounded border"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeEvidence(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors bg-white">
                      {uploadingEvidence ? (
                        <>
                          <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
                          <span className="text-sm text-muted-foreground">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload or drag and drop</span>
                          <span className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF up to 5MB</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploadingEvidence}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full mt-6"
              onClick={handleFund}
              disabled={!selectedPaymentMethod || isProcessing || !amount || uploadingEvidence}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {selectedPaymentMethod === 'wallet' 
                    ? 'Pay from Wallet' 
                    : selectedPaymentMethod === 'manual'
                    ? 'Submit Payment Request'
                    : 'Continue to Payment'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {amount && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>{formatCurrency(parseFloat(amount))}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Funds will be credited to your wallet after payment verification.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

