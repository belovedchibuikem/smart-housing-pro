"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Permission {
  id: string
  name: string
  guard_name: string
  created_at: string
  updated_at: string
}

export default function EditPermissionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [permission, setPermission] = useState<Permission | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    guard_name: "web",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPermission = async () => {
      try {
        const response = await apiFetch<{ success: boolean; permission: Permission }>(`/super-admin/permissions/${params.id}`)
        if (response.success) {
          setPermission(response.permission)
          setFormData({
            name: response.permission.name,
            guard_name: response.permission.guard_name
          })
        }
      } catch (e: any) {
        toast.error(e.message || "Failed to load permission")
        router.push("/super-admin/permissions")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermission()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiFetch(`/super-admin/permissions/${params.id}`, {
        method: 'PUT',
        body: formData
      })
      toast.success("Permission updated successfully!")
      router.push("/super-admin/permissions")
    } catch (e: any) {
      toast.error(e.message || "Failed to update permission")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading permission...</p>
        </div>
      </div>
    )
  }

  if (!permission) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Permission not found</h3>
          <p className="text-muted-foreground mb-4">The permission you're looking for doesn't exist.</p>
          <Link href="/super-admin/permissions">
            <Button>Back to Permissions</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/super-admin/permissions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Permission</h1>
          <p className="text-muted-foreground mt-1">Update permission details</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Permission Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., businesses.view" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Use dot notation for hierarchical permissions (e.g., businesses.view, businesses.create)
              </p>
            </div>
            <div>
              <Label htmlFor="guard_name">Guard Name</Label>
              <Input 
                id="guard_name" 
                placeholder="web" 
                value={formData.guard_name}
                onChange={(e) => setFormData({ ...formData, guard_name: e.target.value })}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                The guard name for this permission (usually 'web' for web applications)
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Permission"}
            </Button>
            <Link href="/super-admin/permissions">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
