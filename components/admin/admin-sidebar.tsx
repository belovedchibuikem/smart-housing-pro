"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Wallet,
  TrendingUp,
  Home,
  FileText,
  Settings,
  BarChart3,
  Shield,
  X,
  Package,
  ScrollText,
  DollarSign,
  Building2,
  Upload,
  LinkIcon,
  Mail,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Inbox,
  Send,
  FileEdit,
  FileBarChart,
  CreditCard,
  HandCoins,
  Receipt,
  FileCheck,
  Wrench,
  Building,
  UserCheck,
  Eye,
  Layout,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { getFilteredNavItems, type UserRole } from "@/lib/roles"

interface NavItem {
  href?: string
  label: string
  icon: any
  subItems?: NavItem[]
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/bulk-upload/members", label: "↳ Bulk Upload Members", icon: Upload },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/wallets", label: "All Wallets", icon: Wallet },
  { href: "/admin/wallets/transactions", label: "Transactions", icon: ScrollText },
  { href: "/admin/wallets/pending", label: "Pending Approvals", icon: FileText },
  { href: "/admin/contributions", label: "Contributions", icon: Wallet },
  { href: "/admin/bulk-upload/contributions", label: "↳ Bulk Upload Contributions", icon: Upload },
  { href: "/admin/financial-reports", label: "Financial Reports", icon: DollarSign },
  { href: "/admin/loans", label: "Loans", icon: TrendingUp },
  { href: "/admin/bulk-upload/loan-repayments", label: "↳ Bulk Upload Repayments", icon: Upload },
  { href: "/admin/loan-products", label: "Loan Products", icon: Package },
  { href: "/admin/mortgages", label: "Mortgages", icon: Building2 },
  { href: "/admin/properties", label: "Properties", icon: Home },
  { href: "/admin/eoi-forms", label: "EOI Forms", icon: ClipboardList },
  { href: "/admin/investment-plans", label: "Investment Plans", icon: TrendingUp },
  {
    label: "Statutory Charges",
    icon: Receipt,
    subItems: [
      { href: "/admin/statutory-charges", label: "All Charges", icon: Eye },
      { href: "/admin/statutory-charges/types", label: "Manage Charge Types", icon: FileCheck },
      { href: "/admin/statutory-charges/payments", label: "Payment Records", icon: DollarSign },
      { href: "/admin/statutory-charges/departments", label: "Department Allocation", icon: Building },
    ],
  },
  {
    label: "Property Management",
    icon: Building2,
    subItems: [
      { href: "/admin/property-management/estates", label: "Manage Estates", icon: Building },
      { href: "/admin/property-management/allottees", label: "Manage Allottees", icon: UserCheck },
      { href: "/admin/property-management/maintenance", label: "Maintenance Records", icon: Wrench },
      { href: "/admin/property-management/reports", label: "Management Reports", icon: FileBarChart },
    ],
  },
  { href: "/admin/blockchain", label: "Blockchain Management", icon: LinkIcon },
  {
    label: "Mail Service",
    icon: Mail,
    subItems: [
      { href: "/admin/mail-service/compose", label: "Compose Mail", icon: FileEdit },
      { href: "/admin/mail-service", label: "All Messages", icon: Mail },
      { href: "/admin/mail-service/inbox", label: "Inbox", icon: Inbox },
      { href: "/admin/mail-service/sent", label: "Sent", icon: Send },
      { href: "/admin/mail-service/outbox", label: "Outbox", icon: Send },
      { href: "/admin/mail-service/drafts", label: "Drafts", icon: FileEdit },
    ],
  },
  {
    label: "Reports",
    icon: BarChart3,
    subItems: [
      { href: "/admin/reports/members", label: "Member Reports", icon: Users },
      { href: "/admin/reports/financial", label: "Financial Reports", icon: DollarSign },
      { href: "/admin/reports/contributions", label: "Contribution Reports", icon: CreditCard },
      { href: "/admin/reports/investments", label: "Investment Reports", icon: TrendingUp },
      { href: "/admin/reports/loans", label: "Loan Reports", icon: HandCoins },
      { href: "/admin/reports/properties", label: "Property Reports", icon: Home },
      { href: "/admin/reports/mail-service", label: "Mail Service Reports", icon: Mail },
      { href: "/admin/reports/audit", label: "Audit Reports", icon: FileBarChart },
    ],
  },
  { href: "/admin/activity-logs", label: "Activity Logs", icon: ScrollText },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  { href: "/admin/roles", label: "Roles & Permissions", icon: Shield },
  {
    label: "Landing Page",
    icon: Layout,
    subItems: [
      { href: "/admin/landing-page", label: "Page Builder", icon: Layout },
      { href: "/admin/landing-page/templates", label: "Templates", icon: FileText },
    ],
  },
  { href: "/admin/payment-gateways", label: "Payment Gateways", icon: CreditCard },
  { href: "/admin/payment-approvals", label: "Payment Approvals", icon: CheckCircle },
  { href: "/admin/white-label", label: "White Label", icon: Settings },
  { href: "/admin/custom-domains", label: "Custom Domains", icon: LinkIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

interface AdminSidebarProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  userRole?: UserRole
}

export function AdminSidebar({ mobileMenuOpen, setMobileMenuOpen, userRole = "super_admin" }: AdminSidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const isMenuOpen = (label: string) => openMenus.includes(label)

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isOpen = isMenuOpen(item.label)
    const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false

    if (hasSubItems) {
      return (
        <div key={item.label}>
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center flex-1 gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </div>
            <button
              onClick={() => toggleMenu(item.label)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
          {isOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.subItems?.map((subItem) => {
                const SubIcon = subItem.icon
                const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href! + "/")
                return (
                  <Link
                    key={subItem.href}
                    href={subItem.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-colors",
                      isSubActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <SubIcon className="h-4 w-4" />
                    {subItem.label}
                  </Link>
                )
              })}
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
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
        {item.label}
      </Link>
    )
  }

  const filteredNavItems = getFilteredNavItems(userRole, navItems)

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
          <span className="font-semibold">Admin Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">{filteredNavItems.map((item) => renderNavItem(item))}</nav>
      </aside>
    </>
  )
}
