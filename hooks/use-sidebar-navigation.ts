"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  collectFlatActiveMenuKeys,
  collectNestedActiveMenuKeys,
  type SidebarNavItem,
} from "@/lib/navigation/sidebar-nav"

type SidebarNavMode = "flat" | "nested"

/** Stable signature so filtered nav arrays don't thrash open-state every render. */
function navItemsSignature(items: SidebarNavItem[]): string {
  const walk = (nodes: SidebarNavItem[]): string =>
    nodes
      .map((node) => {
        const kids = node.subItems?.length ? `[${walk(node.subItems)}]` : ""
        return `${node.label}${kids}`
      })
      .join("|")
  return walk(items)
}

function ancestorsOf(menuKey: string): string[] {
  const parts = menuKey.split("/").filter(Boolean)
  if (parts.length <= 1) return []
  const keys: string[] = []
  for (let i = 1; i < parts.length; i++) {
    keys.push(parts.slice(0, i).join("/"))
  }
  return keys
}

/**
 * Accordion open set:
 * - flat: only one top-level group
 * - nested: only the active branch (ancestors + target); siblings close
 */
function openAccordionBranch(menuKey: string): string[] {
  return [...ancestorsOf(menuKey), menuKey]
}

function closeBranch(prev: string[], menuKey: string): string[] {
  return prev.filter((key) => key !== menuKey && !key.startsWith(`${menuKey}/`))
}

export function useSidebarNavigation(items: SidebarNavItem[], pathname: string, mode: SidebarNavMode = "flat") {
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const itemsKey = useMemo(() => navItemsSignature(items), [items])
  const itemsRef = useRef(items)
  const prevPathnameRef = useRef(pathname)
  itemsRef.current = items

  const resolveActiveKeys = useCallback(
    (path: string) => {
      const current = itemsRef.current
      if (current.length === 0) return [] as string[]
      return mode === "nested"
        ? collectNestedActiveMenuKeys(current, path)
        : collectFlatActiveMenuKeys(current, path)
    },
    [mode],
  )

  // Sync open groups to the route — pathname/structure only (not every new items array ref).
  useEffect(() => {
    const activeKeys = resolveActiveKeys(pathname)
    const pathChanged = prevPathnameRef.current !== pathname
    prevPathnameRef.current = pathname

    if (activeKeys.length === 0) {
      // Close groups when leaving a section; keep manual opens on top-level pages.
      if (pathChanged) setOpenMenus([])
      return
    }

    if (mode === "flat") {
      // One open group: prefer the active route's parent.
      setOpenMenus([activeKeys[0]])
      return
    }

    // Nested: open the deepest active branch only (closes other trees).
    const deepest = activeKeys.reduce((a, b) => (b.length >= a.length ? b : a), activeKeys[0])
    setOpenMenus(openAccordionBranch(deepest))
  }, [pathname, itemsKey, mode, resolveActiveKeys])

  const toggleMenu = useCallback((menuKey: string) => {
    setOpenMenus((prev) => {
      if (prev.includes(menuKey)) {
        return closeBranch(prev, menuKey)
      }
      if (mode === "flat") {
        return [menuKey]
      }
      return openAccordionBranch(menuKey)
    })
  }, [mode])

  const isMenuOpen = useCallback((menuKey: string) => openMenus.includes(menuKey), [openMenus])

  return { openMenus, toggleMenu, isMenuOpen }
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
