"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { resolveStorageUrl } from "@/lib/api/config"

type SubjectPayload = {
  type?: string
  process_key?: string
  process_label?: string
  admin_href?: string | null
  record?: Record<string, any> | null
} | null

function money(value: unknown) {
  const n = Number(value)
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(n)
}

function Field({ label, value }: { label: string; value?: ReactNode }) {
  if (value === undefined || value === null || value === "") return null
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium break-words">{value}</div>
    </div>
  )
}

export function WorkflowSubjectPanel({ subject }: { subject?: SubjectPayload }) {
  const record = subject?.record
  if (!subject || !record) return null

  const type = String(subject.type || "")
  const paySlip = record.pay_slip
  const paySlipUrl =
    typeof paySlip === "string"
      ? resolveStorageUrl(paySlip)
      : paySlip?.url
        ? resolveStorageUrl(paySlip.url)
        : null
  const guarantors: any[] = Array.isArray(record.guarantors) ? record.guarantors : []

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">
              {subject.process_label || type || "Linked record"}
            </CardTitle>
            <CardDescription>
              Full module details for this Digital Office item. Review here without leaving the task.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {record.status ? (
              <Badge variant="outline" className="capitalize">
                {String(record.status).replace(/_/g, " ")}
              </Badge>
            ) : null}
            {subject.admin_href ? (
              <Button asChild size="sm" variant="outline">
                <Link href={subject.admin_href}>
                  Open full record <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {type === "Loan" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Member" value={record.member_name || record.member_number} />
              <Field label="Email" value={record.member_email} />
              <Field label="Loan number" value={record.loan_number} />
              <Field label="Product" value={record.product_name} />
              <Field label="Amount" value={money(record.amount)} />
              <Field
                label="Net pay"
                value={
                  record.net_pay != null ? (
                    <span className="text-base font-semibold">{money(record.net_pay)}</span>
                  ) : (
                    "—"
                  )
                }
              />
              <Field label="Interest" value={record.interest_rate != null ? `${record.interest_rate}%` : null} />
              <Field label="Duration" value={record.duration_months ? `${record.duration_months} months` : null} />
              <Field label="Monthly payment" value={money(record.monthly_payment)} />
              <Field label="Purpose" value={record.purpose} />
              <Field label="Employment" value={record.employment_status} />
              <Field label="Collateral" value={record.collateral} />
            </div>
            {guarantors.length > 0 ? (
              <div>
                <div className="mb-2 text-sm font-medium">Guarantor(s)</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {guarantors.map((g, i) => (
                    <div key={i} className="rounded-md border p-3 text-sm">
                      <div className="font-medium">{g.name || g.guarantor_name || "Guarantor"}</div>
                      <div className="text-muted-foreground">
                        {[g.relationship || g.guarantor_relationship, g.phone || g.guarantor_phone]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      {g.address || g.guarantor_address ? (
                        <div className="mt-1 text-muted-foreground">{g.address || g.guarantor_address}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {paySlipUrl ? (
              <div>
                <div className="mb-2 text-sm font-medium">Payslip</div>
                <a
                  href={paySlipUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline underline-offset-2"
                >
                  View payslip
                </a>
                {typeof paySlip !== "string" && String(paySlip?.mime || "").startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={paySlipUrl} alt="Payslip" className="mt-2 max-h-80 rounded-md border" />
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Member" value={record.member_name || record.member_number} />
            <Field label="Email" value={record.email || record.member_email} />
            <Field label="Amount" value={record.amount != null ? money(record.amount) : null} />
            <Field label="Plan" value={record.plan_name} />
            <Field label="Estate" value={record.estate_name} />
            <Field label="Association" value={record.association_name} />
            <Field label="Charge" value={record.charge_name} />
            <Field label="Property" value={record.property_title} />
            <Field label="Bank reference" value={record.bank_reference} />
            <Field label="Payment date" value={record.payment_date} />
            <Field label="KYC status" value={record.kyc_status} />
            <Field label="Category" value={record.category} />
            <Field label="Payee" value={record.payee} />
            <Field label="Description" value={record.description || record.message || record.purpose || record.subject} />
            <Field label="Reference" value={record.reference || record.reference_number || record.request_number} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
