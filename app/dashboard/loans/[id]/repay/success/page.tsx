import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoanRepaymentSuccessPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-8">Your loan payment has been processed successfully</p>

        <div className="bg-muted p-6 rounded-lg space-y-3 text-left mb-8">
          <h3 className="font-semibold mb-4">Payment Details</h3>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID</span>
            <span className="font-medium">TXN-2024-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Loan ID</span>
            <span className="font-medium">{params.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-medium">₦125,000</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">Debit Card</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t">
            <span className="font-semibold">New Outstanding Balance</span>
            <span className="font-bold">₦4,250,000</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
          <Link href={`/dashboard/loans/${params.id}`} className="flex-1">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Loan Details
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
