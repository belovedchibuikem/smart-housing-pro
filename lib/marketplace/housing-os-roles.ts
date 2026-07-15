/**
 * Housing OS RBAC map — additive roles.
 * Existing Spatie cooperative roles remain unchanged.
 * New marketplace roles append capabilities without renaming legacy roles.
 */

export const HOUSING_OS_ROLES = [
  { key: "guest", label: "Guest", notes: "Unauthenticated marketplace browse" },
  { key: "member", label: "User / Member", notes: "Existing cooperative member" },
  { key: "buyer", label: "Buyer", notes: "Capability flag on member — favorites, inquiries" },
  { key: "seller", label: "Seller", notes: "Capability via landlord/vendor listing publish" },
  { key: "tenant_renter", label: "Tenant (renter)", notes: "Lease holder on rental unit" },
  { key: "landlord", label: "Landlord", notes: "Additive Spatie role — Tenant Admin path" },
  { key: "vendor", label: "Vendor", notes: "tenant_details.vendor_type / marketplace visible" },
  { key: "cooperative", label: "Cooperative", notes: "Existing tenant org — not renamed" },
  { key: "agent", label: "Agent", notes: "MarketplaceAgentProfile + additive Spatie" },
  { key: "property_manager", label: "Property Manager", notes: "Existing role" },
  { key: "estate_manager", label: "Estate Manager", notes: "Maps to property_manager + estates" },
  { key: "admin", label: "Admin", notes: "Existing tenant admin" },
  { key: "super_admin", label: "Super Admin", notes: "Platform operator" },
] as const

export type HousingOsRoleKey = (typeof HOUSING_OS_ROLES)[number]["key"]
