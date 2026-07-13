import { useTenantPermissions } from "@/components/admin/can-permission"

/**
 * Spatie permission required to run each /admin/bulk-upload/{slug} upload.
 * Mirrors api/config/tenant_admin_action_permissions.php bulk.* POST rules.
 */
export const BULK_UPLOAD_SLUG_PERMISSIONS: Record<string, string> = {
  members: "bulk_upload_members",
  contributions: "create_contributions",
  loans: "create_loans",
  properties: "create_properties",
  "equity-contributions": "bulk_upload_equity_contributions|create_equity_contributions",
  "loan-repayments": "manage_loan_repayments",
  mortgages: "create_loans",
  "mortgage-repayments": "manage_loan_repayments",
  "internal-mortgages": "create_loans",
  "internal-mortgage-repayments": "manage_loan_repayments",
  refund: "manage_payments",
  "property-subscribers": "manage_property_allottees|approve_allotments",
  "property-payments": "manage_payments|manage_property_allottees",
  lands: "create_properties",
  "land-subscriptions": "manage_property_allottees|approve_allotments",
  "land-payments": "manage_payments|manage_property_allottees",
  investments: "create_investments|approve_investments|create_investment_plans",
}

export function getBulkUploadPermission(slug: string): string {
  return BULK_UPLOAD_SLUG_PERMISSIONS[slug] ?? "access_admin_panel"
}

export function useBulkUploadPermission(slug: string): boolean {
  const { can } = useTenantPermissions()
  return can(getBulkUploadPermission(slug))
}
