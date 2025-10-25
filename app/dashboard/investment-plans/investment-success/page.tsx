import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Download, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function InvestmentSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Investment Successful!</h1>
          <p className="text-muted-foreground text-lg">Your investment has been processed successfully</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Investment ID</span>
            <span className="font-mono font-semibold">INV-2024-001234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Investment Plan</span>
            <span className="font-semibold">Housing Development Phase 3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date & Time</span>
            <span className="font-semibold">{new Date().toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-xl">₦1,000,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-semibold">Contribution Balance</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-semibold text-green-600">Completed</span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Your investment certificate will be issued when the investment window closes on December 31, 2024. You can
            make additional investments in this plan until then.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button variant="outline" className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Link href="/dashboard/investment-plans" className="flex-1">
            <Button className="w-full">
              View All Plans
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        <Link href="/dashboard" className="block">
          <Button variant="ghost" className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  )
}
