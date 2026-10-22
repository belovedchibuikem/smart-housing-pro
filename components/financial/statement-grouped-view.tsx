"use client"

type SummaryRow = {
  sn?: number
  debit_label?: string
  debit_display?: string
  credit_label?: string
  credit_display?: string
}

type GroupedSummary = {
  rows?: SummaryRow[]
  residual?: {
    show?: boolean
    label?: string
    debit_display?: string
    credit_display?: string
  }
  total_debit?: { display?: string }
  total_credit?: { display?: string }
  period_debit?: { display?: string }
  period_credit?: { display?: string }
  omission_note?: string | null
}

type StatementGroup = {
  key?: string
  name?: string
  visible?: boolean
  debit_display?: string
  credit_display?: string
  transactions?: Array<Record<string, unknown>>
}

function formatDate(value: unknown) {
  if (!value) return "—"
  const raw = String(value)
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return raw
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
}

export function StatementGroupedView({
  groupedSummary,
  groups,
  closingBalance,
}: {
  groupedSummary?: GroupedSummary | null
  groups?: StatementGroup[] | null
  closingBalance?: number | string | null
}) {
  if (!groupedSummary?.rows?.length) return null

  const visibleGroups = (groups || []).filter((group) => {
    if (group.visible === false) return false
    if (group.key === "housing_profit" || group.name === "HOUSING PROFITS") return false
    return (group.transactions || []).length > 0
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Statement of Account</h3>
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-emerald-900 text-white">
              <tr>
                <th className="px-3 py-2.5 text-left font-medium">S/N</th>
                <th className="px-3 py-2.5 text-left font-medium">Debit (DR) – Items</th>
                <th className="px-3 py-2.5 text-right font-medium">Amount (₦)</th>
                <th className="px-3 py-2.5 text-left font-medium">Credit (CR) – Items</th>
                <th className="px-3 py-2.5 text-right font-medium">Amount (₦)</th>
              </tr>
            </thead>
            <tbody>
              {groupedSummary.rows.map((row, index) => (
                <tr key={row.sn} className={index % 2 === 1 ? "bg-muted/30" : ""}>
                  <td className="px-3 py-2">{row.sn}</td>
                  <td className="px-3 py-2">{row.debit_label}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.debit_display}</td>
                  <td className="px-3 py-2">{row.credit_label}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.credit_display}</td>
                </tr>
              ))}
              {groupedSummary.residual?.show && (
                <tr className="border-t">
                  <td className="px-3 py-2" />
                  <td className="px-3 py-2">{groupedSummary.residual.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{groupedSummary.residual.debit_display}</td>
                  <td className="px-3 py-2">{groupedSummary.residual.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{groupedSummary.residual.credit_display}</td>
                </tr>
              )}
              <tr className="border-t bg-emerald-50 font-semibold">
                <td className="px-3 py-2" />
                <td className="px-3 py-2">Total Debit</td>
                <td className="px-3 py-2 text-right tabular-nums">{groupedSummary.total_debit?.display}</td>
                <td className="px-3 py-2">Total Credit</td>
                <td className="px-3 py-2 text-right tabular-nums">{groupedSummary.total_credit?.display}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {visibleGroups.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold">Transaction Details</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Headings are the totals of the transactions under them. Balances stay in date order.
            </p>
          </div>
          {visibleGroups.map((group) => (
            <div key={group.key || group.name} className="overflow-x-auto rounded-lg border shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-emerald-900 px-3 py-2.5 text-sm font-semibold text-white">
                <span>{group.name}</span>
                <span className="font-medium tabular-nums">
                  DR {group.debit_display} · CR {group.credit_display}
                </span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Reference</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 text-right font-medium">Debit</th>
                    <th className="px-3 py-2 text-right font-medium">Credit</th>
                    <th className="px-3 py-2 text-right font-medium">Balance</th>
                    <th className="px-3 py-2 font-medium">Receipt</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(group.transactions || []).map((line, index) => {
                    const title = String(line.asset_title || "").trim()
                    const description = String(line.description || "")
                    return (
                      <tr key={String(line.id || index)} className={index % 2 === 1 ? "bg-muted/20" : ""}>
                        <td className="px-3 py-2 whitespace-nowrap">{formatDate(line.date)}</td>
                        <td className="px-3 py-2 max-w-[140px] break-all text-xs text-muted-foreground">{String(line.reference || "—")}</td>
                        <td className="px-3 py-2">
                          {title ? <div className="font-medium text-emerald-900">{title}</div> : null}
                          <div>{description}</div>
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{String(line.debit_display || "—")}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{String(line.credit_display || "—")}</td>
                        <td className="px-3 py-2 text-right tabular-nums">{String(line.balance_display || "")}</td>
                        <td className="px-3 py-2">{String(line.receipt_number || "—")}</td>
                        <td className="px-3 py-2 capitalize">{String(line.status || "")}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ))}
          <div className="flex flex-wrap justify-end gap-4 text-sm font-semibold">
            <span>Total Debit {groupedSummary.period_debit?.display}</span>
            <span>Total Credit {groupedSummary.period_credit?.display}</span>
            {closingBalance !== undefined && closingBalance !== null && (
              <span>
                Closing {Number(closingBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
      )}

      {groupedSummary.omission_note && (
        <p className="text-xs text-muted-foreground">{groupedSummary.omission_note}</p>
      )}
    </div>
  )
}
