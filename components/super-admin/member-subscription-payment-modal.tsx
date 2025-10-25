"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { CreditCard, Building2, Users } from "lucide-react"

interface MemberSubscription {
  id: string
  tenant_name: string
  member_name: string
  package_name: string
  amount: number
  status: string
}

interface MemberSubscriptionPaymentModalProps {
  memberSubscriptions: MemberSubscription[]
  onPaymentInitiated: (payment: any) => void
}

export function MemberSubscriptionPaymentModal({ memberSubscriptions, onPaymentInitiated }: MemberSubscriptionPaymentModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    member_subscription_id: "",
    amount: "",
    payment_method: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/api/super-admin/payment-gateways/member-subscription-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          member_subscription_id: formData.member_subscription_id,
          amount: Number(formData.amount),
          payment_method: formData.payment_method,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onPaymentInitiated(data.payment)
        setOpen(false)
        setFormData({ member_subscription_id: "", amount: "", payment_method: "" })
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

  const selectedMemberSubscription = memberSubscriptions.find(sub => sub.id === formData.member_subscription_id)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Initialize Member Subscription Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initialize Member Subscription Payment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="member_subscription">Select Member Subscription</Label>
            <Select
              value={formData.member_subscription_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, member_subscription_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a member subscription" />
              </SelectTrigger>
              <SelectContent>
                {memberSubscriptions.map((memberSubscription) => (
                  <SelectItem key={memberSubscription.id} value={memberSubscription.id}>
                    {memberSubscription.member_name} - {memberSubscription.package_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMemberSubscription && (
            <Card className="p-4">
              <div className="space-y-2">
                <p><span className="font-medium">Tenant:</span> {selectedMemberSubscription.tenant_name}</p>
                <p><span className="font-medium">Member:</span> {selectedMemberSubscription.member_name}</p>
                <p><span className="font-medium">Package:</span> {selectedMemberSubscription.package_name}</p>
                <p><span className="font-medium">Amount:</span> ₦{selectedMemberSubscription.amount.toLocaleString()}</p>
                <p><span className="font-medium">Status:</span> {selectedMemberSubscription.status}</p>
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
