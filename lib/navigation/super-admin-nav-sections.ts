/**
 * Visual grouping for the platform super-admin sidebar.
 * Labels must match SUPER_ADMIN_NAV_ITEMS.
 */

export type SuperAdminNavSectionId =
  | "home"
  | "customers"
  | "billing"
  | "platform"
  | "site"
  | "access"
  | "more"

export type SuperAdminNavSection = {
  id: SuperAdminNavSectionId
  label: string
  description: string
  labels: string[]
}

export const SUPER_ADMIN_NAV_SECTIONS: SuperAdminNavSection[] = [
  {
    id: "home",
    label: "Home",
    description: "Overview, analytics, and activity",
    labels: ["Dashboard", "Analytics", "Activity Logs"],
  },
  {
    id: "customers",
    label: "Customers",
    description: "Cooperatives, marketplace, and agents",
    labels: ["Businesses", "Marketplace", "Fraud queue", "Agents"],
  },
  {
    id: "billing",
    label: "Billing",
    description: "Plans, gateways, and payments",
    labels: [
      "Business Subscription",
      "Member Subscriptions",
      "Payment Gateways",
      "Payment Approvals",
      "Invoices",
    ],
  },
  {
    id: "platform",
    label: "Platform",
    description: "Modules, apps, jobs, and domains",
    labels: ["Modules", "App Versions", "Cron Jobs", "Domain Requests", "White Label Packages"],
  },
  {
    id: "site",
    label: "Website",
    description: "Public SaaS pages and branding",
    labels: ["SaaS Landing Pages"],
  },
  {
    id: "access",
    label: "Access",
    description: "Admins, permissions, mail, and settings",
    labels: ["Mail Service", "Super Admins", "Roles & Permissions", "Platform Settings"],
  },
]

type NavNode = {
  label: string
  href?: string
  subItems?: NavNode[]
}

function hrefOwnsPath(href: string, pathname: string): boolean {
  const path = href.split("?")[0].replace(/\/$/, "") || "/"
  if (path === "/super-admin") return pathname === "/super-admin"
  return pathname === path || pathname.startsWith(`${path}/`)
}

export function navItemOwnsPath(item: NavNode, pathname: string): boolean {
  if (item.href && hrefOwnsPath(item.href, pathname)) return true
  return item.subItems?.some((sub) => navItemOwnsPath(sub, pathname)) ?? false
}

export function bucketSuperAdminNav<T extends { label: string }>(
  items: T[],
): { section: SuperAdminNavSection; items: T[] }[] {
  const byLabel = new Map(items.map((item) => [item.label, item]))
  const used = new Set<string>()
  const groups: { section: SuperAdminNavSection; items: T[] }[] = []

  for (const section of SUPER_ADMIN_NAV_SECTIONS) {
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
        description: "Other platform tools",
        labels: rest.map((item) => item.label),
      },
      items: rest,
    })
  }

  return groups
}

export function findSuperAdminSectionId<T extends NavNode>(
  items: T[],
  pathname: string,
): SuperAdminNavSectionId | null {
  const groups = bucketSuperAdminNav(items)
  for (const group of groups) {
    if (group.items.some((item) => navItemOwnsPath(item, pathname))) {
      return group.section.id
    }
  }
  return groups[0]?.section.id ?? null
}
