"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Home,
  Settings,
  X,
  Package,
  Sparkles,
  Shield,
  ChevronDown,
  ChevronRight,
  Mail,
  FileBarChart,
  UserMinus,
  History,
  Eye,
  CreditCard,
  Calendar,
  PlusCircle,
  HandCoins,
  ListChecks,
  Building,
  DollarSign,
  UserCog,
  LogOut,
  Building2,
  LandPlot,
  Inbox,
  Send,
  FileEdit,
  PieChart,
  Plus,
  Receipt,
  Wrench,
  Users,
  FileText,
  Banknote,
  Landmark,
  Search,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo } from "react"
import { apiFetch, getMemberCurrentSubscription } from "@/lib/api/client"
import { filterMemberNavByModules } from "@/lib/modules/filter-nav-by-modules"
import { useI18n } from "@/lib/i18n/i18n-provider"
import { useSidebarNavigation } from "@/hooks/use-sidebar-navigation"
import { itemMatchesPathname, pathnameMatchesHref } from "@/lib/navigation/sidebar-nav"

interface NavItem {
  href?: string
  label: string
  displayKey?: string
  icon: any
  subItems?: NavItem[]
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", displayKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/subscriptions", label: "Subscription", displayKey: "nav.subscription", icon: Package },
  {
    href: "/dashboard/wallet",
    label: "My Wallet",
    displayKey: "nav.myWallet",
    icon: Wallet,
    subItems: [
      { href: "/dashboard/wallet", label: "Wallet", displayKey: "nav.wallet", icon: Wallet },
      { href: "/dashboard/wallet/add-funds", label: "Add Fund", displayKey: "nav.addFund", icon: Plus },
      { href: "/dashboard/wallet/history", label: "History", displayKey: "nav.history", icon: History },
    ],
  },
  {
    label: "My Accounts",
    displayKey: "nav.myAccounts",
    icon: Landmark,
    subItems: [
      {
        label: "Contributions",
        displayKey: "nav.contributionsGroup",
        icon: CreditCard,
        subItems: [
          {
            label: "General Contribution",
            displayKey: "nav.generalContribution",
            icon: CreditCard,
            subItems: [
              { href: "/dashboard/contributions", label: "View Contributions", displayKey: "nav.viewContributions", icon: Eye },
              { href: "/dashboard/contributions/new", label: "Pay Contribution", displayKey: "nav.payContribution", icon: DollarSign },
              { href: "/dashboard/contributions/plan", label: "Contribution Plan", displayKey: "nav.contributionPlan", icon: Calendar },
            ],
          },
          {
            label: "Equity Contribution",
            displayKey: "nav.equityContribution",
            icon: HandCoins,
            subItems: [
              { href: "/dashboard/equity-contributions", label: "View Equity Contributions", displayKey: "nav.equityView", icon: Eye },
              { href: "/dashboard/equity-contributions/new", label: "Make Equity Contribution", displayKey: "nav.equityNew", icon: Plus },
              { href: "/dashboard/equity-wallet", label: "Equity Wallet", displayKey: "nav.equityWallet", icon: Wallet },
              { href: "/dashboard/equity-plans", label: "Equity Plans", displayKey: "nav.equityPlans", icon: Package },
            ],
          },
        ],
      },
      {
        label: "Loans",
        displayKey: "nav.loans",
        icon: Banknote,
        subItems: [
          { href: "/dashboard/loans", label: "View Loans", displayKey: "nav.viewLoans", icon: Eye },
          { href: "/dashboard/loans/apply", label: "Request Loan", displayKey: "nav.requestLoan", icon: PlusCircle },
          { href: "/dashboard/loans/plans", label: "Loan Plans", displayKey: "nav.loanPlans", icon: ListChecks },
        ],
      },
      {
        label: "Investments",
        displayKey: "nav.investments",
        icon: TrendingUp,
        subItems: [
          { href: "/dashboard/investment-plans", label: "Investment Plan", displayKey: "nav.investmentPlans", icon: ListChecks },
          { href: "/dashboard/investments", label: "View My Investment", displayKey: "nav.viewInvestments", icon: Eye },
          { href: "/dashboard/investments/withdraw", label: "Withdraw my Investment", displayKey: "nav.withdrawInvestment", icon: LogOut },
        ],
      },
    ],
  },
  {
    label: "Browse Properties",
    displayKey: "nav.browseProperties",
    icon: Search,
    subItems: [
      { href: "/dashboard/browse-properties?listing=all", label: "All Listings", displayKey: "nav.allListings", icon: LayoutGrid },
      { href: "/dashboard/browse-properties?listing=house", label: "Browse Houses", displayKey: "nav.browseHouses", icon: Building2 },
      { href: "/dashboard/browse-properties?listing=land", label: "Browse Lands", displayKey: "nav.browseLands", icon: LandPlot },
    ],
  },
  {
    label: "My Property",
    displayKey: "nav.myProperty",
    icon: Home,
    subItems: [
      { href: "/dashboard/my-property", label: "My Portfolio", displayKey: "nav.myPortfolio", icon: Home },
      { href: "/dashboard/my-property?tab=land", label: "My Land Parcels", displayKey: "nav.myLandParcels", icon: LandPlot },
      { href: "/dashboard/properties/manage", label: "Manage My Property", displayKey: "nav.manageMyProperty", icon: UserCog },
      { href: "/dashboard/properties/sell", label: "Sell My Property", displayKey: "nav.sellMyProperty", icon: DollarSign },
      {
        label: "Statutory Charges",
        displayKey: "nav.statutory",
        icon: Receipt,
        subItems: [
          { href: "/dashboard/statutory-charges", label: "View Charges", displayKey: "nav.viewCharges", icon: Eye },
          { href: "/dashboard/statutory-charges/pay", label: "Pay Charges", displayKey: "nav.payCharges", icon: DollarSign },
          { href: "/dashboard/statutory-charges/history", label: "Payment History", displayKey: "nav.chargeHistory", icon: History },
        ],
      },
      {
        label: "Estates & Maintenance",
        displayKey: "nav.estatesMaintenance",
        icon: Building2,
        subItems: [
          { href: "/dashboard/property-management/estates", label: "My Estates", displayKey: "nav.myEstates", icon: Building },
          { href: "/dashboard/property-management/allottees", label: "Allottee Status", displayKey: "nav.allotteeStatus", icon: Users },
          { href: "/dashboard/property-management/maintenance", label: "Maintenance Requests", displayKey: "nav.maintenanceRequests", icon: Wrench },
          { href: "/dashboard/property-management/maintenance/new", label: "New Request", displayKey: "nav.newMaintenanceRequest", icon: PlusCircle },
        ],
      },
    ],
  },
  {
    label: "Mail Service",
    displayKey: "nav.mail",
    icon: Mail,
    subItems: [
      { href: "/dashboard/mail-service/compose", label: "Compose Mail", icon: FileEdit },
      { href: "/dashboard/mail-service/inbox", label: "Inbox", icon: Inbox },
      { href: "/dashboard/mail-service/sent", label: "Sent", icon: Send },
      { href: "/dashboard/mail-service/outbox", label: "Outbox", icon: Send },
      { href: "/dashboard/mail-service/drafts", label: "Drafts", icon: FileEdit },
    ],
  },
  {
    label: "Report",
    displayKey: "nav.report",
    icon: FileBarChart,
    subItems: [
      { href: "/dashboard/reports", label: "All Reports", icon: FileBarChart },
      { href: "/dashboard/reports/contributions", label: "Contribution Report", icon: CreditCard },
      { href: "/dashboard/reports/equity-contributions", label: "Equity Contribution Report", icon: HandCoins },
      { href: "/dashboard/reports/investments", label: "Investment Report", icon: TrendingUp },
      { href: "/dashboard/reports/loans", label: "Loan Report", icon: HandCoins },
      { href: "/dashboard/reports/mortgages", label: "Mortgage Report", icon: Banknote },
      { href: "/dashboard/reports/properties", label: "Property Report", icon: Home },
      { href: "/dashboard/reports/financial-summary", label: "Financial Summary", icon: PieChart },
    ],
  },
  { href: "/dashboard/ai-recommendations", label: "AI", displayKey: "nav.ai", icon: Sparkles },
  { href: "/dashboard/blockchain-ledger", label: "Block Chain Ledger", icon: Shield },
  {
    label: "Refunds & Requests",
    displayKey: "nav.refunds",
    icon: Receipt,
    subItems: [
      { href: "/dashboard/refunds", label: "My Requests", icon: FileText },
      { href: "/dashboard/refunds/new", label: "New Request", icon: Plus },
    ],
  },
  { href: "/dashboard/withdraw-membership", label: "Withdraw Membership", displayKey: "nav.withdrawMembership", icon: UserMinus },
  { href: "/dashboard/settings", label: "Settings", displayKey: "nav.settings", icon: Settings },
]

