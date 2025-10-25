"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, use, useEffect } from "react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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

export default function EditSuperAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "active",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const response = await apiFetch<{ admin: SuperAdmin }>(`/super-admin/admins/${resolvedParams.id}`)
        const admin = response.admin
        setFormData({
          name: admin.name,
          email: admin.email,
          password: "", // Don't pre-fill password
          role: admin.role,
          status: admin.status,
        })
      } catch (e: any) {
        toast.error(e.message || "Failed to load admin details")
        router.push("/super-admin/admins")
      } finally {
        setIsLoading(false)
      }
    }
    
    loadAdmin()
  }, [resolvedParams.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiFetch(`/super-admin/admins/${resolvedParams.id}`, {
        method: 'PUT',
        body: formData
      })
      toast.success("Super admin updated successfully!")
      router.push("/super-admin/admins")
    } catch (e: any) {
      toast.error(e.message || "Failed to update super admin")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await apiFetch(`/super-admin/admins/${resolvedParams.id}`, {
        method: 'DELETE',
      })
      toast.success("Super admin deleted successfully!")
      router.push("/super-admin/admins")
    } catch (e: any) {
      toast.error(e.message || "Failed to delete super admin")
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/super-admin/admins">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Super Admin</h1>
            <p className="text-muted-foreground mt-1">Update super admin details</p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive bg-transparent">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Admin
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the super admin account and remove their
                access to the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_administrator">Super Administrator</SelectItem>
                <SelectItem value="business_manager">Business Manager</SelectItem>
                <SelectItem value="support_agent">Support Agent</SelectItem>
                <SelectItem value="billing_manager">Billing Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Super Admin"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/super-admin/admins">Cancel</Link>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
