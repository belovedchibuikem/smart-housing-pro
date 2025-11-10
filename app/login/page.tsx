"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Building2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"
import { useTenantSettings } from "@/lib/context/tenant-settings-context"
import { MaintenanceMode } from "@/components/auth/maintenance-mode"

export default function LoginPage() {
  const { settings: whiteLabelSettings } = useWhiteLabel()
  const { getSetting } = useTenantSettings()
  
  const maintenanceMode = getSetting('maintenance_mode', false)
  const siteName = whiteLabelSettings?.company_name || getSetting('site_name', 'FRSC HMS')
  const siteTagline = whiteLabelSettings?.company_tagline || getSetting('site_description', 'Housing Management System')
  const logoUrl = whiteLabelSettings?.logo_url
  const loginBgUrl = whiteLabelSettings?.login_background_url

  // Check maintenance mode
  if (maintenanceMode) {
    return <MaintenanceMode siteName={siteName} />
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div 
        className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground relative"
        style={loginBgUrl ? {
          backgroundImage: `url(${loginBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {loginBgUrl && (
          <div className="absolute inset-0 bg-primary/80" />
        )}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Building2 className="h-8 w-8" />
            )}
            <div>
              <h1 className="font-bold text-xl">{siteName}</h1>
              <p className="text-xs opacity-90">{siteTagline}</p>
            </div>
          </Link>
        </div>
        <div className="space-y-6 relative z-10">
          <h2 className="text-4xl font-bold text-balance">Welcome Back to Your Housing Journey</h2>
          <p className="text-lg opacity-90 text-balance">
            Access your account to manage contributions, track investments, and explore property opportunities.
          </p>
        </div>
        <div className="text-sm opacity-75 relative z-10">&copy; {new Date().getFullYear()} {siteName}</div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/" className="lg:hidden flex items-center justify-center gap-2 mb-8">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={siteName}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <Building2 className="h-8 w-8 text-primary" />
              )}
              <span className="font-bold text-xl">{siteName}</span>
            </Link>
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-muted-foreground mt-2">Enter your credentials to access your account</p>
          </div>
          <LoginForm allowRegistration={getSetting('allow_registration', true)} />
          {getSetting('allow_registration', true) && (
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
