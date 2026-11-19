"use client"

import { useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { useI18n } from "@/lib/i18n/i18n-provider"
import { Building2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTenantSettings } from "@/lib/context/tenant-settings-context"
import { MaintenanceMode } from "@/components/auth/maintenance-mode"
import { resolveStorageUrl } from "@/lib/api/config"
import { useAuthBrand } from "@/hooks/use-auth-brand"

function BrandMark({
  logoUrl,
  siteName,
  siteTagline,
  homeHref,
  light = false,
}: {
  logoUrl: string
  siteName: string
  siteTagline?: string
  homeHref: string
  light?: boolean
}) {
  const src = logoUrl ? resolveStorageUrl(logoUrl) : ""
  return (
    <Link href={homeHref} className="flex items-center gap-3 min-w-0">
      {src ? (
        <Image
          src={src}
          alt={siteName}
          width={180}
          height={48}
          className="h-10 w-auto max-w-[180px] object-contain"
        />
      ) : (
        <Building2 className={`h-8 w-8 shrink-0 ${light ? "" : "text-primary"}`} />
      )}
      <div className="min-w-0 text-left">
        <h1 className="font-bold text-xl leading-tight">{siteName}</h1>
        {siteTagline ? <p className="text-xs opacity-90 truncate">{siteTagline}</p> : null}
      </div>
    </Link>
  )
}

export default function LoginPage() {
  const { t } = useI18n()
  const { getSetting } = useTenantSettings()
  const { ready, siteName, siteTagline, logoUrl, loginBackgroundUrl, homeHref } = useAuthBrand()

  useEffect(() => {
    if (ready && siteName) {
      document.title = `Sign In | ${siteName}`
    }
  }, [ready, siteName])

  const maintenanceMode = getSetting('maintenance_mode', false)

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }
  const loginBgUrl = loginBackgroundUrl

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
          backgroundImage: `url(${resolveStorageUrl(loginBgUrl)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}}
      >
        {loginBgUrl && (
          <div className="absolute inset-0 bg-primary/80" />
        )}
        <div className="relative z-10">
          <BrandMark
            logoUrl={logoUrl}
            siteName={siteName}
            siteTagline={siteTagline}
            homeHref={homeHref}
            light
          />
        </div>
        <div className="space-y-6 relative z-10">
          <h2 className="text-4xl font-bold text-balance">{t("login.heroTitle")}</h2>
          <p className="text-lg opacity-90 text-balance">{t("login.heroSubtitle")}</p>
        </div>
        <div className="text-sm opacity-75 relative z-10">&copy; {new Date().getFullYear()} {siteName}</div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-8">
              <BrandMark logoUrl={logoUrl} siteName={siteName} homeHref={homeHref} />
            </div>
            <h1 className="text-3xl font-bold">{t("login.title")}</h1>
            <p className="text-muted-foreground mt-2">{t("login.subtitle")}</p>
          </div>
          <LoginForm allowRegistration={getSetting('allow_registration', true)} />
          {getSetting('allow_registration', true) && (
            <p className="text-center text-sm text-muted-foreground">
              {t("login.registerPrompt")}{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">
                {t("login.register")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
