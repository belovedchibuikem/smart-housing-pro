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

export interface Member {
  id: string
  user_id: string
  member_number: string
  staff_id?: string
  ippis_number?: string
  date_of_birth?: string
  gender?: 'Male' | 'Female'
  marital_status?: 'Single' | 'Married' | 'Divorced' | 'Widowed'
  nationality?: string
  state_of_origin?: string
  lga?: string
  residential_address?: string
  city?: string
  state?: string
  rank?: string
  department?: string
  command_state?: string
  employment_date?: string
  years_of_service?: number
  membership_type?: 'Regular' | 'Associate'
  kyc_status: 'pending' | 'verified' | 'rejected'
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