interface DashboardSidebarProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function DashboardSidebar({ mobileMenuOpen, setMobileMenuOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { t } = useI18n()
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [enabledModules, setEnabledModules] = useState<string[] | null>(null)

  const navLabel = (item: NavItem) => (item.displayKey ? t(item.displayKey) : item.label)

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const [memberRes, tenantRes] = await Promise.all([
          getMemberCurrentSubscription(),
          apiFetch<{ enabled_modules?: string[] }>("/tenant/modules").catch(() => ({ enabled_modules: [] })),
        ])
        const isActive = memberRes.subscription?.is_active === true && memberRes.subscription?.status === "active"
        setHasActiveSubscription(isActive)
        setEnabledModules(tenantRes.enabled_modules ?? [])
      } catch (error) {
        console.error("Failed to check subscription status:", error)
        setHasActiveSubscription(false)
        setEnabledModules([])
      }
    }
    checkSubscription()
  }, [])

  const hrefMatchesCurrentLocation = (href: string) => pathnameMatchesHref(pathname, href)

  const itemMatchesLocation = (item: NavItem): boolean => itemMatchesPathname(item, pathname)

  const subscriptionFiltered = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.label === "Subscription" || item.href === "/dashboard/subscriptions") {
          return true
        }
        if (hasActiveSubscription === null) {
          return true
        }
        return hasActiveSubscription
      }),
    [hasActiveSubscription],
  )

  const filteredNavItems = useMemo(
    () =>
      enabledModules === null
        ? subscriptionFiltered
        : filterMemberNavByModules(subscriptionFiltered, enabledModules),
    [subscriptionFiltered, enabledModules],
  )

  const { toggleMenu, isMenuOpen, asideRef } = useSidebarNavigation(filteredNavItems, pathname, "nested")

  const renderNavItem = (item: NavItem, level = 0, menuKey = item.label) => {
    const Icon = item.icon
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isOpen = isMenuOpen(menuKey)
    const isActive = item.href ? hrefMatchesCurrentLocation(item.href) : false
    const hasActiveChild = item.subItems?.some((sub) => itemMatchesLocation(sub)) ?? false

    if (hasSubItems) {
      return (
        <div key={menuKey}>
          <button
            type="button"
            data-nav-active={hasActiveChild && !isOpen ? "true" : undefined}
            onClick={() => toggleMenu(menuKey)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
              level > 0 && "py-2 text-xs",
              isActive || hasActiveChild
                ? "bg-primary/10 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            aria-expanded={isOpen}
          >
            <Icon className={cn("h-5 w-5 shrink-0", level > 0 && "h-4 w-4")} />
            <span className="flex-1">{navLabel(item)}</span>
            {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 opacity-70" /> : <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />}
          </button>
          {isOpen && (
            <div className={cn("ml-4 mt-1 space-y-1 border-l border-border/60 pl-2", level > 0 && "ml-5")}>
              {item.subItems?.map((subItem) =>
                renderNavItem(subItem, level + 1, `${menuKey}/${subItem.label}`),
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={menuKey}
        href={item.href!}
        data-nav-active={isActive ? "true" : undefined}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
          level > 0 && "py-2 text-xs",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
        {navLabel(item)}
      </Link>
    )
  }

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        ref={asideRef}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 border-r bg-card/95 backdrop-blur-sm transition-transform duration-300 lg:translate-x-0",
          "lg:block min-h-[calc(100vh-73px)] mt-[73px] lg:mt-0 overflow-y-auto",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b">
          <span className="font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">{filteredNavItems.map((item) => renderNavItem(item))}</nav>
      </aside>
    </>
  )
}
