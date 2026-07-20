/**
 * Mirrors api/config/tenant_admin_route_permissions.php (pipe-separated OR permissions).
 * Used to show sidebar links only when the user has a matching Spatie permission.
 * Tenant super_admin sees everything (handled via roles in the sidebar).
 */

export const TENANT_ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  dashboard:
    "access_admin_panel|view_analytics|view_reports|view_financial_reports|view_members|view_contributions|view_loans|view_properties|view_equity_contributions|view_investments|view_documents",
  "pending-badges":
    "view_analytics|view_reports|view_financial_reports|view_members|view_contributions|view_loans|view_properties|view_equity_contributions|view_wallets|view_investments|manage_payments",

  "bulk.members":
    "bulk_upload_members|view_members|create_members|edit_members|delete_members|manage_member_kyc",
  "bulk.mortgages": "view_loans|create_loans|edit_loans|approve_loans|manage_loan_repayments",
  "bulk.properties": "view_properties|create_properties|edit_properties|delete_properties|manage_property_estates",
  "bulk.property-subscribers": "view_properties|manage_property_allottees|approve_allotments",
  "bulk.property-payments": "view_properties|manage_property_allottees|manage_payments",
  "bulk.lands": "view_properties|create_properties|edit_properties|manage_property_estates",
  "bulk.land-subscriptions": "view_properties|manage_property_allottees|approve_allotments",
  "land-subscriptions": "view_properties|manage_property_allottees|approve_allotments|manage_payments",
  "bulk.land-payments": "view_properties|manage_property_allottees|manage_payments",
  "bulk.contributions": "view_contributions|create_contributions|edit_contributions|delete_contributions",
  "bulk.equity-contributions":
    "view_equity_contributions|bulk_upload_equity_contributions|approve_equity_contributions|create_equity_contributions",
  "bulk.loans": "view_loans|create_loans|edit_loans|approve_loans|manage_loan_repayments",
  "bulk.loan-repayments": "manage_loan_repayments|view_loans",
  "bulk.mortgage-repayments": "manage_loan_repayments|view_loans",
  "bulk.internal-mortgage-repayments": "manage_loan_repayments|view_loans",
  "bulk.refund": "manage_payments|view_wallets|view_contributions",
  "bulk.wallet-transfers": "manage_wallets|manage_payments|view_wallets",
  "bulk.internal-mortgages": "view_loans|create_loans|approve_loans",
  "bulk.investments": "view_investments|create_investments|approve_investments|create_investment_plans",

  members:
    "view_members|create_members|edit_members|delete_members|bulk_upload_members|manage_member_kyc|view_kyc|approve_kyc|reject_kyc",
  "member-subscriptions": "view_members|manage_member_kyc|view_wallets|manage_payments|view_contributions",
  subscriptions: "access_admin_panel|manage_settings|view_analytics|view_reports|view_members|view_payment_gateways",
  subscription: "access_admin_panel|manage_settings|view_payment_gateways",

  users: "view_users|create_users|edit_users|delete_users",
  roles: "manage_roles",
  permissions: "manage_roles",
  "custom-domains": "manage_settings|view_white_label",
  settings: "manage_settings|view_activity_logs",
  "landing-page": "view_white_label|manage_white_label|manage_settings",
  "payment-gateways": "view_payment_gateways|manage_payment_gateways|test_payment_gateways",
  "payment-approvals": "manage_payments|view_payment_gateways|view_wallets|view_contributions",
  "payment-evidence": "manage_payments|view_payment_gateways|view_wallets|view_contributions",
  "wallet-transfer": "manage_wallets|manage_payments|view_wallets",
  "white-label": "view_white_label|manage_white_label",
  wallets: "view_wallets|manage_wallets|view_pending_wallets|view_wallet_transactions|manage_payments",
  "investment-withdrawal-requests": "view_investments|edit_investments|approve_investments|manage_payments",
  investments: "create_investment_plans|edit_investment_plans|delete_investment_plans|view_investments|approve_investments",
  refunds: "manage_payments|view_wallets|view_contributions|view_investments",
  "refund-member": "manage_payments|view_wallets|view_contributions",
  "mortgage-providers": "view_loans|create_loans|edit_loans|approve_loans",
  mortgages: "view_loans|create_loans|edit_loans|approve_loans|reject_loans|manage_loan_repayments",
  contributions:
    "view_contributions|create_contributions|edit_contributions|delete_contributions|approve_contributions|reject_contributions",
  loans: "view_loans|create_loans|edit_loans|approve_loans|reject_loans|disburse_loans|manage_loan_repayments",
  "loan-repayments": "manage_loan_repayments|view_loans|create_loans",
  properties:
    "view_properties|create_properties|edit_properties|delete_properties|manage_property_estates|manage_property_allottees",
  lands: "view_properties|create_properties|edit_properties|delete_properties|manage_property_estates",
  "property-statistics":
    "view_properties|manage_property_estates|create_properties|manage_settings",
  "property-payment-plans": "view_properties|create_properties|edit_properties|manage_property_allottees",
  "property-subscriptions": "view_properties|manage_property_allottees|approve_allotments",
  "internal-mortgages": "view_loans|manage_loan_repayments|approve_loans",
  "eoi-forms": "view_properties|approve_allotments|reject_allotments|view_members",
  "land-eoi-forms": "view_properties|approve_allotments|reject_allotments|view_members",
  "investment-plans":
    "create_investment_plans|edit_investment_plans|delete_investment_plans|view_investments|approve_investments",
  "contribution-plans": "view_contributions|create_contributions|edit_contributions|delete_contributions",
  "equity-contributions":
    "view_equity_contributions|approve_equity_contributions|reject_equity_contributions|create_equity_contributions",
  "equity-plans": "manage_equity_plans|view_equity_contributions|create_equity_contributions|approve_equity_contributions",
  "loan-products": "create_loan_plans|edit_loan_plans|delete_loan_plans|view_loans|approve_loans",
  "statutory-charges":
    "view_statutory_charges|create_statutory_charges|edit_statutory_charges|delete_statutory_charges|approve_statutory_charges|reject_statutory_charges|manage_statutory_charge_types|manage_statutory_charge_departments",
  "property-management":
    "view_properties|manage_property_estates|manage_property_allottees|view_maintenance|create_maintenance|edit_maintenance|assign_maintenance|complete_maintenance|approve_allotments|reject_allotments|view_property_reports",
  "blockchain-setup": "view_properties|manage_settings|view_reports",
  "blockchain-wallets": "view_properties|view_wallets|manage_wallets|view_reports",
  blockchain: "view_properties|view_wallets|view_reports|view_members",
  "mail-service":
    "view_mail|compose_mail|reply_mail|assign_mail|bulk_mail|delete_mail",
  reports:
    "view_reports|export_reports|view_analytics|view_financial_reports|view_contributions|view_loan_reports|view_property_reports|view_investment_reports|view_equity_reports",
  "activity-logs": "view_activity_logs|manage_settings",
  "audit-logs": "view_activity_logs|manage_settings",
  documents: "view_documents|upload_documents|approve_documents|reject_documents|delete_documents",
  notifications: "view_users|view_members|create_users|manage_settings",
}

