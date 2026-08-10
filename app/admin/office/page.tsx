"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { bootstrapOffice, getOfficeDashboard } from "@/lib/api/office"
import {
  Briefcase,
  Building2,
  FileEdit,
  FileText,
  Inbox,
  ListTodo,
  Loader2,
  Send,
  FolderOpen,
} from "lucide-react"

const links = [
  { href: "/admin/office/cases", label: "Case Desk", icon: ListTodo, desc: "Requests, complaints, letters — assign, process, resolve" },
  { href: "/admin/office/contributions", label: "Contributions Office", icon: Briefcase, desc: "Stoppage, schedules, and contribution desk cases" },
  { href: "/admin/office/inbox", label: "Inbox", icon: Inbox, desc: "Pending reviews and approvals assigned to you" },
  { href: "/admin/office/outbox", label: "Outbox", icon: Send, desc: "Documents you created and routed" },
  { href: "/admin/office/tasks", label: "My Tasks", icon: ListTodo, desc: "Reviews, minutes, drafts, and overdue actions" },
  { href: "/admin/office/documents", label: "Registry Search", icon: FolderOpen, desc: "Search the unified document repository" },
  { href: "/admin/office/library", label: "Folders & Tags", icon: FolderOpen, desc: "Library folders, tags, and labels" },
  { href: "/admin/office/memos/new", label: "New Internal Memo", icon: FileEdit, desc: "Create and route an internal memorandum" },
  { href: "/admin/office/correspondence", label: "Correspondence", icon: Send, desc: "External dispatch and acknowledgements" },
  { href: "/admin/office/circulars", label: "HQ Circulars", icon: Building2, desc: "Directives and branch monitoring" },
  { href: "/admin/office/reports", label: "Reports", icon: FileText, desc: "Workload metrics and CSV exports" },
  { href: "/admin/office/ai", label: "AI Assist", icon: FileEdit, desc: "Draft, summarize, classify — confirm before apply" },
  { href: "/admin/office/org-units", label: "Org Units", icon: Building2, desc: "Departments, heads, and membership" },
  { href: "/admin/office/workflows", label: "Workflows", icon: FolderOpen, desc: "Configure multi-level approval chains" },
  { href: "/admin/office/categories", label: "Categories", icon: FileText, desc: "Document taxonomy for filing and search" },
  { href: "/admin/office/templates", label: "Templates", icon: FileEdit, desc: "Memo and office document templates" },
]

export default function OfficeHubPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [data, setData] = useState<Record<string, any> | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await getOfficeDashboard()
      if (res.success) setData(res.data)
    } catch (e: any) {
      toast({
        title: "Digital Office not ready",
        description: e.message || "Run bootstrap to seed categories, templates, and workflows.",
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
      const res = await bootstrapOffice()
      toast({ title: "Digital Office ready", description: res.message || "Seeded successfully." })
      await load()
    } catch (e: any) {
      toast({ title: "Bootstrap failed", description: e.message, variant: "destructive" })
    } finally {
      setBootstrapping(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Digital Office
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Operational command centre — cases, document workflows, departments, and member service in one place.
          </p>
        </div>
        <Button onClick={handleBootstrap} disabled={bootstrapping}>
          {bootstrapping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Bootstrap / Reseed
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading dashboard…
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Case operations</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Open cases", data?.cases_open],
                ["Assigned to me", data?.cases_assigned_to_me],
                ["Unassigned queue", data?.cases_unassigned],
                ["Overdue SLA", data?.cases_overdue],
                ["Awaiting member", data?.cases_awaiting_member],
                ["Pending signature", data?.cases_pending_signature],
                ["Due today", data?.cases_due_today],
                ["Org units", data?.org_units],
              ].map(([label, value]) => (
                <Card key={String(label)}>
                  <CardHeader className="pb-2">
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="text-3xl">{value ?? 0}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">Document workflows</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Pending tasks", data?.pending_tasks],
                ["My drafts", data?.drafts],
                ["Returned", data?.returned],
                ["Open minute actions", data?.open_minute_actions],
                ["In review (tenant)", data?.in_review],
                ["Approved / issued", data?.approved],
                ["Archived", data?.archived],
                ["Overdue actions", data?.overdue_actions],
              ].map(([label, value]) => (
                <Card key={String(label)}>
                  <CardHeader className="pb-2">
                    <CardDescription>{label}</CardDescription>
                    <CardTitle className="text-3xl">{value ?? 0}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition hover:border-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </CardTitle>
                <CardDescription>{item.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary">Open →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
