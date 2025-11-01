import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api/client'
import { Role, RolesResponse, RoleStats, CreateRoleRequest, UpdateRoleRequest } from '@/lib/types/role'

interface UseRolesOptions {
  search?: string
  is_active?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  perPage?: number
}

export function useRoles(options: UseRolesOptions = {}) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  })

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (options.search) params.append('search', options.search)
      if (options.is_active && options.is_active !== 'all') params.append('is_active', options.is_active)
      if (options.sortBy) params.append('sort_by', options.sortBy)
      if (options.sortOrder) params.append('sort_order', options.sortOrder)
      if (options.page) params.append('page', options.page.toString())
      if (options.perPage) params.append('per_page', options.perPage.toString())

      const response = await apiFetch<RolesResponse>(`/admin/roles?${params.toString()}`)
      setRoles(response.roles)
      setPagination(response.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [options.search, options.is_active, options.sortBy, options.sortOrder, options.page, options.perPage])

  return {
    roles,
    loading,
    error,
    pagination,
    refetch: fetchRoles
  }
}

export function useRoleStats() {
  const [stats, setStats] = useState<RoleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch<{ success: boolean; stats: RoleStats }>('/admin/roles/stats')
      setStats(response.stats)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch role stats')
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

export function useCreateRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createRole = async (roleData: CreateRoleRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch('/admin/roles', {
        method: 'POST',
        body: JSON.stringify(roleData)
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to create role')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createRole,
    loading,
    error
  }
}

export function useUpdateRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateRole = async (id: string, roleData: UpdateRoleRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/admin/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roleData)
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to update role')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    updateRole,
    loading,
    error
  }
}

export function useDeleteRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteRole = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/admin/roles/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to delete role')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteRole,
    loading,
    error
  }
}

export function useToggleRoleStatus() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleStatus = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/admin/roles/${id}/toggle-status`, {
        method: 'POST'
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to toggle role status')
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




