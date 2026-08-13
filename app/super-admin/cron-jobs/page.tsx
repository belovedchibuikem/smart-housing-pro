"use client"

import { useCallback, useEffect, useState } from "react"
import { Clock, Play, Plus, RefreshCw, Server, Trash2 } from "lucide-react"

import { apiFetch } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CronJob {
  id: string
  name: string
  url: string
  http_method: string
  cron_expression: string
  is_enabled: boolean
  description?: string | null
  last_run_at?: string | null
  last_status?: string | null
  last_http_code?: number | null
  last_error?: string | null
  server_synced?: boolean
  timeout_seconds?: number
}

interface ServerStatus {
  success?: boolean
  method?: string
  os?: string
  enabled_jobs?: number
  schedule_run_installed?: boolean
  managed_block_present?: boolean
  writable?: boolean
  message?: string
  manual_hint?: string
  script_path?: string
  crontab_preview?: string
}

interface CronJobsResponse {
  success: boolean
  data: CronJob[]
  server?: ServerStatus
}

const PRESETS: { label: string; value: string }[] = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Hourly", value: "0 * * * *" },
  { label: "Daily at 02:00", value: "0 2 * * *" },
  { label: "Weekly (Sun 03:00)", value: "0 3 * * 0" },
]

const emptyForm = {
  name: "",
  url: "",
  http_method: "GET",
  cron_expression: "*/5 * * * *",
  is_enabled: true,
  description: "",
  auth_header_name: "",
  auth_header_value: "",
  timeout_seconds: 60,
}

export default function CronJobsPage() {
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [server, setServer] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch<CronJobsResponse>("/super-admin/cron-jobs")
      setJobs(res.data ?? [])
      setServer(res.server ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cron jobs")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const onSave = async () => {
    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const res = await apiFetch<{ success: boolean; message?: string; server_sync?: { message?: string } }>(
        "/super-admin/cron-jobs",
        {
          method: "POST",
          body: {
            ...form,
            auth_header_name: form.auth_header_name || null,
            auth_header_value: form.auth_header_value || null,
            description: form.description || null,
          },
        },
      )
      setNotice(res.server_sync?.message || res.message || "Saved and synced to server.")
      setForm(emptyForm)
      setShowForm(false)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save cron job")
    } finally {
      setSaving(false)
    }
  }

  const onToggle = async (job: CronJob) => {
    setError(null)
    setNotice(null)
    try {
      const res = await apiFetch<{ message?: string; server_sync?: { message?: string } }>(
        `/super-admin/cron-jobs/${job.id}/toggle`,
        { method: "POST" },
      )
      setNotice(res.server_sync?.message || res.message || "Updated.")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to toggle cron job")
    }
  }

  const onDelete = async (job: CronJob) => {
    if (!window.confirm(`Delete cron job "${job.name}"?`)) return
    setError(null)
    try {
      await apiFetch(`/super-admin/cron-jobs/${job.id}`, { method: "DELETE" })
      setNotice("Cron job deleted and server configuration synced.")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  const onRun = async (job: CronJob) => {
    setError(null)
    setNotice(null)
    try {
      const res = await apiFetch<{ message?: string }>(`/super-admin/cron-jobs/${job.id}/run`, { method: "POST" })
      setNotice(res.message || "Run completed.")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to run cron job")
    }
  }

  const onSync = async () => {
    setSyncing(true)
    setError(null)
    setNotice(null)
    try {
      const res = await apiFetch<{ message?: string; server?: ServerStatus }>("/super-admin/cron-jobs/sync-server", {
        method: "POST",
      })
      setNotice(res.message || "Server synced.")
      if (res.server) setServer(res.server)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Server sync failed")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cron Jobs</h1>
          <p className="text-sm text-muted-foreground">
            Paste a cron URL/route, save it, and the platform configures the server scheduler automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => void onSync()} disabled={syncing}>
            <Server className="mr-2 h-4 w-4" />
            {syncing ? "Syncing…" : "Sync server"}
          </Button>
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            Add cron job
          </Button>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="h-4 w-4" />
            Server configuration
          </CardTitle>
          <CardDescription>
            Enabled jobs are written into the OS scheduler (Linux crontab or Windows Task Scheduler) and also run through
            Laravel&apos;s <code>schedule:run</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {server ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">OS: {server.os || "unknown"}</Badge>
                <Badge variant="secondary">Method: {server.method || "n/a"}</Badge>
                <Badge variant={server.schedule_run_installed ? "default" : "destructive"}>
                  schedule:run {server.schedule_run_installed ? "installed" : "missing"}
                </Badge>
                <Badge variant="outline">{server.enabled_jobs ?? 0} enabled</Badge>
              </div>
              <p className="text-muted-foreground">{server.message}</p>
              {server.manual_hint && (
                <div>
                  <Label className="text-xs text-muted-foreground">Fallback install command</Label>
                  <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-3 text-xs">{server.manual_hint}</pre>
                </div>
              )}
              {server.script_path && (
                <p className="text-xs text-muted-foreground">Windows script: {server.script_path}</p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">Loading server status…</p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New cron job</CardTitle>
            <CardDescription>Enter the HTTP route/link the server should call on the schedule.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Escalate overdue cases"
              />
            </div>
            <div className="space-y-2">
              <Label>HTTP method</Label>
              <Select value={form.http_method} onValueChange={(v) => setForm((f) => ({ ...f, http_method: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Cron URL / route</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://your-domain.com/api/cron/your-endpoint"
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule preset</Label>
              <Select
                value={PRESETS.some((p) => p.value === form.cron_expression) ? form.cron_expression : "custom"}
                onValueChange={(v) => {
                  if (v !== "custom") setForm((f) => ({ ...f, cron_expression: v }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESETS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom expression</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cron expression</Label>
              <Input
                value={form.cron_expression}
                onChange={(e) => setForm((f) => ({ ...f, cron_expression: e.target.value }))}
                placeholder="*/5 * * * *"
              />
            </div>
            <div className="space-y-2">
              <Label>Auth header name (optional)</Label>
              <Input
                value={form.auth_header_name}
                onChange={(e) => setForm((f) => ({ ...f, auth_header_name: e.target.value }))}
                placeholder="X-Cron-Token"
              />
            </div>
            <div className="space-y-2">
              <Label>Auth header value (optional)</Label>
              <Input
                value={form.auth_header_value}
                onChange={(e) => setForm((f) => ({ ...f, auth_header_value: e.target.value }))}
                placeholder="secret-token"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <Switch checked={form.is_enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, is_enabled: v }))} />
              <Label>Enabled</Label>
            </div>
            <div className="md:col-span-2">
              <Button onClick={() => void onSave()} disabled={saving || !form.name || !form.url}>
                <Clock className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save & configure on server"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configured jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cron jobs yet. Add a URL to get started.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last run</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-xs text-muted-foreground">{job.http_method}</div>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-xs" title={job.url}>
                      {job.url}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{job.cron_expression}</TableCell>
                    <TableCell className="text-xs">
                      {job.last_run_at ? (
                        <div>
                          <div>{new Date(job.last_run_at).toLocaleString()}</div>
                          <Badge variant={job.last_status === "success" ? "default" : "destructive"} className="mt-1">
                            {job.last_status || "n/a"}
                            {job.last_http_code ? ` ${job.last_http_code}` : ""}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch checked={job.is_enabled} onCheckedChange={() => void onToggle(job)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" title="Run now" onClick={() => void onRun(job)}>
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Delete" onClick={() => void onDelete(job)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
