/**
 * Admin GET /api/admin/members returns:
 * `{ success, members: MemberResource::collection(paginator), pagination }`.
 * Paginated JsonResource collections serialize as `{ data: [...], links, meta }` under `members`.
 * Some callers incorrectly read `response.data`, which is absent.
 */
export function normalizeAdminMembersList(payload: unknown): Record<string, unknown>[] {
	if (!payload || typeof payload !== "object") return []
	const p = payload as Record<string, unknown>
	const members = p.members
	if (Array.isArray(members)) return members as Record<string, unknown>[]
	if (members && typeof members === "object") {
		const inner = (members as { data?: unknown }).data
		if (Array.isArray(inner)) return inner as Record<string, unknown>[]
	}
	if (Array.isArray(p.data)) return p.data as Record<string, unknown>[]
	return []
}
