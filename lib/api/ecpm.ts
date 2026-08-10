import { apiFetch } from "@/lib/api/client"

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

export async function bootstrapEcpm() {
  return apiFetch<{ success: boolean; message?: string; data: Record<string, unknown> }>(
    "/admin/ecpm/bootstrap",
    { method: "POST" }
  )
}

export async function getEcpmDashboard() {
  return apiFetch<{ success: boolean; data: Record<string, any> }>("/admin/ecpm/dashboard")
}

export async function listEcpmEstates(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/estates${toQuery(params)}`)
}

export async function createEcpmEstate(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/estates", { method: "POST", body })
}

export async function getEcpmEstate(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/estates/${id}`)
}

export async function updateEcpmEstate(id: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/estates/${id}`, { method: "PUT", body })
}

export async function createEcpmPlot(estateId: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/estates/${estateId}/plots`, {
    method: "POST",
    body,
  })
}

export async function listEcpmParties(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/parties${toQuery(params)}`)
}

export async function createEcpmParty(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/parties", { method: "POST", body })
}

export async function listEcpmProjects(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/projects${toQuery(params)}`)
}

export async function createEcpmProject(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/projects", { method: "POST", body })
}

export async function getEcpmProject(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/projects/${id}`)
}

export async function updateEcpmProject(id: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/projects/${id}`, { method: "PUT", body })
}

export async function updateEcpmStageItem(itemId: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/stage-items/${itemId}`, {
    method: "PUT",
    body,
  })
}

export async function listEcpmBoqs(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/boqs${toQuery(params)}`)
}

export async function createEcpmBoq(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/boqs", { method: "POST", body })
}

export async function getEcpmBoq(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/boqs/${id}`)
}

export async function submitEcpmBoq(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/boqs/${id}/submit`, { method: "POST" })
}

export async function listEcpmQuotations(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/quotations${toQuery(params)}`)
}

export async function createEcpmQuotation(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/quotations", { method: "POST", body })
}

export async function submitEcpmQuotation(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/quotations/${id}/submit`, { method: "POST" })
}

export async function acceptEcpmQuotation(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/quotations/${id}/accept`, { method: "POST" })
}

export async function listEcpmContracts(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/contracts${toQuery(params)}`)
}

export async function createEcpmContract(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/contracts", { method: "POST", body })
}

export async function submitEcpmContract(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/contracts/${id}/submit`, { method: "POST" })
}

export async function signEcpmContract(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/contracts/${id}/sign`, { method: "POST" })
}

export async function listEcpmDrawings(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/drawings${toQuery(params)}`)
}

export async function uploadEcpmDrawing(fields: {
  project_id: string
  title: string
  file: File
  drawing_number?: string
  discipline?: string
  description?: string
  change_notes?: string
}) {
  const form = new FormData()
  form.append("project_id", fields.project_id)
  form.append("title", fields.title)
  form.append("file", fields.file)
  if (fields.drawing_number) form.append("drawing_number", fields.drawing_number)
  if (fields.discipline) form.append("discipline", fields.discipline)
  if (fields.description) form.append("description", fields.description)
  if (fields.change_notes) form.append("change_notes", fields.change_notes)

  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/drawings", {
    method: "POST",
    body: form,
  })
}

export async function reviseEcpmDrawing(
  id: string,
  fields: { file: File; change_notes?: string },
) {
  const form = new FormData()
  form.append("file", fields.file)
  if (fields.change_notes) form.append("change_notes", fields.change_notes)

  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/drawings/${id}/revise`, {
    method: "POST",
    body: form,
  })
}

export async function listEcpmApprovals(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/approvals${toQuery(params)}`)
}

export async function decideEcpmApproval(id: string, body: { status: "approved" | "rejected"; comments?: string }) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/approvals/${id}/decide`, {
    method: "POST",
    body,
  })
}

export async function listEcpmAudit(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/audit${toQuery(params)}`)
}

// Phase 2–5
export async function listEcpmDiaries(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/diaries${toQuery(params)}`)
}
export async function createEcpmDiary(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/diaries", { method: "POST", body })
}
export async function listEcpmInspections(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/inspections${toQuery(params)}`)
}
export async function createEcpmInspection(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/inspections", { method: "POST", body })
}
export async function completeEcpmInspection(id: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/inspections/${id}/complete`, { method: "POST", body })
}
export async function listEcpmHse(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/hse${toQuery(params)}`)
}
export async function createEcpmHse(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/hse", { method: "POST", body })
}
export async function listEcpmProgress(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/progress-updates${toQuery(params)}`)
}
export async function createEcpmProgress(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/progress-updates", { method: "POST", body })
}
export async function listEcpmStock(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/stock-items${toQuery(params)}`)
}
export async function createEcpmStock(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/stock-items", { method: "POST", body })
}
export async function listEcpmMaterialRequests(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/material-requests${toQuery(params)}`)
}
export async function createEcpmMaterialRequest(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/material-requests", { method: "POST", body })
}
export async function listEcpmPurchaseOrders(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/purchase-orders${toQuery(params)}`)
}
export async function createEcpmPurchaseOrder(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/purchase-orders", { method: "POST", body })
}
export async function getEcpmHandover(projectId: string) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/projects/${projectId}/handover`)
}
export async function updateEcpmHandover(projectId: string, body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/projects/${projectId}/handover`, { method: "PUT", body })
}
export async function completeEcpmHandover(projectId: string) {
  return apiFetch<{ success: boolean; data: any; message?: string }>(`/admin/ecpm/projects/${projectId}/handover/complete`, { method: "POST" })
}
export async function listEcpmAiSuggestions(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/ai-suggestions${toQuery(params)}`)
}
export async function requestEcpmAi(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/ai-suggestions", { method: "POST", body })
}
export async function reviewEcpmAi(id: string, body: { status: "accepted" | "rejected"; review_notes?: string }) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/ai-suggestions/${id}/review`, { method: "POST", body })
}
export async function getEcpmExecutiveReport() {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/reports/executive")
}
export async function getEcpmProjectReport(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/reports/projects${toQuery(params)}`)
}
export async function getEcpmProcurementReport() {
  return apiFetch<{ success: boolean; data: any }>("/admin/ecpm/reports/procurement")
}
export async function getEcpmHseReport(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/admin/ecpm/reports/hse${toQuery(params)}`)
}
