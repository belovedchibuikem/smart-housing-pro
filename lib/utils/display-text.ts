export function toDisplayText(value: unknown, fallback = "—"): string {
	if (value == null) return fallback
	if (typeof value === "string") {
		const trimmed = value.trim()
		return trimmed || fallback
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value)
	}
	if (Array.isArray(value)) {
		const joined = value
			.map((entry) => toDisplayText(entry, ""))
			.filter(Boolean)
			.join(", ")
		return joined || fallback
	}
	if (typeof value === "object") {
		const record = value as Record<string, unknown>
		const composed = [record.name, record.location, record.city, record.state, record.label]
			.map((entry) => (typeof entry === "string" ? entry.trim() : ""))
			.filter(Boolean)
			.join(", ")
		return composed || fallback
	}
	return fallback
}
