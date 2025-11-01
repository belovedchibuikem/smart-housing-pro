import { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/api/client'
import { Permission, GroupedPermissions } from '@/lib/types/role'

interface UsePermissionsOptions {
  search?: string
  group?: string
  is_active?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  perPage?: number
}

export function usePermissions(options: UsePermissionsOptions = {}) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 50,
    total: 0
  })

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (options.search) params.append('search', options.search)
      if (options.group) params.append('group', options.group)
      if (options.is_active && options.is_active !== 'all') params.append('is_active', options.is_active)
      if (options.sortBy) params.append('sort_by', options.sortBy)
      if (options.sortOrder) params.append('sort_order', options.sortOrder)
      if (options.page) params.append('page', options.page.toString())
      if (options.perPage) params.append('per_page', options.perPage.toString())

      const response = await apiFetch<{ success?: boolean; permissions: any; pagination?: any }>(`/admin/permissions?${params.toString()}`)
      const list = Array.isArray(response.permissions)
        ? response.permissions
        : (response as any).data?.permissions || response.permissions?.data || []
      // Normalize is_active to boolean (handles various source keys)
      const toBool = (v: any) => {
        if (typeof v === 'boolean') return v
        if (typeof v === 'number') return v !== 0
        if (typeof v === 'string') {
          const t = v.trim().toLowerCase()
          return t === '1' || t === 'true' || t === 'yes' || t === 'active'
        }
        return !!v
      }
      const normalized = (list as any[]).map((p) => {
        const raw = (p as any)
        const rawActive =
          ('is_active' in raw ? raw.is_active : undefined) ??
          ('active' in raw ? raw.active : undefined) ??
          ('status' in raw ? raw.status : undefined) ??
          ('enabled' in raw ? raw.enabled : undefined)
        return {
          ...p,
          is_active: toBool(rawActive),
        }
      })
      setPermissions(normalized as Permission[])
      if (response.pagination) {
        setPagination(response.pagination)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [options.search, options.group, options.is_active, options.sortBy, options.sortOrder, options.page, options.perPage])

  return {
    permissions,
    loading,
    error,
    pagination,
    refetch: fetchPermissions
  }
}

export function useGroupedPermissions(options: { search?: string; group?: string; is_active?: string } = {}) {
  const [groupedMap, setGroupedMap] = useState<Record<string, Permission[]>>({})
  const [groupedPermissions, setGroupedPermissions] = useState<Array<{ group: string; group_display_name: string; permissions: Permission[] }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toBool = (v: any) => {
    if (typeof v === 'boolean') return v
    if (typeof v === 'number') return v !== 0
    if (typeof v === 'string') {
      const t = v.trim().toLowerCase()
      return t === '1' || t === 'true' || t === 'yes' || t === 'active'
    }
    return !!v
  }

  const toDisplay = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  const fetchGroupedPermissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.search) params.append('search', options.search)
      if (options.group && options.group !== 'all') params.append('group', options.group)
      if (options.is_active && options.is_active !== 'all') params.append('is_active', options.is_active)

      const response = await apiFetch<{ success?: boolean; grouped_permissions: GroupedPermissions[] | Record<string, Permission[]> }>(
        `/admin/permissions/grouped${params.toString() ? `?${params.toString()}` : ''}`
      )

      const gp: any = response.grouped_permissions
      let map: Record<string, Permission[]> = {}

      if (Array.isArray(gp)) {
        gp.forEach((g: any) => {
          const key = g.group || 'ungrouped'
          const perms: any[] = g.permissions || []
          map[key] = perms.map((p) => {
            const raw = p as any
            const rawActive = ('is_active' in raw ? raw.is_active : undefined) ?? ('active' in raw ? raw.active : undefined) ?? ('status' in raw ? raw.status : undefined) ?? ('enabled' in raw ? raw.enabled : undefined)
            return { ...p, is_active: toBool(rawActive) } as Permission
          })
        })
      } else if (gp && typeof gp === 'object') {
        Object.entries(gp as Record<string, any[]>).forEach(([key, perms]) => {
          map[key] = (perms as any[]).map((p) => {
            const raw = p as any
            const rawActive = ('is_active' in raw ? raw.is_active : undefined) ?? ('active' in raw ? raw.active : undefined) ?? ('status' in raw ? raw.status : undefined) ?? ('enabled' in raw ? raw.enabled : undefined)
            return { ...p, is_active: toBool(rawActive) } as Permission
          })
        })
      }

      setGroupedMap(map)
      const arr = Object.entries(map).map(([group, permissions]) => ({
        group,
        group_display_name: toDisplay(group),
        permissions,
      }))
      setGroupedPermissions(arr)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch grouped permissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroupedPermissions()
  }, [options.search, options.group, options.is_active])

  return {
    groupedPermissions, // array for components using .map()
    groupedMap,         // map form if needed elsewhere
    loading,
    error,
    refetch: fetchGroupedPermissions,
  }
}

export function usePermissionGroups() {
  const [groups, setGroups] = useState<Array<{ group: string; display_name: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch<{ success: boolean; groups: Array<{ group: string; display_name: string; count: number }> }>('/admin/permissions/groups')
      setGroups(response.groups)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permission groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  return {
    groups,
    loading,
    error,
    refetch: fetchGroups
  }
}

export function useCreatePermission() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPermission = async (permissionData: Partial<Permission>) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch('/admin/permissions', {
        method: 'POST',
        body: JSON.stringify(permissionData)
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to create permission')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    createPermission,
    loading,
    error
  }
}

export function useUpdatePermission() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePermission = async (id: string, permissionData: Partial<Permission>) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/admin/permissions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(permissionData)
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to update permission')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    updatePermission,
    loading,
    error
  }
}

export function useDeletePermission() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deletePermission = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch(`/admin/permissions/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (err: any) {
      setError(err.message || 'Failed to delete permission')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    deletePermission,
    loading,
    error
  }
}

export function usePermissionStats() {
  const [stats, setStats] = useState<{
    total_permissions: number
    active_permissions: number
    inactive_permissions: number
    groups_count: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiFetch<{ success: boolean; stats: any }>(
        '/admin/permissions/stats'
      )
      setStats(response.stats)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch permission stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return { stats, loading, error, refetch: fetchStats }
}


