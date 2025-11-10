"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Loader2, Info, Calendar, Wallet } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { toast as sonnerToast } from "sonner"

interface EquityPlan {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount?: number
  frequency: string
  is_mandatory: boolean
  is_active: boolean
}

export default function EquityPlansPage() {
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<EquityPlan[]>([])

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: EquityPlan[] }>('/user/equity-plans?is_active=true&per_page=100')
      
      if (response.success) {
        const plansData = Array.isArray(response.data) ? response.data : (response.data as any).data || []
        setPlans(plansData)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equity Plans</h1>
          <p className="text-muted-foreground mt-1">Available equity contribution plans for property deposits</p>
        </div>
        <Link href="/dashboard/equity-contributions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Make Contribution
          </Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No active equity plans available</p>
            <Link href="/dashboard/equity-contributions/new">
              <Button variant="outline">
                Make Custom Contribution
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    {plan.is_mandatory && (
                      <Badge variant="default" className="mt-2">Mandatory</Badge>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.description && (
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Minimum Amount</span>
                    <span className="font-semibold">₦{plan.min_amount.toLocaleString()}</span>
                  </div>
                  {plan.max_amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Maximum Amount</span>
                      <span className="font-semibold">₦{plan.max_amount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Frequency</span>
                    <Badge variant="outline" className="capitalize">{plan.frequency.replace('_', ' ')}</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link href={`/dashboard/equity-contributions/new?plan=${plan.id}`}>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Contribute to This Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">About Equity Plans</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            Equity plans help you structure your property deposit contributions. When you contribute to an equity plan, 
            your funds are automatically added to your equity wallet upon approval.
          </p>
          <p>
            You can also make custom contributions without selecting a plan. All equity contributions are specifically 
            for property deposits and payments.
          </p>
          <p className="font-medium mt-2">
            Payment gateways (Paystack, Remita, Stripe) are auto-approved, while manual payments require admin approval.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

