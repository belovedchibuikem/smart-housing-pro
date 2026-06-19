type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

type InstallPromptListener = (event: BeforeInstallPromptEvent | null) => void

declare global {
  interface Window {
    __deferredPwaInstallPrompt?: BeforeInstallPromptEvent | null
  }
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
const listeners = new Set<InstallPromptListener>()
let initialized = false

function readWindowPrompt() {
  if (typeof window === "undefined") return null
  return window.__deferredPwaInstallPrompt ?? null
}

function notifyListeners() {
  listeners.forEach((listener) => listener(deferredPrompt))
}

export function initInstallPromptCapture() {
  if (initialized || typeof window === "undefined") return
  initialized = true

  deferredPrompt = readWindowPrompt()

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    window.__deferredPwaInstallPrompt = deferredPrompt
    notifyListeners()
  })

  window.addEventListener("pwa-installprompt-ready", () => {
    deferredPrompt = readWindowPrompt()
    notifyListeners()
  })

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null
    window.__deferredPwaInstallPrompt = null
    notifyListeners()
  })
}

export function getDeferredInstallPrompt() {
  return deferredPrompt ?? readWindowPrompt()
}

export function subscribeInstallPrompt(listener: InstallPromptListener) {
  listeners.add(listener)
  listener(deferredPrompt)
  return () => listeners.delete(listener)
}

export type { BeforeInstallPromptEvent }
