"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function NewPermissionPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    guard_name: "web",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await apiFetch("/super-admin/permissions", {
        method: 'POST',
        body: formData
      })
      toast.success("Permission created successfully!")
      router.push("/super-admin/permissions")
    } catch (e: any) {
      toast.error(e.message || "Failed to create permission")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/permissions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Permission</h1>
          <p className="text-muted-foreground mt-1">Create a new system permission</p>
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
              {isSubmitting ? "Creating..." : "Create Permission"}
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

