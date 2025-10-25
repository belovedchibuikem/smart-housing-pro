import { RegisterForm } from "@/components/auth/register-form"
import { Building2 } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          <div>
            <h1 className="font-bold text-xl">FRSC HMS</h1>
            <p className="text-xs opacity-90">Housing Management System</p>
          </div>
        </Link>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold text-balance">Start Your Path to Homeownership Today</h2>
          <p className="text-lg opacity-90 text-balance">
            Join thousands of FRSC personnel building their future through our cooperative housing program.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <div className="font-semibold">Flexible Contributions</div>
                <div className="text-sm opacity-75">Save at your own pace with automated payments</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <div className="font-semibold">Affordable Loans</div>
                <div className="text-sm opacity-75">Access competitive mortgage rates</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <div className="font-semibold">Quality Properties</div>
                <div className="text-sm opacity-75">Choose from verified properties nationwide</div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm opacity-75">&copy; 2025 FRSC Housing Management System</div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">FRSC HMS</span>
            </Link>
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-muted-foreground mt-2">Join the FRSC Housing Cooperative</p>
          </div>
          <RegisterForm />
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
