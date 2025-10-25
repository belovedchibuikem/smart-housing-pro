export type UserRole =
  | "super_admin"
  | "finance_manager"
  | "loan_officer"
  | "property_manager"
  | "member_manager"
  | "document_manager"
  | "system_admin"
  | "investment_manager"

export interface RolePermissions {
  role: UserRole
  label: string
  description: string
  allowedRoutes: string[]
}

export const rolePermissions: Record<UserRole, RolePermissions> = {
  super_admin: {
    role: "super_admin",
    label: "Super Admin",
    description: "Full access to all system features",
    allowedRoutes: ["*"], // Access to everything
  },
  finance_manager: {
    role: "finance_manager",
    label: "Finance Manager",
    description: "Manage contributions, wallets, and financial reports",
    allowedRoutes: [
      "/admin",
      "/admin/contributions",
      "/admin/bulk-upload/contributions",
      "/admin/wallets",
      "/admin/wallets/transactions",
      "/admin/wallets/pending",
      "/admin/financial-reports",
      "/admin/reports/financial",
      "/admin/reports/contributions",
      "/admin/statutory-charges",
      "/admin/statutory-charges/types",
      "/admin/statutory-charges/payments",
      "/admin/statutory-charges/departments",
    ],
  },
  loan_officer: {
    role: "loan_officer",
    label: "Loan Officer",
    description: "Manage loans, mortgages, and repayments",
    allowedRoutes: [
      "/admin",
      "/admin/loans",
      "/admin/bulk-upload/loan-repayments",
      "/admin/loan-products",
      "/admin/loans/settings",
      "/admin/mortgages",
      "/admin/reports/loans",
    ],
  },
  property_manager: {
    role: "property_manager",
    label: "Property Manager",
    description: "Manage properties, estates, and maintenance",
    allowedRoutes: [
      "/admin",
      "/admin/properties",
      "/admin/eoi-forms",
      "/admin/property-management/estates",
      "/admin/property-management/allottees",
      "/admin/property-management/maintenance",
      "/admin/property-management/reports",
      "/admin/reports/properties",
      "/admin/blockchain",
    ],
  },
  investment_manager: {
    role: "investment_manager",
    label: "Investment Manager",
    description: "Manage investment plans and portfolios",
    allowedRoutes: ["/admin", "/admin/investment-plans", "/admin/reports/investments"],
  },
  member_manager: {
    role: "member_manager",
    label: "Member Manager",
    description: "Manage members, subscriptions, and KYC",
    allowedRoutes: ["/admin", "/admin/members", "/admin/bulk-upload/members", "/admin/reports/members"],
  },
  document_manager: {
    role: "document_manager",
    label: "Document Manager",
    description: "Manage documents and approvals",
    allowedRoutes: ["/admin", "/admin/documents"],
  },
  system_admin: {
    role: "system_admin",
    label: "System Administrator",
    description: "Manage users, roles, and system settings",
    allowedRoutes: ["/admin", "/admin/users", "/admin/roles", "/admin/settings", "/admin/activity-logs"],
  },
}

// Helper function to check if user has access to a route
export function hasAccess(userRole: UserRole, route: string): boolean {
  const permissions = rolePermissions[userRole]

  // Super admin has access to everything
  if (permissions.allowedRoutes.includes("*")) {
    return true
  }

  // Check if the route matches any allowed routes
  return permissions.allowedRoutes.some((allowedRoute) => {
    // Exact match
    if (route === allowedRoute) return true
    // Check if route starts with allowed route (for sub-routes)
    if (route.startsWith(allowedRoute + "/")) return true
    return false
  })
}

// Helper function to filter nav items based on role
export function getFilteredNavItems(userRole: UserRole, navItems: any[]): any[] {
  const permissions = rolePermissions[userRole]

  // Super admin sees everything
  if (permissions.allowedRoutes.includes("*")) {
    return navItems
  }

  return navItems.filter((item) => {
    // If item has href, check if user has access
    if (item.href) {
      return hasAccess(userRole, item.href)
    }

    // If item has subItems, filter them and keep parent if any subItem is accessible
    if (item.subItems) {
      const filteredSubItems = item.subItems.filter((subItem: any) => hasAccess(userRole, subItem.href))
      if (filteredSubItems.length > 0) {
        item.subItems = filteredSubItems
        return true
      }
      return false
    }

    return false
  })
}
