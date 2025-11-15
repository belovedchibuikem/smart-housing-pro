"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createRefundRequest } from "@/lib/api/client"
import { Loader2, ArrowLeft, Send } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function NewRefundRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    request_type: "refund" as "refund" | "stoppage_of_deduction" | "building_plan" | "tdp" | "change_of_ownership" | "other",
    source: "" as "" | "wallet" | "contribution" | "investment_return" | "equity_wallet",
    amount: "",
    reason: "",
    message: "",
  })

  const requestTypeLabels: Record<string, string> = {
    refund: "Refund Request",
    stoppage_of_deduction: "Stoppage of Deduction",
    building_plan: "Building Plan Request",
    tdp: "TDP Request",
    change_of_ownership: "Change of Ownership",
    other: "Other Request",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.reason.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.request_type === "refund") {
      if (!formData.source) {
        toast.error("Please select a refund source")
        return
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        toast.error("Please enter a valid amount greater than 0")
        return
      }
    }

    try {
      setLoading(true)
      const payload: any = {
        request_type: formData.request_type,
        reason: formData.reason,
        message: formData.message,
      }

      // Only include source and amount for refund requests
      if (formData.request_type === "refund") {
        payload.source = formData.source
        payload.amount = parseFloat(formData.amount)
      }

      await createRefundRequest(payload)
      toast.success("Refund request submitted successfully")
      router.push("/dashboard/refunds")
    } catch (error: any) {
      toast.error(error.message || "Failed to submit refund request")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/refunds">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Request</h1>
          <p className="text-muted-foreground mt-1">Submit a new refund or service request</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>
            Fill in the details below to submit your request. All requests are reviewed by admin staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="request_type">Request Type *</Label>
              <Select
                value={formData.request_type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, request_type: value, source: "", amount: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">Refund Request</SelectItem>
                  <SelectItem value="stoppage_of_deduction">Stoppage of Deduction</SelectItem>
                  <SelectItem value="building_plan">Building Plan Request</SelectItem>
                  <SelectItem value="tdp">TDP Request</SelectItem>
                  <SelectItem value="change_of_ownership">Change of Ownership</SelectItem>
                  <SelectItem value="other">Other Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.request_type === "refund" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="source">Refund Source *</Label>
                  <Select value={formData.source} onValueChange={(value: any) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select refund source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="contribution">Contribution</SelectItem>
                      <SelectItem value="investment_return">Investment Return</SelectItem>
                      <SelectItem value="equity_wallet">Equity Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason/Title *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Brief reason for your request"
                maxLength={500}
                required
              />
              <p className="text-xs text-muted-foreground">{formData.reason.length}/500 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message/Details *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Provide detailed information about your request..."
                rows={6}
                maxLength={5000}
                required
              />
              <p className="text-xs text-muted-foreground">{formData.message.length}/5000 characters</p>
            </div>

            <div className="flex gap-4">
              <Link href="/dashboard/refunds">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

