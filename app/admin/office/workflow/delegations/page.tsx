"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  createWorkflowDelegation,
  getWorkflowDelegations,
  revokeWorkflowDelegation,
} from "@/lib/api/office"
import { Loader2 } from "lucide-react"

export default function WorkflowDelegationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    process_key: "",
    stage_kind: "approval",
    delegate_type: "user",
    delegate_user_id: "",
    delegate_role: "",
    ends_at: "",
    reason: "",
  })

  const load = async () => {
    try {
      setLoading(true)
      const res = await getWorkflowDelegations()
      setRows(res.data || [])
    } catch (e: any) {
      toast({ title: "Failed to load delegations", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!form.stage_kind) return
    if (form.delegate_type === "user" && !form.delegate_user_id) {
      toast({ title: "Delegate user ID required", variant: "destructive" })
      return
    }
    try {
      setBusy(true)
      await createWorkflowDelegation({
        process_key: form.process_key || null,
        stage_kind: form.stage_kind,
        delegate_type: form.delegate_type,
        delegate_user_id: form.delegate_type === "user" ? form.delegate_user_id : null,
        delegate_role: form.delegate_type === "role" ? form.delegate_role : null,
        ends_at: form.ends_at || null,
        reason: form.reason || null,
      })
      toast({ title: "Delegation created" })
      setForm((f) => ({ ...f, delegate_user_id: "", delegate_role: "", reason: "" }))
      await load()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (id: string) => {
    try {
      setBusy(true)
      await revokeWorkflowDelegation(id)
      toast({ title: "Delegation revoked" })
      await load()
    } catch (e: any) {
      toast({ title: "Revoke failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflow delegations</h1>
          <p className="text-sm text-muted-foreground">
            Stage-specific, time-bound authority. Expired or revoked delegations stop granting access
            immediately.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/office/workflow/queue">Queue</Link>
        </Button>
      </div>

      <div className="rounded-md border p-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Process key (optional)
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            value={form.process_key}
            onChange={(e) => setForm({ ...form, process_key: e.target.value })}
            placeholder="loan, membership_kyc, …"
          />
        </label>
        <label className="text-sm">
          Stage
          <select
            className="mt-1 w-full rounded border px-2 py-1"
            value={form.stage_kind}
            onChange={(e) => setForm({ ...form, stage_kind: e.target.value })}
          >
            <option value="review">Review</option>
            <option value="recommendation">Recommendation</option>
            <option value="approval">Approval</option>
          </select>
        </label>
        <label className="text-sm">
          Delegate type
          <select
            className="mt-1 w-full rounded border px-2 py-1"
            value={form.delegate_type}
            onChange={(e) => setForm({ ...form, delegate_type: e.target.value })}
          >
            <option value="user">User</option>
            <option value="role">Role</option>
          </select>
        </label>
        {form.delegate_type === "user" ? (
          <label className="text-sm">
            Delegate user ID
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={form.delegate_user_id}
              onChange={(e) => setForm({ ...form, delegate_user_id: e.target.value })}
            />
          </label>
        ) : (
          <label className="text-sm">
            Delegate role
            <input
              className="mt-1 w-full rounded border px-2 py-1"
              value={form.delegate_role}
              onChange={(e) => setForm({ ...form, delegate_role: e.target.value })}
              placeholder="admin, loan_officer, …"
            />
          </label>
        )}
        <label className="text-sm">
          Ends at
          <input
            type="datetime-local"
            className="mt-1 w-full rounded border px-2 py-1"
            value={form.ends_at}
            onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Reason
          <input
            className="mt-1 w-full rounded border px-2 py-1"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </label>
        <Button disabled={busy} onClick={create}>
          Create delegation
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No delegations yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Process</th>
                <th className="p-3">Stage</th>
                <th className="p-3">Delegate</th>
                <th className="p-3">Window</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  <td className="p-3">{row.process_key || "Any"}</td>
                  <td className="p-3">{row.stage_kind}</td>
                  <td className="p-3">
                    {row.delegate_type === "user"
                      ? row.delegate_user?.email || row.delegate_user_id
                      : row.delegate_role}
                  </td>
                  <td className="p-3">
                    {row.starts_at ? new Date(row.starts_at).toLocaleString() : "—"}
                    {" → "}
                    {row.ends_at ? new Date(row.ends_at).toLocaleString() : "open"}
                  </td>
                  <td className="p-3">{row.status}</td>
                  <td className="p-3">
                    {row.status === "active" && (
                      <Button size="sm" variant="outline" disabled={busy} onClick={() => revoke(row.id)}>
                        Revoke
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
