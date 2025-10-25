import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, Home } from "lucide-react"
import Link from "next/link"

export default function ContributionSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg">Your contribution has been processed successfully</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-medium">TXN001234567</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium">₦50,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">Dec 28, 2024</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">Bank Transfer</span>
          </div>
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
              <Download className="h-4 w-4 mr-2" />
              Receipt
            </Button>
          </div>
          <Link href="/dashboard/contributions" className="block">
            <Button variant="ghost" className="w-full">
              View All Contributions
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
