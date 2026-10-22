"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiFetch } from "@/lib/api/client"
import { cn } from "@/lib/utils"

type MailAlert = {
  id: string
  subject: string
  from: string
  is_urgent?: boolean
  sent_at?: string
}

let mailAudio: AudioContext | null = null

function mailAudioContext() {
  if (typeof window === "undefined") return null
  const Context = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Context) return null
  if (!mailAudio) mailAudio = new Context()
  return mailAudio
}

function unlockMailSound() {
  const audio = mailAudioContext()
  if (audio?.state === "suspended") void audio.resume()
}

function playMailChime() {
  const audio = mailAudioContext()
  if (!audio) return
  if (audio.state === "suspended") {
    void audio.resume().then(() => playMailChime())
    return
  }

  const start = audio.currentTime
  ;[784, 1046].forEach((frequency, index) => {
    const tone = audio.createOscillator()
    const level = audio.createGain()
    const at = start + index * 0.14
    tone.type = "sine"
    tone.frequency.value = frequency
    level.gain.setValueAtTime(0.0001, at)
    level.gain.exponentialRampToValueAtTime(0.09, at + 0.02)
    level.gain.exponentialRampToValueAtTime(0.0001, at + 0.28)
    tone.connect(level)
    level.connect(audio.destination)
    tone.start(at)
    tone.stop(at + 0.3)
  })
}

function formatWhen(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export function MailBell({
  inboxHref,
  messageHref,
}: {
  inboxHref: string
  messageHref: (id: string) => string
}) {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [messages, setMessages] = useState<MailAlert[]>([])
  const [pulse, setPulse] = useState(false)
  const knownCount = useRef<number | null>(null)

  const load = useCallback(async () => {
    try {
      const response = await apiFetch<{ unread_count?: number; messages?: MailAlert[] }>("/communication/mail/unread-count")
      const next = Number(response.unread_count || 0)
      if (knownCount.current !== null && next > knownCount.current) {
        setPulse(true)
        playMailChime()
      }
      knownCount.current = next
      setCount(next)
      setMessages(response.messages || [])
    } catch {
      // Keep the last count if the poll fails.
    }
  }, [])

  useEffect(() => {
    const unlock = () => unlockMailSound()
    window.addEventListener("pointerdown", unlock)
    window.addEventListener("keydown", unlock)
    return () => {
      window.removeEventListener("pointerdown", unlock)
      window.removeEventListener("keydown", unlock)
    }
  }, [])

  useEffect(() => {
    load()
    const timer = setInterval(load, 20000)
    return () => clearInterval(timer)
  }, [load])

  useEffect(() => {
    if (!pulse) return
    const timer = setTimeout(() => setPulse(false), 1600)
    return () => clearTimeout(timer)
  }, [pulse])

  return (
    <DropdownMenu open={open} onOpenChange={(next) => { setOpen(next); if (next) load() }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Email">
          <Mail className={cn("h-5 w-5", pulse && "animate-bounce text-emerald-700")} />
          {count > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
              {count > 99 ? "99+" : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Email</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {messages.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">No unread email</p>
        ) : (
          <div className="max-h-80 overflow-auto">
            {messages.map((message) => (
              <Link
                key={message.id}
                href={messageHref(message.id)}
                className="block border-b px-3 py-2.5 last:border-b-0 hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{message.from || "Unknown"}</p>
                  {message.is_urgent ? <span className="text-[10px] uppercase text-red-600">Urgent</span> : null}
                </div>
                <p className="truncate text-sm text-muted-foreground">{message.subject}</p>
                <p className="text-xs text-muted-foreground">{formatWhen(message.sent_at)}</p>
              </Link>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <Link href={inboxHref} className="block px-3 py-2 text-center text-sm font-medium text-emerald-800 hover:bg-accent" onClick={() => setOpen(false)}>
          Open inbox
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
