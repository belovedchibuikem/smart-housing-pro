"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Mail,
  Settings,
  BarChart3,
  Shield,
  X,
  ChevronDown,
  CreditCard,
  FileText,
  Activity,
  Blocks,
  Globe,
  Palette,
  CheckCircle,
  FileEdit,
  ImageIcon,
  MessageSquare,
  Star,
  UserCircle,
  Calendar,
  Heart,
  Smartphone,
  Store,
  Search,
  Clock,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useMemo, useRef } from "react"
import { getSuperAdminPendingBadges, type SuperAdminPendingBadgeCounts } from "@/lib/api/client"
import { useSidebarNavigation } from "@/hooks/use-sidebar-navigation"
import { itemMatchesPathname } from "@/lib/navigation/sidebar-nav"
import { filterNavTreeByQuery } from "@/lib/navigation/nav-search"
import {
  bucketSuperAdminNav,
  findSuperAdminSectionId,
  type SuperAdminNavSectionId,
} from "@/lib/navigation/super-admin-nav-sections"
import { Input } from "@/components/ui/input"

const SUPER_ADMIN_BADGE_BY_HREF: Partial<Record<string, keyof SuperAdminPendingBadgeCounts>> = {
  "/super-admin/payment-approvals": "platform_payment_approvals_pending",
  "/super-admin/subscriptions": "business_subscription_payments_pending",
  "/super-admin/member-subscriptions/list": "member_subscription_payments_pending",
  "/super-admin/domain-requests": "domain_requests_pending",
}

function SuperPendingBadge({ count }: { count: number }) {
  if (count < 1) return null
  const label = count > 99 ? "99+" : String(count)
  return (
    <Badge
      variant="destructive"
      className="h-5 min-w-5 rounded-full px-1.5 text-[11px] font-semibold tabular-nums leading-none"
    >
      {label}
    </Badge>
  )
}

interface NavItem {
  href?: string
  label: string
  icon: LucideIcon
  subItems?: NavItem[]
}

const SECTION_ICONS: Record<SuperAdminNavSectionId, LucideIcon> = {
  home: LayoutDashboard,
  customers: Building2,
  billing: CreditCard,
  platform: Blocks,
  site: FileEdit,
  access: Shield,
  more: Palette,
}

export const SUPER_ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/super-admin/marketplace", label: "Marketplace", icon: Store },
  { href: "/super-admin/marketplace-fraud", label: "Fraud queue", icon: Shield },
  { href: "/super-admin/marketplace-agents", label: "Agents", icon: Users },
  { href: "/super-admin/modules", label: "Modules", icon: Blocks },
  {
    label: "Business Subscription",
    icon: CreditCard,
    subItems: [
      { href: "/super-admin/subscriptions", label: "All Subscriptions", icon: CreditCard },
      { href: "/super-admin/packages", label: "Packages", icon: Package },
    ],
  },
  {
    label: "Member Subscriptions",
    icon: Package,
    subItems: [
      { href: "/super-admin/member-subscriptions", label: "Plans", icon: Package },
      { href: "/super-admin/member-subscriptions/list", label: "Member Subscriptions", icon: Users },
    ],
  },
  { href: "/super-admin/payment-gateways", label: "Payment Gateways", icon: CreditCard },
  { href: "/super-admin/app-versions", label: "App Versions", icon: Smartphone },
  { href: "/super-admin/cron-jobs", label: "Cron Jobs", icon: Clock },
  { href: "/super-admin/payment-approvals", label: "Payment Approvals", icon: CheckCircle },
  { href: "/super-admin/invoices", label: "Invoices", icon: FileText },
  { href: "/super-admin/domain-requests", label: "Domain Requests", icon: Globe },
  { href: "/super-admin/white-label-packages", label: "White Label Packages", icon: Palette },
  { href: "/super-admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/super-admin/activity", label: "Activity Logs", icon: Activity },
  { href: "/super-admin/mail", label: "Mail Service", icon: Mail },
  { href: "/super-admin/admins", label: "Super Admins", icon: Users },
  {
    label: "Roles & Permissions",
    icon: Shield,
    subItems: [
      { href: "/super-admin/roles", label: "Roles", icon: Shield },
      { href: "/super-admin/permissions", label: "Permissions", icon: Shield },
    ],
  },
  {
    label: "SaaS Landing Pages",
    icon: FileEdit,
    subItems: [
      { href: "/super-admin/saas-pages", label: "Page Sections", icon: FileEdit },
      { href: "/super-admin/saas-pages/branding", label: "Logo & Branding", icon: ImageIcon },
      { href: "/super-admin/saas-pages/community", label: "Community", icon: MessageSquare },
      { href: "/super-admin/saas-pages/testimonials", label: "Testimonials", icon: Star },
      { href: "/super-admin/saas-pages/team", label: "Team", icon: UserCircle },
      { href: "/super-admin/saas-pages/milestones", label: "Milestones", icon: Calendar },
      { href: "/super-admin/saas-pages/values", label: "Values", icon: Heart },
    ],
  },
  { href: "/super-admin/settings", label: "Platform Settings", icon: Settings },
]

