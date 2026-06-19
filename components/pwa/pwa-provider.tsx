"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useWhiteLabel } from "@/lib/context/white-label-context"
import { applyPwaMetaTags } from "@/lib/pwa/apply-pwa-meta"
import { useServiceWorker } from "@/lib/pwa/register-service-worker"
import { InstallAppBanner } from "@/components/pwa/install-app-banner"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useServiceWorker()

  useEffect(() => {
    applyPwaMetaTags(settings)
    setIsStandalone(isStandaloneDisplayMode())
    setIsInstalled(isStandaloneDisplayMode())

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstalled(true)
      setIsStandalone(true)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onAppInstalled)
    }
  }, [settings])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null)
      return true
    }
    return false
  }, [deferredPrompt])

  const dismissInstallPrompt = useCallback(() => {
    const until = Date.now() + 7 * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, String(until))
    setDeferredPrompt(null)
  }, [])

  const value = useMemo<PwaContextValue>(
    () => ({
      canInstall: Boolean(deferredPrompt) && !isInstalled,
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
