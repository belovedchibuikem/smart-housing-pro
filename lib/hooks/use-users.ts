import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api/client'
import { User, UsersResponse, UserStats, CreateUserRequest, UpdateUserRequest } from '@/lib/types/user'

interface UseUsersOptions {
  search?: string
  role?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  perPage?: number
}

export function useUsers(options: UseUsersOptions = {}) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (options.search) params.append('search', options.search)
      if (options.role && options.role !== 'all') params.append('role', options.role)
      if (options.status && options.status !== 'all') params.append('status', options.status)
      if (options.sortBy) params.append('sort_by', options.sortBy)
      if (options.sortOrder) params.append('sort_order', options.sortOrder)
      if (options.page) params.append('page', options.page.toString())
      if (options.perPage) params.append('per_page', options.perPage.toString())

      const response = await apiFetch<UsersResponse>(`/admin/users?${params.toString()}`)
      setUsers(response.users)
      setPagination(response.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [options.search, options.role, options.status, options.sortBy, options.sortOrder, options.page, options.perPage])

  return {
    users,
    loading,
    error,
    pagination,
    refetch: fetchUsers
  }
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch<{ stats: UserStats }>('/admin/users/stats')
      setStats(response.stats)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
}

export function useCreateUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUser = async (userData: CreateUserRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch('/admin/users', {
        method: 'POST',
        // Send plain object; apiFetch will JSON.stringify
        body: userData
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createUser,
    loading,
    error
  }
}

export function useUpdateUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateUser = async (id: string, userData: UpdateUserRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/admin/users/${id}`, {
        method: 'PUT',
        // Send plain object; apiFetch will JSON.stringify
        body: userData
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    updateUser,
    loading,
    error
  }
}

export function useDeleteUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteUser = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/admin/users/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteUser,
    loading,
    error
  }
}

export function useToggleUserStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleStatus = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/admin/users/${id}/toggle-status`, {
        method: 'POST'
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to toggle user status')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    toggleStatus,
    loading,
    error
  }
}




