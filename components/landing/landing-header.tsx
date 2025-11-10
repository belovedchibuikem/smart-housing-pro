"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Menu, X } from "lucide-react"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"
import Image from "next/image"

interface LandingHeaderProps {
  isTenantPage?: boolean
}

export function LandingHeader({ isTenantPage = true }: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { settings } = useWhiteLabel()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings?.logo_url ? (
              <Image
                src={settings.logo_url || "/placeholder.svg"}
                alt={settings.company_name || "Logo"}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
            <div>
              <h1 className="font-bold text-xl">{settings?.company_name || "FRSC HMS"}</h1>
              <p className="text-xs text-muted-foreground">{settings?.company_tagline || "Housing Management System"}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#properties" className="text-sm font-medium hover:text-primary transition-colors">
              Properties
            </Link>
            <Link href="#investments" className="text-sm font-medium hover:text-primary transition-colors">
              Investments
            </Link>
            <Link href="#loans" className="text-sm font-medium hover:text-primary transition-colors">
              Loans
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3">
              <Link
                href="#properties"
                className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Properties
              </Link>
              <Link
                href="#investments"
                className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Investments
              </Link>
              <Link
                href="#loans"
                className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Loans
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </nav>
            <div className="flex flex-col gap-2 pt-2 border-t">
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
