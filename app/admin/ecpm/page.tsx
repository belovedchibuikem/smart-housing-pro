"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Building2,
  ClipboardCheck,
  ClipboardList,
  FileSignature,
  FileText,
  HardHat,
  Loader2,
  MapPinned,
  Receipt,
  ScrollText,
  Users,
} from "lucide-react"
import { bootstrapEcpm, getEcpmDashboard } from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"

function money(n: number | undefined) {
  return `₦${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const links = [
  { href: "/admin/ecpm/estates", label: "Estates & Plots", icon: MapPinned, desc: "Land development, phases, plots and survey documents" },
  { href: "/admin/ecpm/projects", label: "Projects", icon: Building2, desc: "Construction projects, stages, milestones and risks" },
  { href: "/admin/ecpm/parties", label: "Contractors & Parties", icon: Users, desc: "Contractors, consultants, architects and suppliers" },
  { href: "/admin/ecpm/drawings", label: "Drawing Register", icon: FileText, desc: "Architectural and engineering drawings with revisions" },
  { href: "/admin/ecpm/boqs", label: "Bills of Quantities", icon: ClipboardList, desc: "Cost estimates and BOQ line items" },
  { href: "/admin/ecpm/quotations", label: "Quotations", icon: Receipt, desc: "Client quotations, revisions and acceptance" },
  { href: "/admin/ecpm/contracts", label: "Contracts", icon: FileSignature, desc: "Construction contracts, retention and variations" },
  { href: "/admin/ecpm/approvals", label: "Approvals Inbox", icon: ClipboardCheck, desc: "Pending drawing, BOQ, quotation and contract approvals" },
  { href: "/admin/ecpm/site-ops", label: "Site Operations", icon: ClipboardList, desc: "Diaries, inspections, HSE and progress evidence" },
  { href: "/admin/ecpm/procurement", label: "Procurement", icon: ClipboardList, desc: "Stock, material requests, POs and issuance" },
  { href: "/admin/ecpm/handover", label: "Handover", icon: FileSignature, desc: "Completion gates and FM transfer" },
  { href: "/admin/ecpm/ai", label: "AI Assist", icon: HardHat, desc: "BOQ, schedule and report suggestions with human review" },
  { href: "/admin/ecpm/reports", label: "ECPM Reports", icon: ScrollText, desc: "Executive and operational analytics" },
  { href: "/admin/ecpm/audit", label: "Audit Trail", icon: ScrollText, desc: "Immutable construction activity log" },
]

export default function EcpmHubPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [data, setData] = useState<Record<string, any> | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getEcpmDashboard()
      if (res.success) setData(res.data)
    } catch (e: any) {
      toast({
        title: "ECPM not ready",
        description: e.message || "Run bootstrap to initialize stage templates.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleBootstrap = async () => {
    try {
      setBootstrapping(true)
      const res = await bootstrapEcpm()
      toast({ title: "ECPM bootstrapped", description: res.message || "Defaults are ready." })
      await load()
    } catch (e: any) {
      toast({ title: "Bootstrap failed", description: e.message, variant: "destructive" })
    } finally {
      setBootstrapping(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <HardHat className="h-7 w-7 text-primary" />
            Enterprise Construction (ECPM)
          </h1>
          <p className="text-muted-foreground mt-1">
            Land development through design, BOQ, quotations, contracts and project delivery
          </p>
        </div>
        <Button onClick={handleBootstrap} disabled={bootstrapping}>
          {bootstrapping ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Bootstrap Defaults
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Projects", value: String(data?.active_projects ?? 0) },
              { label: "Pending Approvals", value: String(data?.pending_approvals ?? 0) },
              { label: "Budget Total", value: money(data?.budget_total) },
              { label: "Budget Utilization", value: `${Number(data?.budget_utilization || 0)}%` },
            ].map((card) => (
              <Card key={card.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(data?.upcoming_milestones?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {data!.upcoming_milestones.map((m: any, i: number) => (
                  <div key={i} className="flex justify-between border-b py-1">
                    <span>
                      {m.project_name} — {m.milestone}
                    </span>
                    <span className="text-muted-foreground">{m.due_date || "—"}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{item.label}</CardTitle>
                      </div>
                      <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
