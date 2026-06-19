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

export function hasDisplayValue(value: unknown): boolean {
	if (value == null) return false
	if (typeof value === "string") return value.trim() !== ""
	if (typeof value === "number") return Number.isFinite(value) && value !== 0 ? true : value === 0
	if (typeof value === "boolean") return value
	if (typeof value === "object") {
		if (Array.isArray(value)) return value.length > 0
		return Object.keys(value as object).length > 0 && toDisplayText(value, "") !== "—"
	}
	return false
}

export function toOptionalNumber(value: unknown): number | undefined {
	if (value == null || value === "") return undefined
	if (typeof value === "number") return Number.isFinite(value) ? value : undefined
	if (typeof value === "string") {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : undefined
	}
	return undefined
}

export function toOptionalString(value: unknown): string | undefined {
	const text = toDisplayText(value, "")
	return text === "—" || text === "" ? undefined : text
}