interface SuperAdminSidebarProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function SuperAdminSidebar({ mobileMenuOpen, setMobileMenuOpen }: SuperAdminSidebarProps) {
  const pathname = usePathname()
  const [pendingBadges, setPendingBadges] = useState<SuperAdminPendingBadgeCounts | null>(null)
  const [navQuery, setNavQuery] = useState("")
  const [railTip, setRailTip] = useState<{ label: string; top: number; left: number } | null>(null)
  const [pinnedSectionId, setPinnedSectionId] = useState<SuperAdminNavSectionId | null>(null)
  const [pinnedForPath, setPinnedForPath] = useState(pathname)
  const navScrollRef = useRef<HTMLDivElement>(null)

  if (pinnedForPath !== pathname) {
    setPinnedForPath(pathname)
    setPinnedSectionId(null)
  }

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await getSuperAdminPendingBadges()
        if (!cancelled && res?.success && res.counts) {
          setPendingBadges(res.counts)
        }
      } catch {
        if (!cancelled) setPendingBadges(null)
      }
    }
    load()
    const t = setInterval(load, 120000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  const badgeCountForHref = (href: string | undefined): number => {
    if (!href || !pendingBadges) return 0
    const key = SUPER_ADMIN_BADGE_BY_HREF[href]
    if (!key) return 0
    const n = pendingBadges[key]
    return typeof n === "number" && n > 0 ? n : 0
  }

  const badgeCountForItem = (item: NavItem): number => {
    if (item.href) return badgeCountForHref(item.href)
    if (!item.subItems?.length) return 0
    return item.subItems.reduce((sum, subItem) => sum + badgeCountForItem(subItem), 0)
  }

  const sections = useMemo(() => bucketSuperAdminNav(SUPER_ADMIN_NAV_ITEMS), [])
  const searching = navQuery.trim().length > 0
  const routedSectionId = findSuperAdminSectionId(SUPER_ADMIN_NAV_ITEMS, pathname)
  const activePin = pinnedForPath === pathname ? pinnedSectionId : null
  const pinnedIsVisible = activePin != null && sections.some((group) => group.section.id === activePin)
  const visibleSectionId = (pinnedIsVisible ? activePin : routedSectionId) ?? sections[0]?.section.id ?? null
  const currentGroup = sections.find((group) => group.section.id === visibleSectionId) ?? sections[0] ?? null
  const searchGroups = searching
    ? sections
        .map((group) => ({
          section: group.section,
          items: filterNavTreeByQuery(group.items, navQuery),
        }))
        .filter((group) => group.items.length > 0)
    : []

  const { toggleMenu, isMenuOpen } = useSidebarNavigation(SUPER_ADMIN_NAV_ITEMS, pathname, "flat")

  useEffect(() => {
    if (searching) return
    const container = navScrollRef.current
    if (!container) return
    const timer = window.setTimeout(() => {
      const active = container.querySelector<HTMLElement>('[data-nav-active="true"]')
      if (!active) return
      const delta = active.getBoundingClientRect().top - container.getBoundingClientRect().top
      if (delta < 8 || delta > container.clientHeight - 48) {
        container.scrollTop += delta - 56
      }
    }, 220)
    return () => window.clearTimeout(timer)
  }, [pathname, visibleSectionId, searching])

  const linkIsCurrent = (href: string | undefined, candidates: string[]): boolean => {
    if (!href) return false
    const path = href.split("?")[0].replace(/\/$/, "") || "/"
    let best: string | null = null
    for (const candidate of candidates) {
      const candidatePath = candidate.split("?")[0].replace(/\/$/, "") || "/"
      const matches =
        candidatePath === "/super-admin"
          ? pathname === "/super-admin"
          : pathname === candidatePath || pathname.startsWith(`${candidatePath}/`)
      if (!matches) continue
      if (!best || candidatePath.length > best.length) best = candidatePath
    }
    return best === path
  }

  const showRailTip = (label: string, pending: number, target: HTMLElement) => {
    const rect = target.getBoundingClientRect()
    const text = pending > 0 ? `${label} · ${pending} waiting` : label
    setRailTip({ label: text, top: rect.top + rect.height / 2, left: rect.right + 12 })
  }

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isOpen = searching || isMenuOpen(item.label)
    const isActive = linkIsCurrent(item.href, item.href ? [item.href] : [])
    const hasActiveChild = hasSubItems && item.subItems!.some((sub) => itemMatchesPathname(sub, pathname))

    if (hasSubItems) {
      const groupBadge = badgeCountForItem(item)
      const childHrefs = item.subItems!.map((sub) => sub.href).filter((href): href is string => Boolean(href))

      return (
        <div key={item.label}>
          <button
            type="button"
            onClick={() => toggleMenu(item.label)}
            aria-expanded={isOpen}
            title={item.label}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              hasActiveChild || isOpen
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", hasActiveChild ? "text-primary" : "text-muted-foreground")} />
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <SuperPendingBadge count={groupBadge} />
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground/80 transition-transform duration-200",
                isOpen ? "rotate-0" : "-rotate-90",
              )}
            />
          </button>
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
              isOpen ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <div className="space-y-0.5 py-1 pl-1">
                {item.subItems?.map((subItem) => {
                  const isSubActive = linkIsCurrent(subItem.href, childHrefs)
                  const subBadge = badgeCountForHref(subItem.href)
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href!}
                      title={subItem.label}
                      data-nav-active={isSubActive ? "true" : undefined}
                      aria-current={isSubActive ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSubActive
                          ? "bg-primary/10 font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          isSubActive ? "bg-primary" : "bg-muted-foreground/35",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{subItem.label}</span>
                      <SuperPendingBadge count={subBadge} />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )
    }

    const topBadge = badgeCountForHref(item.href)

    return (
      <Link
        key={item.href}
        href={item.href!}
        title={item.label}
        data-nav-active={isActive ? "true" : undefined}
        aria-current={isActive ? "page" : undefined}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <SuperPendingBadge count={topBadge} />
      </Link>
    )
  }

  const panelTitle = searching ? "Search" : currentGroup?.section.label ?? "Menu"
  const panelDescription = searching
    ? "Matches across every platform menu"
    : currentGroup?.section.description

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-16 z-50 flex w-[23.5rem] min-h-0 overflow-hidden border-r bg-card transition-transform duration-300",
          "lg:static lg:top-auto lg:h-full lg:max-h-full lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <nav
          className="flex w-[6.5rem] shrink-0 flex-col items-stretch gap-1 overflow-y-auto border-r bg-muted/30 px-1.5 py-3"
          aria-label="Platform areas"
          onScroll={() => setRailTip(null)}
        >
          {sections.map((group) => {
            const SectionIcon = SECTION_ICONS[group.section.id]
            const selected = !searching && group.section.id === visibleSectionId
            const pending = group.items.reduce((sum, item) => sum + badgeCountForItem(item), 0)
            return (
              <button
                key={group.section.id}
                type="button"
                aria-pressed={selected}
                aria-label={pending > 0 ? `${group.section.label}, ${pending} waiting` : group.section.label}
                onMouseEnter={(event) => showRailTip(group.section.label, pending, event.currentTarget)}
                onMouseLeave={() => setRailTip(null)}
                onFocus={(event) => showRailTip(group.section.label, pending, event.currentTarget)}
                onBlur={() => setRailTip(null)}
                onClick={() => {
                  setRailTip(null)
                  setNavQuery("")
                  setPinnedSectionId(group.section.id)
                }}
                className={cn(
                  "relative flex w-full shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground",
                )}
              >
                <SectionIcon className="h-5 w-5" />
                <span className="w-full text-center text-[10px] font-medium leading-tight">
                  {group.section.label}
                </span>
                {pending > 0 ? (
                  <span
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card"
                    aria-hidden
                  />
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b px-4 pb-3 pt-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">{panelTitle}</h2>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    Platform
                  </span>
                </div>
                {panelDescription ? (
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{panelDescription}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                placeholder="Search all menus"
                className={cn("h-9 rounded-lg bg-muted/40 pl-9 text-sm", navQuery ? "pr-9" : "")}
                aria-label="Search all menus"
              />
              {navQuery ? (
                <button
                  type="button"
                  onClick={() => setNavQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear menu search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          <div ref={navScrollRef} className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {searching ? (
              searchGroups.length > 0 ? (
                <div className="space-y-5">
                  {searchGroups.map((group) => (
                    <div key={group.section.id}>
                      <p className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {group.section.label}
                      </p>
                      <div className="space-y-0.5">{group.items.map((item) => renderNavItem(item))}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matching menu items.</p>
              )
            ) : currentGroup ? (
              <nav className="space-y-0.5" aria-label={currentGroup.section.label}>
                {currentGroup.items.map((item) => renderNavItem(item))}
              </nav>
            ) : (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No menus available.</p>
            )}
          </div>
        </div>
      </aside>

      {railTip ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[70] -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-lg"
          style={{ top: railTip.top, left: railTip.left }}
        >
          {railTip.label}
        </div>
      ) : null}
    </>
  )
}