/**
 * Map a frontend /admin/... href to the same config key Laravel uses for /api/admin/...
 */
export function adminHrefToPermissionKey(href: string): string | null {
  const trimmed = href.replace(/\/+$/, "")
  if (trimmed === "/admin" || trimmed === "") {
    return "dashboard"
  }
  const rest = trimmed.replace(/^\/admin\/?/, "").replace(/\/+$/, "")
  if (!rest) {
    return "dashboard"
  }

  const prefixOverrides: Array<{ prefix: string; key: string }> = [
    { prefix: "property-management", key: "property-management" },
    { prefix: "blockchain/wallets", key: "blockchain-wallets" },
    { prefix: "blockchain/setup", key: "blockchain-setup" },
    { prefix: "tools/mortgage-calculators", key: "mortgages" },
    { prefix: "post-contribution", key: "contributions" },
    { prefix: "financial-reports", key: "reports" },
  ]
  for (const { prefix, key } of prefixOverrides) {
    if (rest === prefix || rest.startsWith(`${prefix}/`)) {
      return key
    }
  }

  if (rest.startsWith("bulk-upload/")) {
    const sub = rest.slice("bulk-upload/".length).split("/")[0]
    return sub ? `bulk.${sub}` : null
  }

  return rest.split("/")[0] || null
}

