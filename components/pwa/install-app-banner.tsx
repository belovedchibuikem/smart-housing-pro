"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Download, Share, Smartphone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWhiteLabelSettings } from "@/lib/hooks/use-white-label"
import { useOptionalPwa } from "@/components/pwa/pwa-provider"
import { resolveStorageUrl } from "@/lib/api/config"
import {
  isAndroidDevice,
  isInstallPromptRoute,
  openAndroidPlayStore,
} from "@/lib/pwa/mobile-app-store"

const DISMISS_KEY = "pwa-install-dismissed-until"

function isDismissedRecently() {
  if (typeof window === "undefined") return true
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const until = Number(raw)
  return Number.isFinite(until) && Date.now() < until
}

function isIosDevice() {
  if (typeof window === "undefined") return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function InstallAppBanner() {
  const pathname = usePathname()
  const pwa = useOptionalPwa()
  const { getCompanyName, getLogo } = useWhiteLabelSettings()
  const [visible, setVisible] = useState(false)
  const [iosMode, setIosMode] = useState(false)
  const [playStoreMode, setPlayStoreMode] = useState(false)

  const showOnRoute = isInstallPromptRoute(pathname)
  const androidDevice = isAndroidDevice()

  useEffect(() => {
    if (!showOnRoute || isStandaloneDisplayMode() || isDismissedRecently()) {
      setVisible(false)
      setPlayStoreMode(false)
      setIosMode(false)
      return
    }

    if (androidDevice) {
      setPlayStoreMode(true)
      setIosMode(false)
      const timer = window.setTimeout(() => setVisible(true), 800)
      return () => window.clearTimeout(timer)
    }

    setPlayStoreMode(false)
    const ios = isIosDevice()
    setIosMode(ios && !pwa?.canInstall)

    if (pwa?.canInstall) {
      const timer = window.setTimeout(() => setVisible(true), 800)
      return () => window.clearTimeout(timer)
    }

    if (ios) {
      const timer = window.setTimeout(() => setVisible(true), 1500)
      return () => window.clearTimeout(timer)
    }

    setVisible(false)
  }, [androidDevice, showOnRoute, pwa?.canInstall, pwa?.isStandalone])

  if (!visible || isStandaloneDisplayMode()) {
    return null
  }

  const logo = getLogo()
  const logoSrc = logo ? resolveStorageUrl(logo) : "/pwa/icon/192"
  const appName = getCompanyName()

  const handleInstall = async () => {
    if (playStoreMode) {
      openAndroidPlayStore()
      setVisible(false)
      return
    }
    if (!pwa?.canInstall) return
    const installed = await pwa.promptInstall()
    if (installed) setVisible(false)
  }

  const handleDismiss = () => {
    pwa?.dismissInstallPrompt()
    setVisible(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none">
      <div className="pointer-events-auto mx-auto flex max-w-lg items-start gap-3 rounded-2xl border bg-background/95 p-4 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <img
          src={logoSrc}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl border object-contain bg-white p-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold leading-tight">
                {playStoreMode ? `Get ${appName} on Google Play` : `Install ${appName}`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {playStoreMode
                  ? "Install the official Android app for faster access, notifications, and the best mobile experience."
                  : iosMode
                    ? "On iPhone/iPad: tap Share, then “Add to Home Screen” for app-like access with your cooperative logo."
                    : "Install on your desktop for quick access from your taskbar — works like a native app."}
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {playStoreMode ? (
              <Button type="button" size="sm" onClick={handleInstall}>
                <Download className="mr-2 h-4 w-4" />
                Get it on Google Play
              </Button>
            ) : pwa?.canInstall ? (
              <Button type="button" size="sm" onClick={handleInstall}>
                <Download className="mr-2 h-4 w-4" />
                Install app
              </Button>
            ) : iosMode ? (
              <Button type="button" size="sm" variant="secondary" disabled>
                <Share className="mr-2 h-4 w-4" />
                Use Share → Add to Home Screen
              </Button>
            ) : null}
            <Button type="button" size="sm" variant="outline" onClick={handleDismiss}>
              Not now
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Smartphone className="h-3.5 w-3.5" />
            {playStoreMode
              ? "Opens Google Play to install the app"
              : "Desktop: install as PWA · iPhone/iPad: Add to Home Screen"}
          </p>
        </div>
      </div>
    </div>
  )
}

export function InstallAppButton({
  variant = "outline",
  size = "sm",
  className,
}: {
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}) {
  const pathname = usePathname()
  const pwa = useOptionalPwa()
  const { getCompanyName } = useWhiteLabelSettings()

  if (!isInstallPromptRoute(pathname) || pwa?.isStandalone) {
    return null
  }

  if (isAndroidDevice()) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => openAndroidPlayStore()}
      >
        <Download className="mr-2 h-4 w-4" />
        Get app
      </Button>
    )
  }

  if (!pwa?.canInstall) {
    return null
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => void pwa.promptInstall()}
    >
      <Download className="mr-2 h-4 w-4" />
      Install {getCompanyName()}
    </Button>
  )
}
