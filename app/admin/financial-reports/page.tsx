import { redirect } from "next/navigation"

/** Legacy URL — real reports live under /admin/reports/financial */
export default function FinancialReportsRedirectPage() {
  redirect("/admin/reports/financial")
}
