export type PropertyTypeSource = {
	property_type?: string | null
	type?: string | null
	listing_kind?: string | null
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

	const fullType = source.property_type?.trim()
	if (fullType) return fullType

	const listingKind = source.listing_kind?.toLowerCase()
	if (listingKind === "land_parcel" || listingKind === "land_legacy") return "Land"

	const category = source.type?.trim()
	if (!category) return fallback
	if (category.toLowerCase() === "land") return "Land"

	return titleCase(category)
}
