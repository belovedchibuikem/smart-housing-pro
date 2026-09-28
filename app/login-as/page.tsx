"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { consumePendingImpersonation } from "@/lib/auth/impersonation"
import { Suspense } from "react"

function LoginAsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const ended = searchParams.get("ended") === "1"
  const [message, setMessage] = useState(ended ? "" : "Signing in…")

  useEffect(() => {
    if (ended) return

    let settled = false
    const finish = () => {
      if (settled) return
      if (!consumePendingImpersonation()) return false
      settled = true
      router.replace("/admin")
      return true
    }

    if (finish()) return

    const onStorage = () => {
      finish()
    }
    window.addEventListener("storage", onStorage)
    const poll = window.setInterval(() => {
      finish()
    }, 300)
    const timer = window.setTimeout(() => {
      if (!settled) setMessage("This sign-in link expired. Close the tab and try again from Users.")
    }, 20000)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.clearInterval(poll)
      window.clearTimeout(timer)
    }
  }, [ended, router])

  if (ended) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-muted-foreground">This signed-in session has ended. You can close this tab.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export default function LoginAsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginAsInner />
    </Suspense>
  )
}
