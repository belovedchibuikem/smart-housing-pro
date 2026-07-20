"use client"

import { useCallback, useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Home, LandPlot, MapPin, Calendar, ChevronRight, History, FileText, ReceiptText } from "lucide-react"
import { toast } from "sonner"
import { AdminAssetRepaymentForm } from "@/components/admin/admin-asset-repayment-form"
import {
  getMemberOwnershipHistory,
  getMemberPropertyHoldings,
  type MemberPropertySupportDocument,
  type MemberOwnershipDocument,
  type MemberOwnershipFinancials,
  type MemberPropertyHolding,
  type MemberOwnershipPaymentSchedule,
  type MemberOwnershipRepaymentEntry,
  type MemberOwnershipStatutoryCharge,
  type MemberOwnershipHistoryEntry,
  type MemberOwnershipAssetDetail,
} from "@/lib/api/client"

interface MemberPropertiesSectionProps {
  memberId: string
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString()
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatCurrency(value?: number | null) {
  return currencyFormatter.format(Number(value ?? 0))
}

function statusBadgeVariant(status?: string) {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
    case "approved":
    case "subscribed":
    case "active":
      return "default" as const
    case "pending":
      return "secondary" as const
    case "rejected":
      return "destructive" as const
    default:
      return "outline" as const
  }
}

