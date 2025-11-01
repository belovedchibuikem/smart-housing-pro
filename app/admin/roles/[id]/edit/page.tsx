"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { useUpdateRole } from "@/lib/hooks/use-roles"
import { useGroupedPermissions } from "@/lib/hooks/use-permissions"
import { UpdateRoleRequest } from "@/lib/types/role"
import { toast } from "sonner"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"

export default function EditRolePage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params.id as string
  
  const { updateRole, loading } = useUpdateRole()
  const { groupedPermissions, loading: permissionsLoading } = useGroupedPermissions()
  
  const [formData, setFormData] = useState<UpdateRoleRequest>({
    name: '',
    description: '',
    color: 'bg-blue-500',
    is_active: true,
    sort_order: 0,
    permissions: []
  })

  const [loadingRole, setLoadingRole] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoadingRole(true)
        const response = await apiFetch(`/admin/roles/${roleId}`)
        if (response.success) {
          const role = response.role
          setFormData({
            name: role.name,
            description: role.description || '',
            color: role.color || 'bg-blue-500',
            is_active: role.is_active,
            sort_order: role.sort_order || 0,
            permissions: role.permissions?.map((p: any) => p.name) || []
          })
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch role")
        router.push('/admin/roles')
      } finally {
        setLoadingRole(false)
      }
    }

    if (roleId) {
      fetchRole()
    }
  }, [roleId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      await updateRole(roleId, formData)
      toast.success("Role updated successfully!")
      router.push('/admin/roles')
    } catch (error: any) {
      if (error.details?.errors) {
        setErrors(error.details.errors)
      } else {
        toast.error(error.message || "Failed to update role")
      }
    }
  }

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, permissionName]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permissionName)
      }))
    }
  }

  const handleSelectAll = (groupPermissions: string[], checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...groupPermissions])]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !groupPermissions.includes(p))
      }))
    }
  }

  const colorOptions = [
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-pink-500', label: 'Pink' },
    { value: 'bg-gray-500', label: 'Gray' },
  ]

  if (loadingRole) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/roles">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Role</h1>
          <p className="text-muted-foreground mt-1">Update role information and permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Role Information</CardTitle>
                <CardDescription>Basic details about the role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., finance_manager"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this role can do"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                        className={`h-8 w-8 rounded-full ${color.value} ${
                          formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>Select the permissions for this role</CardDescription>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {formData.permissions.length} permissions selected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {permissionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {groupedPermissions?.map((group) => (
                      <div key={group.group} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{group.group_display_name}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAll(
                              group.permissions.map(p => p.name),
                              !group.permissions.every(p => formData.permissions.includes(p.name))
                            )}
                          >
                            {group.permissions.every(p => formData.permissions.includes(p.name)) ? 'Deselect All' : 'Select All'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={formData.permissions.includes(permission.name)}
                                onCheckedChange={(checked) => handlePermissionChange(permission.name, !!checked)}
                              />
                              <Label htmlFor={permission.id} className="text-sm">
                                {permission.display_name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/roles">
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Update Role
          </Button>
        </div>
      </form>
    </div>
  )
}