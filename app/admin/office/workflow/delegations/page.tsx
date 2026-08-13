"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  UserRound,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SearchableSelect,
  usersToSearchableOptions,
  type SearchableSelectOption,
} from "@/components/ui/searchable-select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiFetch, getUsers } from "@/lib/api/client"
import {
  createWorkflowDelegation,
  getWorkflowDelegations,
  getWorkflowProcessKeys,
  revokeWorkflowDelegation,
} from "@/lib/api/office"
import type { RolesResponse } from "@/lib/types/role"
import { cn } from "@/lib/utils"

type StageKind = "review" | "recommendation" | "approval"

type DelegationForm = {
  process_key: string
  stage_kinds: StageKind[]
  delegate_type: "user" | "role"
  delegate_user_ids: string[]
  delegate_roles: string[]
  starts_at: string
  ends_at: string
  reason: string
}

const STAGE_OPTIONS: Array<{ value: StageKind; label: string; description: string }> = [
  { value: "review", label: "Review", description: "First-pass check of the submission" },
  { value: "recommendation", label: "Recommendation", description: "Advise approve or reject" },
  { value: "approval", label: "Approval", description: "Final decision authority" },
]

const emptyForm = (): DelegationForm => ({
  process_key: "",
  stage_kinds: ["approval"],
  delegate_type: "user",
  delegate_user_ids: [],
  delegate_roles: [],
  starts_at: "",
  ends_at: "",
  reason: "",
})

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "default"
    case "expired":
      return "secondary"
    case "revoked":
      return "destructive"
    default:
      return "outline"
  }
}

