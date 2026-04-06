export const MORTGAGE_PROPERTY_TITLE_KEYS = [
	"c_of_o",
	"r_of_o",
	"deed_of_assignment",
	"governors_consent",
	"excision",
	"survey_plan",
] as const

export type MortgagePropertyTitleKey = (typeof MORTGAGE_PROPERTY_TITLE_KEYS)[number]

const LABELS: Record<MortgagePropertyTitleKey, string> = {
	c_of_o: "C of O (Certificate of Occupancy)",
	r_of_o: "R of O (Right of Occupancy)",
	deed_of_assignment: "Deed of Assignment",
	governors_consent: "Governor's Consent",
	excision: "Excision",
	survey_plan: "Survey Plan",
}

export const MORTGAGE_PROPERTY_TITLE_OPTIONS: { key: MortgagePropertyTitleKey; label: string }[] =
	MORTGAGE_PROPERTY_TITLE_KEYS.map((key) => ({ key, label: LABELS[key] }))

const ALLOWED = new Set<string>(MORTGAGE_PROPERTY_TITLE_KEYS)

export function isMortgagePropertyTitleKey(value: string): value is MortgagePropertyTitleKey {
	return ALLOWED.has(value)
}

export function labelForMortgagePropertyTitle(key: string): string {
	if (isMortgagePropertyTitleKey(key)) return LABELS[key]
	return key
}
