"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Edit, Eye, Plus, RefreshCw, Trash2 } from "lucide-react"

import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface AppVersionRow {
  id: number
  platform: "android" | "ios" | "both"
  version_name: string
  version_code: number
  min_required_version: string
  min_required_version_code: number
  is_active: boolean
  is_force_update: boolean
  release_date?: string | null
  created_at?: string | null
}

interface AppVersionsResponse {
  success: boolean
  versions: AppVersionRow[]
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function AppVersionsPage() {
  const { isLoading, data, error, loadData } = usePageLoading()
  const [page, setPage] = useState(1)
  const [actionError, setActionError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkBusy, setBulkBusy] = useState(false)

  const loadVersions = useCallback(async () => {
    return loadData(async () => {
      const res = await apiFetch<AppVersionsResponse>(`/super-admin/app-versions?page=${page}&per_page=15`)
      return res
    })
  }, [loadData, page])

  useEffect(() => {
    void loadVersions()
  }, [loadVersions])

  const onDelete = async (id: number) => {
    const ok = window.confirm("Delete this app version? This performs a soft delete.")
    if (!ok) return
    setActionError(null)
    try {
      await apiFetch(`/super-admin/app-versions/${id}`, { method: "DELETE" })
      await loadVersions()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Failed to delete app version.")
    }
  }

  const toggleSelected = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((v) => v !== id)))
  }

  const toggleSelectAll = (idsOnPage: number[], checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        return [...new Set([...prev, ...idsOnPage])]
      }
      return prev.filter((id) => !idsOnPage.includes(id))
    })
  }

  const runBulkActivation = async (targetActive: boolean, rows: AppVersionRow[]) => {
    if (selectedIds.length === 0) return
    setBulkBusy(true)
    setActionError(null)
    try {
      const picked = rows.filter((row) => selectedIds.includes(row.id))
      await Promise.all(
        picked.map((row) =>
          apiFetch(`/super-admin/app-versions/${row.id}`, {
            method: "PUT",
            body: { is_active: targetActive, is_force_update: row.is_force_update },
          }),
        ),
      )
      setSelectedIds([])
      await loadVersions()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Bulk update failed.")
    } finally {
      setBulkBusy(false)
    }
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>
  }

  if (isLoading || !data) {
    return null
  }

  const response = data as AppVersionsResponse
  const rows = response.versions ?? []
  const pagination = response.pagination
  const idsOnPage = rows.map((r) => r.id)
  const allSelectedOnPage = idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.includes(id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">App Versions</h1>
          <p className="text-muted-foreground">Manage mobile app update versions for Android and iOS.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={bulkBusy || selectedIds.length === 0}
            onClick={() => void runBulkActivation(true, rows)}
          >
            Bulk Activate
          </Button>
          <Button
            variant="outline"
            disabled={bulkBusy || selectedIds.length === 0}
            onClick={() => void runBulkActivation(false, rows)}
          >
            Bulk Deactivate
          </Button>
          <Button variant="outline" onClick={() => void loadVersions()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/super-admin/app-versions/new">
              <Plus className="h-4 w-4 mr-2" />
              New Version
            </Link>
          </Button>
        </div>
      </div>

      {actionError ? <div className="text-sm text-red-600">{actionError}</div> : null}

      <Card>
        <CardHeader>
          <CardTitle>Configured Versions</CardTitle>
          <CardDescription>Latest and minimum-required versions used by the in-app update flow.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={(e) => toggleSelectAll(idsOnPage, e.target.checked)}
                    aria-label="Select all versions on current page"
                  />
                </TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Minimum Required</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={(e) => toggleSelected(row.id, e.target.checked)}
                      aria-label={`Select version ${row.id}`}
                    />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell className="uppercase">{row.platform}</TableCell>
                  <TableCell>{row.version_name}</TableCell>
                  <TableCell>{row.version_code}</TableCell>
                  <TableCell>
                    {row.min_required_version} ({row.min_required_version_code})
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={row.is_active ? "default" : "secondary"}>{row.is_active ? "Active" : "Inactive"}</Badge>
                      {row.is_force_update ? <Badge variant="destructive">Force</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/super-admin/app-versions/${row.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/super-admin/app-versions/${row.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => void onDelete(row.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination ? (
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page >= pagination.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
