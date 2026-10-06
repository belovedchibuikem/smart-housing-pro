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
  UserPlus,
  Plus,
  Calculator,
  Bell,
  MapPinned,
  RotateCcw,
  ArrowRightLeft,
  Landmark,
  BookOpen,
  CalendarRange,
  Scale,
  Briefcase,
  FolderOpen,
  ListTodo,
  HardHat,
  ClipboardCheck,
  FileSignature,
  Sparkles,
  Megaphone,
  Phone,
  Search,
  AlertCircle,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Fragment, useState, useEffect, useMemo, useRef } from "react"
import { filterNavTreeByQuery } from "@/lib/navigation/nav-search"
import {
  bucketAdminNav,
  findAdminSectionId,
  type AdminNavSectionId,
} from "@/lib/navigation/admin-nav-sections"
import { Input } from "@/components/ui/input"
import type { UserRole } from "@/lib/roles"
import { useSidebarNavigation } from "@/hooks/use-sidebar-navigation"
import { itemMatchesPathname } from "@/lib/navigation/sidebar-nav"
import {
  getPermissionFilteredNavItems,
  isTenantSuperAdminContext,
} from "@/lib/admin/nav-permissions"
import { getAdminPendingBadges, getCurrentSubscription, type AdminPendingBadgeCounts } from "@/lib/api/client"
import { filterAdminNavByModules } from "@/lib/modules/filter-nav-by-modules"
import {
  ADMIN_NAV_MODULE_MAP,
  ALWAYS_VISIBLE_ADMIN_HREFS,
  CORE_ADMIN_MODULE_SLUGS,
} from "@/lib/modules/module-config"

/** When the API returns no permission slugs (legacy session), only the dashboard is shown. */
const MINIMAL_STAFF_NAV: NavItem[] = [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }]

const ADMIN_BADGE_BY_HREF: Partial<Record<string, keyof AdminPendingBadgeCounts>> = {
  "/admin/payment-approvals": "payment_approvals_pending",
  "/admin/wallets/pending": "wallet_withdrawals_pending",
  "/admin/refunds": "refund_requests_pending",
  "/admin/investment-withdrawal-requests": "investment_withdrawals_pending",
  "/admin/subscriptions": "business_subscription_payments_pending",
  "/admin/member-subscriptions/bulk": "member_subscription_payments_pending",
  "/admin/members": "kyc_pending_review",
  "/admin/loans": "loans_pending",
  "/admin/change-requests": "change_requests_pending",
  "/admin/ecpm/approvals": "ecpm_approvals_pending",
  "/admin/office/tasks": "office_tasks_pending",
  "/admin/office/workflow/queue": "office_tasks_pending",
}

function PendingBadge({ count }: { count: number }) {
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
  icon: any
  subItems?: NavItem[]
  module?: string
  /** Visual cluster inside a long group. Does not affect permissions or modules. */
  cluster?: string
}