/**
 * Strict sub-route rules checked before the coarse segment OR map.
 * Mirrors api/config/tenant_admin_action_permissions.php intent for the admin UI.
 */
const ADMIN_HREF_ACTION_RULES: Array<{ test: (href: string) => boolean; permission: string }> = [
  { test: (h) => h === "/admin/members/new", permission: "create_members" },
  { test: (h) => /^\/admin\/members\/[^/]+\/edit$/.test(h), permission: "edit_members" },
  { test: (h) => h === "/admin/users/new", permission: "create_users" },
  { test: (h) => /^\/admin\/users\/[^/]+\/edit$/.test(h), permission: "edit_users" },
  { test: (h) => h === "/admin/roles/new", permission: "manage_roles" },
  { test: (h) => /^\/admin\/roles\/[^/]+\/edit$/.test(h), permission: "manage_roles" },
  { test: (h) => h === "/admin/loans/new", permission: "create_loans" },
  { test: (h) => /^\/admin\/loans\/[^/]+\/edit$/.test(h), permission: "edit_loans" },
  { test: (h) => h === "/admin/contributions/new", permission: "create_contributions" },
  { test: (h) => /^\/admin\/contributions\/[^/]+\/edit$/.test(h), permission: "edit_contributions" },
  { test: (h) => h === "/admin/properties/new", permission: "create_properties" },
  { test: (h) => /^\/admin\/properties\/[^/]+\/edit$/.test(h), permission: "edit_properties" },
  { test: (h) => h === "/admin/lands/new", permission: "create_properties" },
  { test: (h) => /^\/admin\/lands\/[^/]+\/edit$/.test(h), permission: "edit_properties" },
  { test: (h) => h === "/admin/documents/new", permission: "upload_documents" },
  { test: (h) => h === "/admin/mail-service/compose", permission: "compose_mail" },
  { test: (h) => /^\/admin\/bulk-upload\/members/.test(h), permission: "bulk_upload_members" },
  { test: (h) => /^\/admin\/bulk-upload\/contributions/.test(h), permission: "create_contributions" },
  { test: (h) => /^\/admin\/bulk-upload\/loans/.test(h), permission: "create_loans" },
  { test: (h) => /^\/admin\/bulk-upload\/properties/.test(h), permission: "create_properties" },
  { test: (h) => /^\/admin\/statutory-charges\/new/.test(h), permission: "create_statutory_charges" },
  { test: (h) => /^\/admin\/statutory-charges\/[^/]+\/edit$/.test(h), permission: "edit_statutory_charges" },
  { test: (h) => /^\/admin\/investment-plans\/new/.test(h), permission: "create_investment_plans" },
  { test: (h) => /^\/admin\/investment-plans\/[^/]+\/edit$/.test(h), permission: "edit_investment_plans" },
  { test: (h) => /^\/admin\/loan-products\/new/.test(h), permission: "create_loan_plans" },
  { test: (h) => /^\/admin\/loan-products\/[^/]+\/edit$/.test(h), permission: "edit_loan_plans" },
  { test: (h) => /^\/admin\/contribution-plans\/new/.test(h), permission: "create_contributions" },
  { test: (h) => /^\/admin\/contribution-plans\/[^/]+\/edit$/.test(h), permission: "edit_contributions" },
  { test: (h) => /^\/admin\/equity-plans\/new/.test(h), permission: "manage_equity_plans" },
  { test: (h) => /^\/admin\/equity-plans\/[^/]+\/edit$/.test(h), permission: "manage_equity_plans" },
  { test: (h) => /^\/admin\/payment-gateways\/new/.test(h), permission: "manage_payment_gateways" },
  { test: (h) => /^\/admin\/payment-gateways\/[^/]+\/edit$/.test(h), permission: "manage_payment_gateways" },
]

