/**
 * Mirrors api/config/tenant_admin_route_permissions.php (pipe-separated OR permissions).
 * Used to show sidebar links only when the user has a matching Spatie permission.
 * Tenant super_admin sees everything (handled via roles in the sidebar).
 */

import { expandTenantPermissions } from "@/lib/admin/expand-tenant-permissions"
import { permissionForAdminMenu } from "@/lib/admin/menu-permissions"
import { filterNavForRaOfficer, isResidentAssociationOfficerOnly } from "@/lib/admin/ra-officer-scope"

export const TENANT_ADMIN_ROUTE_PERMISSIONS: Record<string, string> = {
  dashboard: "view_dashboard",
  "pending-badges":
    "view_analytics|view_reports|view_financial_reports|view_members|view_contributions|view_loans|view_properties|view_equity_contributions|view_wallets|view_investments|manage_payments",

  "bulk.members": "bulk_upload_members",
  "bulk.mortgages": "bulk_upload_mortgages",
  "bulk.properties": "bulk_upload_properties",
  "bulk.property-subscribers": "bulk_property_subscribers",
  "bulk.property-payments": "bulk_property_payments",
  "bulk.equity-asset-repayments": "bulk_equity_repayments",
  "bulk.contribution-asset-repayments": "bulk_contribution_repayments",
  "bulk.issued-documents": "issue_documents",
  "bulk.rollbacks": "rollback_financial_transactions",
  "financial-rollbacks": "rollback_financial_transactions",
  "bulk.lands": "bulk_upload_lands",
  "bulk.land-subscriptions": "bulk_land_subscriptions",
  "land-subscriptions": "manage_land_subscriptions",
  "bulk.land-payments": "bulk_land_payments",
  "bulk.contributions": "bulk_upload_contributions",
  "bulk.equity-contributions": "bulk_upload_equity_contributions",
  "bulk.loans": "bulk_upload_loans",
  "bulk.loan-repayments": "bulk_upload_loan_repayments",
  "bulk.mortgage-repayments": "bulk_mortgage_repayments",
  "bulk.internal-mortgage-repayments": "bulk_internal_mortgage_repayments",
  "bulk.refund": "bulk_refunds",
  "bulk.wallet-transfers": "bulk_wallet_transfers",
  "bulk.internal-mortgages": "bulk_internal_mortgages",
  "bulk.investments": "bulk_upload_investments",

  members:
    "view_members|create_members|edit_members|delete_members|manage_member_kyc|view_kyc|approve_kyc|reject_kyc",
  "member-subscriptions": "view_member_property_subscriptions|bulk_member_subscriptions",
  subscriptions: "view_tenant_subscription",
  subscription: "view_tenant_subscription",

  users: "view_users|create_users|edit_users|delete_users|reset_user_passwords",
  roles: "view_roles|manage_roles",
  permissions: "view_permissions|manage_permissions",
  "custom-domains": "manage_custom_domains",
  settings: "manage_settings",
  "landing-page": "manage_landing_page|manage_landing_page_templates",
  "payment-gateways": "view_payment_gateways|manage_payment_gateways|test_payment_gateways",
  "payment-approvals": "manage_payment_approvals",
  "payment-evidence": "manage_payment_approvals",
  "wallet-transfer": "manage_wallet_transfers",
  "white-label": "view_white_label|manage_white_label",
  wallets: "view_wallets|manage_wallets|view_pending_wallets|view_wallet_transactions",
  "investment-withdrawal-requests": "view_investment_withdrawals",
  investments:
    "view_investments|create_investments|edit_investments|approve_investments|view_investment_plans|create_investment_plans|edit_investment_plans|delete_investment_plans",
  refunds: "view_refunds|manage_refunds",
  "refund-member": "manage_refunds",
  "mortgage-providers": "view_mortgage_providers",
  mortgages:
    "view_mortgages|create_mortgages|edit_mortgages|delete_mortgages|approve_mortgages|reject_mortgages|disburse_mortgages",
  contributions:
    "view_contributions|create_contributions|edit_contributions|delete_contributions|approve_contributions|reject_contributions",
  loans:
    "view_loans|create_loans|edit_loans|approve_loans|reject_loans|disburse_loans|manage_loan_repayments|delete_loans|manage_loan_stoppage",
  "loan-repayments": "manage_loan_repayments",
  properties: "view_properties|create_properties|edit_properties|delete_properties",
  lands: "view_lands|create_lands|edit_lands|delete_lands",
  "property-statistics": "view_properties",
  "property-payment-plans": "view_property_payment_plans",
  "property-subscriptions": "manage_property_allottees|approve_allotments",
  "internal-mortgages": "view_internal_mortgages",
  "eoi-forms": "manage_eoi_forms",
  "land-eoi-forms": "manage_land_eoi",
  "investment-plans": "view_investment_plans|create_investment_plans|edit_investment_plans|delete_investment_plans",
  "contribution-plans":
    "view_contribution_plans|create_contribution_plans|edit_contribution_plans|delete_contribution_plans",
  "equity-contributions":
    "view_equity_contributions|approve_equity_contributions|reject_equity_contributions|create_equity_contributions",
  "equity-plans": "manage_equity_plans",
  "loan-products": "view_loan_products|create_loan_plans|edit_loan_plans|delete_loan_plans",
  "statutory-charges":
    "view_statutory_charges|create_statutory_charges|edit_statutory_charges|delete_statutory_charges|approve_statutory_charges|reject_statutory_charges|manage_statutory_charge_types|manage_statutory_charge_departments|manage_statutory_charge_payments",
  "property-management":
    "manage_property_estates|manage_property_allottees|view_maintenance|create_maintenance|edit_maintenance|assign_maintenance|complete_maintenance|delete_maintenance|view_property_ops_reports|record_house_repayments|manage_land_subscriptions",
  "blockchain-setup": "manage_blockchain_setup",
  "blockchain-wallets": "manage_blockchain_wallets",
  blockchain: "view_blockchain|manage_blockchain",
  "mail-service":
    "view_mail|view_mail_inbox|view_mail_sent|view_mail_outbox|view_mail_drafts|compose_mail|reply_mail|assign_mail|bulk_mail|delete_mail",
  reports:
    "view_reports|export_reports|view_member_reports|view_financial_reports|view_contribution_reports|view_refund_reports|view_equity_reports|view_investment_reports|view_loan_reports|view_mail_reports|view_audit_reports|view_property_reports|view_land_reports",
  accounting:
    "view_accounting|manage_chart_of_accounts|manage_posting_rules|manage_financial_periods|post_journal_entries|view_gl_reports|generate_member_statements|reopen_locked_periods|view_property_ledger",
  office:
    "view_office|manage_office_org_units|create_office_documents|route_office_documents|approve_office_documents|minute_office_documents|sign_office_documents|archive_office_documents|manage_office_workflows|manage_office_templates|view_office_audit|manage_office_folders|manage_office_tags|checkout_office_documents|manage_office_correspondence|manage_office_retention|approve_office_disposal|view_office_reports|manage_office_circulars|use_office_ai|sync_office_source_files|view_office_cases|manage_office_cases|assign_office_cases|resolve_office_cases|view_internal_case_notes|escalate_office_cases|manage_office_case_sla|claim_office_cases|workflow.review|workflow.recommend|workflow.approve|workflow.reject|workflow.return|workflow.assign|workflow.reassign|workflow.bulk_review|workflow.bulk_recommend|workflow.bulk_approve|workflow.configure|workflow.delegate",
  ecpm:
    "view_ecpm|manage_ecpm_estates|manage_ecpm_projects|manage_ecpm_parties|manage_ecpm_drawings|manage_ecpm_boqs|manage_ecpm_quotations|manage_ecpm_contracts|approve_ecpm_documents|view_ecpm_audit|manage_ecpm_settings|manage_ecpm_site_ops|manage_ecpm_procurement|manage_ecpm_handover|view_ecpm_client_portal|manage_ecpm_ai|view_ecpm_reports",
  "activity-logs": "view_activity_logs",
  "audit-logs": "view_audit_logs",
  documents: "view_documents|upload_documents|approve_documents|reject_documents|delete_documents",
  "issued-documents":
    "view_issued_documents|issue_documents|approve_issued_documents|revoke_issued_documents|reissue_documents|download_issued_documents|verify_documents_admin|manage_letterhead_settings|manage_document_templates",
  notifications: "view_notifications|manage_notifications",
  profile: "access_admin_panel|view_users|view_members|ra.estate.view",
  valuations: "view_valuations|run_valuation|override_valuation|approve_valuation|manage_valuation_settings",
  "change-requests": "view_change_requests|manage_change_requests",
  ownership: "view_ownership|manage_ownership|manage_ownership_settings|view_change_requests",
  "property-improvements": "view_property_improvements|manage_property_improvements",
  "payment-routing": "manage_payment_routing",
  "contact-centre": "manage_contact_centre",
  "platform-config": "manage_platform_config",
  "resident-association":
    "ra.estate.view|ra.estate.manage|ra.house.view|ra.house.manage|ra.charge.manage|ra.payment.view|ra.payment.verify|ra.payment.reject|ra.payment.correct|ra.discrepancy.view|ra.revenue.view|ra.expenditure.manage|ra.reports.view|ra.settings.manage|ra.notice.manage",
  collaterals: "view_collateral|create_collateral|verify_collateral|manage_collateral_transfer|manage_collateral_rules",
  announcements:
    "view_announcements|create_announcement|publish_announcement|manage_announcement_settings|manage_notification_templates|manage_notifications",
  "payment-receipts": "view_receipts|issue_receipt|cancel_receipt",
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
    { prefix: "accounting", key: "accounting" },
    { prefix: "office", key: "office" },
    { prefix: "ecpm", key: "ecpm" },
    { prefix: "payment-receipts", key: "payment-receipts" },
    { prefix: "issued-documents", key: "issued-documents" },
    { prefix: "valuations", key: "valuations" },
    { prefix: "collaterals", key: "collaterals" },
    { prefix: "announcements", key: "announcements" },
    { prefix: "change-requests", key: "change-requests" },
    { prefix: "property-improvements", key: "property-improvements" },
    { prefix: "payment-routing", key: "payment-routing" },
    { prefix: "contact-centre", key: "contact-centre" },
    { prefix: "platform-config", key: "platform-config" },
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
  { test: (h) => h === "/admin/permissions/new", permission: "manage_permissions" },
  { test: (h) => /^\/admin\/permissions\/[^/]+\/edit$/.test(h), permission: "manage_permissions" },
  { test: (h) => h === "/admin/loans/new" || h === "/admin/loans/apply", permission: "create_loans" },
  { test: (h) => /^\/admin\/loans\/[^/]+\/edit$/.test(h), permission: "edit_loans" },
  { test: (h) => h === "/admin/contributions/new", permission: "create_contributions" },
  { test: (h) => /^\/admin\/contributions\/[^/]+\/edit$/.test(h), permission: "edit_contributions" },
  { test: (h) => h === "/admin/properties/new", permission: "create_properties" },
  { test: (h) => /^\/admin\/properties\/[^/]+\/edit$/.test(h), permission: "edit_properties" },
  { test: (h) => h === "/admin/lands/new", permission: "create_lands" },
  { test: (h) => /^\/admin\/lands\/[^/]+\/edit$/.test(h), permission: "edit_lands" },
  { test: (h) => h === "/admin/documents/new", permission: "upload_documents" },
  { test: (h) => h === "/admin/mail-service/compose", permission: "compose_mail" },
  { test: (h) => /^\/admin\/bulk-upload\/members/.test(h), permission: "bulk_upload_members" },
  { test: (h) => /^\/admin\/bulk-upload\/contributions/.test(h), permission: "bulk_upload_contributions" },
  { test: (h) => /^\/admin\/bulk-upload\/loans/.test(h), permission: "bulk_upload_loans" },
  { test: (h) => /^\/admin\/bulk-upload\/properties/.test(h), permission: "bulk_upload_properties" },
  { test: (h) => /^\/admin\/bulk-upload\/issued-documents/.test(h), permission: "issue_documents" },
  { test: (h) => /^\/admin\/statutory-charges\/new/.test(h), permission: "create_statutory_charges" },
  { test: (h) => /^\/admin\/statutory-charges\/[^/]+\/edit$/.test(h), permission: "edit_statutory_charges" },
  { test: (h) => /^\/admin\/investment-plans\/new/.test(h), permission: "create_investment_plans" },
  { test: (h) => /^\/admin\/investment-plans\/[^/]+\/edit$/.test(h), permission: "edit_investment_plans" },
  { test: (h) => /^\/admin\/loan-products\/new/.test(h), permission: "create_loan_plans" },
  { test: (h) => /^\/admin\/loan-products\/[^/]+\/edit$/.test(h), permission: "edit_loan_plans" },
  { test: (h) => /^\/admin\/contribution-plans\/new/.test(h), permission: "create_contribution_plans" },
  { test: (h) => /^\/admin\/contribution-plans\/[^/]+\/edit$/.test(h), permission: "edit_contribution_plans" },
  { test: (h) => /^\/admin\/equity-plans\/new/.test(h), permission: "manage_equity_plans" },
  { test: (h) => /^\/admin\/equity-plans\/[^/]+\/edit$/.test(h), permission: "manage_equity_plans" },
  { test: (h) => /^\/admin\/payment-gateways\/new/.test(h), permission: "manage_payment_gateways" },
  { test: (h) => /^\/admin\/payment-gateways\/[^/]+\/edit$/.test(h), permission: "manage_payment_gateways" },
  { test: (h) => h === "/admin/resident-association/associations" || h.startsWith("/admin/resident-association/associations/"), permission: "ra.estate.manage" },
  { test: (h) => h === "/admin/office/workflow/settings" || h.startsWith("/admin/office/workflow/settings/"), permission: "workflow.configure" },
  { test: (h) => h === "/admin/office/workflow/delegations" || h.startsWith("/admin/office/workflow/delegations/"), permission: "workflow.delegate" },
  { test: (h) => h === "/admin/office/cases/sla" || h.startsWith("/admin/office/cases/sla"), permission: "manage_office_case_sla" },
  { test: (h) => h === "/admin/office/contributions" || h.startsWith("/admin/office/contributions/"), permission: "view_office_contributions" },
  { test: (h) => h === "/admin/office/inbox", permission: "approve_office_documents" },
  { test: (h) => h === "/admin/office/outbox", permission: "create_office_documents" },
  { test: (h) => h === "/admin/office/documents" || h.startsWith("/admin/office/documents/"), permission: "create_office_documents" },
  { test: (h) => h === "/admin/office/library", permission: "manage_office_folders" },
  { test: (h) => h === "/admin/office/memos/new", permission: "create_office_documents" },
  { test: (h) => h === "/admin/office/correspondence" || h.startsWith("/admin/office/correspondence/"), permission: "manage_office_correspondence" },
  { test: (h) => h === "/admin/office/circulars", permission: "manage_office_circulars" },
  { test: (h) => h === "/admin/office/reports", permission: "view_office_reports" },
  { test: (h) => h === "/admin/office/ai", permission: "use_office_ai" },
  { test: (h) => h === "/admin/office/org-units", permission: "manage_office_org_units" },
  { test: (h) => h === "/admin/office/workflows", permission: "manage_office_workflows" },
  { test: (h) => h === "/admin/office/categories", permission: "manage_office_templates" },
  { test: (h) => h === "/admin/office/templates", permission: "manage_office_templates" },
  { test: (h) => h === "/admin/office/workflow/queue" || h.startsWith("/admin/office/workflow/queue/"), permission: "workflow.review|workflow.recommend|workflow.approve" },
  { test: (h) => h === "/admin/office/workflow/tasks" || h.startsWith("/admin/office/workflow/tasks/"), permission: "workflow.review|workflow.recommend|workflow.approve" },
  { test: (h) => h === "/admin/office/tasks", permission: "workflow.review|workflow.recommend|workflow.approve|view_office_cases" },
  { test: (h) => h === "/admin/office/cases" || h.startsWith("/admin/office/cases/"), permission: "view_office_cases|claim_office_cases" },
]

function normalizeAdminHref(href: string): string {
  const trimmed = href.replace(/\/+$/, "")
  return trimmed.length > 0 ? trimmed : "/admin"
}

function hasAnyPermission(userPerms: string[], requiredPipeList: string): boolean {
  const required = expandTenantPermissions(
    requiredPipeList
      .split("|")
      .map((p) => p.trim())
      .filter(Boolean),
  )
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
      return hasAnyPermission(perms, rule.permission)
    }
  }

  const menuPermission = permissionForAdminMenu(normalized)
  if (menuPermission) {
    return hasAnyPermission(perms, menuPermission)
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

  const filtered = navItems
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

  if (isResidentAssociationOfficerOnly({ roles: roleNames, role: legacyUserRole, permissions: perms })) {
    return filterNavForRaOfficer(filtered, perms)
  }

  return filtered
}
