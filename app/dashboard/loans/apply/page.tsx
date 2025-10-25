import { LoanApplicationForm } from "@/components/loans/loan-application-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LoanApplicationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/loans">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Loans
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Apply for a Loan</h1>
        <p className="text-muted-foreground mt-1">Complete the form below to submit your loan application</p>
      </div>
      <LoanApplicationForm />
    </div>
  )
}
