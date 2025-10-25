import { NewContributionForm } from "@/components/contributions/new-contribution-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewContributionPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard/contributions">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contributions
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Make a Contribution</h1>
        <p className="text-muted-foreground mt-1">Add funds to your housing cooperative wallet</p>
      </div>
      <NewContributionForm />
    </div>
  )
}
