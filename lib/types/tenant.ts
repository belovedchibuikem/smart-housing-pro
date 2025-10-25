// Multi-tenancy Type Definitions

export interface Tenant {
  id: string
  name: string
  slug: string
  custom_domain: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  status: "active" | "suspended" | "cancelled"
  subscription_status: "trial" | "active" | "past_due" | "cancelled"
  trial_ends_at: string | null
  subscription_ends_at: string | null
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TenantSubscription {
  id: string
  tenant_id: string
  package_id: string
  status: "active" | "past_due" | "cancelled"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
  package?: Package
}

export interface Package {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  billing_cycle: "monthly" | "yearly"
  trial_days: number
  is_active: boolean
  is_featured: boolean
  limits: PackageLimits
  created_at: string
  updated_at: string
  modules?: Module[]
}

export interface PackageLimits {
  max_members: number // -1 for unlimited
  max_properties: number
  max_loan_products: number
  max_contribution_plans: number
  max_investment_plans: number
  max_mortgage_plans: number
  storage_gb: number
  max_admins: number
  has_role_management: boolean // Only available in highest tier
}

export interface Module {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PackageModule {
  id: string
  package_id: string
  module_id: string
  limits: Record<string, any>
  created_at: string
}

export interface TenantUsage {
  id: string
  tenant_id: string
  module_slug: string
  metric_name: string
  current_value: number
  limit_value: number | null
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface TenantAdmin {
  id: string
  tenant_id: string
  email: string
  first_name: string
  last_name: string
  role: string
  is_owner: boolean
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface SuperAdmin {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  permissions: string[]
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface SuperAdminRole {
  id: string
  name: string
  description: string | null
  permissions: string[]
  created_at: string
  updated_at: string
}

export interface TenantInvoice {
  id: string
  tenant_id: string
  subscription_id: string
  invoice_number: string
  amount: number
  tax: number
  total: number
  status: "pending" | "paid" | "failed" | "refunded"
  due_date: string
  paid_at: string | null
  stripe_invoice_id: string | null
  invoice_url: string | null
  created_at: string
  updated_at: string
}

export interface LandingPageTemplate {
  id: string
  name: string
  description: string | null
  thumbnail_url: string | null
  template_data: any
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TenantLandingPage {
  id: string
  tenant_id: string
  template_id: string | null
  page_data: any
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface SuperAdminMessage {
  id: string
  sender_id: string
  subject: string
  body: string
  recipient_type: "tenant_admins" | "all_members" | "specific_tenant"
  tenant_id: string | null
  status: "draft" | "sent" | "scheduled"
  scheduled_at: string | null
  sent_at: string | null
  recipient_count: number
  created_at: string
  updated_at: string
}

export interface TenantActivityLog {
  id: string
  tenant_id: string
  actor_type: "super_admin" | "tenant_admin" | "system"
  actor_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}
