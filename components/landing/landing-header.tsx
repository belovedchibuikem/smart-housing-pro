"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"
import { TenantBrandLogo } from "@/components/branding/tenant-brand-logo"

interface LandingHeaderProps {
  isTenantPage?: boolean
}

const NAV_LINKS = [
  { href: "#properties", label: "Properties" },
  { href: "#investments", label: "Investments" },
  { href: "#loans", label: "Loans" },
  { href: "#features", label: "Features" },
  { href: "#download-app", label: "Get the App" },
  { href: "#upload-docs", label: "Upload Docs" },
  { href: "/verify", label: "Verify Document" },
]

export function LandingHeader(_props: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { settings } = useWhiteLabel()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" className="flex min-w-0 flex-1 items-center sm:flex-none sm:shrink-0">
            <TenantBrandLogo
              settings={settings}
              fullName
              iconClassName="h-10 w-10"
              titleClassName="font-semibold text-[15px] tracking-tight text-foreground sm:text-base"
              taglineClassName="text-[11px] leading-4 text-muted-foreground"
            />
          </Link>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-foreground">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-md p-2 text-foreground transition-colors hover:bg-muted xl:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <nav className="hidden h-11 items-center justify-between border-t xl:flex" aria-label="Primary">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="border-t bg-background xl:hidden">
          <nav className="container mx-auto flex flex-col px-4 py-2" aria-label="Primary">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t py-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