const SECTION_ICONS: Record<AdminNavSectionId, LucideIcon> = {
  home: LayoutDashboard,
  people: Users,
  finance: Wallet,
  property: Home,
  operations: Briefcase,
  communications: Mail,
  platform: Settings,
  more: Sparkles,
}

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/subscriptions", label: "Subscription", icon: Package },
  {
    label: "Members",
    icon: Users,
    subItems: [
      { href: "/admin/members", label: "All Members", icon: Users },
      { href: "/admin/members/subscriptions", label: "Property & Land Subscriptions", icon: Home },
      { href: "/admin/members/new", label: "Add Member", icon: UserPlus },
      { href: "/admin/member-subscriptions/bulk", label: "Bulk Member Subscriptions", icon: Package },
      { href: "/admin/bulk-upload/members", label: "Bulk Upload", icon: Upload },
    ],
  },
  {
    label: "Admin Users",
    icon: Shield,
    subItems: [
      { href: "/admin/users", label: "All Admin Users", icon: Shield },
      { href: "/admin/users/new", label: "Add Admin User", icon: UserPlus },
    ],
  },
  {
    label: "Roles & Permissions",
    icon: Shield,
    subItems: [
      { href: "/admin/roles", label: "All Roles", icon: Shield },
      { href: "/admin/roles/new", label: "Create Role", icon: Plus },
      { href: "/admin/permissions", label: "All Permissions", icon: CheckCircle },
    ],
  },
  {
    label: "User Wallets",
    icon: Wallet,
    subItems: [
      { href: "/admin/wallets", label: "Wallets", icon: Wallet },
      { href: "/admin/wallets/transactions", label: "Wallet Transactions", icon: ScrollText },
      { href: "/admin/wallet-transfer", label: "Wallet Transfer", icon: ArrowRightLeft },
      { href: "/admin/bulk-upload/wallet-transfers", label: "Bulk Wallet Transfer", icon: Upload },
    ],
  },
  {
    label: "Contributions",
    icon: CreditCard,
    subItems: [
      { href: "/admin/contributions", label: "All Contributions", icon: CreditCard },
      { href: "/admin/post-contribution", label: "Post Contribution", icon: Plus },
      { href: "/admin/contribution-plans", label: "Contribution Plans", icon: Package },
      { href: "/admin/bulk-upload/contributions", label: "Bulk Upload Contribution", icon: Upload },
      { href: "/admin/bulk-upload/contribution-asset-repayments", label: "Bulk Contribution Repayments", icon: Upload },
    ],
  },
  {
    label: "Equity Contributions",
    icon: HandCoins,
    subItems: [
      { href: "/admin/equity-contributions", label: "All Equity Contributions", icon: HandCoins },
      { href: "/admin/equity-plans", label: "Equity Plans", icon: Package },
      { href: "/admin/bulk-upload/equity-contributions", label: "Bulk Upload Equity", icon: Upload },
      { href: "/admin/bulk-upload/equity-asset-repayments", label: "Bulk Equity Repayments", icon: Upload },
    ],
  },
  {
    label: "Loans",
    icon: TrendingUp,
    subItems: [
      { href: "/admin/loans", label: "All Loans", icon: TrendingUp, cluster: "Lending" },
      { href: "/admin/loans/apply", label: "Apply for Member", icon: FileEdit, cluster: "Lending" },
      { href: "/admin/loans/stoppage", label: "Loan Stoppage", icon: CalendarRange, cluster: "Lending" },
      { href: "/admin/loan-repayments", label: "Individual Repayment", icon: Receipt, cluster: "Lending" },
      { href: "/admin/loan-products", label: "Loan Products", icon: Package, cluster: "Lending" },
      { href: "/admin/bulk-upload/loans", label: "Bulk Loan Applications", icon: Upload, cluster: "Bulk" },
      { href: "/admin/bulk-upload/loan-repayments", label: "Bulk Upload Repayments", icon: Upload, cluster: "Bulk" },
    ],
  },
  {
    label: "Refund",
    icon: Receipt,
    subItems: [
      { href: "/admin/refunds", label: "Refund Requests", icon: FileText },
      { href: "/admin/wallets/pending", label: "Pending Refund", icon: FileText },
      { href: "/admin/refund-member", label: "Refund Member", icon: DollarSign },
      { href: "/admin/bulk-upload/refund", label: "Bulk Refund", icon: Upload },
    ],
  },
  {
    label: "Mortgages",
    icon: Building2,
    subItems: [
      { href: "/admin/mortgages", label: "All Mortgages", icon: Building2, cluster: "Mortgages" },
      { href: "/admin/mortgages/new", label: "Create Mortgage", icon: Plus, cluster: "Mortgages" },
      { href: "/admin/mortgage-providers", label: "Mortgage Providers", icon: Building, cluster: "Mortgages" },
      { href: "/admin/mortgages/bulk-repay", label: "Bulk Mortgage Repayment", icon: Receipt, cluster: "Mortgages" },
      { href: "/admin/bulk-upload/mortgages", label: "Bulk Upload", icon: Upload, cluster: "Mortgages" },
      { href: "/admin/internal-mortgages", label: "Internal Mortgage Plans", icon: Wrench, cluster: "Internal" },
      { href: "/admin/bulk-upload/internal-mortgages", label: "Bulk Internal Mortgage", icon: Upload, cluster: "Internal" },
      { href: "/admin/tools/mortgage-calculators", label: "Mortgage Calculators", icon: Calculator, cluster: "Tools" },
    ],
  },
  { href: "/admin/bulk-upload/rollbacks", label: "Financial Rollbacks", icon: RotateCcw, module: "financial_rollbacks" },
  {
    label: "Houses / Buildings",
    icon: Home,
    subItems: [
      { href: "/admin/properties", label: "House Management", icon: Home, cluster: "Manage" },
      { href: "/admin/properties/new", label: "Upload House/Building", icon: Plus, cluster: "Manage" },
      { href: "/admin/eoi-forms", label: "House EOI Forms", icon: ClipboardList, cluster: "Manage" },
      { href: "/admin/property-payment-plans", label: "House Payment Plans", icon: CreditCard, cluster: "Manage" },
      { href: "/admin/bulk-upload/properties", label: "Bulk Houses (CSV)", icon: Upload, cluster: "Bulk" },
      { href: "/admin/bulk-upload/property-subscribers", label: "Bulk House Subscribers", icon: Upload, cluster: "Bulk" },
      { href: "/admin/bulk-upload/property-payments", label: "Bulk House Repayments", icon: Upload, cluster: "Bulk" },
      { href: "/admin/bulk-upload/equity-asset-repayments", label: "Bulk Equity Repayments", icon: Upload, cluster: "Bulk" },
      { href: "/admin/bulk-upload/contribution-asset-repayments", label: "Bulk Contribution Repayments", icon: Upload, cluster: "Bulk" },
      { href: "/admin/bulk-upload/issued-documents", label: "Bulk Document Issuance", icon: Upload, cluster: "Bulk" },
      { href: "/admin/house-repayments", label: "Record House/Land Repayment", icon: CreditCard, cluster: "Allocation" },
      { href: "/admin/property-management/allottees/new", label: "Assign House to Member", icon: UserCheck, cluster: "Allocation" },
      { href: "/admin/property-management/allottees", label: "Manage House Allottees", icon: UserCheck, cluster: "Allocation" },
      { href: "/admin/property-management/allottees/mass-allocate", label: "Mass Allocate Houses", icon: Users, cluster: "Allocation" },
      { href: "/admin/reports/properties", label: "Building Reports", icon: FileBarChart, cluster: "Records" },
      { href: "/admin/valuations", label: "Property Valuations", icon: Calculator, cluster: "Records" },
      { href: "/admin/change-requests", label: "Change Request Center", icon: ClipboardList, cluster: "Records" },
      { href: "/admin/property-improvements", label: "Property Improvements", icon: Wrench, cluster: "Records" },
    ],
  },
  {
    label: "Land",
    icon: MapPinned,
    subItems: [
      { href: "/admin/lands", label: "Land Management", icon: MapPinned, cluster: "Manage" },
      { href: "/admin/lands/new", label: "Upload Land", icon: Plus, cluster: "Manage" },
      { href: "/admin/land-eoi-forms", label: "Land EOI Forms", icon: ClipboardList, cluster: "Manage" },
      { href: "/admin/house-repayments", label: "Record House/Land Repayment", icon: CreditCard, cluster: "Allocation" },
      { href: "/admin/land-subscriptions/new", label: "Assign Land to Member", icon: UserCheck, cluster: "Allocation" },
      { href: "/admin/land-subscriptions/mass-allocate", label: "Mass Allocate Land", icon: Users, cluster: "Allocation" },
      { href: "/admin/bulk-upload/lands", label: "Bulk Land (CSV)", icon: Upload, cluster: "Bulk" },
      { href: "/admin/bulk-upload/land-subscriptions", label: "Bulk Land Subscriptions", icon: Upload, cluster: "Bulk" },
      { href: "/admin/bulk-upload/land-payments", label: "Bulk Land Payments", icon: Upload, cluster: "Bulk" },
      { href: "/admin/reports/land", label: "Land Reports", icon: FileBarChart, cluster: "Records" },
    ],
  },
  {
    label: "Investments",
    icon: TrendingUp,
    subItems: [
      { href: "/admin/investment-plans", label: "Investment Plans", icon: Package },
      { href: "/admin/investments", label: "All Investments", icon: TrendingUp },
      { href: "/admin/collaterals", label: "Collateral Register", icon: Shield },
      { href: "/admin/bulk-upload/investments", label: "Bulk Upload Investments", icon: Upload },
      { href: "/admin/investment-withdrawal-requests", label: "Withdrawal Requests", icon: DollarSign },
    ],
  },
  {
    label: "Statutory Charges",
    icon: Receipt,
    subItems: [
      { href: "/admin/statutory-charges", label: "All Charges", icon: Eye },
      { href: "/admin/statutory-charges/definitions", label: "Charge Definitions", icon: FileCheck },
      { href: "/admin/statutory-charges/types", label: "Manage Charge Types", icon: FileCheck },
      { href: "/admin/statutory-charges/payments/new", label: "Record Payment", icon: DollarSign },
      { href: "/admin/statutory-charges/payments", label: "Payment Records", icon: DollarSign },
      { href: "/admin/statutory-charges/departments", label: "Department Allocation", icon: Building },
    ],
  },
  {
    label: "Estates & Ops",
    icon: Building2,
    subItems: [
      { href: "/admin/property-management/estates", label: "Manage Estates", icon: Building },
      { href: "/admin/property-management/maintenance", label: "Maintenance Records", icon: Wrench },
      { href: "/admin/property-management/reports", label: "Ops Reports", icon: FileBarChart },
    ],
  },
  {
    label: "Resident Association",
    icon: Users,
    module: "resident_association",
    subItems: [
      { href: "/admin/resident-association", label: "Dashboard", icon: LayoutDashboard, cluster: "Community" },
      { href: "/admin/resident-association/associations", label: "Associations", icon: Building2, cluster: "Community" },
      { href: "/admin/resident-association/houses", label: "Houses", icon: Home, cluster: "Community" },
      { href: "/admin/resident-association/notices", label: "Notices", icon: Megaphone, cluster: "Community" },
      { href: "/admin/resident-association/charges", label: "Charges", icon: Receipt, cluster: "Money" },
      { href: "/admin/resident-association/payments", label: "Payments", icon: CreditCard, cluster: "Money" },
      { href: "/admin/resident-association/discrepancies", label: "Discrepancies", icon: AlertCircle, cluster: "Money" },
      { href: "/admin/resident-association/revenue", label: "Revenue", icon: BarChart3, cluster: "Money" },
      { href: "/admin/resident-association/expenditures", label: "Expenditure", icon: DollarSign, cluster: "Money" },
      { href: "/admin/resident-association/bank-accounts", label: "Bank Accounts", icon: Landmark, cluster: "Money" },
    ],
  },
  {
    label: "Blockchain",
    icon: LinkIcon,
    subItems: [
      { href: "/admin/blockchain", label: "Properties", icon: LinkIcon },
      { href: "/admin/blockchain/wallets", label: "Wallets", icon: Wallet },
      { href: "/admin/blockchain/setup", label: "Setup", icon: Settings },
    ],
  },
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
      { href: "/admin/reports/refunds", label: "Refund Reports", icon: RotateCcw },
      { href: "/admin/reports/equity-contributions", label: "Equity Contribution Reports", icon: HandCoins },
      { href: "/admin/reports/investments", label: "Investment Reports", icon: TrendingUp },
      { href: "/admin/reports/loans", label: "Loan Reports", icon: HandCoins },
      { href: "/admin/reports/mail-service", label: "Mail Service Reports", icon: Mail },
      { href: "/admin/reports/audit", label: "Audit Reports", icon: FileBarChart },
    ],
  },
  {
    label: "Accounting",
    icon: Landmark,
    module: "accounting",
    subItems: [
      { href: "/admin/accounting", label: "Accounting Hub", icon: Landmark, cluster: "Setup" },
      { href: "/admin/accounting/accounts", label: "Chart of Accounts", icon: BookOpen, cluster: "Setup" },
      { href: "/admin/accounting/rules", label: "Posting Rules", icon: Settings, cluster: "Setup" },
      { href: "/admin/accounting/periods", label: "Financial Periods", icon: CalendarRange, cluster: "Setup" },
      { href: "/admin/accounting/journals", label: "Journals", icon: Scale, cluster: "Books" },
      { href: "/admin/accounting/reports", label: "GL Reports", icon: FileBarChart, cluster: "Books" },
      { href: "/admin/accounting/statements", label: "Member Statements", icon: Wallet, cluster: "Books" },
      { href: "/admin/accounting/property-ledger", label: "Property Ledger", icon: Home, cluster: "Books" },
    ],
  },
  {
    label: "Construction (ECPM)",
    icon: HardHat,
    module: "ecpm",
    subItems: [
      { href: "/admin/ecpm", label: "ECPM Hub", icon: HardHat, cluster: "Projects" },
      { href: "/admin/ecpm/estates", label: "Estates & Plots", icon: MapPinned, cluster: "Projects" },
      { href: "/admin/ecpm/projects", label: "Projects", icon: Building2, cluster: "Projects" },
      { href: "/admin/ecpm/parties", label: "Contractors & Parties", icon: Users, cluster: "Projects" },
      { href: "/admin/ecpm/drawings", label: "Drawings", icon: FileText, cluster: "Commercial" },
      { href: "/admin/ecpm/boqs", label: "BOQs", icon: ClipboardList, cluster: "Commercial" },
      { href: "/admin/ecpm/quotations", label: "Quotations", icon: Receipt, cluster: "Commercial" },
      { href: "/admin/ecpm/contracts", label: "Contracts", icon: FileSignature, cluster: "Commercial" },
      { href: "/admin/ecpm/approvals", label: "Approvals", icon: ClipboardCheck, cluster: "Commercial" },
      { href: "/admin/ecpm/site-ops", label: "Site Ops", icon: ClipboardList, cluster: "Site" },
      { href: "/admin/ecpm/procurement", label: "Procurement", icon: Package, cluster: "Site" },
      { href: "/admin/ecpm/handover", label: "Handover", icon: FileCheck, cluster: "Site" },
      { href: "/admin/ecpm/ai", label: "AI Assist", icon: Sparkles, cluster: "Review" },
      { href: "/admin/ecpm/reports", label: "ECPM Reports", icon: FileBarChart, cluster: "Review" },
      { href: "/admin/ecpm/audit", label: "Audit Trail", icon: ScrollText, cluster: "Review" },
    ],
  },
  {
    label: "Digital Office",
    icon: Briefcase,
    module: "office",
    subItems: [
      { href: "/admin/office", label: "Office Hub", icon: Briefcase, cluster: "Desk" },
      { href: "/admin/office/cases", label: "Case Desk", icon: ListTodo, cluster: "Desk" },
      { href: "/admin/office/workflow/queue", label: "Workflow Queue", icon: ClipboardCheck, cluster: "Desk" },
      { href: "/admin/office/tasks", label: "My Tasks", icon: ListTodo, cluster: "Desk" },
      { href: "/admin/office/inbox", label: "Inbox", icon: Inbox, cluster: "Desk" },
      { href: "/admin/office/outbox", label: "Outbox", icon: Send, cluster: "Desk" },
      { href: "/admin/office/contributions", label: "Contributions Office", icon: CreditCard, cluster: "Desk" },
      { href: "/admin/office/documents", label: "Registry Search", icon: FolderOpen, cluster: "Documents" },
      { href: "/admin/office/library", label: "Folders & Tags", icon: FolderOpen, cluster: "Documents" },
      { href: "/admin/office/memos/new", label: "New Internal Memo", icon: FileEdit, cluster: "Documents" },
      { href: "/admin/office/correspondence", label: "Correspondence", icon: Mail, cluster: "Documents" },
      { href: "/admin/office/circulars", label: "HQ Circulars", icon: Building2, cluster: "Documents" },
      { href: "/admin/office/workflow/settings", label: "Workflow Settings", icon: Settings, cluster: "Setup" },
      { href: "/admin/office/workflow/delegations", label: "Delegations", icon: Settings, cluster: "Setup" },
      { href: "/admin/office/cases/sla", label: "Case SLA", icon: Settings, cluster: "Setup" },
      { href: "/admin/office/org-units", label: "Org Units", icon: Building2, cluster: "Setup" },
      { href: "/admin/office/workflows", label: "Workflows", icon: FolderOpen, cluster: "Setup" },
      { href: "/admin/office/categories", label: "Categories", icon: FileText, cluster: "Setup" },
      { href: "/admin/office/templates", label: "Templates", icon: FileEdit, cluster: "Setup" },
      { href: "/admin/office/reports", label: "Reports", icon: FileBarChart, cluster: "Review" },
      { href: "/admin/office/ai", label: "AI Assist", icon: Wrench, cluster: "Review" },
    ],
  },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/announcements", label: "Public Notices", icon: Megaphone },
  { href: "/admin/documents", label: "Documents", icon: FileText },
  {
    label: "Document Issuing",
    icon: FileText,
    subItems: [
      { href: "/admin/issued-documents", label: "Dashboard", icon: FileText },
      { href: "/admin/payment-receipts", label: "Payment Receipts", icon: FileText },
      { href: "/admin/issued-documents/letterhead", label: "Letterhead", icon: Settings },
      { href: "/admin/issued-documents/templates", label: "Templates", icon: FileText },
      { href: "/admin/bulk-upload/issued-documents", label: "Bulk Issue", icon: Upload },
    ],
  },
  {
    label: "Landing Page",
    icon: Layout,
    subItems: [
      { href: "/admin/landing-page", label: "Page Builder", icon: Layout },
      { href: "/admin/landing-page/templates", label: "Templates", icon: FileText },
    ],
  },
  {
    label: "Payment Manager",
    icon: CreditCard,
    subItems: [
      { href: "/admin/payment-gateways", label: "Payment Gateways", icon: CreditCard },
      { href: "/admin/payment-approvals", label: "Payment Approvals", icon: CheckCircle },
      { href: "/admin/payment-receipts", label: "Payment Receipts", icon: FileText },
    ],
  },
  { href: "/admin/white-label", label: "White Label", icon: Settings },
  { href: "/admin/custom-domains", label: "Custom Domains", icon: LinkIcon },
  {
    label: "System",
    icon: Settings,
    subItems: [
      { href: "/admin/audit-logs", label: "Audit Logs", icon: Shield },
      { href: "/admin/activity-logs", label: "Activity Logs", icon: ScrollText },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/platform-config", label: "Platform Configuration", icon: Settings },
      { href: "/admin/payment-routing", label: "Payment Routing", icon: CreditCard },
      { href: "/admin/contact-centre", label: "Contact Centre", icon: Phone },
    ],
  },
]

