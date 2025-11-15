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
  ArrowRightLeft,
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface NavItem {
  href?: string
  label: string
  icon: any
  subItems?: NavItem[]
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/subscriptions", label: "Subscription", icon: Package },
  {
    href: "/dashboard/wallet",
    label: "My Wallet",
    icon: Wallet,
    subItems: [
      { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
      { href: "/dashboard/wallet/add-funds", label: "Add Fund", icon: Plus },
      { href: "/dashboard/wallet/history", label: "History", icon: History },
    ],
  },
  {
    label: "My Contribution",
    icon: CreditCard,
    subItems: [
      { href: "/dashboard/contributions", label: "View Contributions", icon: Eye },
      { href: "/dashboard/contributions/new", label: "Pay Contribution", icon: DollarSign },
      { href: "/dashboard/contributions/plan", label: "Contribution Plan", icon: Calendar },
    ],
  },
  {
    label: "Equity Contributions",
    icon: HandCoins,
    subItems: [
      { href: "/dashboard/equity-contributions", label: "View Equity Contributions", icon: Eye },
      { href: "/dashboard/equity-contributions/new", label: "Make Equity Contribution", icon: Plus },
      { href: "/dashboard/equity-wallet", label: "Equity Wallet", icon: Wallet },
      { href: "/dashboard/equity-plans", label: "Equity Plans", icon: Package },
    ],
  },
  {
    label: "My Loans",
    icon: HandCoins,
    subItems: [
      { href: "/dashboard/loans", label: "View Loans", icon: Eye },
      { href: "/dashboard/loans/apply", label: "Request Loan", icon: PlusCircle },
      { href: "/dashboard/loans/plans", label: "Loan Plans", icon: ListChecks },
    ],
  },
  {
    label: "My Investment",
    icon: TrendingUp,
    subItems: [
      { href: "/dashboard/investment-plans", label: "Investment Plan", icon: ListChecks },
      { href: "/dashboard/investments", label: "View My Investment", icon: Eye },
      { href: "/dashboard/investments/withdraw", label: "Withdraw my Investment", icon: LogOut },
    ],
  },
  
  {
    label: "My Properties",
    icon: Home,
    subItems: [
      {
        label: "Property List",
        icon: Building,
        subItems: [
          { href: "/dashboard/properties?type=house", label: "House", icon: Building2 },
          { href: "/dashboard/properties?type=land", label: "Land", icon: LandPlot },
        ],
      },
      {
        label: "Authority Transfer",
        icon: ArrowRightLeft,
        subItems: [
          { href: "/dashboard/properties/manage", label: "Manage My Property", icon: UserCog },
          { href: "/dashboard/properties/sell", label: "Sell My Property", icon: DollarSign },
        ],
      },
    ],
  },
  {
    label: "Statutory Charges",
    icon: Receipt,
    subItems: [
      { href: "/dashboard/statutory-charges", label: "View Charges", icon: Eye },
      { href: "/dashboard/statutory-charges/pay", label: "Pay Charges", icon: DollarSign },
      { href: "/dashboard/statutory-charges/history", label: "Payment History", icon: History },
    ],
  },
  {
    label: "Property Management",
    icon: Building2,
    subItems: [
      { href: "/dashboard/property-management/estates", label: "My Estates", icon: Building },
      { href: "/dashboard/property-management/allottees", label: "Allottee Status", icon: Users },
      { href: "/dashboard/property-management/maintenance", label: "Maintenance Requests", icon: Wrench },
      { href: "/dashboard/property-management/maintenance/new", label: "New Request", icon: PlusCircle },
    ],
  },
  {
    label: "Mail Service",
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
    icon: FileBarChart,
    subItems: [
      { href: "/dashboard/reports/contributions", label: "Contribution Report", icon: CreditCard },
      { href: "/dashboard/reports/equity-contributions", label: "Equity Contribution Report", icon: HandCoins },
      { href: "/dashboard/reports/investments", label: "Investment Report", icon: TrendingUp },
      { href: "/dashboard/reports/loans", label: "Loan Report", icon: HandCoins },
      { href: "/dashboard/reports/properties", label: "Property Report", icon: Home },
      { href: "/dashboard/reports/financial-summary", label: "Financial Summary", icon: PieChart },
    ],
  },
  { href: "/dashboard/ai-recommendations", label: "AI", icon: Sparkles },
  { href: "/dashboard/blockchain-ledger", label: "Block Chain Ledger", icon: Shield },
  {
    label: "Refunds & Requests",
    icon: Receipt,
    subItems: [
      { href: "/dashboard/refunds", label: "My Requests", icon: FileText },
      { href: "/dashboard/refunds/new", label: "New Request", icon: Plus },
    ],
  },
  { href: "/dashboard/withdraw-membership", label: "Withdraw Membership", icon: UserMinus },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

interface DashboardSidebarProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function DashboardSidebar({ mobileMenuOpen, setMobileMenuOpen }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const isMenuOpen = (label: string) => openMenus.includes(label)

  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = item.icon
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isOpen = isMenuOpen(item.label)
    const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false

    if (hasSubItems) {
      return (
        <div key={item.label}>
          <div className="flex items-center gap-1">
            {item.href ? (
              <Link
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center flex-1 gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  level > 0 && "py-2 text-xs",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
                {item.label}
              </Link>
            ) : (
              <div
                className={cn(
                  "flex items-center flex-1 gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground",
                  level > 0 && "py-2 text-xs",
                )}
              >
                <Icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
                {item.label}
              </div>
            )}
            <button
              onClick={() => toggleMenu(item.label)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
          {isOpen && (
            <div className={cn("ml-4 mt-1 space-y-1", level > 0 && "ml-6")}>
              {item.subItems?.map((subItem) => renderNavItem(subItem, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href!}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
          level > 0 && "py-2 text-xs",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className={cn("h-5 w-5", level > 0 && "h-4 w-4")} />
        {item.label}
      </Link>
    )
  }

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
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

        <nav className="p-4 space-y-2">{navItems.map((item) => renderNavItem(item))}</nav>
      </aside>
    </>
  )
}
