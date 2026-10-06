import { useTenantPermissions } from "@/components/admin/can-permission"

/**
 * Spatie permission required to run each /admin/bulk-upload/{slug} upload.
 * Mirrors api/config/tenant_admin_action_permissions.php bulk.* POST rules.
 */
export const BULK_UPLOAD_SLUG_PERMISSIONS: Record<string, string> = {
  members: "bulk_upload_members",
  contributions: "bulk_upload_contributions",
  loans: "bulk_upload_loans",
  properties: "bulk_upload_properties",
  "equity-contributions": "bulk_upload_equity_contributions",
  "loan-repayments": "bulk_upload_loan_repayments",
  mortgages: "bulk_upload_mortgages",
  "mortgage-repayments": "bulk_mortgage_repayments",
  "internal-mortgages": "bulk_internal_mortgages",
  "internal-mortgage-repayments": "bulk_internal_mortgage_repayments",
  refund: "bulk_refunds",
  "wallet-transfers": "bulk_wallet_transfers",
  "property-subscribers": "bulk_property_subscribers",
  "property-payments": "bulk_property_payments",
  lands: "bulk_upload_lands",
  "land-subscriptions": "bulk_land_subscriptions",
  "land-payments": "bulk_land_payments",
  "equity-asset-repayments": "bulk_equity_repayments",
  "contribution-asset-repayments": "bulk_contribution_repayments",
  "issued-documents": "issue_documents",
  rollbacks: "rollback_financial_transactions",
  investments: "bulk_upload_investments",
}

export function getBulkUploadPermission(slug: string): string {
  return BULK_UPLOAD_SLUG_PERMISSIONS[slug] ?? "access_admin_panel"
}

export function useBulkUploadPermission(slug: string): boolean {
  const { can } = useTenantPermissions()
  return can(getBulkUploadPermission(slug))
}
