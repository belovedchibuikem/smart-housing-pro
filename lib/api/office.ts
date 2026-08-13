import { apiFetch, apiFetchBlob, getAuthToken, getTenantSlug } from "@/lib/api/client"
import { getApiBaseUrl } from "@/lib/api/config"

type Query = Record<string, string | number | boolean | undefined | null>

function toQuery(params?: Query): string {
  if (!params) return ""
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v))
  })
  const s = q.toString()
  return s ? `?${s}` : ""
}

export async function bootstrapOffice() {
  return apiFetch<{ success: boolean; message?: string; data: Record<string, number> }>(
    "/admin/office/bootstrap",
    { method: "POST" }
  )
}

export async function getOfficeDashboard() {
  return apiFetch<{ success: boolean; data: Record<string, number> }>("/admin/office/dashboard")
}

export async function getOfficeInbox(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/inbox${toQuery(params)}`)
}

export async function getOfficeOutbox(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/outbox${toQuery(params)}`)
}

export async function getOfficeMyTasks() {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/my-tasks")
}

export async function getOfficeDocuments(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents${toQuery(params)}`)
}

export async function getOfficeDocument(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}`)
}

export async function createOfficeDocument(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/documents", {
    method: "POST",
    body: body,
  })
}

export async function updateOfficeDocument(id: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}`, {
    method: "PUT",
    body: body,
  })
}

export async function submitOfficeDocument(id: string, comments?: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/submit`, {
    method: "POST",
    body: { comments },
  })
}

export async function recallOfficeDocument(id: string, comments?: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/recall`, {
    method: "POST",
    body: { comments },
  })
}

export async function actOnOfficeTask(
  taskId: string,
  body: { action: string; comments?: string; forward_to_user_id?: string }
) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/tasks/${taskId}/act`, {
    method: "POST",
    body: body,
  })
}

export async function addOfficeMinute(id: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/minutes`, {
    method: "POST",
    body: body,
  })
}

export async function completeMinuteAction(actionId: string) {
  return apiFetch<{ success: boolean; data: any }>(
    `/admin/office/minute-actions/${actionId}/complete`,
    { method: "POST" }
  )
}

export async function signOfficeDocument(id: string, signature: string, role_label?: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/sign`, {
    method: "POST",
    body: { signature, role_label },
  })
}

export async function archiveOfficeDocument(id: string, comments?: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/archive`, {
    method: "POST",
    body: { comments },
  })
}

export async function downloadOfficeDocument(id: string) {
  return apiFetchBlob(`/admin/office/documents/${id}/download`)
}

export async function getMemberOfficeFile(memberId: string, params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(
    `/admin/office/member-file/${memberId}${toQuery(params)}`
  )
}

export async function getOfficeOrgUnits() {
  return apiFetch<{ success: boolean; data: any[] }>("/admin/office/org-units")
}

export async function createOfficeOrgUnit(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/org-units", {
    method: "POST",
    body: body,
  })
}

export async function updateOfficeOrgUnit(id: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/org-units/${id}`, {
    method: "PUT",
    body: body,
  })
}

export async function getOfficeCategories() {
  return apiFetch<{ success: boolean; data: any[] }>("/admin/office/categories")
}

export async function createOfficeCategory(body: { name: string; description?: string }) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/categories", {
    method: "POST",
    body: body,
  })
}

export async function getOfficeTemplates() {
  return apiFetch<{ success: boolean; data: any[] }>("/admin/office/templates")
}

export async function updateOfficeTemplate(id: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/templates/${id}`, {
    method: "PUT",
    body: body,
  })
}

export async function getOfficeStaffUsers(q?: string) {
  return apiFetch<{
    success: boolean
    data: Array<{ id: string; name: string; email: string; first_name?: string; last_name?: string; roles?: string[] }>
    highest_admin?: { id: string; name: string; email: string; roles?: string[] } | null
    current_user?: { id: string; name: string; email: string } | null
  }>(`/admin/office/staff-users${toQuery({ q })}`)
}

export async function uploadOfficeAttachment(documentId: string, file: File) {
  const form = new FormData()
  form.append("file", file)
  const url = `${getApiBaseUrl()}/admin/office/documents/${documentId}/attachments`
  const headers: Record<string, string> = { Accept: "application/json" }
  const token = getAuthToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (typeof window !== "undefined") {
    headers["X-Forwarded-Host"] = window.location.host
    const slug = getTenantSlug()
    if (slug) headers["X-Tenant-Slug"] = slug
  }
  const response = await fetch(url, { method: "POST", headers, body: form })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.message || "Upload failed")
  }
  return payload as { success: boolean; data: any }
}

export async function getOfficeWorkflows() {
  return apiFetch<{ success: boolean; data: any[] }>("/admin/office/workflows")
}

export async function createOfficeWorkflow(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/workflows", {
    method: "POST",
    body: body,
  })
}

export async function updateOfficeWorkflow(id: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/workflows/${id}`, {
    method: "PUT",
    body: body,
  })
}

