"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Menu, Home, Sparkles, CreditCard, Users, Info, LogIn } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

export function SaaSHeader() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    {
      href: "/saas#features",
      label: "Features",
      icon: Sparkles,
      description: "Explore our powerful features",
    },
    {
      href: "/saas#plans",
      label: "Plans",
      icon: CreditCard,
      description: "Choose the right plan for you",
    },
    {
      href: "/saas/community",
      label: "Community",
      icon: Users,
      description: "Join our community discussions",
    },
    {
      href: "/saas/about",
      label: "About",
      icon: Info,
      description: "Learn more about us",
    },
  ]

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/saas" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
          <span>CoopHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/saas#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/saas#plans" className="text-sm font-medium hover:text-primary transition-colors">
            Plans
          </Link>
          <Link href="/saas/community" className="text-sm font-medium hover:text-primary transition-colors">
            Community
          </Link>
          <Link href="/saas/about" className="text-sm font-medium hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/saas#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
            Testimonials
          </Link>
          <Link href="/super-admin" className="text-sm font-medium hover:text-primary transition-colors">
            Login
          </Link>
        </nav>

        {/* Desktop CTA Button */}
        <Button asChild className="hidden md:flex">
          <Link href="/onboard">Start Free Trial</Link>
        </Button>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <Link
                  href="/saas"
                  className="flex items-center gap-2 font-bold text-xl"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span>CoopHub</span>
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-6">
                <div className="space-y-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent transition-colors group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="mt-0.5 p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-base group-hover:text-primary transition-colors">
                            {link.label}
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">{link.description}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <Separator className="my-6" />

                {/* Additional Links */}
                <div className="space-y-1">
                  <Link
                    href="/saas#testimonials"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="h-4 w-4 text-muted-foreground" />
                    Testimonials
                  </Link>
                  <Link
                    href="/super-admin"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="h-4 w-4 text-muted-foreground" />
                    Login
                  </Link>
                </div>
              </nav>

              {/* Mobile Menu Footer with CTA */}
              <div className="p-6 border-t bg-muted/30">
                <Button asChild className="w-full h-12 text-base font-semibold" size="lg">
                  <Link href="/onboard" onClick={() => setIsOpen(false)}>
                    Start Free Trial
                  </Link>
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  No credit card required • 14-day free trial
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
