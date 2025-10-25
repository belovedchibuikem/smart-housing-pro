"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"

interface Role {
  id: string
  name: string
  slug: string
  description: string
  user_count: number
  permissions: Record<string, any>
  spatie_permissions?: Array<{
    id: string
    name: string
    guard_name: string
  }>
  is_active: boolean
  guard_name: string
  created_at: string
  updated_at: string
}

interface Permission {
  id: string
  name: string
  guard_name: string
}

interface GroupedPermissions {
  [key: string]: Permission[]
}

export default function EditRolePage() {
  const params = useParams()
  const router = useRouter()
  const roleId = params.id as string
  
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({})
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadRole()
    loadPermissions()
  }, [roleId])

  const loadRole = async () => {
    try {
      const response = await apiFetch<{ success: boolean; role: Role }>(`/super-admin/roles/${roleId}`)
      setRole(response.role)
      setFormData({
        name: response.role.name,
        description: response.role.description,
      })
      
      // Load role permissions separately to avoid memory issues
      await loadRolePermissions()
    } catch (e: any) {
      toast.error(e.message || "Failed to load role")
    } finally {
      setIsLoading(false)
    }
  }

  const loadRolePermissions = async () => {
    try {
      const response = await apiFetch<{ success: boolean; permissions: Array<{ id: string; name: string; guard_name: string }> }>(`/super-admin/roles/${roleId}/permissions`)
      if (response.permissions && response.permissions.length > 0) {
        setSelectedPermissions(response.permissions.map(p => p.name))
        
        // Expand all categories that have selected permissions
        const categoriesWithPermissions = new Set<string>()
        response.permissions.forEach(permission => {
          const category = permission.name.split('.')[0]
          categoriesWithPermissions.add(category)
        })
        setExpandedCategories(categoriesWithPermissions)
      }
    } catch (e: any) {
      console.error("Failed to load role permissions:", e)
      // Don't show error toast for permissions, just log it
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await apiFetch<{ success: boolean; grouped_permissions: GroupedPermissions }>("/super-admin/permissions/grouped")
      setGroupedPermissions(response.grouped_permissions || {})
    } catch (e: any) {
      toast.error(e.message || "Failed to load permissions")
      setGroupedPermissions({})
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required")
      return
    }

    setIsSaving(true)
    try {
      await apiFetch(`/super-admin/roles/${roleId}`, {
        method: 'PUT',
        body: {
          name: formData.name,
          description: formData.description,
          permissions: selectedPermissions
        }
      })
      toast.success("Role updated successfully!")
      router.push("/super-admin/roles")
    } catch (e: any) {
      toast.error(e.message || "Failed to update role")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await apiFetch(`/super-admin/roles/${roleId}`, {
        method: 'DELETE',
      })
      toast.success("Role deleted successfully!")
      router.push("/super-admin/roles")
    } catch (e: any) {
      toast.error(e.message || "Failed to delete role")
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const togglePermission = (permissionName: string) => {
    console.log('togglePermission called with:', permissionName)
    setSelectedPermissions(prev => {
      const newSelection = prev.includes(permissionName) 
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
      console.log('New selection:', newSelection)
      return newSelection
    })
  }

  const toggleCategory = (category: string, checked: boolean) => {
    const categoryPermissions = Array.isArray(groupedPermissions[category]) ? groupedPermissions[category] : []
    const permissionNames = categoryPermissions.map(p => p.name)
    
    if (checked) {
      setSelectedPermissions(prev => [...new Set([...prev, ...permissionNames])])
    } else {
      setSelectedPermissions(prev => prev.filter(p => !permissionNames.includes(p)))
    }
  }

  const isCategorySelected = (category: string) => {
    const categoryPermissions = Array.isArray(groupedPermissions[category]) ? groupedPermissions[category] : []
    return categoryPermissions.length > 0 && categoryPermissions.every(p => selectedPermissions.includes(p.name))
  }

  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermissions = Array.isArray(groupedPermissions[category]) ? groupedPermissions[category] : []
    if (categoryPermissions.length === 0) return false
    const selectedInCategory = categoryPermissions.filter(p => selectedPermissions.includes(p.name)).length
    return selectedInCategory > 0 && selectedInCategory < categoryPermissions.length
  }

  if (isLoading) return <div className="p-6">Loading...</div>
  if (!role) return <div className="p-6 text-red-600">Role not found</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/super-admin/roles">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roles
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Role</h1>
          <p className="text-muted-foreground mt-1">Update role permissions and settings</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter role name"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter role description"
                rows={3}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Permissions</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select the permissions for this role. Users with this role will have access to the selected features.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedPermissions).map(([category, permissions]) => {
                const categoryPermissions = Array.isArray(permissions) ? permissions : []
                const isExpanded = expandedCategories.has(category)
                return (
                <Card key={category} className="overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleCategoryExpansion(category)}
                  >
                    <div className="flex items-center space-x-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <h4 className="font-medium capitalize">{category}</h4>
                      <span className="text-sm text-muted-foreground">
                        ({categoryPermissions.length} permissions)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        id={`select-all-${category}`}
                        checked={isCategorySelected(category)}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = isCategoryPartiallySelected(category)
                          }
                        }}
                        onCheckedChange={(checked) => {
                          console.log('Select All clicked for category:', category, checked)
                          toggleCategory(category, checked as boolean)
                        }}
                      />
                      <Label htmlFor={`select-all-${category}`} className="text-sm cursor-pointer">
                        Select All
                      </Label>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t p-4 bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.name)}
                              onCheckedChange={(checked) => {
                                console.log('Checkbox clicked:', permission.name, checked)
                                togglePermission(permission.name)
                              }}
                            />
                            <Label 
                              htmlFor={permission.id} 
                              className="text-sm font-medium cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
                )
              })}
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || role.user_count > 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Role"}
          </Button>
          
          <div className="flex items-center gap-3">
            <Link href="/super-admin/roles">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}