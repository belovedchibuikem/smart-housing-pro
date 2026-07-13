"use client"

import { useCallback, useEffect, useState, type ChangeEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, TrendingUp, CreditCard, Calendar, Percent, Upload } from "lucide-react"
import {
  getPropertyPaymentSetup,
  getPropertyTenure,
  getMemberHouseAccount,
  uploadPropertyDeed,
  uploadHouseAccountDeed,
  type PropertyPaymentSetup,
  type MemberPropertyTenure,
  type MemberHouse,
} from "@/lib/api/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

type PropertyFinancialsProps = {
  house?: MemberHouse | null
}

function formatCurrency(amount: number | undefined | null) {
  if (amount == null || Number.isNaN(amount)) return "₦0"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

export function PropertyFinancials({ house }: PropertyFinancialsProps) {
  const { toast } = useToast()
  const [paymentSetup, setPaymentSetup] = useState<PropertyPaymentSetup | null>(null)
  const [tenure, setTenure] = useState<MemberPropertyTenure | null>(null)
  const [loading, setLoading] = useState(false)
  const [deedFile, setDeedFile] = useState<File | null>(null)
  const [uploadingDeed, setUploadingDeed] = useState(false)

  const propertyId = house?.property_id ?? house?.id
  const allocationId = house?.allocation_id ?? null

  const load = useCallback(async () => {
    if (!propertyId) return
    setLoading(true)
    try {
      const setupPromise = getPropertyPaymentSetup(propertyId)
      const tenurePromise = allocationId
        ? getMemberHouseAccount(allocationId).then((res) =>
            res.success && res.data
              ? { success: true as const, data: res.data as unknown as MemberPropertyTenure }
              : { success: false as const },
          )
        : getPropertyTenure(propertyId)

      const [setupRes, tenureRes] = await Promise.allSettled([setupPromise, tenurePromise])
      if (setupRes.status === "fulfilled" && setupRes.value.success) {
        setPaymentSetup(setupRes.value.data)
      }
      if (
        tenureRes.status === "fulfilled" &&
        tenureRes.value &&
        "success" in tenureRes.value &&
        tenureRes.value.success &&
        "data" in tenureRes.value
      ) {
        setTenure(tenureRes.value.data)
      } else {
        setTenure(null)
      }
    } catch (error) {
      console.error("Failed to load financials:", error)
    } finally {
      setLoading(false)
    }
  }, [propertyId, allocationId])

  useEffect(() => {
    void load()
  }, [load])

  const handleDeedUpload = async () => {
    if (!propertyId || !deedFile) {
      toast({ title: "Select a deed file first", variant: "destructive" })
      return
    }
    const deedAllocationId = allocationId ?? tenure?.allocation_id
    setUploadingDeed(true)
    try {
      const form = new FormData()
      form.append("file", deedFile)
      const res = deedAllocationId
        ? await uploadHouseAccountDeed(deedAllocationId, form)
        : await uploadPropertyDeed(propertyId, form)
      toast({ title: res.message || "Deed uploaded" })
      setDeedFile(null)
      await load()
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Could not upload deed",
        variant: "destructive",
      })
    } finally {
      setUploadingDeed(false)
    }
  }

  if (!house) return null

  const salePrice = tenure?.sale_price ?? paymentSetup?.property?.price ?? house.price ?? 0
  const totalPaid = tenure?.amount_paid ?? paymentSetup?.property?.total_paid ?? house.total_paid ?? 0
  const balance =
    tenure?.outstanding ??
    paymentSetup?.property?.balance ??
    Math.max(0, salePrice - totalPaid)
  const progress =
    tenure?.payment_progress_percent ??
    paymentSetup?.property?.progress ??
    (salePrice > 0 ? (totalPaid / salePrice) * 100 : 0)
  const tenureStatus = tenure?.tenure_status ?? house.tenure_status ?? null
  const accountAllocationId = allocationId ?? tenure?.allocation_id
  const slotLabel = tenure?.slot_label ?? house.slot_label
  const ledgerTotalPaid = paymentSetup?.ledger_total_paid ?? 0
  const paymentHistory = paymentSetup?.payment_history ?? []
  const ledgerEntries = paymentSetup?.ledger_entries ?? []

  const activePaymentMethods = new Set<string>()
  paymentHistory.forEach((payment) => {
    if (payment.payment_method && (payment.status === "completed" || payment.status === "success")) {
      activePaymentMethods.add(payment.payment_method)
    }
  })
  ledgerEntries.forEach((entry) => {
    if (entry.source && entry.direction === "credit" && entry.status === "completed") {
      activePaymentMethods.add(entry.source)
    }
  })

  const repaymentSchedules = paymentSetup?.repayment_schedules ?? {}
  let nextPaymentDue: { amount: number; date: string; type: string } | null = null

  if (repaymentSchedules.mortgage?.schedule) {
    const nextMortgagePayment = repaymentSchedules.mortgage.schedule.find(
      (entry) => entry.status === "pending" || entry.status === "overdue",
    )
    if (nextMortgagePayment) {
      nextPaymentDue = {
        amount: nextMortgagePayment.total ?? 0,
        date: nextMortgagePayment.due_date ?? "",
        type: "Mortgage",
      }
    }
  }

  if (!nextPaymentDue && repaymentSchedules.loan?.schedule) {
    const nextLoanPayment = repaymentSchedules.loan.schedule.find(
      (entry) => entry.status === "pending" || entry.status === "overdue",
    )
    if (nextLoanPayment) {
      nextPaymentDue = {
        amount: nextLoanPayment.total ?? 0,
        date: nextLoanPayment.due_date ?? "",
        type: "Loan",
      }
    }
  }

  if (!nextPaymentDue && repaymentSchedules.cooperative?.schedule) {
    const nextCoopPayment = repaymentSchedules.cooperative.schedule.find(
      (entry) => entry.status === "pending" || entry.status === "overdue",
    )
    if (nextCoopPayment) {
      nextPaymentDue = {
        amount: nextCoopPayment.total ?? 0,
        date: nextCoopPayment.due_date ?? "",
        type: "Cooperative Deduction",
      }
    }
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentPayments = paymentHistory.filter((payment) => {
    if (!payment.created_at) return false
    const paymentDate = new Date(payment.created_at)
    return paymentDate >= thirtyDaysAgo && (payment.status === "completed" || payment.status === "success")
  })
  const recentPaymentsTotal = recentPayments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>Summary of your journey to owning this property.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {(accountAllocationId || slotLabel) && (
                <div className="flex flex-wrap items-center gap-2">
                  {slotLabel && (
                    <Badge variant="outline">Slot: {slotLabel}</Badge>
                  )}
                  {accountAllocationId && (
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/dashboard/my-houses/${accountAllocationId}`}>Open house account</Link>
                    </Button>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Progress</span>
                  <span className="font-semibold">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Sale price</p>
                  <p className="text-xl font-semibold">{formatCurrency(salePrice)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Amount paid</p>
                  <p className="text-xl font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
                  {ledgerTotalPaid > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      (₦{ledgerTotalPaid.toLocaleString()} via ledger)
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Outstanding</p>
                  <p className="text-xl font-semibold text-orange-600">{formatCurrency(balance)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Tenure status</p>
                  <p className="text-xl font-semibold capitalize">
                    {tenureStatus ? tenureStatus.replace(/_/g, " ") : "—"}
                  </p>
                  {tenure?.owner_sequence != null && (
                    <p className="text-xs text-muted-foreground mt-1">Owner #{tenure.owner_sequence}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Recent Payments (30 days)
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(recentPaymentsTotal)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{recentPayments.length} transaction(s)</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Active Payment Methods
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activePaymentMethods.size > 0 ? (
                      Array.from(activePaymentMethods).map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method.replace(/_/g, " ")}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
                {nextPaymentDue ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Next Payment Due
                    </p>
                    <p className="text-lg font-semibold">{formatCurrency(nextPaymentDue.amount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {nextPaymentDue.type} • {new Date(nextPaymentDue.date).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Next Payment Due
                    </p>
                    <p className="text-lg font-semibold text-muted-foreground">No upcoming payments</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                    <Percent className="h-3 w-3" />
                    Completion Status
                  </p>
                  <p className="text-lg font-semibold">
                    {progress >= 100 ? (
                      <span className="text-green-600">Completed</span>
                    ) : progress >= 75 ? (
                      <span className="text-blue-600">Near Completion</span>
                    ) : progress >= 50 ? (
                      <span className="text-yellow-600">Halfway</span>
                    ) : progress >= 25 ? (
                      <span className="text-orange-600">In Progress</span>
                    ) : (
                      <span className="text-gray-600">Getting Started</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(1)}% complete</p>
                </div>
              </div>

              {(house.current_value || house.predictive_value) && (
                <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                  {house.current_value ? (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Current Value</p>
                      <p className="text-xl font-semibold text-primary">{formatCurrency(house.current_value)}</p>
                    </div>
                  ) : null}
                  {house.predictive_value ? (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Predictive Value</p>
                      <p className="text-xl font-semibold text-primary/80">{formatCurrency(house.predictive_value)}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {tenure && (
        <Card>
          <CardHeader>
            <CardTitle>Deed of Assignment</CardTitle>
            <CardDescription>
              Upload your executed deed when available. Required before the cooperative can mark the tenure as sold.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tenure.deed ? (
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Deed on file</Badge>
                <span className="text-sm capitalize text-muted-foreground">
                  Status: {tenure.deed.status?.replace(/_/g, " ")}
                </span>
                {tenure.deed.file_url && (
                  <Button asChild variant="outline" size="sm">
                    <a href={tenure.deed.file_url} target="_blank" rel="noreferrer">
                      View deed
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">No deed uploaded yet for this tenure.</p>
                <div className="space-y-2">
                  <Label htmlFor="house-deed-file">Deed file (PDF or image)</Label>
                  <Input
                    id="house-deed-file"
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/jpg"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setDeedFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button onClick={handleDeedUpload} disabled={uploadingDeed || !deedFile}>
                  {uploadingDeed ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload deed
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
