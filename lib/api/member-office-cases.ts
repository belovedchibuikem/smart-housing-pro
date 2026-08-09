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

export async function getMemberOfficeCases(params?: Query) {
  return apiFetch<{ success: boolean; data: any }>(`/member/office/cases${toQuery(params)}`)
}

export async function getMemberOfficeCase(id: string) {
  return apiFetch<{ success: boolean; data: any }>(`/member/office/cases/${id}`)
}

export async function createMemberOfficeCase(body: Record<string, unknown>) {
  return apiFetch<{ success: boolean; data: any }>("/member/office/cases", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function replyMemberOfficeCase(id: string, body: string) {
  return apiFetch<{ success: boolean; data: any }>(`/member/office/cases/${id}/reply`, {
    method: "POST",
    body: JSON.stringify({ body }),
  })
}
