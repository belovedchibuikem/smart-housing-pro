"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Shield, Search } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { toast } from "sonner"
import { Pagination } from "@/components/ui/pagination"

interface Permission {
  id: string
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

interface PermissionsResponse {
  success: boolean
  permissions: Permission[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function SuperAdminPermissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  
  const { isLoading, data, error, loadData } = usePageLoading<PermissionsResponse>()

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string, page: number = 1) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          loadData(async () => {
            const params = new URLSearchParams()
            if (query) params.append('search', query)
            params.append('page', page.toString())
            
            const response = await apiFetch<PermissionsResponse>(`/super-admin/permissions?${params.toString()}`)
            return response
          })
        }, 300)
      }
    })(),
    [loadData]
  )

  useEffect(() => {
    debouncedSearch(searchTerm, currentPage)
  }, [searchTerm, currentPage, debouncedSearch])

  useEffect(() => {
    loadData(async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      params.append('page', currentPage.toString())
      
      const response = await apiFetch<PermissionsResponse>(`/super-admin/permissions?${params.toString()}`)
      return response
    })
  }, [loadData, currentPage])

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/super-admin/permissions/${id}`, {
        method: 'DELETE',
      })
      toast.success("Permission deleted successfully!")
      // Reload current page data
      loadData(async () => {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        params.append('page', currentPage.toString())
        
        const response = await apiFetch<PermissionsResponse>(`/super-admin/permissions?${params.toString()}`)
        return response
      })
    } catch (e: any) {
      toast.error(e.message || "Failed to delete permission")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const permissions = data?.permissions || []
  const pagination = data?.pagination

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage system permissions</p>
        </div>
        <Link href="/super-admin/permissions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Permission
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page when searching
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {permissions.map((permission) => (
          <Card key={permission.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{permission.name}</h3>
                    <Badge variant="outline">{permission.guard_name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(permission.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/super-admin/permissions/${permission.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(permission.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {permissions.length === 0 && (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No permissions found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first permission"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} permissions
          </div>
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

