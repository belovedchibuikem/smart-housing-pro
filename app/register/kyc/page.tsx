import { KYCForm } from "@/components/kyc/kyc-form"
import { Building2 } from "lucide-react"
import Link from "next/link"

export default function KYCPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-xl">FRSC HMS</h1>
              <p className="text-xs text-muted-foreground">Housing Management System</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-muted-foreground">
              Please provide the following information to verify your identity and complete your membership
              registration.
            </p>
          </div>
          <KYCForm />
        </div>
      </div>
    </div>
  )
}