function normalizeAdminHref(href: string): string {
  const trimmed = href.replace(/\/+$/, "")
  return trimmed.length > 0 ? trimmed : "/admin"
}

function hasAnyPermission(userPerms: string[], requiredPipeList: string): boolean {
  const required = requiredPipeList
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean)
  if (required.length === 0) {
    return false
  }
  const set = new Set(userPerms)
  return required.some((p) => set.has(p))
}

/** Paths any staff user may open when the session has no permission slugs yet (legacy). */
export function legacyStaffFallbackPaths(): string[] {
  return ["/admin", "/admin/subscriptions", "/admin/subscription"]
}

export function isLegacyStaffFallbackPath(href: string): boolean {
  const normalized = normalizeAdminHref(href)
  return (
    normalized === "/admin" ||
    normalized === "/admin/subscriptions" ||
    normalized.startsWith("/admin/subscriptions/") ||
    normalized === "/admin/subscription" ||
    normalized.startsWith("/admin/subscription/")
  )
}

export function userHasPermissionForAdminHref(
  href: string | undefined,
  permissions: string[] | undefined,
): boolean {
  if (!href) {
    return false
  }

  const normalized = normalizeAdminHref(href)
  const perms = permissions ?? []

  for (const rule of ADMIN_HREF_ACTION_RULES) {
    if (rule.test(normalized)) {
      return perms.includes(rule.permission)
    }
  }

  const key = adminHrefToPermissionKey(normalized)
  if (!key) {
    return false
  }
  const segmentRule = TENANT_ADMIN_ROUTE_PERMISSIONS[key]
  if (!segmentRule) {
    return false
  }
  return hasAnyPermission(perms, segmentRule)
}

/** Tenant Spatie role name */
export function isTenantSuperAdminRole(roleNames: string[] | undefined): boolean {
  if (!roleNames?.length) {
    return false
  }
  return roleNames.some((r) => {
    const n = String(r).toLowerCase().replace(/-/g, "_")
    return n === "super_admin"
  })
}

/** Spatie roles array and/or legacy `users.role` string from login payload */
export function isTenantSuperAdminContext(
  roleNames: string[] | undefined,
  legacyUserRole?: string,
): boolean {
  if (isTenantSuperAdminRole(roleNames)) {
    return true
  }
  if (!legacyUserRole) {
    return false
  }
  const n = String(legacyUserRole).toLowerCase().replace(/-/g, "_")
  return n === "super_admin"
}

/**
 * Filter nav items: super_admin sees all; otherwise require at least one permission from the route map.
 * Falls back to false for unknown hrefs (deny).
 */
export function getPermissionFilteredNavItems<T extends { href?: string; subItems?: T[] }>(
  permissions: string[] | undefined,
  roleNames: string[] | undefined,
  navItems: T[],
  legacyUserRole?: string,
): T[] {
  if (isTenantSuperAdminContext(roleNames, legacyUserRole)) {
    return navItems
  }
  const perms = permissions ?? []

  return navItems
    .map((item) => {
      if (item.href) {
        return userHasPermissionForAdminHref(item.href, perms) ? item : null
      }
      if (item.subItems?.length) {
        const subs = item.subItems.filter((s) => userHasPermissionForAdminHref(s.href, perms))
        if (subs.length === 0) {
          return null
        }
        return { ...item, subItems: subs } as T
      }
      return null
    })
    .filter((x): x is T => x !== null)
}
