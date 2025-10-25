import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock, Home } from "lucide-react"
import Link from "next/link"

export default function KYCSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Application Submitted Successfully!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for completing your KYC verification. Your application is now under review.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-left">
              <h3 className="font-semibold mb-1">What happens next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Our team will review your application within 2-3 business days</li>
                <li>• You'll receive an email notification once your account is verified</li>
                <li>• After approval, you can start making contributions and accessing all features</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Link href="/dashboard" className="block">
            <Button size="lg" className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">You can track your verification status from your dashboard</p>
        </div>
      </Card>
    </div>
  )
}
