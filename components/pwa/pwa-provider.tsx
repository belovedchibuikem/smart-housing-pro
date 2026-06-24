"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useWhiteLabel } from "@/lib/context/white-label-context"
import { applyPwaMetaTags } from "@/lib/pwa/apply-pwa-meta"
import {
  getDeferredInstallPrompt,
  initInstallPromptCapture,
  subscribeInstallPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install-prompt-store"
import { useServiceWorker } from "@/lib/pwa/register-service-worker"
import { InstallAppBanner } from "@/components/pwa/install-app-banner"
import { isAndroidDevice, isDesktopBrowser } from "@/lib/pwa/mobile-app-store"

initInstallPromptCapture()

type PwaContextValue = {
  canInstall: boolean
  isInstalled: boolean
  isStandalone: boolean
  promptInstall: () => Promise<boolean>
  dismissInstallPrompt: () => void
}

const PwaContext = createContext<PwaContextValue | undefined>(undefined)

const DISMISS_KEY = "pwa-install-dismissed-until"

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const { settings } = useWhiteLabel()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
    typeof window === "undefined" ? null : getDeferredInstallPrompt(),
  )
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useServiceWorker()

  useEffect(() => {
    applyPwaMetaTags(settings)
    setIsStandalone(isStandaloneDisplayMode())
    setIsInstalled(isStandaloneDisplayMode())

    return subscribeInstallPrompt((event) => {
      setDeferredPrompt(event)
      if (!event && isStandaloneDisplayMode()) {
        setIsInstalled(true)
        setIsStandalone(true)
      }
    })
  }, [settings])

  const promptInstall = useCallback(async () => {
    if (isAndroidDevice() || !isDesktopBrowser()) return false
    const prompt = deferredPrompt ?? getDeferredInstallPrompt()
    if (!prompt) return false
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null)
      setIsInstalled(true)
      setIsStandalone(true)
      return true
    }
    return false
  }, [deferredPrompt])

  const dismissInstallPrompt = useCallback(() => {
    const until = Date.now() + 7 * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, String(until))
  }, [])

  const value = useMemo<PwaContextValue>(
    () => ({
      canInstall: Boolean(deferredPrompt) && !isInstalled && isDesktopBrowser() && !isAndroidDevice(),
      isInstalled,
      isStandalone,
      promptInstall,
      dismissInstallPrompt,
    }),
    [deferredPrompt, dismissInstallPrompt, isInstalled, isStandalone, promptInstall],
  )

  return (
    <PwaContext.Provider value={value}>
      {children}
      <InstallAppBanner />
    </PwaContext.Provider>
  )
}

export function usePwa() {
  const context = useContext(PwaContext)
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider")
  }
  return context
}

export function useOptionalPwa() {
  return useContext(PwaContext)
}
