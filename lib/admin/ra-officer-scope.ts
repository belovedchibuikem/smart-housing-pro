/**
 * Resident Association executives must only see residence work — never cooperative
 * finance, members, loans, or other tenant-admin modules.
 */

const TENANT_WIDE_STAFF_ROLES = new Set([
  "super_admin",
  "admin",
  "system_admin",
  "finance_manager",
  "accountant",
  "loan_officer",
  "property_manager",
  "manager",
  "member_manager",
  "document_manager",
  "investment_manager",
])

function normalizeRole(role: string | undefined | null): string {
  return role?.toLowerCase().replace(/-/g, "_") ?? ""
}

export function isResidentAssociationOfficerOnly(input: {
  roles?: string[]
  role?: string
  permissions?: string[]
} | null | undefined): boolean {
  if (!input) return false
  const roles = (input.roles ?? []).map(normalizeRole).filter(Boolean)
  const legacy = normalizeRole(input.role)
  const all = legacy && !roles.includes(legacy) ? [...roles, legacy] : roles
  if (!all.includes("resident_association_officer")) return false
  return !all.some((r) => TENANT_WIDE_STAFF_ROLES.has(r))
}

const RA_OFFICE_HREF_PREFIXES = [
  "/admin/office",
  "/admin/office/cases",
  "/admin/office/workflow/queue",
  "/admin/office/workflow/tasks",
  "/admin/office/tasks",
]

const RA_NAV_HREF_PREFIXES = [
  "/admin",
  "/admin/profile",
  "/admin/resident-association",
  ...RA_OFFICE_HREF_PREFIXES,
]

function hrefAllowed(href: string, prefixes: string[]): boolean {
  const normalized = href.replace(/\/+$/, "") || "/admin"
  return prefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

export function isRaOfficerAllowedAdminHref(href: string | undefined, permissions?: string[]): boolean {
  if (!href) return false
  const normalized = href.replace(/\/+$/, "") || "/admin"
  if (normalized === "/admin") return true
  if (normalized === "/admin/resident-association/associations" || normalized.startsWith("/admin/resident-association/associations/")) {
    return (permissions ?? []).includes("ra.estate.manage")
  }
  if (normalized.startsWith("/admin/resident-association")) return true
  if (normalized === "/admin/office/workflow/settings") return false
  if (normalized === "/admin/office/workflow/delegations") return false
  if (normalized === "/admin/office/cases/sla") return false
  if (normalized === "/admin/office/contributions") return false
  if (normalized === "/admin/office/inbox" || normalized === "/admin/office/outbox") return false
  if (normalized === "/admin/office/documents" || normalized.startsWith("/admin/office/documents/")) return false
  if (normalized === "/admin/office/library") return false
  if (normalized === "/admin/office/memos/new") return false
  if (normalized === "/admin/office/correspondence") return false
  if (normalized === "/admin/office/circulars") return false
  if (normalized === "/admin/office/reports") return false
  if (normalized === "/admin/office/ai") return false
  if (normalized === "/admin/office/org-units") return false
  if (normalized === "/admin/office/workflows") return false
  if (normalized === "/admin/office/categories") return false
  if (normalized === "/admin/office/templates") return false
  return hrefAllowed(normalized, RA_NAV_HREF_PREFIXES)
}

export function filterNavForRaOfficer<T extends { href?: string; subItems?: T[]; label?: string }>(
  items: T[],
  permissions?: string[],
): T[] {
  return items
    .map((item) => {
      if (item.href) {
        return isRaOfficerAllowedAdminHref(item.href, permissions) ? item : null
      }
      if (item.subItems?.length) {
        const subs = filterNavForRaOfficer(item.subItems, permissions)
        if (subs.length === 0) return null
        return { ...item, subItems: subs }
      }
      return null
    })
    .filter((x): x is T => x !== null)
}
