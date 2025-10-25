import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TransferSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Transfer Successful!</h1>
        <p className="text-muted-foreground mb-8">
          Your funds have been successfully transferred to the recipient's wallet.
        </p>

        <Card className="p-6 bg-muted/50 text-left mb-6">
          <h3 className="font-semibold mb-4">Transfer Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-medium">TXN-2024-001235</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recipient ID</span>
              <span className="font-medium">FRSC-HMS-12345</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Transferred</span>
              <span className="font-medium">₦25,000</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">Completed</span>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Link href="/dashboard/contributions" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wallet
            </Button>
          </Link>
          <Button className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </Card>
    </div>
  )
}
