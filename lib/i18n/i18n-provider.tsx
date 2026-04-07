"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import type { AppLocale } from "@/lib/i18n/messages"
import { translate } from "@/lib/i18n/messages"
import { getUserSettings } from "@/lib/api/client"

const STORAGE_KEY = "dashboard_locale"

type I18nContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function normalizeLocale(raw: string | null | undefined): AppLocale {
  if (raw === "yo" || raw === "ha" || raw === "ig" || raw === "en") return raw
  return "en"
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en")

  useEffect(() => {
    try {
      const stored = normalizeLocale(localStorage.getItem(STORAGE_KEY))
      setLocaleState(stored)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    const onLocale = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      setLocaleState(normalizeLocale(detail))
    }
    window.addEventListener("app:locale", onLocale as EventListener)
    return () => window.removeEventListener("app:locale", onLocale as EventListener)
  }, [])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale === "en" ? "en" : locale
    }
  }, [locale])

  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
        if (!token) return
        const res = await getUserSettings()
        if (cancelled || !res.success || !res.settings?.language) return
        const next = normalizeLocale(res.settings.language as string)
        setLocaleState(next)
        try {
          localStorage.setItem(STORAGE_KEY, next)
        } catch {
          /* ignore */
        }
      } catch {
        /* ignore */
      }
    }
    void sync()
    return () => {
      cancelled = true
    }
  }, [])

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const t = useCallback((key: string) => translate(locale, key), [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return {
      locale: "en",
      setLocale: () => {},
      t: (key: string) => translate("en", key),
    }
  }
  return ctx
}
