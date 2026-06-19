"use client"

import { useEffect } from "react"

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return
  }

  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => {
      registration.addEventListener("updatefound", () => {
        const nextWorker = registration.installing
        if (!nextWorker) return
        nextWorker.addEventListener("statechange", () => {
          if (nextWorker.state === "installed" && navigator.serviceWorker.controller) {
            nextWorker.postMessage({ type: "SKIP_WAITING" })
          }
        })
      })
    })
    .catch((error) => {
      console.warn("[PWA] Service worker registration failed:", error)
    })
}

export function useServiceWorker() {
  useEffect(() => {
    registerServiceWorker()
  }, [])
}
