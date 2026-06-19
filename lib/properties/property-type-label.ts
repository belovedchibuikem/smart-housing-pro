export type PropertyTypeSource = {
	property_type?: string | null
	type?: string | null
	type_label?: string | null
	listing_kind?: string | null
}

const CATEGORY_SLUGS = new Set(["apartment", "house", "duplex", "bungalow", "commercial", "land"])

function isCategorySlug(value?: string | null): boolean {
	if (!value?.trim()) return true
	const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_")
	return CATEGORY_SLUGS.has(normalized)
}

function titleCase(value: string): string {
	return value
		.replace(/_/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getPropertyTypeLabel(source?: PropertyTypeSource | null, fallback = "—"): string {
	if (!source) return fallback

	const resolved = source.type_label?.trim()
	if (resolved) return resolved

	const fullType = source.property_type?.trim()
	if (fullType && !isCategorySlug(fullType)) return fullType

	const listingKind = source.listing_kind?.toLowerCase()
	if (listingKind === "land_parcel" || listingKind === "land_legacy") return "Land"

	const category = source.type?.trim()
	if (!category) return fallback
	if (category.toLowerCase() === "land") return "Land"

	return titleCase(category)
}

export function isPropertyCategorySlug(value?: string | null): boolean {
	return isCategorySlug(value)
}
