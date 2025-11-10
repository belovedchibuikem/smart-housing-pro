"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Loader2, Search, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

interface ContributionPlan {
  id: string
  name: string
  description?: string
  amount: number
  minimum_amount: number
  frequency: string
  is_mandatory: boolean
  is_active: boolean
  contributions_count?: number
  total_contributions?: number
  total_members?: number
  created_at: string
}

export default function ContributionPlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<ContributionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<ContributionPlan | null>(null)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    minimum_amount: "",
    frequency: "monthly",
    is_mandatory: false,
    is_active: true,
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      params.append('per_page', '100')

      const response = await apiFetch<{ success: boolean; data: ContributionPlan[] }>(
        `/admin/contribution-plans?${params.toString()}`
      )

      if (response.success) {
        setPlans(response.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching contribution plans:', error)
      sonnerToast.error("Failed to load contribution plans", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchPlans()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleCreate = async () => {
    try {
      setProcessing(true)
      if (!formData.minimum_amount) {
        sonnerToast.error("Minimum amount is required")
        setProcessing(false)
        return
      }

      const min = parseFloat(formData.minimum_amount)
      const amount = parseFloat(formData.amount)

      if (Number.isFinite(amount) && Number.isFinite(min) && min > amount) {
        sonnerToast.error("Minimum amount cannot exceed the plan amount")
        setProcessing(false)
        return
      }

      const response = await apiFetch<{ success: boolean; message?: string; data?: ContributionPlan }>(
        '/admin/contribution-plans',
        {
          method: 'POST',
          body: {
            ...formData,
            amount,
            minimum_amount: min,
          }
        }
      )

      if (response.success) {
        sonnerToast.success("Contribution Plan Created", {
          description: response.message || "Plan has been created successfully",
        })
        setShowCreateDialog(false)
        resetForm()
        fetchPlans()
      }
    } catch (error: any) {
      console.error('Error creating contribution plan:', error)
      sonnerToast.error("Failed to create contribution plan", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedPlan) return

    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/contribution-plans/${selectedPlan.id}`,
        { method: 'DELETE' }
      )

      if (response.success) {
        sonnerToast.success("Contribution Plan Deleted", {
          description: response.message || "Plan has been deleted successfully",
        })
        setShowDeleteDialog(false)
        setSelectedPlan(null)
        fetchPlans()
      }
    } catch (error: any) {
      console.error('Error deleting contribution plan:', error)
      sonnerToast.error("Failed to delete contribution plan", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleStatus = async (plan: ContributionPlan) => {
    try {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/contribution-plans/${plan.id}/toggle-status`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Status Updated", {
          description: response.message || "Plan status has been updated",
        })
        fetchPlans()
      }
    } catch (error: any) {
      console.error('Error toggling plan status:', error)
      sonnerToast.error("Failed to update plan status", {
        description: error.message || "Please try again later",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      amount: "",
      minimum_amount: "",
      frequency: "monthly",
      is_mandatory: false,
      is_active: true,
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contribution Plans</h1>
          <p className="text-muted-foreground mt-1">Manage contribution plans for members</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Contribution Plans</CardTitle>
              <CardDescription>Configure and manage contribution plans</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No contribution plans found. Create your first plan to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? "Active" : "Inactive"}
                        </Badge>
                        {plan.is_mandatory && (
                          <Badge variant="outline">Mandatory</Badge>
                        )}
                      </div>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                      )}
                      <div className="grid gap-4 mt-4 sm:grid-cols-5">
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-medium text-sm">{formatCurrency(plan.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Minimum Amount</p>
                          <p className="font-medium text-sm">{formatCurrency(plan.minimum_amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Frequency</p>
                          <p className="font-medium text-sm capitalize">{plan.frequency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Contributions</p>
                          <p className="font-medium text-sm">{plan.contributions_count || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Members</p>
                          <p className="font-medium text-sm">{plan.total_members || 0}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(plan)}
                        title={plan.is_active ? "Deactivate" : "Activate"}
                      >
                        {plan.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/contribution-plans/${plan.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/contribution-plans/${plan.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Contribution Plan</DialogTitle>
            <DialogDescription>Add a new contribution plan for members</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Monthly Contribution"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the plan"
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_amount">Minimum Amount (₦) *</Label>
                <Input
                  id="minimum_amount"
                  type="number"
                  value={formData.minimum_amount}
                  onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                  placeholder="e.g., 25000"
                />
                <p className="text-xs text-muted-foreground">Members must contribute at least this amount each cycle.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                    <SelectItem value="one_time">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mandatory">Mandatory Contribution</Label>
                <p className="text-sm text-muted-foreground">Members must pay this contribution</p>
              </div>
              <Switch
                id="mandatory"
                checked={formData.is_mandatory}
                onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active Status</Label>
                <p className="text-sm text-muted-foreground">Make this plan available to members</p>
              </div>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); resetForm() }} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={processing || !formData.name || !formData.amount || !formData.minimum_amount}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contribution Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedPlan(null) }} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

