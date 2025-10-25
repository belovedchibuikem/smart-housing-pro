import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Subscription Activated!</CardTitle>
          <CardDescription>
            Your subscription has been successfully activated. You now have full access to the FRSC Housing Management
            System.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Package</span>
              <span className="font-medium">Monthly Standard</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valid Until</span>
              <span className="font-medium">Jan 15, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="font-medium">₦1,500</span>
            </div>
          </div>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link href="/dashboard/subscriptions">
            <Button variant="outline" className="w-full bg-transparent">
              View My Subscriptions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
