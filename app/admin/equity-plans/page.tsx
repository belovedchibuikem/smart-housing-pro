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

interface EquityPlan {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount?: number
  frequency: string
  is_mandatory: boolean
  is_active: boolean
  contributions_count?: number
  total_contributions?: number
  total_members?: number
  created_at: string
}

export default function EquityPlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<EquityPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<EquityPlan | null>(null)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    min_amount: "",
    max_amount: "",
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

      const response = await apiFetch<{ success: boolean; data: EquityPlan[]; pagination?: any }>(
        `/admin/equity-plans?${params.toString()}`
      )

      if (response.success) {
        setPlans(response.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching equity plans:', error)
      sonnerToast.error("Failed to load equity plans", {
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
      const response = await apiFetch<{ success: boolean; message?: string; data?: EquityPlan }>(
        '/admin/equity-plans',
        {
          method: 'POST',
          body: {
            ...formData,
            min_amount: parseFloat(formData.min_amount),
            max_amount: formData.max_amount ? parseFloat(formData.max_amount) : null,
          }
        }
      )

      if (response.success) {
        sonnerToast.success("Equity Plan Created", {
          description: response.message || "Plan has been created successfully",
        })
        setShowCreateDialog(false)
        resetForm()
        fetchPlans()
      }
    } catch (error: any) {
      console.error('Error creating equity plan:', error)
      sonnerToast.error("Failed to create equity plan", {
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
        `/admin/equity-plans/${selectedPlan.id}`,
        { method: 'DELETE' }
      )

      if (response.success) {
        sonnerToast.success("Equity Plan Deleted", {
          description: response.message || "Plan has been deleted successfully",
        })
        setShowDeleteDialog(false)
        setSelectedPlan(null)
        fetchPlans()
      }
    } catch (error: any) {
      console.error('Error deleting equity plan:', error)
      sonnerToast.error("Failed to delete equity plan", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleStatus = async (planId: string) => {
    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string; data?: EquityPlan }>(
        `/admin/equity-plans/${planId}/toggle-status`,
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
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      min_amount: "",
      max_amount: "",
      frequency: "monthly",
      is_mandatory: false,
      is_active: true,
    })
  }

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equity Plans</h1>
          <p className="text-muted-foreground mt-1">Manage equity contribution plans for property deposits</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPlans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No equity plans found</p>
              </div>
            ) : (
              filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{plan.name}</h3>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {plan.is_mandatory && (
                            <Badge variant="outline">Mandatory</Badge>
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-muted-foreground">Min Amount: </span>
                            <span className="font-semibold">₦{parseFloat(plan.min_amount.toString()).toLocaleString()}</span>
                          </div>
                          {plan.max_amount && (
                            <div>
                              <span className="text-muted-foreground">Max Amount: </span>
                              <span className="font-semibold">₦{parseFloat(plan.max_amount.toString()).toLocaleString()}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Frequency: </span>
                            <span className="font-semibold capitalize">{plan.frequency}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Contributions: </span>
                            <span className="font-semibold">{plan.contributions_count || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(plan.id)}
                          disabled={processing}
                        >
                          {plan.is_active ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan)
                            setFormData({
                              name: plan.name,
                              description: plan.description || "",
                              min_amount: plan.min_amount.toString(),
                              max_amount: plan.max_amount?.toString() || "",
                              frequency: plan.frequency,
                              is_mandatory: plan.is_mandatory,
                              is_active: plan.is_active,
                            })
                            setShowCreateDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? "Edit Equity Plan" : "Create Equity Plan"}</DialogTitle>
            <DialogDescription>
              {selectedPlan ? "Update the equity plan details" : "Create a new equity contribution plan"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Monthly Equity Plan"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Plan description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_amount">Minimum Amount (₦) *</Label>
                <Input
                  id="min_amount"
                  type="number"
                  value={formData.min_amount}
                  onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_amount">Maximum Amount (₦)</Label>
                <Input
                  id="max_amount"
                  type="number"
                  value={formData.max_amount}
                  onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                  placeholder="Optional"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency *</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                  <SelectItem value="one_time">One Time</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mandatory Plan</Label>
                <p className="text-sm text-muted-foreground">Members must contribute to this plan</p>
              </div>
              <Switch
                checked={formData.is_mandatory}
                onCheckedChange={(checked) => setFormData({ ...formData, is_mandatory: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">Plan is available for selection</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              setSelectedPlan(null)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={selectedPlan ? async () => {
              try {
                setProcessing(true)
                const response = await apiFetch<{ success: boolean; message?: string; data?: EquityPlan }>(
                  `/admin/equity-plans/${selectedPlan.id}`,
                  {
                    method: 'PUT',
                    body: {
                      ...formData,
                      min_amount: parseFloat(formData.min_amount),
                      max_amount: formData.max_amount ? parseFloat(formData.max_amount) : null,
                    }
                  }
                )

                if (response.success) {
                  sonnerToast.success("Equity Plan Updated", {
                    description: response.message || "Plan has been updated successfully",
                  })
                  setShowCreateDialog(false)
                  setSelectedPlan(null)
                  resetForm()
                  fetchPlans()
                }
              } catch (error: any) {
                console.error('Error updating equity plan:', error)
                sonnerToast.error("Failed to update equity plan", {
                  description: error.message || "Please try again later",
                })
              } finally {
                setProcessing(false)
              }
            } : handleCreate} disabled={processing || !formData.name || !formData.min_amount}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {selectedPlan ? "Updating..." : "Creating..."}
                </>
              ) : (
                selectedPlan ? "Update Plan" : "Create Plan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equity Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPlan?.name}"? This action cannot be undone.
              {selectedPlan && selectedPlan.contributions_count && selectedPlan.contributions_count > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This plan has {selectedPlan.contributions_count} contributions associated with it.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false)
              setSelectedPlan(null)
            }}>
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

