export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'suspended'
  avatar_url?: string
  email_verified_at?: string
  last_login?: string
  created_at: string
  updated_at: string
  member?: Member
  roles?: Array<{
    id: string
    name: string
    description?: string
    color?: string
  }>
}

export interface KycDocument {
  type: string
  path: string
  uploaded_at?: string | null
}

export interface Member {
  id: string
  user_id: string
  member_number: string
  staff_id?: string | null
  ippis_number?: string | null
  date_of_birth?: string | null
  gender?: string | null
  marital_status?: string | null
  nationality?: string | null
  state_of_origin?: string | null
  lga?: string | null
  residential_address?: string | null
  city?: string | null
  state?: string | null
  rank?: string | null
  department?: string | null
  command_state?: string | null
  employment_date?: string | null
  years_of_service?: number | null
  next_of_kin_name?: string | null
  next_of_kin_relationship?: string | null
  next_of_kin_phone?: string | null
  next_of_kin_email?: string | null
  next_of_kin_address?: string | null
  membership_type?: string | null
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected'
  kyc_submitted_at?: string | null
  kyc_verified_at?: string | null
  kyc_rejection_reason?: string | null
  kyc_documents?: KycDocument[]
  created_at: string
  updated_at: string
}

export interface UserStats {
  total_users: number
  active_users: number
  inactive_users: number
  suspended_users: number
  admin_users: number
  member_users: number
}

export interface UsersResponse {
  users: User[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface CreateUserRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  roles: string[]
  status: 'active' | 'inactive' | 'suspended'
  password: string
  member_data?: Partial<Member>
}

export interface UpdateUserRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  roles?: string[]
  status?: 'active' | 'inactive' | 'suspended'
  password?: string
  member_data?: Partial<Member>
}
