"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Shield } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { toast } from "sonner"

interface Role {
  id: string
  name: string
  slug: string
  description: string
  user_count: number
  permissions: Array<{
    id: string
    name: string
    guard_name: string
  }>
  permissions_count?: number
  is_active: boolean
  guard_name: string
  created_at: string
  updated_at: string
}

interface RolesResponse {
  success: boolean
  roles: Role[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function SuperAdminRolesPage() {
  const [showAddRole, setShowAddRole] = useState(false)
  
  const { isLoading, data, error, loadData } = usePageLoading<RolesResponse>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<RolesResponse>("/super-admin/roles")
      return response
    })
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/super-admin/roles/${id}`, {
        method: 'DELETE',
      })
      toast.success("Role deleted successfully!")
      loadData(async () => {
        const response = await apiFetch<RolesResponse>("/super-admin/roles")
        return response
      }) // Reload data
    } catch (e: any) {
      toast.error(e.message || "Failed to delete role")
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const roles = data?.roles || []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage super admin roles and permissions</p>
        </div>
        <Link href="/super-admin/roles/new">
          <Button onClick={() => setShowAddRole(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{role.name}</h3>
                    <Badge variant="secondary">{role.user_count} users</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions_count && role.permissions_count > 0 ? (
                      <Badge variant="outline">
                        {role.permissions_count} permissions assigned
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No permissions assigned</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/super-admin/roles/${role.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(role.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
