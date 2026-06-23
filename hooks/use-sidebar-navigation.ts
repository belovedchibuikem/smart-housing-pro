"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  collectFlatActiveMenuKeys,
  collectNestedActiveMenuKeys,
  type SidebarNavItem,
  scrollSidebarToActiveItem,
} from "@/lib/navigation/sidebar-nav"

type SidebarNavMode = "flat" | "nested"

function mergeOpenMenuKeys(prev: string[], activeKeys: string[]): string[] {
  if (activeKeys.length === 0) return prev
  const next = Array.from(new Set([...prev, ...activeKeys]))
  if (next.length === prev.length && next.every((key) => prev.includes(key))) {
    return prev
  }
  return next
}

export function useSidebarNavigation(items: SidebarNavItem[], pathname: string, mode: SidebarNavMode = "flat") {
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const asideRef = useRef<HTMLElement | null>(null)
  const pendingScrollPathRef = useRef<string | null>(null)

  useEffect(() => {
    pendingScrollPathRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (items.length === 0) return

    const activeKeys =
      mode === "nested"
        ? collectNestedActiveMenuKeys(items, pathname)
        : collectFlatActiveMenuKeys(items, pathname)

    setOpenMenus((prev) => mergeOpenMenuKeys(prev, activeKeys))
  }, [pathname, items, mode])

  // Auto-scroll only once after route navigation (not on manual scroll or incidental re-renders).
  useEffect(() => {
    if (pendingScrollPathRef.current !== pathname) return

    const frame = requestAnimationFrame(() => {
      if (pendingScrollPathRef.current !== pathname) return
      scrollSidebarToActiveItem(asideRef.current)
      pendingScrollPathRef.current = null
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname, openMenus])

  const toggleMenu = useCallback((menuKey: string) => {
    setOpenMenus((prev) => (prev.includes(menuKey) ? prev.filter((key) => key !== menuKey) : [...prev, menuKey]))
  }, [])

  const isMenuOpen = useCallback((menuKey: string) => openMenus.includes(menuKey), [openMenus])

  return { openMenus, toggleMenu, isMenuOpen, asideRef }
}

export function formatMemberDisplayIdentifier(member: {
  member_id?: string | null
  member_number?: string | null
  staff_id?: string | null
  ippis_number?: string | null
} | null | undefined): string | null {
  if (!member) return null

  if (member.member_number?.trim()) return `Member No: ${member.member_number.trim()}`
  if (member.staff_id?.trim()) return `Staff ID: ${member.staff_id.trim()}`
  if (member.ippis_number?.trim()) return `IPPIS: ${member.ippis_number.trim()}`

  const legacy = member.member_id?.trim()
  if (legacy && legacy !== "—") return legacy

  return null
}
