/**
 * Visual grouping for the tenant admin sidebar.
 * Labels must match ADMIN_NAV_ITEMS. Permission and plan/module filters
 * still run on that flat tree; this file only decides how the result is shown.
 */

export type AdminNavSectionId =
  | "home"
  | "people"
  | "finance"
  | "property"
  | "operations"
  | "communications"
  | "platform"
  | "more"

export type AdminNavSection = {
  id: AdminNavSectionId
  label: string
  short: string
  description: string
  /** Top-level ADMIN_NAV_ITEMS labels, in display order. */
  labels: string[]
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: "home",
    label: "Home",
    short: "Home",
    description: "Dashboard, plan, and reports",
    labels: ["Dashboard", "Subscription", "Reports"],
  },
  {
    id: "people",
    label: "People",
    short: "People",
    description: "Members, staff, and access",
    labels: ["Members", "Admin Users", "Roles & Permissions"],
  },
  {
    id: "finance",
    label: "Finance",
    short: "Finance",
    description: "Wallets, lending, charges, and ledgers",
    labels: [
      "User Wallets",
      "Contributions",
      "Equity Contributions",
      "Loans",
      "Mortgages",
      "Investments",
      "Refund",
      "Statutory Charges",
      "Accounting",
      "Payment Manager",
      "Financial Rollbacks",
    ],
  },
  {
    id: "property",
    label: "Property",
    short: "Property",
    description: "Houses, land, estates, and residents",
    labels: ["Houses / Buildings", "Land", "Estates & Ops", "Resident Association"],
  },
  {
    id: "operations",
    label: "Operations",
    short: "Ops",
    description: "Construction and the digital office",
    labels: ["Construction (ECPM)", "Digital Office"],
  },
  {
    id: "communications",
    label: "Communications",
    short: "Comms",
    description: "Mail, notices, and documents",
    labels: ["Mail Service", "Notifications", "Public Notices", "Documents", "Document Issuing"],
  },
  {
    id: "platform",
    label: "Setup",
    short: "Setup",
    description: "Website, branding, and system tools",
    labels: ["Landing Page", "White Label", "Custom Domains", "Blockchain", "System"],
  },
]

type NavNode = {
  label: string
  href?: string
  subItems?: NavNode[]
}

function hrefOwnsPath(href: string, pathname: string): boolean {
  const path = href.split("?")[0].replace(/\/$/, "") || "/"
  if (path === "/admin") return pathname === "/admin"
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function navItemOwnsPath(item: NavNode, pathname: string): boolean {
  if (item.href && hrefOwnsPath(item.href, pathname)) return true
  return item.subItems?.some((sub) => navItemOwnsPath(sub, pathname)) ?? false
}

export function bucketAdminNav<T extends { label: string }>(
  items: T[],
): { section: AdminNavSection; items: T[] }[] {
  const byLabel = new Map(items.map((item) => [item.label, item]))
  const used = new Set<string>()
  const groups: { section: AdminNavSection; items: T[] }[] = []

  for (const section of ADMIN_NAV_SECTIONS) {
    const matched: T[] = []
    for (const label of section.labels) {
      const item = byLabel.get(label)
      if (!item || used.has(label)) continue
      used.add(label)
      matched.push(item)
    }
    if (matched.length > 0) groups.push({ section, items: matched })
  }

  const rest = items.filter((item) => !used.has(item.label))
  if (rest.length > 0) {
    groups.push({
      section: {
        id: "more",
        label: "More",
        short: "More",
        description: "Other tools on this plan",
        labels: rest.map((item) => item.label),
      },
      items: rest,
    })
  }

  return groups
}

export function findAdminSectionId<T extends NavNode>(
  items: T[],
  pathname: string,
): AdminNavSectionId | null {
  const groups = bucketAdminNav(items)
  for (const group of groups) {
    if (group.items.some((item) => navItemOwnsPath(item, pathname))) {
      return group.section.id
    }
  }
  return groups[0]?.section.id ?? null
}
