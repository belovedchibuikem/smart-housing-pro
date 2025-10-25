export interface SuperAdminRole {
  id: string
  name: string
  description: string
  permissions: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SuperAdminUser {
  id: string
  email: string
  name: string
  role_id: string
  role?: SuperAdminRole
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface SuperAdminActivityLog {
  id: string
  super_admin_id: string
  super_admin?: SuperAdminUser
  action: string
  resource_type: string | null
  resource_id: string | null
  business_id: string | null
  metadata: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface SuperAdminMailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  created_at: string
  updated_at: string
}

export interface SuperAdminSentMail {
  id: string
  super_admin_id: string
  template_id: string | null
  recipient_type: "business_admin" | "all_members" | "specific_business"
  recipient_ids: string[]
  business_id: string | null
  subject: string
  body: string
  sent_count: number
  status: "pending" | "sent" | "failed"
  sent_at: string | null
  created_at: string
}
