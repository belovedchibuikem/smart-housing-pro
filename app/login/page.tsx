import { LoginForm } from "@/components/auth/login-form"
import { Building2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
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
          <h2 className="text-4xl font-bold text-balance">Welcome Back to Your Housing Journey</h2>
          <p className="text-lg opacity-90 text-balance">
            Access your account to manage contributions, track investments, and explore property opportunities.
          </p>
        </div>
        <div className="text-sm opacity-75">&copy; 2025 FRSC Housing Management System</div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">FRSC HMS</span>
            </Link>
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
          </div>
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
