"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getWorkflowSettings, updateWorkflowSetting, enqueueWorkflowPending } from "@/lib/api/office"
import { Loader2, Save } from "lucide-react"

type Setting = {
  process_key: string
  label?: string
  enabled: boolean
  review_enabled: boolean
  recommendation_enabled: boolean
  approval_enabled: boolean
  approver_type: string
  bulk_enabled: boolean
  prevent_self_approval: boolean
  sla_hours?: number | null
  wired?: boolean
}

export default function WorkflowSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [rows, setRows] = useState<Setting[]>([])

  const load = async () => {
    try {
      setLoading(true)
      const res = await getWorkflowSettings()
      setRows((res.data || []).map((r: any) => ({ ...r })))
    } catch (e: any) {
      toast({ title: "Failed to load settings", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const updateLocal = (key: string, patch: Partial<Setting>) => {
    setRows((prev) => prev.map((r) => (r.process_key === key ? { ...r, ...patch } : r)))
  }

  const save = async (row: Setting) => {
    try {
      setSaving(row.process_key)
      const res = await updateWorkflowSetting(row.process_key, {
        enabled: row.enabled,
        review_enabled: row.review_enabled,
        recommendation_enabled: row.recommendation_enabled,
        approval_enabled: row.approval_enabled,
        approver_type: row.approver_type || "tenant_highest_admin",
        bulk_enabled: row.bulk_enabled,
        prevent_self_approval: row.prevent_self_approval,
        sla_hours: row.sla_hours || null,
      })
      const queued = res.enqueued_pending?.enqueued ?? 0
      toast({
        title: "Saved",
        description:
          queued > 0
            ? `${row.label || row.process_key} updated · ${queued} pending item(s) sent to Digital Office`
            : `${row.label || row.process_key} updated`,
      })
      await load()
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(null)
    }
  }

  const enqueuePending = async (row: Setting) => {
    try {
      setSaving(row.process_key)
      const res = await enqueueWorkflowPending(row.process_key)
      toast({
        title: "Pending items queued",
        description: res.message || `${res.data?.enqueued ?? 0} sent to Digital Office`,
      })
    } catch (e: any) {
      toast({ title: "Enqueue failed", description: e.message, variant: "destructive" })
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflow configuration</h1>
          <p className="text-sm text-muted-foreground">
            Enable review / recommendation / approval per process. Disabled processes keep their
            existing direct approve path. Approver defaults to the tenant highest admin (tenant{" "}
            <code>super_admin</code> role), not the platform Super Admin. Approval strategy is{" "}
            <strong>single</strong> (one designated approver). Processes marked “not wired” cannot
            be enabled until an executor exists.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/office/workflow/queue">Open queue</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.process_key} className="rounded-md border p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{row.label || row.process_key}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.process_key}
                    {row.wired === false ? " · not wired yet" : ""}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!row.enabled}
                    disabled={row.wired === false}
                    onChange={(e) => updateLocal(row.process_key, { enabled: e.target.checked })}
                  />
                  Workflow enabled
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["review_enabled", "Review"],
                    ["recommendation_enabled", "Recommendation"],
                    ["approval_enabled", "Approval"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={!!row[field]}
                      disabled={!row.enabled}
                      onChange={(e) => updateLocal(row.process_key, { [field]: e.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!row.bulk_enabled}
                    onChange={(e) => updateLocal(row.process_key, { bulk_enabled: e.target.checked })}
                  />
                  Bulk actions
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!row.prevent_self_approval}
                    onChange={(e) =>
                      updateLocal(row.process_key, { prevent_self_approval: e.target.checked })
                    }
                  />
                  Prevent self-approval
                </label>
                <label className="flex items-center gap-2">
                  SLA hours
                  <input
                    type="number"
                    min={1}
                    className="w-24 rounded border px-2 py-1"
                    value={row.sla_hours ?? ""}
                    onChange={(e) =>
                      updateLocal(row.process_key, {
                        sla_hours: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={saving === row.process_key} onClick={() => save(row)}>
                  {saving === row.process_key ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
                {row.enabled && row.wired !== false ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving === row.process_key}
                    onClick={() => enqueuePending(row)}
                  >
                    Send pending to Digital Office
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
