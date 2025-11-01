export interface Role {
  id: string
  name: string
  description?: string
  color?: string
  is_active: boolean
  sort_order: number
  users_count: number
  permissions_count: number
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  display_name: string
  description?: string
  group: string
  group_display_name: string
  is_active: boolean
  sort_order: number
  roles_count: number
  users_count: number
  created_at: string
  updated_at: string
}

export interface GroupedPermissions {
  group: string
  group_display_name: string
  permissions: Permission[]
}

export interface RoleStats {
  total_roles: number
  active_roles: number
  inactive_roles: number
  roles_in_use: number
  total_permissions: number
}

export interface RolesResponse {
  success: boolean
  roles: Role[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface CreateRoleRequest {
  name: string
  description?: string
  color?: string
  is_active?: boolean
  sort_order?: number
  permissions?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  color?: string
  is_active?: boolean
  sort_order?: number
  permissions?: string[]
}




