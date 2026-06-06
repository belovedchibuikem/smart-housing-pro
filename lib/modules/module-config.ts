export const ALWAYS_VISIBLE_ADMIN_HREFS = new Set([
  "/admin",
  "/admin/subscriptions",
  "/admin/subscription",
])

export const ALWAYS_VISIBLE_MEMBER_HREFS = new Set([
  "/dashboard",
  "/dashboard/subscriptions",
])

/** Admin nav group label → module slug */
export const ADMIN_NAV_MODULE_MAP: Record<string, string> = {
  Members: "members",
  "Admin Users": "admin_users",
  "Roles & Permissions": "roles_permissions",
  "User Wallets": "wallet",
  Contributions: "contributions",
  "Equity Contributions": "equity",
  Loans: "loans",
  Refund: "refunds",
  Mortgages: "mortgages",
  Properties: "properties",
  Investments: "investments",
  "Statutory Charges": "statutory",
  "Property Management": "property_management",
  Blockchain: "blockchain",
  "Mail Service": "mail",
  Reports: "reports",
  "Activity Logs": "activity_logs",
  Notifications: "notifications",
  Documents: "documents",
  "Landing Page": "landing_page",
  "Payment Manager": "payment_manager",
  "White Label": "white_label",
  "Custom Domains": "white_label",
  Settings: "settings",
}

/** Member nav label → module slug */
export const MEMBER_NAV_MODULE_MAP: Record<string, string> = {
  "My Wallet": "wallet",
  "My Contribution": "contributions",
  "Equity Contributions": "equity",
  "My Loans": "loans",
  "My Investment": "investments",
  "My Properties": "properties",
  "Statutory Charges": "statutory",
  "Property Management": "property_management",
  "Mail Service": "mail",
  Report: "reports",
  AI: "ai",
  "Blockchain Ledger": "blockchain",
  "Refunds & Requests": "refunds",
  "Withdraw Membership": "withdraw_membership",
  Settings: "settings",
}

/** Admin href path segment → module slug */
export const ADMIN_HREF_MODULE_MAP: Record<string, string> = {
  members: "members",
  "member-subscriptions": "members",
  users: "admin_users",
  roles: "roles_permissions",
  permissions: "roles_permissions",
  wallets: "wallet",
  contributions: "contributions",
  "post-contribution": "contributions",
  "contribution-plans": "contributions",
  "equity-contributions": "equity",
  "equity-plans": "equity",
  loans: "loans",
  "loan-repayments": "loans",
  "loan-products": "loans",
  refunds: "refunds",
  "refund-member": "refunds",
  mortgages: "mortgages",
  "mortgage-providers": "mortgages",
  "internal-mortgages": "mortgages",
  tools: "mortgages",
  properties: "properties",
  lands: "properties",
  "eoi-forms": "properties",
  "land-eoi-forms": "properties",
  "property-payment-plans": "properties",
  "land-subscriptions": "properties",
  investments: "investments",
  "investment-plans": "investments",
  "investment-withdrawal-requests": "investments",
  "statutory-charges": "statutory",
  "property-management": "property_management",
  blockchain: "blockchain",
  "mail-service": "mail",
  reports: "reports",
  "activity-logs": "activity_logs",
  notifications: "notifications",
  documents: "documents",
  "landing-page": "landing_page",
  "payment-gateways": "payment_manager",
  "payment-approvals": "payment_manager",
  "white-label": "white_label",
  "custom-domains": "white_label",
  settings: "settings",
}

/** Member href path segment → module slug */
export const MEMBER_HREF_MODULE_MAP: Record<string, string> = {
  wallet: "wallet",
  contributions: "contributions",
  equity: "equity",
  "equity-contributions": "equity",
  "equity-wallet": "equity",
  "equity-plans": "equity",
  loans: "loans",
  investments: "investments",
  properties: "properties",
  "statutory-charges": "statutory",
  "property-management": "property_management",
  mail: "mail",
  "mail-service": "mail",
  reports: "reports",
  "ai-recommendations": "ai",
  "blockchain-ledger": "blockchain",
  refunds: "refunds",
  "withdraw-membership": "withdraw_membership",
  settings: "settings",
}

export const DASHBOARD_CARD_MODULES: Record<string, string> = {
  "Total Contributions": "contributions",
  "Active Loans": "loans",
  "Total Investments": "investments",
  "Wallet Balance": "wallet",
}

export function resolveAdminHrefModule(href: string): string | null {
  const normalized = href.split("?")[0].replace(/\/$/, "")
  if (ALWAYS_VISIBLE_ADMIN_HREFS.has(normalized)) {
    return null
  }
  const segment = normalized.replace(/^\/admin\/?/, "").split("/")[0]
  if (!segment) return null
  if (segment === "bulk") {
    const sub = normalized.replace(/^\/admin\/bulk\/?/, "").split("/")[0]
    return sub ? ADMIN_HREF_MODULE_MAP[sub] ?? null : null
  }
  return ADMIN_HREF_MODULE_MAP[segment] ?? null
}

export function resolveMemberHrefModule(href: string): string | null {
  const normalized = href.split("?")[0].replace(/\/$/, "")
  if (ALWAYS_VISIBLE_MEMBER_HREFS.has(normalized)) {
    return null
  }
  const segment = normalized.replace(/^\/dashboard\/?/, "").split("/")[0]
  if (!segment) return null
  return MEMBER_HREF_MODULE_MAP[segment] ?? null
}

export function hasModuleAccess(enabledModules: string[], slug: string | null | undefined): boolean {
  if (!slug) return true
  if (enabledModules.length === 0) return false
  return enabledModules.includes(slug)
}
