"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface WhiteLabelPackage {
  id: string
  name: string
  description: string
  price: number
  formatted_price: string
  billing_cycle: string
  features: string[]
  is_active: boolean
  subscribers: number
  created_at: string
  updated_at: string
}

export default function WhiteLabelPackagesPage() {
  const { isLoading, data, error, loadData } = usePageLoading<{ packages: WhiteLabelPackage[] }>()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    features: "",
    price: "",
    billing_cycle: "monthly",
  })

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ packages: WhiteLabelPackage[] }>("/super-admin/white-label-packages")
      return response
    })
  }, [loadData])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const packages = data?.packages || []

  const handleAddPackage = async () => {
    try {
      const featuresArray = newPackage.features.split('\n').filter(f => f.trim())
      const packageData = {
        ...newPackage,
        price: parseFloat(newPackage.price),
        features: featuresArray,
        is_active: true
      }
      
      await apiFetch("/super-admin/white-label-packages", {
        method: 'POST',
        body: packageData
      })
      
      // Reload packages
      loadData(async () => {
        const response = await apiFetch<{ packages: WhiteLabelPackage[] }>("/super-admin/white-label-packages")
        return response
      })
      
      setIsAddDialogOpen(false)
      setNewPackage({
        name: "",
        description: "",
        features: "",
        price: "",
        billing_cycle: "monthly",
      })
    } catch (error) {
      console.error('Failed to add package:', error)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await apiFetch(`/super-admin/white-label-packages/${id}/toggle`, {
        method: 'POST'
      })
      
      // Reload packages
      loadData(async () => {
        const response = await apiFetch<{ packages: WhiteLabelPackage[] }>("/super-admin/white-label-packages")
        return response
      })
    } catch (error) {
      console.error('Failed to toggle package status:', error)
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    
    try {
      await apiFetch(`/super-admin/white-label-packages/${id}`, {
        method: 'DELETE'
      })
      
      // Reload packages
      loadData(async () => {
        const response = await apiFetch<{ packages: WhiteLabelPackage[] }>("/super-admin/white-label-packages")
        return response
      })
    } catch (error) {
      console.error('Failed to delete package:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">White Label Packages</h1>
          <p className="text-muted-foreground">Manage white label subscription packages for businesses</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create White Label Package</DialogTitle>
              <DialogDescription>Add a new white label subscription package</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Premium White Label"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the package"
                  value={newPackage.description}
                  onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  placeholder="Custom logo&#10;Custom colors&#10;Email branding"
                  rows={5}
                  value={newPackage.features}
                  onChange={(e) => setNewPackage({ ...newPackage, features: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="50000"
                    value={newPackage.price}
                    onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <select
                    id="billing_cycle"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newPackage.billing_cycle}
                    onChange={(e) => setNewPackage({ ...newPackage, billing_cycle: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPackage}>Create Package</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.length}</div>
            <p className="text-xs text-muted-foreground">{packages.filter((p) => p.is_active).length} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{packages.reduce((sum, pkg) => sum + pkg.subscribers, 0)}</div>
            <p className="text-xs text-muted-foreground">Across all packages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{packages.reduce((sum, pkg) => sum + pkg.price * pkg.subscribers, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">From white label packages</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
          <CardDescription>Manage white label subscription packages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Subscribers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{pkg.description}</TableCell>
                  <TableCell>
                    ₦{pkg.price.toLocaleString()}/{pkg.billing_cycle}
                  </TableCell>
                  <TableCell>{pkg.subscribers}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={pkg.is_active} 
                        onCheckedChange={() => handleToggleStatus(pkg.id)} 
                      />
                      <Badge variant={pkg.is_active ? "default" : "secondary"}>
                        {pkg.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}