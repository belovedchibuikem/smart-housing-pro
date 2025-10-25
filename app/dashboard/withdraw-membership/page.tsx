import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function WithdrawMembershipPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Withdraw Membership</h1>
        <p className="text-muted-foreground mt-2">Request to withdraw from FRSC Housing Cooperative</p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <AlertTriangle className="h-6 w-6 text-destructive mt-1" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Important Notice</h2>
            <p className="text-muted-foreground">
              Withdrawing your membership will affect your access to cooperative benefits, ongoing loans, and property
              investments. Please ensure all outstanding obligations are settled before proceeding.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Requirements for Withdrawal:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>All loan repayments must be completed</li>
              <li>No pending contributions or dues</li>
              <li>Property investments must be settled</li>
              <li>6-month notice period required</li>
            </ul>
          </div>

          <Button variant="destructive" className="mt-6">
            Submit Withdrawal Request
          </Button>
        </div>
      </Card>
    </div>
  )
}
