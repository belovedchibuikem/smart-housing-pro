/** Parse package limit integers (-1 = unlimited). Throws on invalid input. */
export function parsePackageLimit(value: string, fieldLabel: string): number {
  const trimmed = value.trim()
  if (trimmed === "") {
    throw new Error(`${fieldLabel} is required`)
  }
  const n = parseInt(trimmed, 10)
  if (Number.isNaN(n)) {
    throw new Error(`${fieldLabel} must be a valid number`)
  }
  return n
}

export type PackageLimitsForm = {
  max_members: string
  max_properties: string
  max_loan_products: string
  max_contribution_plans: string
  max_investment_plans: string
  max_mortgage_plans: string
  storage_gb: string
  max_admins: string
  has_role_management: boolean
}

export type PackageMarketingForm = {
  custom_pricing: boolean
  tagline: string
  usd_hint: string
  sort_order: string
  display_features_text: string
}

export function buildPackageLimitsPayload(
  limits: PackageLimitsForm,
  marketing: PackageMarketingForm,
): Record<string, unknown> {
  const display_features = marketing.display_features_text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)

  const sortOrderRaw = marketing.sort_order.trim()
  const sort_order = sortOrderRaw ? parseInt(sortOrderRaw, 10) : undefined

  const payload: Record<string, unknown> = {
    max_members: parsePackageLimit(limits.max_members, "Maximum members"),
    max_properties: parsePackageLimit(limits.max_properties, "Maximum properties"),
    max_loan_products: parsePackageLimit(limits.max_loan_products, "Maximum loan plans"),
    max_contribution_plans: parsePackageLimit(
      limits.max_contribution_plans,
      "Maximum contribution plans",
    ),
    max_investment_plans: parsePackageLimit(
      limits.max_investment_plans,
      "Maximum investment plans",
    ),
    max_mortgage_plans: parsePackageLimit(limits.max_mortgage_plans, "Maximum mortgage plans"),
    storage_gb: parsePackageLimit(limits.storage_gb, "Storage (GB)"),
    max_admins: parsePackageLimit(limits.max_admins, "Maximum admins"),
    has_role_management: limits.has_role_management,
    custom_pricing: marketing.custom_pricing,
    display_features,
  }

  const tagline = marketing.tagline.trim()
  if (tagline) payload.tagline = tagline

  const usdHint = marketing.usd_hint.trim()
  if (usdHint) payload.usd_hint = usdHint

  if (sort_order !== undefined && !Number.isNaN(sort_order)) {
    payload.sort_order = sort_order
  }

  return payload
}

/** Unwrap Laravel paginated `{ packages: { data: [] } }` or flat `{ packages: [] }`. */
export function normalizePackagesList<T>(response: { packages?: T[] | { data?: T[] } }): T[] {
  const pkgs = response.packages
  if (Array.isArray(pkgs)) return pkgs
  if (pkgs && typeof pkgs === "object" && Array.isArray((pkgs as { data?: T[] }).data)) {
    return (pkgs as { data: T[] }).data
  }
  return []
}
