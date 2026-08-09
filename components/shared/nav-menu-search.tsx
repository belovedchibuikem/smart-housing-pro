"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { flattenNavItems, type FlatNavSearchItem } from "@/lib/navigation/nav-search"
import { cn } from "@/lib/utils"

type NavLike = {
  href?: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  subItems?: NavLike[]
}

type Props = {
  items: NavLike[]
  placeholder?: string
  triggerClassName?: string
  /** Compact button for headers */
  variant?: "header" | "sidebar"
  /** Register Ctrl/Cmd+K. Disable when mounting a second instance (e.g. mobile icon). */
  enableShortcut?: boolean
}

export function NavMenuSearch({
  items,
  placeholder = "Search menu…",
  triggerClassName,
  variant = "header",
  enableShortcut = true,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const flat = useMemo(() => flattenNavItems(items), [items])

  const grouped = useMemo(() => {
    const map = new Map<string, FlatNavSearchItem[]>()
    for (const row of flat) {
      const key = row.group || "Pages"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(row)
    }
    return map
  }, [flat])

  useEffect(() => {
    if (!enableShortcut) return
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [enableShortcut])

  const go = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return (
    <>
      <Button
        type="button"
        variant={variant === "header" ? "outline" : "ghost"}
        onClick={() => setOpen(true)}
        className={cn(
          variant === "header"
            ? "h-9 w-full max-w-md justify-start gap-2 text-muted-foreground"
            : "h-9 w-full justify-start gap-2 px-3 text-muted-foreground",
          triggerClassName,
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate text-sm">{placeholder}</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search menu">
        <CommandInput placeholder="Type to find a page…" />
        <CommandList>
          <CommandEmpty>No matching menu items.</CommandEmpty>
          {[...grouped.entries()].map(([group, rows]) => (
            <CommandGroup key={group} heading={group}>
              {rows.map((row) => (
                <CommandItem
                  key={row.href}
                  value={`${row.label} ${row.group || ""} ${row.href}`}
                  onSelect={() => go(row.href)}
                >
                  <span className="flex-1 truncate">{row.label}</span>
                  <span className="ml-2 truncate text-xs text-muted-foreground">{row.href}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