interface AdminSidebarProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
  userRole?: UserRole
  /** Spatie permission names from login /me (flat strings). */
  permissions?: string[]
  /** Spatie role names (e.g. super_admin). */
  roleNames?: string[]
}

export function AdminSidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
  userRole = "member",
  permissions = [],
  roleNames = [],
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null)
  const [enabledModules, setEnabledModules] = useState<string[] | null>(null)
  const [packageName, setPackageName] = useState<string | null>(null)
  const [pendingBadges, setPendingBadges] = useState<AdminPendingBadgeCounts | null>(null)
  const navScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    const loadBadges = async () => {
      try {
        const res = await getAdminPendingBadges()
        if (!cancelled && res?.success && res.counts) {
          setPendingBadges(res.counts)
        }
      } catch {
        if (!cancelled) setPendingBadges(null)
      }
    }
    loadBadges()
    const t = setInterval(loadBadges, 120000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  const badgeCountForHref = (href: string | undefined): number => {
    if (!href || !pendingBadges) return 0
    const key = ADMIN_BADGE_BY_HREF[href]
    if (!key) return 0
    const n = pendingBadges[key]
    return typeof n === "number" && n > 0 ? n : 0
  }

  const badgeCountForItem = (item: NavItem): number => {
    if (item.href) {
      return badgeCountForHref(item.href)
    }
    if (!item.subItems?.length) return 0
    return item.subItems.reduce((sum, subItem) => sum + badgeCountForItem(subItem), 0)
  }

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await getCurrentSubscription()
        const isActive = response.subscription?.is_active === true && response.subscription?.status === "active"
        setHasActiveSubscription(isActive)
        setEnabledModules(response.enabled_modules ?? [])
        setPackageName(response.subscription?.package_name?.trim() || null)
      } catch (error) {
        console.error("Failed to check subscription status:", error)
        // Default to false if check fails
        setHasActiveSubscription(false)
        setEnabledModules([])
        setPackageName(null)
      }
    }
    checkSubscription()
  }, [])

  const isCoreAdminNavItem = (item: NavItem): boolean => {
    if (item.href) {
      const normalized = item.href.split("?")[0].replace(/\/$/, "")
      if (ALWAYS_VISIBLE_ADMIN_HREFS.has(normalized)) {
        return true
      }
    }
    const slug = ADMIN_NAV_MODULE_MAP[item.label]
    return slug ? CORE_ADMIN_MODULE_SLUGS.has(slug) : false
  }

  // Filter nav items based on subscription status
  // Always show subscription + core admin tools; hide business modules if no active subscription
  const filterBySubscription = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      if (
        item.label === "Subscription" ||
        item.href === "/admin/subscriptions" ||
        item.href === "/admin/subscription"
      ) {
        return true
      }
      if (isCoreAdminNavItem(item)) {
        return true
      }
      if (hasActiveSubscription === null) {
        return true
      }
      return hasActiveSubscription
    })
  }

  const roleSlug = String(userRole || "member").toLowerCase().replace(/-/g, "_")

  // Permission-based nav matches /api/admin/* checks; super_admin sees all. Otherwise require Spatie permission slugs (no legacy route-only fallback).
  const superAdmin = isTenantSuperAdminContext(roleNames, roleSlug)
  const roleFilteredItems = superAdmin
    ? ADMIN_NAV_ITEMS
    : permissions.length > 0
      ? getPermissionFilteredNavItems(
          permissions,
          roleNames.length ? roleNames : [],
          ADMIN_NAV_ITEMS,
          roleSlug,
        )
      : MINIMAL_STAFF_NAV
  const subscriptionFiltered = filterBySubscription(roleFilteredItems)
  const shouldSkipModuleFilter =
    enabledModules === null ||
    (hasActiveSubscription === true && enabledModules.length === 0)
  const filteredNavItems = shouldSkipModuleFilter
    ? subscriptionFiltered
    : filterAdminNavByModules(subscriptionFiltered, enabledModules)

  const [navQuery, setNavQuery] = useState("")
  const [pinnedSectionId, setPinnedSectionId] = useState<AdminNavSectionId | null>(null)
  const [pinnedForPath, setPinnedForPath] = useState(pathname)

  if (pinnedForPath !== pathname) {
    setPinnedForPath(pathname)
    setPinnedSectionId(null)
  }

  const sections = useMemo(() => bucketAdminNav(filteredNavItems), [filteredNavItems])
  const searching = navQuery.trim().length > 0
  const routedSectionId = findAdminSectionId(filteredNavItems, pathname)
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

  const { toggleMenu, isMenuOpen } = useSidebarNavigation(filteredNavItems, pathname, "flat")

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
        candidatePath === "/admin"
          ? pathname === "/admin"
          : pathname === candidatePath || pathname.startsWith(`${candidatePath}/`)
      if (!matches) continue
      if (!best || candidatePath.length > best.length) best = candidatePath
    }
    return best === path
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
      let lastCluster: string | undefined

      return (
        <div key={item.label} className="space-y-1">
          <button
            type="button"
            onClick={() => toggleMenu(item.label)}
            aria-expanded={isOpen}
            title={item.label}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              hasActiveChild
                ? "text-foreground"
                : isOpen
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                hasActiveChild
                  ? "bg-primary/10 text-primary"
                  : isOpen
                    ? "bg-background text-foreground shadow-sm"
                    : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <PendingBadge count={groupBadge} />
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
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
              <div className="mb-1 ml-6 space-y-0.5 border-l border-border py-1 pl-3">
                {item.subItems?.map((subItem) => {
                  const showCluster = Boolean(subItem.cluster) && subItem.cluster !== lastCluster
                  lastCluster = subItem.cluster
                  const isSubActive = linkIsCurrent(subItem.href, childHrefs)
                  const subBadge = badgeCountForHref(subItem.href)
                  return (
                    <Fragment key={subItem.href ?? subItem.label}>
                      {showCluster ? (
                        <p className="px-3 pb-1 pt-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          {subItem.cluster}
                        </p>
                      ) : null}
                      <Link
                        href={subItem.href!}
                        title={subItem.label}
                        data-nav-active={isSubActive ? "true" : undefined}
                        aria-current={isSubActive ? "page" : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isSubActive
                            ? "bg-primary font-medium text-primary-foreground"
                            : "font-normal text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{subItem.label}</span>
                        <PendingBadge count={subBadge} />
                      </Link>
                    </Fragment>
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
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            isActive ? "bg-primary-foreground/15 text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <PendingBadge count={topBadge} />
      </Link>
    )
  }

  const planLabel = hasActiveSubscription === false ? "No active plan" : packageName
  const showSwitcher = sections.length > 1

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-[73px] z-50 flex w-80 min-h-0 flex-col overflow-hidden border-r bg-card transition-transform duration-300",
          "lg:static lg:top-auto lg:h-full lg:max-h-full lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-3 py-3 lg:hidden">
          <span className="font-semibold">Admin Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="shrink-0 space-y-4 border-b px-4 py-4">
          {planLabel ? (
            <p className="truncate px-0.5 text-xs font-semibold text-foreground/80" title={planLabel}>
              {planLabel}
            </p>
          ) : null}

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={navQuery}
              onChange={(e) => setNavQuery(e.target.value)}
              placeholder="Search all menus"
              className={cn("h-10 rounded-xl bg-muted/30 pl-9", navQuery ? "pr-9" : "")}
              aria-label="Search all menus"
            />
            {navQuery ? (
              <button
                type="button"
                onClick={() => setNavQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear menu search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {showSwitcher ? (
            <div
              className={cn(
                "grid gap-2",
                sections.length <= 2 ? "grid-cols-2" : sections.length === 3 ? "grid-cols-3" : "grid-cols-4",
              )}
              role="group"
              aria-label="Admin areas"
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
                    title={
                      pending > 0
                        ? `${group.section.label}. ${pending} waiting`
                        : group.section.description
                    }
                    onClick={() => {
                      setNavQuery("")
                      setPinnedSectionId(group.section.id)
                    }}
                    className={cn(
                      "relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2.5 text-[11px] font-medium leading-none transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/80 bg-background text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <SectionIcon className="h-4 w-4 shrink-0" />
                    <span>{group.section.short}</span>
                    {pending > 0 ? (
                      <span
                        className={cn(
                          "absolute right-2 top-2 h-1.5 w-1.5 rounded-full",
                          selected ? "bg-primary-foreground" : "bg-destructive",
                        )}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>
          ) : null}

          <div className="px-0.5">
            {searching ? (
              <>
                <p className="text-sm font-semibold text-foreground">Search</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Matches across every menu on this plan
                </p>
              </>
            ) : currentGroup ? (
              <>
                <p className="text-sm font-semibold text-foreground">{currentGroup.section.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {currentGroup.section.description}
                </p>
              </>
            ) : null}
          </div>
        </div>

        <div ref={navScrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {searching ? (
            searchGroups.length > 0 ? (
              <div className="space-y-6">
                {searchGroups.map((group) => (
                  <div key={group.section.id}>
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.section.label}
                    </p>
                    <div className="space-y-1">{group.items.map((item) => renderNavItem(item))}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matching menu items.</p>
            )
          ) : currentGroup ? (
            <nav className="space-y-1" aria-label={currentGroup.section.label}>
              {currentGroup.items.map((item) => renderNavItem(item))}
            </nav>
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No menus available.</p>
          )}
        </div>
      </aside>
    </>
  )
}
