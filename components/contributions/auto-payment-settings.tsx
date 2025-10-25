"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { CreditCard, Calendar } from "lucide-react"

export function AutoPaymentSettings() {
  const [autoPayEnabled, setAutoPayEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      alert("Auto-payment settings saved successfully!")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-pay" className="text-base font-semibold">
                Enable Auto-Payment
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically deduct monthly contributions from your linked account
              </p>
            </div>
            <Switch id="auto-pay" checked={autoPayEnabled} onCheckedChange={setAutoPayEnabled} />
          </div>

          {autoPayEnabled && (
            <>
              <div className="border-t pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monthly Contribution Amount</Label>
                  <Input id="amount" type="number" defaultValue="50000" placeholder="Enter amount" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day">Payment Day</Label>
                  <Select defaultValue="1">
                    <SelectTrigger id="day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st of every month</SelectItem>
                      <SelectItem value="5">5th of every month</SelectItem>
                      <SelectItem value="10">10th of every month</SelectItem>
                      <SelectItem value="15">15th of every month</SelectItem>
                      <SelectItem value="20">20th of every month</SelectItem>
                      <SelectItem value="25">25th of every month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select defaultValue="bank">
                    <SelectTrigger id="method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Account (****1234)</SelectItem>
                      <SelectItem value="card">Debit Card (****5678)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Next Auto-Payment</p>
                    <p className="text-sm text-muted-foreground">₦50,000 will be deducted on January 1, 2025</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Linked Payment Methods</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">GTBank Account</p>
                  <p className="text-sm text-muted-foreground">****1234</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Visa Debit Card</p>
                  <p className="text-sm text-muted-foreground">****5678</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
          </div>
          <Button variant="outline" className="w-full bg-transparent">
            Add Payment Method
          </Button>
        </div>
      </Card>
    </div>
  )
}
