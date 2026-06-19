import type { AvailableProperty, BrowsePropertiesPagination } from "@/lib/api/client"
import { getPropertyTypeLabel } from "@/lib/properties/property-type-label"
import { toDisplayText, toOptionalNumber, toOptionalString } from "@/lib/utils/display-text"

function normalizeImages(images: unknown): AvailableProperty["images"] {
	if (!Array.isArray(images)) return []

	return images
		.map((image) => {
			if (!image || typeof image !== "object") return null
			const record = image as Record<string, unknown>
			const url = toOptionalString(record.url ?? record.image_url)
			if (!url) return null
			return {
				id: toDisplayText(record.id, ""),
				url,
				caption: toOptionalString(record.caption),
				is_primary: record.is_primary === true,
			}
		})
		.filter((image): image is NonNullable<typeof image> => image != null)
}

export function normalizeAvailableProperty(property: AvailableProperty): AvailableProperty {
	const city = toOptionalString(property.city)
	const state = toOptionalString(property.state)
	const locationFallback = [city, state].filter(Boolean).join(", ")

	return {
		...property,
		id: toDisplayText(property.id, ""),
		title: toDisplayText(property.title, "Untitled listing"),
		description: toOptionalString(property.description) ?? null,
		type: toDisplayText(property.type, "house"),
		property_type: toOptionalString(property.property_type) ?? null,
		type_label: getPropertyTypeLabel(property),
		listing_kind: toOptionalString(property.listing_kind) ?? property.listing_kind,
		location: toDisplayText(property.location, locationFallback || "—"),
		address: toOptionalString(property.address) ?? null,
		city: city ?? null,
		state: state ?? null,
		land_code: toOptionalString(property.land_code) ?? null,
		land_size_label: toOptionalString(property.land_size_label) ?? null,
		status: toDisplayText(property.status, "available"),
		price: toOptionalNumber(property.price) ?? 0,
		size: toOptionalNumber(property.size) ?? null,
		bedrooms: toOptionalNumber(property.bedrooms) ?? null,
		bathrooms: toOptionalNumber(property.bathrooms) ?? null,
		total_slots: toOptionalNumber(property.total_slots) ?? null,
		slots_used: toOptionalNumber(property.slots_used) ?? null,
		slots_available: toOptionalNumber(property.slots_available) ?? null,
		accepting_interest:
			typeof property.accepting_interest === "boolean" ? property.accepting_interest : undefined,
		images: normalizeImages(property.images),
		features: Array.isArray(property.features)
			? property.features.map((feature) => toDisplayText(feature, "")).filter(Boolean)
			: null,
		infrastructure_plan: Array.isArray(property.infrastructure_plan)
			? property.infrastructure_plan.map((item) => toDisplayText(item, "")).filter(Boolean)
			: null,
	}
}

export function normalizeBrowsePagination(
	pagination: BrowsePropertiesPagination | undefined | null,
): BrowsePropertiesPagination | null {
	if (!pagination || typeof pagination !== "object") return null

	return {
		current_page: toOptionalNumber(pagination.current_page) ?? 1,
		last_page: toOptionalNumber(pagination.last_page) ?? 1,
		per_page: toOptionalNumber(pagination.per_page) ?? 12,
		total: toOptionalNumber(pagination.total) ?? 0,
	}
}
