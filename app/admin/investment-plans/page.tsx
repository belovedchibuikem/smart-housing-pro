"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, TrendingUp, Calendar, DollarSign, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getInvestmentPlans, getInvestmentPlanStats, deleteInvestmentPlan, toggleInvestmentPlanStatus } from "@/lib/api/client"
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

interface InvestmentPlan {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount: number
  expected_return_rate: number
  min_duration_months: number
  max_duration_months: number
  return_type: string
  risk_level: string
  features?: any[]
  is_active: boolean
  investments_count: number
  total_invested: number
  total_investors: number
  created_at: string
}

export default function AdminInvestmentPlansPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [riskFilter, setRiskFilter] = useState("all")
  const [returnTypeFilter, setReturnTypeFilter] = useState("all")
  const [stats, setStats] = useState({ active_plans: 0, total_invested: 0, total_investors: 0 })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter, riskFilter, returnTypeFilter])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== 'all') params.is_active = statusFilter === 'active' ? 'true' : 'false'
      if (riskFilter !== 'all') params.risk_level = riskFilter
      if (returnTypeFilter !== 'all') params.return_type = returnTypeFilter
      
      const response = await getInvestmentPlans(params)
      if (response.success) {
        setPlans(response.data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch investment plans",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await getInvestmentPlanStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats", error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.planId) return
    
    try {
      const response = await deleteInvestmentPlan(deleteDialog.planId)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Investment plan deleted successfully",
        })
        fetchPlans()
        fetchStats()
        setDeleteDialog({ open: false, planId: null })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete investment plan",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (planId: string) => {
    try {
      const response = await toggleInvestmentPlanStatus(planId)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Plan status updated successfully",
        })
        fetchPlans()
        fetchStats()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update plan status",
        variant: "destructive",
      })
    }
  }

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case "low":
        return "default"
      case "medium":
        return "secondary"
      case "high":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getReturnTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      annual: "Annual",
      lump_sum: "Lump Sum",
    }
    return labels[type] || type
  }

  const calculateProgress = (plan: InvestmentPlan) => {
    if (plan.max_amount > 0) {
      return Math.min((plan.total_invested / plan.max_amount) * 100, 100)
    }
    return 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Plans Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage investment opportunities</p>
        </div>
        <Link href="/admin/investment-plans/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Investment Plan
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
              <p className="text-2xl font-bold mt-2">{stats.active_plans}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Investments</p>
              <p className="text-2xl font-bold mt-2">₦{(stats.total_invested / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Investors</p>
              <p className="text-2xl font-bold mt-2">{stats.total_investors}</p>
            </div>
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search investment plans..." 
              className="pl-9" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={returnTypeFilter} onValueChange={setReturnTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Return Types</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="lump_sum">Lump Sum</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No investment plans found
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const progress = calculateProgress(plan)
              return (
                <Card key={plan.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          <Badge variant={getRiskBadgeVariant(plan.risk_level)}>
                            {plan.risk_level.charAt(0).toUpperCase() + plan.risk_level.slice(1)} Risk
                          </Badge>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Min Investment</p>
                            <p className="font-semibold">₦{plan.min_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max Investment</p>
                            <p className="font-semibold">₦{plan.max_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expected ROI</p>
                            <p className="font-semibold">{plan.expected_return_rate}% ({getReturnTypeLabel(plan.return_type)})</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="font-semibold">{plan.min_duration_months} - {plan.max_duration_months} months</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Invested</p>
                            <p className="font-semibold">₦{plan.total_invested.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Investors</p>
                            <p className="font-semibold">{plan.total_investors} members</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Investments</p>
                            <p className="font-semibold">{plan.investments_count} total</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/investment-plans/${plan.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/investment-plans/${plan.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleToggleStatus(plan.id)}
                        >
                          {plan.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDeleteDialog({ open: true, planId: plan.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {plan.max_amount > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Investment Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          Created: {new Date(plan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Link href={`/admin/investment-plans/${plan.id}`}>
                        <Button variant="link" size="sm">
                          View Details →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Card>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, planId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this investment plan? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
