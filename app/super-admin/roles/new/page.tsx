"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Permission {
  id: string
  name: string
  guard_name: string
}

interface GroupedPermissions {
  [key: string]: Permission[]
}

export default function NewRolePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [groupedPermissions, setGroupedPermissions] = useState<GroupedPermissions>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      const response = await apiFetch<{ grouped_permissions: GroupedPermissions }>("/super-admin/permissions/grouped")
      setGroupedPermissions(response.grouped_permissions || {})
    } catch (e: any) {
      toast.error(e.message || "Failed to load permissions")
      setGroupedPermissions({})
    } finally {
      setIsLoading(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiFetch("/super-admin/roles", {
        method: 'POST',
        body: {
          name: formData.name,
          description: formData.description,
          permissions: selectedPermissions
        }
      })
      toast.success("Role created successfully!")
      router.push("/super-admin/roles")
    } catch (e: any) {
      toast.error(e.message || "Failed to create role")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/roles">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Role</h1>
          <p className="text-muted-foreground mt-1">Create a new super admin role with custom permissions</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Business Manager" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief description of this role" 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Permissions</h2>
            <p className="text-sm text-muted-foreground">
              Select the permissions for this role. Users with this role will have access to the selected features.
            </p>
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
                      <h3 className="font-semibold capitalize">{category}</h3>
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Role"}
            </Button>
            <Link href="/super-admin/roles">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}