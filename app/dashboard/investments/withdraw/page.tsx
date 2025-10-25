import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function WithdrawInvestmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/investments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Withdraw Investment</h1>
          <p className="text-muted-foreground">Request withdrawal from your investment</p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Early withdrawal may incur penalties. Please review the terms of your investment plan before proceeding.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Request</CardTitle>
          <CardDescription>Fill in the details to request an investment withdrawal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investment">Select Investment</Label>
            <Select>
              <SelectTrigger id="investment">
                <SelectValue placeholder="Choose investment to withdraw from" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Housing Project 2024 - ₦2,150,000</SelectItem>
                <SelectItem value="2">Land Development Phase 2 - ₦5,500,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount</Label>
            <Input id="amount" type="number" placeholder="Enter amount to withdraw" />
            <p className="text-sm text-muted-foreground">Available balance: ₦2,150,000</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Withdrawal</Label>
            <Select>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="financial">Financial Need</SelectItem>
                <SelectItem value="reinvest">Reinvest Elsewhere</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              placeholder="Provide additional information about your withdrawal request"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Bank Account for Withdrawal</Label>
            <Select>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">GTBank - 0123456789</SelectItem>
                <SelectItem value="2">Access Bank - 9876543210</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Processing Time:</strong> Withdrawal requests are typically processed within 5-7 business days.
              You will receive a notification once your request is approved.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button className="flex-1">Submit Withdrawal Request</Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/investments">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
