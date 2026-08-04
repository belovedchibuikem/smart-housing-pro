import { apiFetch } from "@/lib/api/client"

export interface AnnouncementRow {
	id: string
	title: string
	slug?: string
	category: string
	priority: string
	body?: string | null
	summary?: string | null
	channels?: string[]
	audience_filters?: string[] | Record<string, unknown>
	status: string
	is_pinned?: boolean
	show_banner?: boolean
	show_popup?: boolean
	show_dashboard_card?: boolean
	scheduled_at?: string | null
	published_at?: string | null
	expires_at?: string | null
	created_at?: string | null
}

export async function searchAnnouncements(params: Record<string, string | number | undefined> = {}) {
	const qs = new URLSearchParams()
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== "") qs.set(k, String(v))
	}
	return apiFetch<{
		success: boolean
		data: AnnouncementRow[]
		meta: { current_page: number; last_page: number; per_page: number; total: number }
	}>(`/admin/announcements?${qs.toString()}`)
}

export async function createAnnouncement(body: Record<string, unknown>) {
	return apiFetch<{ success: boolean; announcement: AnnouncementRow }>("/admin/announcements", {
		method: "POST",
		body: JSON.stringify(body),
	})
}

export async function publishAnnouncement(id: string) {
	return apiFetch<{ success: boolean; announcement: AnnouncementRow }>(`/admin/announcements/${id}/publish`, {
		method: "POST",
		body: JSON.stringify({}),
	})
}

export async function getAnnouncement(id: string) {
	return apiFetch<{ success: boolean; announcement: AnnouncementRow }>(`/admin/announcements/${id}`)
}
