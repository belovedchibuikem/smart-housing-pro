"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Check, CreditCard, Wallet, Building2, AlertCircle, ArrowLeft, Upload, X, Receipt } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { getMemberSubscriptionPackages, getMemberSubscriptionPaymentMethods, initializeMemberSubscription, uploadPaymentEvidence } from "@/lib/api/client"
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

export default function SubscriptionCheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const packageId = searchParams.get('package')
  const { isLoading, loadData } = usePageLoading()
  
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [paymentMethods, setPaymentMethods] = useState<Array<{
    id: string
    name: string
    description: string
    icon: string
    is_enabled: boolean
  }>>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Manual payment fields
  const [payerName, setPayerName] = useState("")
  const [payerPhone, setPayerPhone] = useState("")
  const [accountDetails, setAccountDetails] = useState("")
  const [paymentEvidence, setPaymentEvidence] = useState<File[]>([])
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([])
  const [uploadingEvidence, setUploadingEvidence] = useState(false)
  
  // Get selected payment method configuration
  const selectedMethodConfig = paymentMethods.find(m => m.id === selectedPaymentMethod)
  const isManualPayment = selectedPaymentMethod === 'manual'
  const manualConfig = selectedMethodConfig?.configuration as any

  useEffect(() => {
    if (!packageId) {
      router.push('/subscription')
      return
    }

    loadData(async () => {
      try {
        const [packagesRes, paymentMethodsRes] = await Promise.all([
          getMemberSubscriptionPackages(),
          getMemberSubscriptionPaymentMethods(),
        ])

        const pkg = packagesRes.packages.find((p: any) => p.id === packageId)
        if (!pkg) {
          setError("Package not found")
          return
        }

        setSelectedPackage(pkg)
        setPaymentMethods(paymentMethodsRes.payment_methods.filter((m: any) => m.is_enabled))
        
        // Auto-select first payment method
        if (paymentMethodsRes.payment_methods.length > 0) {
          const firstEnabled = paymentMethodsRes.payment_methods.find((m: any) => m.is_enabled)
          if (firstEnabled) {
            setSelectedPaymentMethod(firstEnabled.id)
          }
        }
      } catch (err: any) {
        console.error("Error loading checkout data:", err)
        setError(err.message || "Failed to load checkout data")
      }
    })
  }, [packageId, router, loadData])

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

  const handleSubscribe = async () => {
    if (!selectedPackage || !selectedPaymentMethod) {
      setError("Please select a payment method")
      return
    }

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
        package_id: selectedPackage.id,
        payment_method: selectedPaymentMethod,
      }

      // Add manual payment fields if applicable
      if (isManualPayment) {
        if (payerName) requestData.payer_name = payerName
        if (payerPhone) requestData.payer_phone = payerPhone
        if (accountDetails) requestData.account_details = accountDetails
        if (evidenceUrls.length > 0) requestData.payment_evidence = evidenceUrls
      }

      const response = await initializeMemberSubscription(requestData)

      if (response.success) {
        // For wallet payments or manual payments, redirect to success page
        if (selectedPaymentMethod === 'wallet' || selectedPaymentMethod === 'manual' || response.requires_approval) {
          const params = new URLSearchParams()
          params.set("reference", (response.reference || "manual") as string)
          params.set("provider", selectedPaymentMethod)
          if (selectedPackage?.name) {
            params.set("plan", selectedPackage.name)
          }
          if (selectedPackage?.price) {
            params.set("amount", String(selectedPackage.price))
          }
          router.push(`/dashboard/subscriptions/success?${params.toString()}`)
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
      console.error("Error initializing subscription:", err)
      setError(err.message || "Failed to process subscription")
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
      default:
        return CreditCard
    }
  }

  if (error && !selectedPackage) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Link href="/subscription">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/subscription">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
        <p className="text-muted-foreground">Review your package and choose a payment method</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Package Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Package Summary</CardTitle>
            <CardDescription>Your selected subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && !selectedPackage ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-40" />
              </div>
            ) : selectedPackage ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedPackage.name}</h3>
                  {selectedPackage.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedPackage.description}</p>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{formatCurrency(selectedPackage.price)}</span>
                  <span className="text-muted-foreground">/{selectedPackage.billing_cycle}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{selectedPackage.duration_days} days</span>
                  </div>
                  {selectedPackage.trial_days > 0 && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Trial:</span>
                      <span className="font-medium">{selectedPackage.trial_days} days free</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
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
              onClick={handleSubscribe}
              disabled={!selectedPaymentMethod || isProcessing || !selectedPackage || uploadingEvidence}
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

      {/* Total */}
      {selectedPackage && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span>{formatCurrency(selectedPackage.price)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              By subscribing, you agree to our terms of service and privacy policy.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