function formatWhen(value?: string | null) {
  if (!value) return "—"
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function toApiDateTime(localValue: string): string | null {
  if (!localValue) return null
  return localValue.length === 16 ? `${localValue}:00` : localValue
}

function roleLabel(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function WorkflowDelegationsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [rows, setRows] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired" | "revoked">("all")
  const [processFilter, setProcessFilter] = useState("")
  const [form, setForm] = useState<DelegationForm>(emptyForm)
  const [userPicker, setUserPicker] = useState("")
  const [rolePicker, setRolePicker] = useState("")

  const [processOptions, setProcessOptions] = useState<SearchableSelectOption[]>([])
  const [roleOptions, setRoleOptions] = useState<SearchableSelectOption[]>([])
  const [userOptions, setUserOptions] = useState<SearchableSelectOption[]>([])
  const [selectedUserMeta, setSelectedUserMeta] = useState<Record<string, SearchableSelectOption>>({})
  const [metaLoading, setMetaLoading] = useState(true)

  const loadDelegations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getWorkflowDelegations(
        processFilter ? { process_key: processFilter } : undefined,
      )
      setRows(Array.isArray(res.data) ? res.data : [])
    } catch (e: any) {
      toast({ title: "Failed to load delegations", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [processFilter, toast])

  const loadMeta = useCallback(async () => {
    try {
      setMetaLoading(true)
      const [keysRes, rolesRes, usersRes] = await Promise.all([
        getWorkflowProcessKeys(),
        apiFetch<RolesResponse>("/admin/roles?per_page=200&is_active=true"),
        getUsers({ per_page: 40 }),
      ])

      setProcessOptions(
        (keysRes.data || []).map((k) => ({
          value: k.key,
          label: k.label,
          description: k.key,
          searchText: `${k.label} ${k.key}`,
        })),
      )

      const roles = rolesRes.roles || []
      setRoleOptions(
        roles.map((r) => ({
          value: r.name,
          label: roleLabel(r.name),
          description: r.description || r.name,
          searchText: `${r.name} ${r.description || ""} ${roleLabel(r.name)}`,
        })),
      )

      const users = usersRes.data || (usersRes as any).users || []
      setUserOptions(usersToSearchableOptions(users))
    } catch (e: any) {
      toast({
        title: "Failed to load lookup data",
        description: e.message || "Could not load processes, roles, or users",
        variant: "destructive",
      })
    } finally {
      setMetaLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadMeta()
  }, [loadMeta])

  useEffect(() => {
    void loadDelegations()
  }, [loadDelegations])

  const searchUsers = useCallback(async (query: string): Promise<SearchableSelectOption[]> => {
    const res = await getUsers({ search: query, per_page: 30 })
    const users = res.data || (res as any).users || []
    return usersToSearchableOptions(users)
  }, [])

  const filteredRows = useMemo(() => {
    if (statusFilter === "all") return rows
    return rows.filter((r) => (r.status || "").toLowerCase() === statusFilter)
  }, [rows, statusFilter])

  const processLabel = useCallback(
    (key?: string | null) => {
      if (!key) return "All processes"
      return processOptions.find((p) => p.value === key)?.label || key
    },
    [processOptions],
  )

  const stageLabel = (kind?: string) =>
    STAGE_OPTIONS.find((s) => s.value === kind)?.label || kind || "—"

  const comboCount = useMemo(() => {
    const stages = form.stage_kinds.length
    const delegates =
      form.delegate_type === "user" ? form.delegate_user_ids.length : form.delegate_roles.length
    return stages * delegates
  }, [form])

  const toggleStage = (stage: StageKind) => {
    setForm((f) => {
      const exists = f.stage_kinds.includes(stage)
      if (exists) {
        const next = f.stage_kinds.filter((s) => s !== stage)
        return { ...f, stage_kinds: next.length ? next : f.stage_kinds }
      }
      return { ...f, stage_kinds: [...f.stage_kinds, stage] }
    })
  }

  const addUser = (userId: string) => {
    if (!userId) return
    const meta =
      userOptions.find((u) => u.value === userId) ||
      selectedUserMeta[userId] ||
      ({ value: userId, label: userId } as SearchableSelectOption)
    setSelectedUserMeta((prev) => ({ ...prev, [userId]: meta }))
    setForm((f) =>
      f.delegate_user_ids.includes(userId)
        ? f
        : { ...f, delegate_user_ids: [...f.delegate_user_ids, userId] },
    )
    setUserPicker("")
  }

  const removeUser = (userId: string) => {
    setForm((f) => ({ ...f, delegate_user_ids: f.delegate_user_ids.filter((id) => id !== userId) }))
  }

  const addRole = (roleName: string) => {
    if (!roleName) return
    setForm((f) =>
      f.delegate_roles.includes(roleName)
        ? f
        : { ...f, delegate_roles: [...f.delegate_roles, roleName] },
    )
    setRolePicker("")
  }

  const removeRole = (roleName: string) => {
    setForm((f) => ({ ...f, delegate_roles: f.delegate_roles.filter((r) => r !== roleName) }))
  }

  const create = async () => {
    if (!form.stage_kinds.length) {
      toast({ title: "Select at least one stage", variant: "destructive" })
      return
    }
    if (form.delegate_type === "user" && !form.delegate_user_ids.length) {
      toast({ title: "Select at least one staff user", variant: "destructive" })
      return
    }
    if (form.delegate_type === "role" && !form.delegate_roles.length) {
      toast({ title: "Select at least one role", variant: "destructive" })
      return
    }
    if (!form.ends_at) {
      toast({
        title: "End date is required",
        description: "Delegations must be time-bound.",
        variant: "destructive",
      })
      return
    }

    try {
      setBusy(true)
      const res = await createWorkflowDelegation({
        process_key: form.process_key || null,
        stage_kinds: form.stage_kinds,
        delegate_type: form.delegate_type,
        delegate_user_ids: form.delegate_type === "user" ? form.delegate_user_ids : undefined,
        delegate_roles: form.delegate_type === "role" ? form.delegate_roles : undefined,
        starts_at: toApiDateTime(form.starts_at),
        ends_at: toApiDateTime(form.ends_at),
        reason: form.reason.trim() || null,
      })
      const count = (res as any).count ?? (Array.isArray((res as any).data) ? (res as any).data.length : 1)
      toast({
        title: count === 1 ? "Delegation created" : `${count} delegations created`,
        description:
          count > 1
            ? `${form.stage_kinds.length} stage(s) × ${
                form.delegate_type === "user"
                  ? form.delegate_user_ids.length
                  : form.delegate_roles.length
              } assignee(s)`
            : undefined,
      })
      setForm(emptyForm())
      setUserPicker("")
      setRolePicker("")
      await loadDelegations()
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (id: string) => {
    if (!window.confirm("Revoke this delegation? The delegate will lose access immediately.")) return
    try {
      setBusy(true)
      await revokeWorkflowDelegation(id)
      toast({ title: "Delegation revoked" })
      await loadDelegations()
    } catch (e: any) {
      toast({ title: "Revoke failed", description: e.message, variant: "destructive" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/admin/office"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Digital Office
            </Link>
            <span>/</span>
            <span>Delegations</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflow delegations</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Assign one or more stages to one or more staff users (or roles) in a single action.
            Expired or revoked delegations stop granting access immediately.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/office/workflow/settings">Settings</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/office/workflow/queue">Queue</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || busy}
            onClick={() => void loadDelegations()}
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-4 w-4" />
            Create delegation
          </CardTitle>
          <CardDescription>
            Example: select Review + Approval, then add two admins — each admin gets both stages for
            the chosen process and time window.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {metaLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading processes, roles, and staff…
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Process</Label>
                <div className="max-w-md">
                  <SearchableSelect
                    value={form.process_key}
                    onValueChange={(v) => setForm((f) => ({ ...f, process_key: v }))}
                    options={processOptions}
                    allowEmpty
                    emptyValueLabel="All processes"
                    placeholder="Search process…"
                    searchPlaceholder="Search by name or key…"
                    emptyText="No matching process."
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>
                  Stages <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Select one, two, or all three stages to assign together.
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {STAGE_OPTIONS.map((stage) => {
                    const checked = form.stage_kinds.includes(stage.value)
                    return (
                      <button
                        key={stage.value}
                        type="button"
                        onClick={() => toggleStage(stage.value)}
                        className={cn(
                          "rounded-lg border px-3 py-3 text-left transition-colors",
                          checked
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "hover:bg-muted/50",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded border text-[10px]",
                              checked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40",
                            )}
                          >
                            {checked ? "✓" : ""}
                          </span>
                          <span className="text-sm font-medium">{stage.label}</span>
                        </div>
                        <p className="mt-1 pl-6 text-xs text-muted-foreground">{stage.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Assign to</Label>
                <Select
                  value={form.delegate_type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      delegate_type: (v as "user" | "role") || "user",
                      delegate_user_ids: [],
                      delegate_roles: [],
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <span className="inline-flex items-center gap-2">
                        <UserRound className="h-3.5 w-3.5" />
                        Staff users (one or more)
                      </span>
                    </SelectItem>
                    <SelectItem value="role">
                      <span className="inline-flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        Roles (one or more)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.delegate_type === "user" ? (
                <div className="space-y-2">
                  <Label>
                    Staff users <span className="text-destructive">*</span>
                  </Label>
                  <SearchableSelect
                    value={userPicker}
                    onValueChange={(v) => {
                      addUser(v)
                    }}
                    options={userOptions.filter((u) => !form.delegate_user_ids.includes(u.value))}
                    onSearch={async (q) => {
                      const found = await searchUsers(q)
                      found.forEach((opt) => {
                        setSelectedUserMeta((prev) => ({ ...prev, [opt.value]: opt }))
                      })
                      return found.filter((u) => !form.delegate_user_ids.includes(u.value))
                    }}
                    placeholder="Search and add staff…"
                    searchPlaceholder="Type name or email…"
                    emptyText="No staff found."
                  />
                  {form.delegate_user_ids.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {form.delegate_user_ids.map((id) => {
                        const meta = selectedUserMeta[id] || userOptions.find((u) => u.value === id)
                        return (
                          <Badge key={id} variant="secondary" className="gap-1 py-1 pl-2 pr-1">
                            <UserRound className="h-3 w-3" />
                            <span className="max-w-[180px] truncate">
                              {meta?.label || id}
                              {meta?.description ? ` · ${meta.description}` : ""}
                            </span>
                            <button
                              type="button"
                              className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                              onClick={() => removeUser(id)}
                              aria-label="Remove user"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Add 2+ admins to share the same stages.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>
                    Roles <span className="text-destructive">*</span>
                  </Label>
                  <SearchableSelect
                    value={rolePicker}
                    onValueChange={(v) => addRole(v)}
                    options={roleOptions.filter((r) => !form.delegate_roles.includes(r.value))}
                    placeholder="Search and add roles…"
                    searchPlaceholder="Search roles…"
                    emptyText="No matching role."
                  />
                  {form.delegate_roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {form.delegate_roles.map((name) => (
                        <Badge key={name} variant="secondary" className="gap-1 py-1 pl-2 pr-1">
                          <Shield className="h-3 w-3" />
                          <span>{roleLabel(name)}</span>
                          <button
                            type="button"
                            className="ml-1 rounded-sm p-0.5 hover:bg-muted"
                            onClick={() => removeRole(name)}
                            aria-label="Remove role"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Add one or more roles.</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Starts at (optional)</Label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Defaults to now if left blank.</p>
              </div>

              <div className="space-y-2">
                <Label>
                  Ends at <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Authority ends at this date and time.</p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Reason (optional)</Label>
                <Textarea
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  placeholder="e.g. Covering loan approvals while the primary approver is on leave"
                  rows={3}
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                <Button type="button" disabled={busy || comboCount < 1} onClick={() => void create()}>
                  {busy ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarClock className="mr-2 h-4 w-4" />
                  )}
                  {comboCount > 1
                    ? `Create ${comboCount} delegations`
                    : "Create delegation"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setForm(emptyForm())
                    setUserPicker("")
                    setRolePicker("")
                  }}
                >
                  Clear form
                </Button>
                {comboCount > 0 ? (
                  <span className="text-xs text-muted-foreground">
                    {form.stage_kinds.length} stage(s) ×{" "}
                    {form.delegate_type === "user"
                      ? `${form.delegate_user_ids.length} user(s)`
                      : `${form.delegate_roles.length} role(s)`}{" "}
                    = {comboCount} record(s)
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Active & historical delegations</CardTitle>
              <CardDescription>Filter by process or status, then revoke when coverage ends.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="w-[200px]">
                <SearchableSelect
                  value={processFilter}
                  onValueChange={setProcessFilter}
                  options={processOptions}
                  allowEmpty
                  emptyValueLabel="All processes"
                  placeholder="Filter process…"
                  searchPlaceholder="Search processes…"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter((v as typeof statusFilter) || "all")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {loading ? (
            <div className="flex items-center gap-2 px-6 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading delegations…
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CalendarClock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">No delegations found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a time-bound delegation above to allow another user or role to act on a stage.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Process</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Delegate</th>
                    <th className="px-4 py-3 font-medium">Window</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const user = row.delegate_user || row.delegateUser
                    const userName = user
                      ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
                      : null
                    return (
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="px-6 py-3">
                          <div className="font-medium">{processLabel(row.process_key)}</div>
                          {row.reason ? (
                            <div className="mt-0.5 max-w-[240px] truncate text-xs text-muted-foreground">
                              {row.reason}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">{stageLabel(row.stage_kind)}</td>
                        <td className="px-4 py-3">
                          {row.delegate_type === "user" ? (
                            <div>
                              <div className="inline-flex items-center gap-1.5 font-medium">
                                <UserRound className="h-3.5 w-3.5 text-muted-foreground" />
                                {userName || row.delegate_user_id}
                              </div>
                              {user?.email ? (
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              ) : null}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 font-medium">
                              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                              {roleLabel(row.delegate_role || "")}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <div>{formatWhen(row.starts_at)}</div>
                          <div className="text-xs">
                            → {row.ends_at ? formatWhen(row.ends_at) : "open-ended"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(row.status)} className="capitalize">
                            {row.status || "unknown"}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          {row.status === "active" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              onClick={() => void revoke(row.id)}
                            >
                              Revoke
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
