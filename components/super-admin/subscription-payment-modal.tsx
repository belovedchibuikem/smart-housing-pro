"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { CreditCard, Building2, Smartphone } from "lucide-react"

interface Subscription {
  id: string
  tenant_name: string
  package_name: string
  amount: number
  status: string
}

interface SubscriptionPaymentModalProps {
  subscriptions: Subscription[]
  onPaymentInitiated: (payment: any) => void
}

export function SubscriptionPaymentModal({ subscriptions, onPaymentInitiated }: SubscriptionPaymentModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subscription_id: "",
    amount: "",
    payment_method: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
      const response = await fetch(`${apiBase}/super-admin/payment-gateways/subscription-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          subscription_id: formData.subscription_id,
          amount: Number(formData.amount),
          payment_method: formData.payment_method,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onPaymentInitiated(data.payment)
        setOpen(false)
        setFormData({ subscription_id: "", amount: "", payment_method: "" })
      } else {
        alert(data.message || "Payment initialization failed")
      }
    } catch (error) {
      console.error("Error initializing payment:", error)
      alert("Error initializing payment")
    } finally {
      setLoading(false)
    }
  }

  const selectedSubscription = subscriptions.find(sub => sub.id === formData.subscription_id)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CreditCard className="h-4 w-4 mr-2" />
          Initialize Subscription Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initialize Subscription Payment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subscription">Select Subscription</Label>
            <Select
              value={formData.subscription_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, subscription_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a subscription" />
              </SelectTrigger>
              <SelectContent>
                {subscriptions.map((subscription) => (
                  <SelectItem key={subscription.id} value={subscription.id}>
                    {subscription.tenant_name} - {subscription.package_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSubscription && (
            <Card className="p-4">
              <div className="space-y-2">
                <p><span className="font-medium">Tenant:</span> {selectedSubscription.tenant_name}</p>
                <p><span className="font-medium">Package:</span> {selectedSubscription.package_name}</p>
                <p><span className="font-medium">Amount:</span> ₦{selectedSubscription.amount.toLocaleString()}</p>
                <p><span className="font-medium">Status:</span> {selectedSubscription.status}</p>
              </div>
            </Card>
          )}

          <div>
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Enter payment amount"
              required
            />
          </div>

          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card Payment
                  </div>
                </SelectItem>
                <SelectItem value="bank_transfer">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Bank Transfer
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Initializing..." : "Initialize Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