export async function getOfficeFolders(parent_id?: string) {
  return apiFetch<{ success: boolean; data: any[] }>(`/admin/office/folders${toQuery({ parent_id })}`)
}

export async function createOfficeFolder(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/folders", {
    method: "POST",
    body: body,
  })
}

export async function getOfficeTags() {
  return apiFetch<{ success: boolean; data: any[] }>("/admin/office/tags")
}

export async function createOfficeTag(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/tags", {
    method: "POST",
    body: body,
  })
}

export async function checkoutOfficeDocument(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/checkout`, { method: "POST" })
}

export async function checkinOfficeDocument(id: string, body?: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/checkin`, {
    method: "POST",
    body: body || {},
  })
}

export async function compareOfficeVersions(id: string, left: number, right: number) {
  return apiFetch<{ success: boolean; data: any }>(
    `/admin/office/documents/${id}/compare-versions${toQuery({ left, right })}`
  )
}

export async function syncMemberOfficeSources(memberId: string) {
  return apiFetch<{ success: boolean; data: { synced: number; skipped: number } }>(
    `/admin/office/members/${memberId}/sync-sources`,
    { method: "POST" }
  )
}

export async function getOfficeCorrespondence(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/correspondence${toQuery(params)}`)
}

export async function createOfficeCorrespondence(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/correspondence", {
    method: "POST",
    body: body,
  })
}

export async function dispatchOfficeCorrespondence(id: string, notes?: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/correspondence/${id}/dispatch`, {
    method: "POST",
    body: { notes },
  })
}

export async function ackOfficeCorrespondence(id: string, notes?: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/correspondence/${id}/acknowledge`, {
    method: "POST",
    body: { notes },
  })
}

export async function getOfficeRetentionPolicies() {
  return apiFetch<{ success: boolean; data: any[] }>("/admin/office/retention-policies")
}

export async function setOfficeLegalHold(id: string, legal_hold: boolean, notes?: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/legal-hold`, {
    method: "POST",
    body: { legal_hold, notes },
  })
}

export async function getOfficeReportSummary() {
  return apiFetch<{ success: boolean; data: Record<string, any> }>("/admin/office/reports/summary")
}

export async function exportOfficeReport(type: string = "documents") {
  return apiFetchBlob(`/admin/office/reports/export${toQuery({ type })}`)
}

export async function getOfficeCirculars() {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/circulars")
}

export async function createOfficeCircular(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/circulars", {
    method: "POST",
    body: body,
  })
}

export async function publishOfficeCircular(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/circulars/${id}/publish`, { method: "POST" })
}

export async function getOfficeBranchMonitor() {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/branch-monitor")
}

export async function advancedOfficeSearch(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/search${toQuery(params)}`)
}

export async function officeAiSuggest(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any; message?: string }>("/admin/office/ai/suggest", {
    method: "POST",
    body: body,
  })
}

export async function officeAiReview(id: string, decision: "accepted" | "rejected") {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/ai/suggestions/${id}/review`, {
    method: "POST",
    body: { decision },
  })
}

export async function getMemberDigitalFile(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/member/digital-file${toQuery(params)}`)
}

export async function downloadMemberDigitalFile(id: string) {
  return apiFetchBlob(`/member/digital-file/${id}/download`)
}

// ── Office Case Desk ──

export async function getOfficeCases(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases${toQuery(params)}`)
}

export async function getOfficeCase(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}`)
}

export async function createOfficeCase(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/cases", {
    method: "POST",
    body: body,
  })
}

export async function assignOfficeCase(id: string, body: { assigned_to_user_id: string; note?: string }) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}/assign`, {
    method: "POST",
    body: body,
  })
}

export async function claimOfficeCase(id: string, body?: { note?: string }) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}/claim`, {
    method: "POST",
    body: body || {},
  })
}

export async function escalateOfficeCase(
  id: string,
  body?: { note?: string; reassign_to_head?: boolean },
) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}/escalate`, {
    method: "POST",
    body: body || {},
  })
}

export async function replyOfficeCase(id: string, body: { body: string; visibility?: string }) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}/reply`, {
    method: "POST",
    body: body,
  })
}

