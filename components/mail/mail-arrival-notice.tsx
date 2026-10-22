"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api/client"

type Notice = {
  id: string
  title?: string
  message?: string
  data?: { kind?: string; mail_id?: string; subject?: string }
}

const storageKey = "mail-notices-seen"

function seenIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = sessionStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function remember(id: string) {
  const next = Array.from(new Set([...seenIds(), id])).slice(-40)
  sessionStorage.setItem(storageKey, JSON.stringify(next))
}

export function MailArrivalNotice({ hrefFor }: { hrefFor: (mailId: string) => string }) {
  const router = useRouter()
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    let cancelled = false

    const look = async () => {
      try {
        const response = await apiFetch<{ notifications?: Array<Notice & { is_read?: boolean; is_unread?: boolean }> }>("/notifications?per_page=8")
        const items = response.notifications || []
        const match = items.find((item) => (item.is_unread || item.is_read === false) && item.data?.kind === "mail" && item.data.mail_id && !seenIds().includes(item.id))
        if (!cancelled && match) setNotice(match)
      } catch {
        // The bell still shows notifications if this poll fails.
      }
    }

    look()
    const timer = setInterval(look, 15000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  if (!notice?.data?.mail_id) return null

  const mailId = notice.data.mail_id
  const dismiss = () => {
    remember(notice.id)
    setNotice(null)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(100%-2rem,22rem)] rounded-xl border bg-background p-4 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-emerald-100 p-2 text-emerald-800">
          <Mail className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">You have a new email</p>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{notice.message || notice.data.subject}</p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                dismiss()
                router.push(hrefFor(mailId))
              }}
            >
              Open email
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Later
            </Button>
          </div>
        </div>
        <button type="button" className="text-muted-foreground" onClick={dismiss} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
