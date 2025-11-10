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
  ChevronRight,
  CreditCard,
  FileText,
  Activity,
  Blocks,
  Globe,
  Palette,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface NavItem {
  href?: string
  label: string
  icon: any
  subItems?: NavItem[]
}

const navItems: NavItem[] = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/super-admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/super-admin/modules", label: "Modules", icon: Blocks },
  { 
    label: "Business Subscription", 
    icon: CreditCard,
    subItems: [
      { href: "/super-admin/subscriptions", label: "All Subscriptions", icon: CreditCard },
      { href: "/super-admin/packages", label: "Packages", icon: Package },
    ]
  },
  { 
    label: "Member Subscriptions", 
    icon: Package,
    subItems: [
      { href: "/super-admin/member-subscriptions", label: "Plans", icon: Package },
      { href: "/super-admin/member-subscriptions/list", label: "Member Subscriptions", icon: Users },
    ]
  },
  { href: "/super-admin/payment-gateways", label: "Payment Gateways", icon: CreditCard },
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
    ]
  },
  { href: "/super-admin/settings", label: "Platform Settings", icon: Settings },
]

interface SuperAdminSidebarProps {
  mobileMenuOpen: boolean
  setMobileMenuOpen: (open: boolean) => void
}

export function SuperAdminSidebar({ mobileMenuOpen, setMobileMenuOpen }: SuperAdminSidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const isMenuOpen = (label: string) => openMenus.includes(label)

  // Auto-open parent menus when a child is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const hasActiveChild = item.subItems.some((subItem) => {
          if (!subItem.href) return false
          if (pathname === subItem.href) return true
          return pathname.startsWith(subItem.href + "/")
        })
        if (hasActiveChild && !openMenus.includes(item.label)) {
          setOpenMenus((prev) => [...prev, item.label])
        }
      }
    })
  }, [pathname, openMenus])

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isOpen = isMenuOpen(item.label)
    
    // Enhanced active state logic
    const isActive = item.href ? (() => {
      // Exact match
      if (pathname === item.href) {
        return true
      }
      
      // For dashboard, only match exact path (not sub-paths)
      if (item.href === "/super-admin") {
        return pathname === "/super-admin"
      }
      
      // For other routes, match if pathname starts with the href
      return pathname.startsWith(item.href + "/")
    })() : false

    // Check if any sub-item is active for parent menu highlighting
    const hasActiveSubItem = hasSubItems && item.subItems?.some((subItem) => {
      if (!subItem.href) return false
      if (pathname === subItem.href) return true
      return pathname.startsWith(subItem.href + "/")
    })

    if (hasSubItems) {
      return (
        <div key={item.label}>
          <div className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center flex-1 gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                hasActiveSubItem
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
                const isSubActive = subItem.href ? (() => {
                  // Exact match
                  if (pathname === subItem.href) return true
                  
                  // Match if pathname starts with the href
                  return pathname.startsWith(subItem.href + "/")
                })() : false
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
                    title={`${subItem.label} - ${isSubActive ? 'ACTIVE' : 'inactive'} (${pathname})`}
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
        title={`${item.label} - ${isActive ? 'ACTIVE' : 'inactive'} (${pathname})`}
      >
        <Icon className="h-5 w-5" />
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
          <span className="font-semibold">Super Admin Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">{navItems.map((item) => renderNavItem(item))}</nav>
      </aside>
    </>
  )
}
