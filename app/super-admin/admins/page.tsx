"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, User, Mail, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SuperAdmin {
  id: string
  name: string
  email: string
  role: string
  status: string
  last_login: string
  created_at: string
}

interface SuperAdminsResponse {
  admins: SuperAdmin[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function SuperAdminsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  const { isLoading, data, error, loadData } = usePageLoading<SuperAdminsResponse>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<SuperAdminsResponse>("/super-admin/admins")
      return response
    })
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/super-admin/admins/${id}`, {
        method: 'DELETE',
      })
      toast.success("Super admin deleted successfully!")
      loadData(async () => {
        const response = await apiFetch<SuperAdminsResponse>("/super-admin/admins")
        return response
      }) // Reload data
    } catch (e: any) {
      toast.error(e.message || "Failed to delete super admin")
    }
  }

  const handleToggleStatus = async (admin: SuperAdmin) => {
    try {
      await apiFetch(`/super-admin/admins/${admin.id}/toggle-status`, {
        method: 'POST',
      })
      toast.success(`Super admin ${admin.status === 'active' ? 'deactivated' : 'activated'} successfully!`)
      loadData(async () => {
        const response = await apiFetch<SuperAdminsResponse>("/super-admin/admins")
        return response
      }) // Reload data
    } catch (e: any) {
      toast.error(e.message || "Failed to toggle admin status")
    }
  }

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null

  const admins = data?.admins || []
  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (admin.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (admin.role?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admins</h1>
          <p className="text-muted-foreground mt-2">Manage super admin users and their access</p>
        </div>
        <Button asChild>
          <Link href="/super-admin/admins/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Super Admin
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Admins</p>
          <p className="text-2xl font-bold mt-1">{admins.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{admins.filter((a) => a.status === "active").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="text-2xl font-bold mt-1 text-gray-600">
            {admins.filter((a) => a.status === "inactive").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Roles</p>
          <p className="text-2xl font-bold mt-1">3</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admins..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Admins List */}
      <div className="space-y-4">
        {filteredAdmins.map((admin) => (
          <Card key={admin.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold">{admin.name}</h3>
                    <Badge variant={admin.status === "active" ? "default" : "secondary"}>{admin.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {admin.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {admin.role}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Last login: {admin.last_login}</p>
                    <p>Member since: {new Date(admin.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/super-admin/admins/${admin.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the super admin account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(admin.id)}
                        className="bg-destructive text-destructive-foreground"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No admins found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search</p>
        </Card>
      )}
    </div>
  )
}
