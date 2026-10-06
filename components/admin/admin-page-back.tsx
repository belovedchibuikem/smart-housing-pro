"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function pageAlreadyHasBack(main: HTMLElement, marker: HTMLElement): boolean {
  const arrows = main.querySelectorAll("svg.lucide-arrow-left")
  for (const svg of arrows) {
    if (!marker.contains(svg)) return true
  }

  const controls = main.querySelectorAll("a, button")
  for (const node of controls) {
    if (marker.contains(node)) continue
    const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase()
    const aria = (node.getAttribute("aria-label") || "").toLowerCase()
    if (text === "back" || text.startsWith("back ") || text.startsWith("back to") || aria.includes("back")) {
      return true
    }
  }

  return false
}

export function AdminPageBack() {
  const pathname = usePathname()
  const router = useRouter()
  const [marker, setMarker] = useState<HTMLDivElement | null>(null)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const main = marker?.closest("main")
    if (!marker || !main) return

    const detect = () => setHidden(pageAlreadyHasBack(main, marker))
    detect()

    const observer = new MutationObserver(detect)
    observer.observe(main, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [pathname, marker])

  return (
    <div ref={setMarker} className={hidden ? "hidden" : "mb-4"} data-admin-layout-back>
      <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go back
      </Button>
    </div>
  )
}
