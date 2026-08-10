"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Printer, Download } from "lucide-react"
import {
  exportAdminCredentialsDispatch,
  type AdminCredentialRow,
} from "@/lib/api/admin-password-reset"
import { toast } from "sonner"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters?: {
    search?: string
    role?: string
    status?: string
  }
  selectedUserIds?: string[]
}

function openPrintableWindow(opts: {
  tenant: string
  loginUrl: string
  generatedAt: string
  credentials: AdminCredentialRow[]
}) {
  const { tenant, loginUrl, generatedAt, credentials } = opts
  const slips = credentials
    .map(
      (c) => `
      <article class="slip">
        <h2>${escapeHtml(tenant)} — Admin access</h2>
        <dl>
          <div><dt>Name</dt><dd>${escapeHtml(c.name)}</dd></div>
          <div><dt>Email / login</dt><dd>${escapeHtml(c.email)}</dd></div>
          <div><dt>Temporary password</dt><dd class="pw">${escapeHtml(c.temporary_password)}</dd></div>
          <div><dt>Role(s)</dt><dd>${escapeHtml(c.roles || "—")}</dd></div>
          <div><dt>Login URL</dt><dd>${escapeHtml(loginUrl)}</dd></div>
        </dl>
        <p class="note">Change this password on first login. Do not share after handover.</p>
      </article>`,
    )
    .join("")

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Admin credentials dispatch — ${escapeHtml(tenant)}</title>
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #111; margin: 24px; }
    h1 { font-size: 18px; margin: 0 0 4px; }
    .meta { color: #555; font-size: 12px; margin-bottom: 20px; }
    .slip {
      border: 1px solid #222;
      padding: 16px 18px;
      margin: 0 0 16px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .slip h2 { font-size: 15px; margin: 0 0 12px; }
    dl { margin: 0; }
    dl > div { display: grid; grid-template-columns: 140px 1fr; gap: 8px; margin-bottom: 8px; font-size: 13px; }
    dt { color: #555; }
    dd { margin: 0; font-weight: 600; }
    .pw { font-family: ui-monospace, Consolas, monospace; letter-spacing: 0.04em; }
    .note { margin: 12px 0 0; font-size: 11px; color: #444; }
    @media print {
      body { margin: 12mm; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:16px">
    <button onclick="window.print()">Print</button>
  </div>
  <h1>Admin user credentials — dispatch pack</h1>
  <p class="meta">${escapeHtml(tenant)} · Generated ${escapeHtml(new Date(generatedAt).toLocaleString())} · ${credentials.length} user(s)</p>
  ${slips}
</body>
</html>`

  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=700")
  if (!w) {
    toast.error("Pop-up blocked. Allow pop-ups to print credentials.")
    return
  }
  w.document.write(html)
  w.document.close()
  setTimeout(() => {
    try {
      w.focus()
      w.print()
    } catch {
      /* ignore */
    }
  }, 300)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function downloadCsv(opts: {
  tenant: string
  credentials: AdminCredentialRow[]
}) {
  const header = ["Tenant", "Name", "Email", "Phone", "Roles", "Temporary Password", "Must Change Password"]
  const lines = [
    header.join(","),
    ...opts.credentials.map((c) =>
      [
        opts.tenant,
        c.name,
        c.email,
        c.phone || "",
        c.roles,
        c.temporary_password,
        "Yes",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ]
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `admin_credentials_dispatch_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminCredentialsDispatchDialog({
  open,
  onOpenChange,
  filters,
  selectedUserIds,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [pack, setPack] = useState<{
    tenant: string
    login_url: string
    generated_at: string
    credentials: AdminCredentialRow[]
  } | null>(null)

  const run = async () => {
    setBusy(true)
    try {
      const res = await exportAdminCredentialsDispatch({
        confirm: true,
        user_ids: selectedUserIds?.length ? selectedUserIds : undefined,
        search: filters?.search || undefined,
        role: filters?.role && filters.role !== "all" ? filters.role : undefined,
        status: filters?.status && filters.status !== "all" ? filters.status : undefined,
        format: "json",
      })
      if (!res.data?.credentials?.length) {
        toast.error("No admin users matched (your own account is excluded).")
        return
      }
      setPack(res.data)
      toast.success(`Generated ${res.data.count} temporary password(s) for dispatch`)
    } catch (e: any) {
      toast.error(e.message || "Failed to generate credentials pack")
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setPack(null)
        onOpenChange(next)
      }}
    >
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Export printable admin credentials</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Stored passwords cannot be recovered. This creates <strong>new temporary passwords</strong> for
              matching admin users so you can print or download a dispatch sheet (name, email, password).
            </span>
            <span className="block">
              Each user will be required to change the password on next login. Your own account is never included.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {pack ? (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
            Ready: <strong>{pack.credentials.length}</strong> credential slip(s) for{" "}
            <strong>{pack.tenant}</strong>
          </div>
        ) : null}

        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel disabled={busy}>Close</AlertDialogCancel>
          {!pack ? (
            <Button onClick={run} disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate &amp; prepare
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  downloadCsv({ tenant: pack.tenant, credentials: pack.credentials })
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
              <Button
                onClick={() =>
                  openPrintableWindow({
                    tenant: pack.tenant,
                    loginUrl: pack.login_url,
                    generatedAt: pack.generated_at,
                    credentials: pack.credentials,
                  })
                }
              >
                <Printer className="mr-2 h-4 w-4" />
                Print slips
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
