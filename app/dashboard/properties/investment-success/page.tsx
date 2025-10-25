import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home, FileText } from "lucide-react"
import Link from "next/link"

export default function InvestmentSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Investment Successful!</h1>
          <p className="text-muted-foreground text-lg">Your property investment has been processed successfully</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Investment ID</span>
            <span className="font-medium">INV-2024-001</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Property</span>
            <span className="font-medium">Modern 3-Bedroom Apartment</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shares Purchased</span>
            <span className="font-medium">5 shares (5%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Investment Amount</span>
            <span className="font-medium">₦2,250,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">Dec 28, 2024</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            You now own 5% of this property. You will receive rental income and appreciation returns proportional to
            your ownership.
          </p>
        </div>

        <div className="pt-4 space-y-3">
          <div className="flex gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button size="lg" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Certificate
            </Button>
          </div>
          <Link href="/dashboard/properties" className="block">
            <Button variant="ghost" className="w-full">
              View All Properties
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
