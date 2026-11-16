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

export function LandingHeader({ isTenantPage = true }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { settings } = useWhiteLabel()

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <Link href="/" className="flex min-w-0 max-w-[16rem] items-center sm:max-w-xs lg:max-w-sm">
            <TenantBrandLogo
              settings={settings}
              wrapName
              iconClassName="h-10 w-10"
              titleClassName="font-bold text-base sm:text-lg"
              taglineClassName="text-xs text-muted-foreground"
            />
          </Link>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 transition-colors hover:bg-accent lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <nav className="hidden items-center gap-1 overflow-x-auto pb-3 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {mobileMenuOpen && (
          <div className="space-y-4 pb-4 lg:hidden">
            <nav className="flex flex-col space-y-1">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 border-t pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
