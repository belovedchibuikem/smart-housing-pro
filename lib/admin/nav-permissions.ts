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
  "bulk.lands": "view_properties|create_properties|edit_properties|manage_property_estates",
  "bulk.land-subscriptions": "view_properties|manage_property_allottees|approve_allotments",
  "bulk.land-payments": "view_properties|manage_property_allottees|manage_payments",
  "bulk.contributions": "view_contributions|create_contributions|edit_contributions|delete_contributions",
  "bulk.equity-contributions":
    "view_equity_contributions|bulk_upload_equity_contributions|approve_equity_contributions|create_equity_contributions",
  "bulk.loans": "view_loans|create_loans|edit_loans|approve_loans|manage_loan_repayments",
  "bulk.loan-repayments": "manage_loan_repayments|view_loans",
  "bulk.mortgage-repayments": "manage_loan_repayments|view_loans",
  "bulk.internal-mortgage-repayments": "manage_loan_repayments|view_loans",
  "bulk.refund": "manage_payments|view_wallets|view_contributions",
  "bulk.internal-mortgages": "view_loans|create_loans|approve_loans",

  members:
    "view_members|create_members|edit_members|delete_members|bulk_upload_members|manage_member_kyc|view_kyc|approve_kyc|reject_kyc",
  "member-subscriptions": "view_members|manage_member_kyc|view_wallets|manage_payments|view_contributions",
  subscriptions: "manage_settings|view_analytics|view_reports|view_members|view_payment_gateways",

  users: "view_users|create_users|edit_users|delete_users",
  roles: "manage_roles",
  permissions: "manage_roles",
  "custom-domains": "manage_settings|view_white_label",
  settings: "manage_settings|view_activity_logs",
  "landing-page": "view_white_label|manage_white_label|manage_settings",
  "payment-gateways": "view_payment_gateways|manage_payment_gateways|test_payment_gateways",
  "payment-approvals": "manage_payments|view_payment_gateways|view_wallets|view_contributions",
  "payment-evidence": "manage_payments|view_payment_gateways|view_wallets|view_contributions",
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
    { prefix: "blockchain/wallets", key: "blockchain-wallets" },
    { prefix: "blockchain/setup", key: "blockchain-setup" },
    { prefix: "tools/mortgage-calculators", key: "mortgages" },
    { prefix: "post-contribution", key: "contributions" },
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

export function userHasPermissionForAdminHref(
  href: string | undefined,
  permissions: string[] | undefined,
): boolean {
  if (!href) {
    return false
  }
  const key = adminHrefToPermissionKey(href)
  if (!key) {
    return false
  }
  const rule = TENANT_ADMIN_ROUTE_PERMISSIONS[key]
  if (!rule) {
    return false
  }
  return hasAnyPermission(permissions ?? [], rule)
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