export function MemberPropertiesSection({ memberId }: MemberPropertiesSectionProps) {
  const [holdings, setHoldings] = useState<MemberPropertyHolding[]>([])
  const [loading, setLoading] = useState(true)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<MemberPropertyHolding | null>(null)
  const [assetDetail, setAssetDetail] = useState<MemberOwnershipAssetDetail | null>(null)
  const [ownershipHistory, setOwnershipHistory] = useState<MemberOwnershipHistoryEntry[]>([])
  const [financials, setFinancials] = useState<MemberOwnershipFinancials | null>(null)
  const [repaymentHistory, setRepaymentHistory] = useState<MemberOwnershipRepaymentEntry[]>([])
  const [paymentSchedule, setPaymentSchedule] = useState<MemberOwnershipPaymentSchedule | null>(null)
  const [statutoryCharges, setStatutoryCharges] = useState<MemberOwnershipStatutoryCharge[]>([])
  const [ownershipDocuments, setOwnershipDocuments] = useState<MemberOwnershipDocument[]>([])
  const [assetDocuments, setAssetDocuments] = useState<MemberPropertySupportDocument[]>([])

  const loadHoldings = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getMemberPropertyHoldings(memberId)
      if (response.success) {
        setHoldings(response.data?.holdings ?? [])
      }
    } catch {
      toast.error("Failed to load member properties")
      setHoldings([])
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    void loadHoldings()
  }, [loadHoldings])

  const openHoldingDetail = async (holding: MemberPropertyHolding) => {
    setSelectedHolding(holding)
    setDetailOpen(true)
    setDetailLoading(true)
    setAssetDetail(null)
    setOwnershipHistory([])
    setFinancials(null)
    setRepaymentHistory([])
    setPaymentSchedule(null)
    setStatutoryCharges([])
    setOwnershipDocuments([])
    setAssetDocuments([])

    try {
      const response = await getMemberOwnershipHistory(memberId, holding.asset_type, holding.asset_id, {
        property_slot_id: holding.property_slot_id,
        land_slot_id: holding.land_slot_id,
        holding_id: holding.holding_id,
      })
      if (response.success && response.data) {
        setAssetDetail(response.data.asset)
        setOwnershipHistory(response.data.ownership_history ?? [])
        setFinancials(response.data.financials ?? null)
        setRepaymentHistory(response.data.repayment_history ?? [])
        setPaymentSchedule(response.data.payment_schedule ?? null)
        setStatutoryCharges(response.data.statutory_charges ?? [])
        setOwnershipDocuments(response.data.ownership_documents ?? [])
        setAssetDocuments(
          holding.asset_type === "house"
            ? (response.data.property_documents ?? [])
            : (response.data.land_documents ?? []),
        )
      }
    } catch {
      toast.error("Failed to load property details")
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetail = () => {
    setDetailOpen(false)
    setSelectedHolding(null)
    setAssetDetail(null)
    setOwnershipHistory([])
    setFinancials(null)
    setRepaymentHistory([])
    setPaymentSchedule(null)
    setStatutoryCharges([])
    setOwnershipDocuments([])
    setAssetDocuments([])
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Properties
          </CardTitle>
          <CardDescription>Houses and land parcels allocated or subscribed to this member</CardDescription>
        </CardHeader>
        <CardContent>
          {holdings.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
              No properties recorded for this member.
            </div>
          ) : (
            <div className="space-y-3">
              {holdings.map((holding) => {
                const Icon = holding.asset_type === "land" ? LandPlot : Home
                return (
                  <button
                    key={`${holding.asset_type}-${holding.holding_id}`}
                    type="button"
                    onClick={() => void openHoldingDetail(holding)}
                    className="flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="mt-0.5 rounded-md bg-muted p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{holding.title}</span>
                        <Badge variant="outline" className="font-normal">
                          {holding.type_label}
                        </Badge>
                        {holding.hand_label ? (
                          <Badge variant="secondary" className="font-normal text-[10px]">
                            {holding.is_original_owner ? "Original owner" : holding.hand_label}
                          </Badge>
                        ) : null}
                        <Badge variant={statusBadgeVariant(holding.status)} className="capitalize">
                          {holding.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2">{holding.identifier}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Allocated {formatDate(holding.allocation_date)}
                      </div>
                    </div>
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedHolding?.title ?? "Property details"}</DialogTitle>
            <DialogDescription>
              {selectedHolding?.type_label ?? "Property"} — ownership and allocation details
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {assetDetail ? (
                <div className="grid gap-4 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Address / identifier</p>
                    <p className="font-medium">{assetDetail.location ?? "—"}</p>
                    {assetDetail.estate_location && assetDetail.estate_location !== assetDetail.location ? (
                      <p className="mt-1 text-xs text-muted-foreground">Estate: {assetDetail.estate_location}</p>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Allocation date</p>
                    <p className="font-medium">{formatDate(assetDetail.allocation_date)}</p>
                  </div>
                  {selectedHolding?.asset_type === "house" ? (
                    <>
                      {assetDetail.bedrooms != null ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Bedrooms</p>
                          <p className="font-medium">{assetDetail.bedrooms}</p>
                        </div>
                      ) : null}
                      {assetDetail.bathrooms != null ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Bathrooms</p>
                          <p className="font-medium">{assetDetail.bathrooms}</p>
                        </div>
                      ) : null}
                      {assetDetail.size != null ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Size</p>
                          <p className="font-medium">{assetDetail.size}</p>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {assetDetail.land_code ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Land ID</p>
                          <p className="font-mono font-medium">{assetDetail.land_code}</p>
                        </div>
                      ) : null}
                      {assetDetail.land_size ? (
                        <div>
                          <p className="text-xs text-muted-foreground">Land size</p>
                          <p className="font-medium">{assetDetail.land_size}</p>
                        </div>
                      ) : null}
                    </>
                  )}
                  {(assetDetail.city || assetDetail.state) && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground">Area</p>
                      <p className="font-medium">
                        {[assetDetail.city, assetDetail.state].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {financials ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <h3 className="font-semibold">Payment overview</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Property cost</p>
                      <p className="text-base font-semibold">{formatCurrency(financials.total_cost ?? financials.sale_price ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount paid</p>
                      <p className="text-base font-semibold">{formatCurrency(financials.amount_paid ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Outstanding balance</p>
                      <p className="text-base font-semibold text-primary">{formatCurrency(financials.balance ?? financials.outstanding ?? 0)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Repayment progress</span>
                      <span>{Number(financials.payment_progress_percent ?? 0).toFixed(0)}%</span>
                    </div>
                    <Progress value={Number(financials.payment_progress_percent ?? 0)} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {financials.payment_status ? (
                      <Badge variant="secondary" className="capitalize">
                        {String(financials.payment_status).replace(/_/g, " ")}
                      </Badge>
                    ) : null}
                    {financials.tenure_status ? (
                      <Badge variant="outline" className="capitalize">
                        Tenure: {String(financials.tenure_status).replace(/_/g, " ")}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {selectedHolding ? (
                <div className="space-y-3 rounded-lg border p-4">
                  <h3 className="font-semibold">Record repayment</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply cash, equity wallet, or mortgage disbursement to this member&apos;s{" "}
                    {selectedHolding.asset_type === "land" ? "land slot" : "house block/slot"}.
                  </p>
                  <AdminAssetRepaymentForm
                    assetType={selectedHolding.asset_type}
                    tenureId={selectedHolding.holding_id}
                    memberId={memberId}
                    compact
                    onSuccess={() => void openHoldingDetail(selectedHolding)}
                  />
                </div>
              ) : null}

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Payment schedule</h3>
                </div>
                {!paymentSchedule?.available ? (
                  <p className="text-sm text-muted-foreground">
                    {paymentSchedule?.message ?? "No payment schedule configured yet."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Funding option</p>
                        <p className="font-medium capitalize">{paymentSchedule.funding_option?.replace(/_/g, " ") || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Plan status</p>
                        <p className="font-medium capitalize">{paymentSchedule.status?.replace(/_/g, " ") || "—"}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Plan total</p>
                        <p className="font-medium">{formatCurrency(paymentSchedule.total_amount ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Plan balance</p>
                        <p className="font-medium">{formatCurrency(paymentSchedule.remaining_balance ?? 0)}</p>
                      </div>
                    </div>
                    {(paymentSchedule.selected_methods?.length ?? 0) > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {paymentSchedule.selected_methods?.map((method) => (
                          <Badge key={method} variant="outline" className="capitalize">
                            {method.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    {(paymentSchedule.items?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {paymentSchedule.items.map((item, index) => (
                          <div key={`schedule-${index}`} className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                            {Object.entries(item).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">{key.replace(/_/g, " ")}</span>
                                <span className="font-medium">{String(value ?? "—")}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold">Repayment history</h3>
                {repaymentHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No repayment records found for this slot.</p>
                ) : (
                  <div className="space-y-2">
                    {repaymentHistory.slice(0, 20).map((entry) => (
                      <div key={entry.id} className="rounded-md border px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{formatCurrency(entry.amount)}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(entry.paid_at ?? entry.paid_on)}</p>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {entry.source ? (
                            <Badge variant="outline" className="capitalize">
                              {entry.source.replace(/_/g, " ")}
                            </Badge>
                          ) : null}
                          {entry.reference ? <span>Ref: {entry.reference}</span> : null}
                          {entry.status ? <span className="capitalize">Status: {entry.status.replace(/_/g, " ")}</span> : null}
                        </div>
                        {entry.description ? <p className="mt-1 text-sm">{entry.description}</p> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold">Statutory charges</h3>
                {statutoryCharges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No statutory charge records found for this member.</p>
                ) : (
                  <div className="space-y-2">
                    {statutoryCharges.slice(0, 20).map((charge) => (
                      <div key={charge.id} className="rounded-md border px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{charge.type_label ?? charge.type}</p>
                          <Badge variant={statusBadgeVariant(charge.status)} className="capitalize">
                            {charge.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Due: {formatDate(charge.due_date)} {charge.department ? `• ${charge.department}` : ""}
                        </p>
                        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                          <p>Total: {formatCurrency(charge.amount)}</p>
                          <p>Paid: {formatCurrency(charge.total_paid)}</p>
                          <p>Balance: {formatCurrency(charge.remaining_amount)}</p>
                        </div>
                        {charge.description ? <p className="mt-1 text-sm">{charge.description}</p> : null}
                        {charge.payments.length > 0 ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Payments: {charge.payments.length} recorded
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Ownership documents</h3>
                </div>
                {ownershipDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No ownership documents uploaded for this slot yet.</p>
                ) : (
                  <div className="space-y-2">
                    {ownershipDocuments.map((doc) => (
                      <div key={doc.id} className="rounded-md border px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{doc.document_label ?? doc.document_type}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusBadgeVariant(doc.status)} className="capitalize">
                              {doc.status.replace(/_/g, " ")}
                            </Badge>
                            {doc.uploaded_by_type ? (
                              <Badge variant="outline" className="capitalize">
                                {doc.uploaded_by_type === "member" ? "Member upload" : "Admin upload"}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Uploaded: {formatDate(doc.created_at)} {doc.transfer_date ? `• Transfer: ${formatDate(doc.transfer_date)}` : ""}
                        </p>
                        {doc.file_url ? (
                          <Button asChild variant="outline" size="sm" className="mt-2">
                            <a href={doc.file_url} target="_blank" rel="noreferrer">
                              View document
                            </a>
                          </Button>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">File not attached yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">
                    {selectedHolding?.asset_type === "house" ? "Property documents" : "Land documents"}
                  </h3>
                </div>
                {assetDocuments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No additional uploaded documents found for this {selectedHolding?.asset_type === "house" ? "house block" : "land plot"}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assetDocuments.map((doc) => (
                      <div key={doc.id} className="rounded-md border px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{doc.title || doc.file_name || "Document"}</p>
                          <div className="flex items-center gap-2">
                            {doc.document_type ? (
                              <Badge variant="secondary" className="capitalize">
                                {doc.document_type.replace(/_/g, " ")}
                              </Badge>
                            ) : null}
                            {doc.uploaded_by_role ? (
                              <Badge variant="outline" className="capitalize">
                                {doc.uploaded_by_role === "member" ? "Member upload" : "Admin upload"}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        {doc.description ? <p className="mt-1 text-sm">{doc.description}</p> : null}
                        <p className="mt-1 text-xs text-muted-foreground">
                          Uploaded: {formatDate(doc.created_at)}
                        </p>
                        {doc.file_url ? (
                          <Button asChild variant="outline" size="sm" className="mt-2">
                            <a href={doc.file_url} target="_blank" rel="noreferrer">
                              View document
                            </a>
                          </Button>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">File not attached yet.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Ownership history</h3>
                </div>
                {ownershipHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No ownership history recorded for this asset.</p>
                ) : (
                  <div className="space-y-0">
                    {ownershipHistory.map((entry, index) => (
                      <div key={`${entry.sequence}-${entry.owner_name}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
                        {index < ownershipHistory.length - 1 ? (
                          <span className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-border" />
                        ) : null}
                        <div
                          className={`relative z-10 mt-1 h-[22px] w-[22px] shrink-0 rounded-full border-2 ${
                            entry.is_current ? "border-primary bg-primary" : "border-muted-foreground/40 bg-background"
                          }`}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">{entry.label ?? "Ownership transfer"}</span>
                            {entry.is_original ? (
                              <Badge className="text-[10px]">Original owner</Badge>
                            ) : null}
                            {!entry.is_original && entry.hand_label ? (
                              <Badge variant="outline" className="text-[10px] font-normal">
                                {entry.hand_label}
                              </Badge>
                            ) : null}
                            {entry.is_current ? (
                              <Badge variant="default" className="text-[10px]">
                                Current
                              </Badge>
                            ) : null}
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {entry.event_type}
                            </Badge>
                          </div>
                          <p className="font-medium">{entry.owner_name}</p>
                          {entry.member_number ? (
                            <p className="text-xs text-muted-foreground">Member No: {entry.member_number}</p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(entry.effective_date)}
                            {entry.ended_date ? ` → ${formatDate(entry.ended_date)}` : entry.is_current ? " → Present" : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={closeDetail}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
