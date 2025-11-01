"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Shield, Mail, Phone, Edit, Trash2, MoreHorizontal, User } from "lucide-react"
import { AddUserModal } from "@/components/admin/add-user-modal"
import { EditUserModal } from "@/components/admin/edit-user-modal"
import { useUsers, useUserStats, useDeleteUser, useToggleUserStatus } from "@/lib/hooks/use-users"
import { User as UserType } from "@/lib/types/user"
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

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  const { users, loading, error, pagination, refetch } = useUsers({
    search: searchQuery,
    role: roleFilter,
    status: statusFilter,
  })

  const { stats, loading: statsLoading } = useUserStats()
  const { deleteUser, loading: deleteLoading } = useDeleteUser()
  const { toggleStatus, loading: toggleLoading } = useToggleUserStatus()

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser(userId)
      toast.success("User deleted successfully!")
      refetch()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user")
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      await toggleStatus(userId)
      toast.success("User status updated successfully!")
      refetch()
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status")
    }
  }

  const getRoleColor = (roleName: string) => {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-500',
      'admin': 'bg-blue-500',
      'finance_manager': 'bg-green-500',
      'loan_officer': 'bg-purple-500',
      'property_manager': 'bg-orange-500',
      'member_manager': 'bg-indigo-500',
      'document_manager': 'bg-pink-500',
      'system_admin': 'bg-gray-500',
    }
    return colors[roleName] || 'bg-gray-500'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-yellow-500'
      case 'suspended':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage users and assign roles across the system</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">Error loading users: {error}</p>
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
          <h1 className="text-3xl font-bold text-foreground">Admin Users</h1>
          <p className="text-muted-foreground mt-1">Manage admin users and assign roles across the system</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.total_users}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active_users}</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Admin Users</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.admin_users}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Member Users</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.member_users}</p>
                </div>
                <User className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>All Admin Users</CardTitle>
              <CardDescription>View and manage admin user accounts and roles</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-9" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
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
                  <SelectItem value="suspended">Suspended</SelectItem>
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
            <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Member Info</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <Badge key={role.id} className={`${getRoleColor(role.name)} text-white`}>
                              {role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          )) || (
                            <Badge className="bg-gray-500 text-white">
                              No Roles
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(user.status)} text-white`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                        {user.member ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{user.member.member_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.member.department} • {user.member.rank}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No member profile</span>
                        )}
                  </TableCell>
                  <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </span>
                  </TableCell>
                  <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                      </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user)
                              setShowEditModal(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleToggleStatus(user.id)}
                              disabled={toggleLoading}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {user.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeleteUserId(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.per_page && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === 1}
                  onClick={() => refetch()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => refetch()}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <AddUserModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          refetch()
          setShowAddModal(false)
        }}
      />

      {/* Edit User Modal */}
      <EditUserModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        user={selectedUser}
        onSuccess={() => {
          refetch()
          setShowEditModal(false)
          setSelectedUser(null)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteUserId) {
                  handleDelete(deleteUserId)
                  setDeleteUserId(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}