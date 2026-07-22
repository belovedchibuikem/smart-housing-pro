/**
 * Radix DropdownMenu / Select / Dialog can leave the document body with
 * `pointer-events: none` when navigating away mid-close. That freezes the UI
 * (no hover, no clicks) until a full reload.
 */
export function unlockBodyPointerEvents(): void {
  if (typeof document === "undefined") return

  const body = document.body
  body.style.removeProperty("pointer-events")
  body.style.removeProperty("overflow")
  body.style.removeProperty("padding-right")
  body.removeAttribute("data-scroll-locked")
  body.removeAttribute("data-aria-hidden")

  // Radix RemoveScroll sometimes stamps these on <html> as well.
  const root = document.documentElement
  root.style.removeProperty("pointer-events")
  root.style.removeProperty("overflow")
  root.removeAttribute("data-scroll-locked")

  // Clear leftover inert overlays that never unmounted.
  document.querySelectorAll("[data-radix-focus-guard]").forEach((node) => {
    if (node.parentElement === body) {
      node.remove()
    }
  })
}
