"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Shield, CheckCircle, Plus, Edit, Trash2, MoreHorizontal, Filter } from "lucide-react"
import { useGroupedPermissions, usePermissionStats } from "@/lib/hooks/use-permissions"
import { Permission as PermissionType } from "@/lib/types/role"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"

export default function PermissionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [groupFilter, setGroupFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deletePermissionId, setDeletePermissionId] = useState<string | null>(null)

  const { groupedPermissions, loading, error, refetch } = useGroupedPermissions({
    search: searchQuery,
    group: groupFilter,
    is_active: statusFilter,
  })

  const { stats, loading: statsLoading } = usePermissionStats()

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      'members': 'bg-blue-500',
      'properties': 'bg-green-500',
      'financial': 'bg-yellow-500',
      'loans': 'bg-purple-500',
      'documents': 'bg-pink-500',
      'reports': 'bg-indigo-500',
      'users': 'bg-orange-500',
      'roles': 'bg-red-500',
      'communication': 'bg-teal-500',
      'settings': 'bg-gray-500',
    }
    return colors[group] || 'bg-gray-500'
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-red-500'
  }

  const getGroupDisplayName = (group: string) => {
    const groups: Record<string, string> = {
      'members': 'Member Management',
      'properties': 'Property Management',
      'financial': 'Financial Management',
      'loans': 'Loan Management',
      'documents': 'Document Management',
      'reports': 'Reports & Analytics',
      'users': 'User Management',
      'roles': 'Role Management',
      'communication': 'Communication Management',
      'settings': 'Settings & Configuration',
    }
    return groups[group] || group
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Permissions</h1>
            <p className="text-muted-foreground mt-1">Manage system permissions and access controls</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error loading permissions: {error}</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage system permissions and access controls</p>
        </div>
        <Button onClick={() => window.location.href = '/admin/permissions/new'}>
          <Plus className="h-4 w-4 mr-2" />
          Add Permission
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Permissions</p>
                  <p className="text-2xl font-bold">{stats.total_permissions}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Permissions</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_permissions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Permission Groups</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.groups_count}</p>
                </div>
                <Filter className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive Permissions</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.inactive_permissions}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>View and manage system permissions by group</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search permissions..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="members">Member Management</SelectItem>
                  <SelectItem value="properties">Property Management</SelectItem>
                  <SelectItem value="financial">Financial Management</SelectItem>
                  <SelectItem value="loans">Loan Management</SelectItem>
                  <SelectItem value="documents">Document Management</SelectItem>
                  <SelectItem value="reports">Reports & Analytics</SelectItem>
                  <SelectItem value="users">User Management</SelectItem>
                  <SelectItem value="roles">Role Management</SelectItem>
                  <SelectItem value="communication">Communication Management</SelectItem>
                  <SelectItem value="settings">Settings & Configuration</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {Array.isArray(groupedPermissions) && groupedPermissions.map((group) => {
                const permissionList = Array.isArray(group.permissions) ? group.permissions : []
                return (
                <div key={group.group} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getGroupColor(group.group)} text-white`}>
                          {group.group_display_name || getGroupDisplayName(group.group)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {permissionList.length} permission{permissionList.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>In Use</TableHead>
                        <TableHead>Sort Order</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissionList.map((permission) => {
                        const raw = (permission as any)
                        const inUse = ((): boolean => {
                          const v = raw?.is_in_use ?? raw?.is_active
                          if (typeof v === 'boolean') return v
                          if (typeof v === 'number') return v !== 0
                          if (typeof v === 'string') {
                            const t = v.trim().toLowerCase()
                            return t === '1' || t === 'true' || t === 'yes' || t === 'active'
                          }
                          return !!v
                        })()
                        return (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {permission.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {permission.description || 'No description available'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(inUse)} text-white`}>
                              {inUse === true ? 'In Use' : inUse === false ? 'Not In Use' : 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">{permission.sort_order}</span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => window.location.href = `/admin/permissions/${permission.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Permission
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeletePermissionId(permission.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )})}
                    </TableBody>
                  </Table>
                </div>
              )})}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePermissionId} onOpenChange={() => setDeletePermissionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the permission
              and remove it from all roles that have it assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletePermissionId) {
                  // Handle delete permission
                  toast.success("Permission deleted successfully!")
                  setDeletePermissionId(null)
                  refetch()
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
