"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Building2, CreditCard, Loader2, Wallet } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  createEquityContribution,
  getEquityContributionPaymentMethods,
  getEquityPlans,
  getWallet,
  uploadPaymentEvidence,
} from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"
import { cn } from "@/lib/utils"
import { Recaptcha, RecaptchaRef } from "@/components/auth/recaptcha"
import { useI18n } from "@/lib/i18n/i18n-provider"

interface EquityPlan {
  id: string
  name: string
  description?: string | null
  min_amount: number
  max_amount?: number | null
  frequency: string
  is_mandatory: boolean
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

const methodIconMap: Record<string, JSX.Element> = {
  paystack: <CreditCard className="h-5 w-5 text-primary" />,
  remita: <Building2 className="h-5 w-5 text-primary" />,
  stripe: <CreditCard className="h-5 w-5 text-primary" />,
  manual: <Wallet className="h-5 w-5 text-primary" />,
  bank_transfer: <Building2 className="h-5 w-5 text-primary" />,
  wallet: <Wallet className="h-5 w-5 text-primary" />,
}

const stages = ["details", "review", "confirm"] as const

type Stage = (typeof stages)[number]

type ManualDetailsState = {
  bankAccountId: string
  payerName: string
  payerPhone: string
  transactionReference: string
}

type SubmissionInfo = {
  message?: string
  reference?: string
  manualInstructions?: {
    account?: Record<string, unknown>
    requires_payment_evidence?: boolean
    message?: string
  } | null
  paymentMethod: string
}

export default function NewEquityContributionPage() {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const recaptchaRef = useRef<RecaptchaRef>(null)

  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<EquityPlan[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [stage, setStage] = useState<Stage>("details")
  const [submitting, setSubmitting] = useState(false)

  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")

  const [manualConfig, setManualConfig] = useState<ManualConfig | null>(null)
  const [manualDetails, setManualDetails] = useState<ManualDetailsState>({
    bankAccountId: "",
    payerName: "",
    payerPhone: "",
    transactionReference: "",
  })
  const [manualEvidence, setManualEvidence] = useState<string[]>([])
  const [evidenceUploading, setEvidenceUploading] = useState(false)
  const [submissionInfo, setSubmissionInfo] = useState<SubmissionInfo | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  const isManualPayment = paymentMethod === "manual" || paymentMethod === "bank_transfer"

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const [plansResponse, methodsResponse, walletResponse] = await Promise.all([
          getEquityPlans().catch(() => ({ success: false, data: [] })),
          getEquityContributionPaymentMethods().catch(() => ({ success: false, payment_methods: [] })),
          getWallet().catch(() => null),
        ])

        if (!active) return

        if (plansResponse.success && Array.isArray(plansResponse.data)) {
          setPlans(plansResponse.data)
        }

        if (methodsResponse.success && Array.isArray(methodsResponse.payment_methods)) {
          const allowedIds = new Set(["paystack", "remita", "stripe", "manual", "bank_transfer", "wallet"])
          const enabledMethods = methodsResponse.payment_methods.filter(
            (method) => method.is_enabled && allowedIds.has(method.id),
          )
          setPaymentMethods(enabledMethods)
        }

        const queryPlan = searchParams?.get("plan") ?? ""
        if (queryPlan) {
          setSelectedPlanId(queryPlan)
          const plan = plansResponse.success ? plansResponse.data.find((item) => item.id === queryPlan) : null
          if (plan) {
            setAmount(String(plan.min_amount))
          }
        }

        if (methodsResponse.payment_methods?.length) {
          const enabled = methodsResponse.payment_methods.filter(
            (method) =>
              method.is_enabled &&
              ["paystack", "remita", "stripe", "manual", "bank_transfer", "wallet"].includes(method.id),
          )
      if (enabled.length) {
            const defaultMethod = enabled.find((method) => method.id === "wallet") ?? enabled[0]
            setPaymentMethod(defaultMethod.id)
      }
        }

        const walletData = walletResponse?.wallet
        if (walletData) {
          const parsed = Number(walletData.balance)
          setWalletBalance(Number.isFinite(parsed) ? parsed : null)
        }
      } catch (error: any) {
        console.error("Failed to load equity contribution setup", error)
        sonnerToast.error(t("equityCheckout.loadError"), {
          description: error?.message || t("equityCheckout.loadErrorDesc"),
        })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [searchParams])

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return null
    return plans.find((plan) => plan.id === selectedPlanId) ?? null
  }, [plans, selectedPlanId])

  useEffect(() => {
    if (selectedPlan && !amount) {
      setAmount(String(selectedPlan.min_amount))
    }
  }, [selectedPlan, amount])

  const selectedMethod = useMemo(
    () => paymentMethods.find((method) => method.id === paymentMethod) ?? null,
    [paymentMethods, paymentMethod],
  )

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
        if (prev.bankAccountId && configuration.bank_accounts?.some((account) => account.id === prev.bankAccountId)) {
          return prev
        }
        const primary = configuration.bank_accounts.find((account) => account.is_primary) ?? configuration.bank_accounts[0]
        return {
          ...prev,
          bankAccountId: primary?.id ?? "",
        }
      })
    }
  }, [isManualPayment, paymentMethods])

  const selectedManualAccount = useMemo(() => {
    if (!manualConfig?.bank_accounts?.length) return null
    if (!manualDetails.bankAccountId) return manualConfig.bank_accounts[0]
    return (
      manualConfig.bank_accounts.find((account) => account.id === manualDetails.bankAccountId) ??
      manualConfig.bank_accounts[0]
    )
  }, [manualConfig, manualDetails.bankAccountId])

  const validateInputs = () => {
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      sonnerToast.error(t("equityCheckout.errInvalidAmount"), {
        description: t("equityCheckout.errInvalidAmountDesc"),
      })
      return false
    }

    if (numericAmount < 100) {
      sonnerToast.error(t("equityCheckout.errTooLow"), {
        description: t("equityCheckout.errTooLowDesc"),
      })
      return false
    }

    if (selectedPlan) {
      if (numericAmount < selectedPlan.min_amount) {
        sonnerToast.error(t("equityCheckout.errBelowMin"), {
          description: t("equityCheckout.errBelowMinDesc").replace(
            "{amount}",
            currencyFormatter.format(selectedPlan.min_amount),
          ),
        })
        return false
      }
      if (selectedPlan.max_amount && numericAmount > selectedPlan.max_amount) {
        sonnerToast.error(t("equityCheckout.errAboveMax"), {
          description: t("equityCheckout.errAboveMaxDesc").replace(
            "{amount}",
            currencyFormatter.format(selectedPlan.max_amount),
          ),
        })
        return false
      }
    }

    if (paymentMethod === "wallet" && walletBalance !== null && numericAmount > walletBalance) {
      sonnerToast.error(t("equityCheckout.errWallet"), {
        description: t("equityCheckout.errWalletDesc").replace("{amount}", currencyFormatter.format(walletBalance)),
      })
      return false
    }

    if (!paymentMethod) {
      sonnerToast.error(t("equityCheckout.errPayMethod"), {
        description: t("equityCheckout.errPayMethodDesc"),
      })
      return false
    }

    if (isManualPayment) {
      if (!manualConfig) {
        sonnerToast.error(t("equityCheckout.errManualCfg"), {
          description: t("equityCheckout.errManualCfgDesc"),
        })
        return false
      }

      if (manualConfig.bank_accounts && manualConfig.bank_accounts.length > 1 && !manualDetails.bankAccountId) {
        sonnerToast.error(t("equityCheckout.errPickBank"), {
          description: t("equityCheckout.errPickBankDesc"),
        })
        return false
      }

      if ((manualConfig.require_payer_name ?? true) && !manualDetails.payerName.trim()) {
        sonnerToast.error(t("equityCheckout.errPayerName"), {
          description: t("equityCheckout.errPayerNameDesc"),
        })
        return false
      }

      if ((manualConfig.require_payer_phone ?? false) && !manualDetails.payerPhone.trim()) {
        sonnerToast.error(t("equityCheckout.errPayerPhone"), {
          description: t("equityCheckout.errPayerPhoneDesc"),
        })
        return false
      }

      if ((manualConfig.require_transaction_reference ?? true) && !manualDetails.transactionReference.trim()) {
        sonnerToast.error(t("equityCheckout.errTxnRef"), {
          description: t("equityCheckout.errTxnRefDesc"),
        })
        return false
      }

      if ((manualConfig.require_payment_evidence ?? true) && manualEvidence.length === 0) {
        sonnerToast.error(t("equityCheckout.errEvidence"), {
          description: t("equityCheckout.errEvidenceDesc"),
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
      sonnerToast.success(
        uploads.length > 1
          ? t("equityCheckout.uploadOkMulti").replace("{n}", String(uploads.length))
          : t("equityCheckout.uploadOk"),
      )
    } catch (error: any) {
      sonnerToast.error(t("equityCheckout.uploadFail"), {
        description: error?.message || t("equityCheckout.uploadFailDesc"),
      })
    } finally {
      setEvidenceUploading(false)
      event.target.value = ""
    }
  }

  const removeEvidence = (url: string) => {
    setManualEvidence((prev) => prev.filter((item) => item !== url))
  }

  const goToNextStage = () => {
    setStage((current) => {
      const index = stages.indexOf(current)
      return stages[index + 1] ?? current
    })
  }

  const goToPreviousStage = () => {
    setStage((current) => {
      const index = stages.indexOf(current)
      return stages[index - 1] ?? current
    })
  }

  const handleProceedFromDetails = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateInputs()) return
    goToNextStage()
  }

  const handleProceedFromReview = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    goToNextStage()
  }

  const submitContribution = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    if (!validateInputs()) {
      setStage("details")
      return
    }

    let recaptchaToken: string
    if (recaptchaRef.current) {
      try {
        recaptchaToken = await recaptchaRef.current.execute()
      } catch {
        sonnerToast.error(t("equityCheckout.submitFail"), {
          description: t("equityCheckout.recaptchaNotReady"),
        })
        return
      }
    } else {
      sonnerToast.error(t("equityCheckout.submitFail"), {
        description: t("equityCheckout.recaptchaNotReady"),
      })
      return
    }

    try {
      setSubmitting(true)
      setSubmissionInfo(null)

      const numericAmount = Number(amount)
      const payload: Record<string, unknown> = {
        plan_id: selectedPlanId || null,
        amount: numericAmount,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
        recaptcha_token: recaptchaToken,
      }

      if (isManualPayment) {
        payload.payer_name = manualDetails.payerName.trim() || null
        payload.payer_phone = manualDetails.payerPhone.trim() || null
        payload.transaction_reference = manualDetails.transactionReference.trim() || null
        payload.bank_account_id = manualDetails.bankAccountId || null
        payload.payment_evidence = manualEvidence
      }

      const response = await createEquityContribution(payload)

      if (!response.success) {
        throw new Error(response.message || t("equityCheckout.submitFail"))
      }

      setSubmissionInfo({
        message: response.message,
        reference: response.reference,
        manualInstructions: response.manual_instructions ?? null,
        paymentMethod: paymentMethod,
      })

      if (paymentMethod === "wallet") {
        router.push(
          `/dashboard/equity-contributions/success?${new URLSearchParams({
            amount: String(numericAmount),
            method: paymentMethod,
            status: "success",
            reference: response.reference ?? "",
          }).toString()}`,
        )
        return
      }

      if (isManualPayment) {
        const params = new URLSearchParams()
        params.set("amount", String(numericAmount))
        params.set("method", paymentMethod)
        if (response.reference) params.set("reference", response.reference)
        params.set("status", response.requires_approval ? "awaiting_approval" : "pending")
        if (response.message) params.set("info", response.message)
        router.push(`/dashboard/equity-contributions/success?${params.toString()}`)
        return
      }

      if (response.payment_url) {
        window.location.href = response.payment_url
        return
      }

      sonnerToast.success(response.message || t("equityCheckout.initSuccess"))
      router.push("/dashboard/equity-contributions")
    } catch (error: any) {
      console.error("Failed to submit equity contribution", error)
      sonnerToast.error(t("equityCheckout.submitFail"), {
        description: error?.message || t("equityCheckout.submitFailDesc"),
      })
      if (recaptchaRef.current) {
        try {
          await recaptchaRef.current.execute()
        } catch {
          /* ignore */
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!paymentMethods.length) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/equity-contributions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t("equityCheckout.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("equityCheckout.subtitle")}</p>
          </div>
        </div>
        <Alert>
          <AlertDescription>{t("equityCheckout.noMethods")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const manualAccounts = manualConfig?.bank_accounts ?? []

  if (stage === "review") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setStage("details")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("equityCheckout.reviewTitle")}</h1>
            <p className="text-muted-foreground mt-1">{t("equityCheckout.reviewSubtitle")}</p>
          </div>
        </div>

        <form onSubmit={handleProceedFromReview} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("equityCheckout.summaryTitle")}</CardTitle>
              <CardDescription>{t("equityCheckout.summaryDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("walletFund.amount")}</span>
                  <span className="text-2xl font-semibold">{currencyFormatter.format(Number(amount || 0))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("walletFund.paymentMethod")}</span>
                  <span className="font-medium">{selectedMethod?.name ?? paymentMethod}</span>
                </div>
                {selectedPlan && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("equityCheckout.plan")}</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                )}
              </div>

              {notes.trim() && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">{t("equityCheckout.notes")}</p>
                  <p className="mt-1 text-sm">{notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {isManualPayment && manualConfig && (
            <Card>
              <CardHeader>
                <CardTitle>{t("equityCheckout.manualCardTitle")}</CardTitle>
                <CardDescription>{t("equityCheckout.manualCardDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedManualAccount ? (
                  <div className="rounded-lg border p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("walletFund.bank")}</span>
                      <span className="font-medium">{selectedManualAccount.bank_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("walletFund.accountName")}</span>
                      <span className="font-medium break-all">{selectedManualAccount.account_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("walletFund.accountNumber")}</span>
                      <span className="font-medium">{selectedManualAccount.account_number}</span>
                    </div>
                    {selectedManualAccount.instructions && (
                      <p className="text-xs text-muted-foreground mt-2">{selectedManualAccount.instructions}</p>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>{t("equityCheckout.noManualBank")}</AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">{t("walletFund.payerName")}</p>
                    <p className="font-medium">{manualDetails.payerName || t("walletFund.notProvided")}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("walletFund.payerPhone")}</p>
                    <p className="font-medium">{manualDetails.payerPhone || t("walletFund.notProvided")}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-muted-foreground">{t("walletFund.transactionRef")}</p>
                    <p className="font-medium break-all">
                      {manualDetails.transactionReference || t("walletFund.notProvided")}
                    </p>
                  </div>
                </div>

                {manualEvidence.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("equityCheckout.uploadedEvidence").replace("{n}", String(manualEvidence.length))}
                    </p>
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
                    <Alert>
                      <AlertDescription>{t("equityCheckout.noEvidence")}</AlertDescription>
                    </Alert>
                  )
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={goToPreviousStage}>
              {t("equityCheckout.back")}
            </Button>
            <Button type="submit">{t("equityCheckout.proceedConfirm")}</Button>
          </div>
        </form>
      </div>
    )
  }

  if (stage === "confirm") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={goToPreviousStage}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t("equityCheckout.confirmTitle")}</h1>
            <p className="text-muted-foreground mt-1">{t("equityCheckout.confirmSubtitle")}</p>
          </div>
        </div>

        <form onSubmit={submitContribution} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("equityCheckout.summaryTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("walletFund.amount")}</span>
                  <span className="text-2xl font-semibold">{currencyFormatter.format(Number(amount || 0))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("walletFund.paymentMethod")}</span>
                  <span className="font-medium">{selectedMethod?.name ?? paymentMethod}</span>
                </div>
                {selectedPlan && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("equityCheckout.plan")}</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{t("equityCheckout.authorize")}</p>

              {submissionInfo?.manualInstructions && isManualPayment && selectedManualAccount && (
                <Alert>
                  <AlertDescription>
                    {submissionInfo.manualInstructions.message || t("equityCheckout.awaitingDefault")}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Recaptcha ref={recaptchaRef} onVerify={() => {}} onError={() => {}} action="equity_contribution" />

          <p className="text-[11px] text-muted-foreground text-center leading-snug">{t("equityCheckout.recaptcha")}</p>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={goToPreviousStage}>
              {t("equityCheckout.back")}
            </Button>
            <Button type="submit" disabled={submitting || evidenceUploading}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("equityCheckout.processing")}
                </>
              ) : (
                t("equityCheckout.confirmBtn")
              )}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/equity-contributions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{t("equityCheckout.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("equityCheckout.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleProceedFromDetails} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("equityCheckout.detailsTitle")}</CardTitle>
            <CardDescription>{t("equityCheckout.detailsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan_id">{t("equityCheckout.planOptional")}</Label>
              <Select
                value={selectedPlanId || "custom"}
                onValueChange={(value) => setSelectedPlanId(value === "custom" ? "" : value)}
                disabled={!plans.length}
              >
                <SelectTrigger id="plan_id">
                  <SelectValue
                    placeholder={plans.length ? t("equityCheckout.planPlaceholder") : t("equityCheckout.noPlans")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t("equityCheckout.customAmount")}</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {currencyFormatter.format(plan.min_amount)}
                          {plan.max_amount ? ` - ${currencyFormatter.format(plan.max_amount)}` : ""} • {plan.frequency.replace("_", " ")}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlan && (
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <p className="font-medium">{selectedPlan.name}</p>
                  {selectedPlan.description && <p className="text-muted-foreground">{selectedPlan.description}</p>}
                  <p className="text-muted-foreground">
                    {t("equityCheckout.range")} {currencyFormatter.format(selectedPlan.min_amount)}
                    {selectedPlan.max_amount ? ` - ${currencyFormatter.format(selectedPlan.max_amount)}` : "+"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t("equityCheckout.amountLabel")}</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder={t("equityCheckout.amountPlaceholder")}
                min={0}
                step="0.01"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("equityCheckout.payTitle")}</CardTitle>
            <CardDescription>{t("equityCheckout.payDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
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
                          {method.id === "manual" && <Badge variant="secondary">{t("equityCheckout.adminApproval")}</Badge>}
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
                <AlertDescription>
                  {walletBalance !== null
                    ? t("equityCheckout.walletBalance").replace("{amount}", currencyFormatter.format(walletBalance))
                    : t("equityCheckout.walletBalanceUnknown")}
                </AlertDescription>
              </Alert>
            )}

            {isManualPayment && manualConfig && (
              <Alert>
                <AlertDescription>{t("equityCheckout.manualAlert")}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {isManualPayment && manualConfig && (
          <Card>
            <CardHeader>
              <CardTitle>{t("equityCheckout.manualSectionTitle")}</CardTitle>
              <CardDescription>{t("equityCheckout.manualSectionDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {manualAccounts.length > 0 ? (
                <div className="space-y-2">
                  <Label htmlFor="manual-account">{t("equityCheckout.destAccount")}</Label>
                  <Select
                    value={manualDetails.bankAccountId}
                    onValueChange={(value) =>
                      setManualDetails((prev) => ({
                        ...prev,
                        bankAccountId: value,
                      }))
                    }
                  >
                    <SelectTrigger id="manual-account">
                      <SelectValue placeholder={t("equityCheckout.selectBank")} />
                    </SelectTrigger>
                    <SelectContent>
                      {manualAccounts.map((account) => (
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
              ) : (
                <Alert>
                  <AlertDescription>{t("equityCheckout.noManualConfigured")}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    {t("walletFund.payerNameLabel")}{" "}
                    {manualConfig.require_payer_name ?? true
                      ? t("equityCheckout.requiredMark")
                      : t("equityCheckout.optional")}
                  </Label>
                  <Input
                    value={manualDetails.payerName}
                    onChange={(event) =>
                      setManualDetails((prev) => ({
                        ...prev,
                        payerName: event.target.value,
                      }))
                    }
                    placeholder={t("equityCheckout.payerNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("walletFund.payerPhoneLabel")}{" "}
                    {manualConfig.require_payer_phone ? t("equityCheckout.requiredMark") : t("equityCheckout.optional")}
                  </Label>
                  <Input
                    value={manualDetails.payerPhone}
                    onChange={(event) =>
                      setManualDetails((prev) => ({
                        ...prev,
                        payerPhone: event.target.value,
                      }))
                    }
                    placeholder={t("equityCheckout.payerPhonePlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  {t("walletFund.transactionRef")}{" "}
                  {manualConfig.require_transaction_reference ?? true
                    ? t("equityCheckout.requiredMark")
                    : t("equityCheckout.optional")}
                </Label>
                <Input
                  value={manualDetails.transactionReference}
                  onChange={(event) =>
                    setManualDetails((prev) => ({
                      ...prev,
                      transactionReference: event.target.value,
                    }))
                  }
                  placeholder={t("equityCheckout.txnRefPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  {t("equityCheckout.evidenceLabel")}{" "}
                  {manualConfig.require_payment_evidence ?? true
                    ? t("equityCheckout.requiredMark")
                    : t("equityCheckout.optional")}
                </Label>
                <Input type="file" multiple accept="image/*,.pdf" onChange={handleEvidenceUpload} disabled={evidenceUploading} />
                {evidenceUploading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> {t("equityCheckout.uploadingEvidence")}
                  </div>
                )}
                {manualEvidence.length > 0 && (
                  <div className="space-y-2">
                    {manualEvidence.map((url) => (
                      <div key={url} className="flex items-center justify-between rounded border p-2 text-sm">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {t("equityCheckout.viewEvidence")}
                        </a>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeEvidence(url)}>
                          {t("equityCheckout.remove")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("equityCheckout.notesTitle")}</CardTitle>
            <CardDescription>{t("equityCheckout.notesHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={t("equityCheckout.notesPlaceholder")}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Link href="/dashboard/equity-contributions">
            <Button type="button" variant="outline">
              {t("equityCheckout.cancel")}
            </Button>
          </Link>
          <Button type="submit">{t("equityCheckout.reviewContinue")}</Button>
        </div>
      </form>
    </div>
  )
}

function normalizeManualConfig(configuration?: Record<string, unknown>): ManualConfig {
  const defaults: ManualConfig = {
    require_payer_name: true,
    require_payer_phone: false,
    require_transaction_reference: true,
    require_payment_evidence: true,
    bank_accounts: [],
  }

  if (!configuration) return defaults

  const merged: ManualConfig = {
    ...defaults,
    ...(configuration as ManualConfig),
  }

  if (!Array.isArray(merged.bank_accounts)) {
    merged.bank_accounts = []
  } else {
    merged.bank_accounts = merged.bank_accounts.map((account) => ({
      ...account,
      id: account.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    }))
  }

  return merged
}