export async function resolveOfficeCase(
  id: string,
  body: { resolution_summary: string; close?: boolean; apply_domain_action?: boolean },
) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}/resolve`, {
    method: "POST",
    body: body,
  })
}

export async function transitionOfficeCase(id: string, body: { status: string; note?: string }) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}/transition`, {
    method: "POST",
    body: body,
  })
}

export async function getOfficeCaseSlaSettings() {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/cases/sla-settings")
}

export async function updateOfficeCaseSlaSettings(hours: Record<string, number>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/cases/sla-settings", {
    method: "PUT",
    body: { hours },
  })
}

export async function createOfficeCaseLetter(id: string, body?: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}/create-letter`, {
    method: "POST",
    body: body || {},
  })
}

export async function issueOfficeCaseLetterhead(
  id: string,
  body?: {
    subject?: string
    body_html?: string
    use_tenant_signatory?: boolean
    signature?: string
    role_label?: string
  },
) {
  return apiFetch<{ success: boolean; message?: string; data: any }>(
    `/admin/office/cases/${id}/issue-letterhead`,
    {
      method: "POST",
      body: body || { use_tenant_signatory: true },
    },
  )
}

export async function renderOfficeDocumentPdf(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/documents/${id}/render-pdf`, {
    method: "POST",
    body: {},
  })
}

export async function uploadOfficeCaseAttachment(id: string, file: File) {
  const form = new FormData()
  form.append("file", file)
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/cases/${id}/attachments`, {
    method: "POST",
    body: form,
  })
}

/** Promote a mail thread into an OfficeCase (also files to registry). */
export async function convertMailToOfficeCase(mailId: string) {
  return apiFetch<{ success: boolean; message?: string; data: any }>(
    `/admin/mail-service/${mailId}/convert-to-case`,
    { method: "POST", body: {} },
  )
}

/* ─── Central Workflow Engine ─── */

export async function getWorkflowSettings() {
  return apiFetch<{ success: boolean; data: any[] }>("/admin/office/workflow/settings")
}

export async function updateWorkflowSetting(processKey: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; message?: string; data: any }>(
    `/admin/office/workflow/settings/${processKey}`,
    { method: "PUT", body },
  )
}

export async function getWorkflowQueue(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/workflow/queue${toQuery(params)}`)
}

export async function getMyWorkflowReviews(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/workflow/my-reviews${toQuery(params)}`)
}

export async function getMyWorkflowRecommendations(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(
    `/admin/office/workflow/my-recommendations${toQuery(params)}`,
  )
}

export async function getMyWorkflowApprovals(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/workflow/my-approvals${toQuery(params)}`)
}

export async function getWorkflowTask(taskId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/office/workflow/tasks/${taskId}`)
}

export async function actOnWorkflowTask(
  taskId: string,
  body: { action: string; reason?: string; assignee_user_id?: string },
) {
  return apiFetch<{ success: boolean; message?: string; data: any }>(
    `/admin/office/workflow/tasks/${taskId}/act`,
    { method: "POST", body },
  )
}

export async function bulkActWorkflowTasks(body: {
  task_ids: string[]
  action: string
  reason?: string
  confirmation_note?: string
  process_key?: string
}) {
  return apiFetch<{ success: boolean; message?: string; data: any }>(
    "/admin/office/workflow/bulk-act",
    { method: "POST", body },
  )
}

export async function getWorkflowDelegations(params?: Query) {
  return apiFetch<{ success: boolean; data: any[] }>(
    `/admin/office/workflow/delegations${toQuery(params)}`,
  )
}

export async function createWorkflowDelegation(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/office/workflow/delegations", {
    method: "POST",
    body,
  })
}

export async function revokeWorkflowDelegation(id: string) {
  return apiFetch<{ success: boolean; data: any }>(
    `/admin/office/workflow/delegations/${id}/revoke`,
    { method: "POST", body: {} },
  )
}

export async function getWorkflowProcessKeys() {
  return apiFetch<{ success: boolean; data: Array<{ key: string; label: string }> }>(
    "/admin/office/workflow/process-keys",
  )
}

export async function getWorkflowInstance(instanceId: string) {
  return apiFetch<{ success: boolean; data: any }>(
    `/admin/office/workflow/instances/${instanceId}`,
  )
}

export async function retryWorkflowExecution(instanceId: string) {
  return apiFetch<{ success: boolean; message?: string; data: any }>(
    `/admin/office/workflow/instances/${instanceId}/retry-execution`,
    { method: "POST", body: {} },
  )
}

