"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"
import { TenantBrandLogo } from "@/components/branding/tenant-brand-logo"

interface LandingHeaderProps {
  isTenantPage?: boolean
}

const PRIMARY_LINKS = [
  { href: "#properties", label: "Properties" },
  { href: "#investments", label: "Investments" },
  { href: "#loans", label: "Loans" },
  { href: "#features", label: "Features" },
]

const UTILITY_LINKS = [
  { href: "#download-app", label: "Get the App" },
  { href: "#upload-docs", label: "Upload Docs" },
  { href: "/verify", label: "Verify Document" },
]

const NAV_LINKS = [...PRIMARY_LINKS, ...UTILITY_LINKS]

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
    >
      {label}
    </Link>
  )
}

export function LandingHeader(_props: LandingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { settings } = useWhiteLabel()

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink items-center" onClick={() => setMenuOpen(false)}>
          <TenantBrandLogo
            settings={settings}
            fullName
            iconClassName="h-9 w-9"
            titleClassName="font-semibold text-sm tracking-tight text-foreground sm:text-[15px]"
            taglineClassName="text-[11px] leading-4 text-muted-foreground"
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center min-[1180px]:flex" aria-label="Primary">
          <div className="flex items-center">
            {PRIMARY_LINKS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
          <span className="mx-2 h-4 w-px shrink-0 bg-border" aria-hidden />
          <div className="flex items-center">
            {UTILITY_LINKS.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-2 min-[1180px]:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-foreground">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="px-4">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted min-[1180px]:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t bg-background min-[1180px]:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6" aria-label="Primary">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-3">
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
