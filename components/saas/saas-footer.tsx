"use client"

import Link from "next/link"
import { useSaasBranding } from "@/hooks/use-saas-branding"
import { SaasBrandMark } from "@/components/saas/saas-brand-mark"

export function SaaSFooter() {
  const { branding } = useSaasBranding()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t py-12 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-1">
            <SaasBrandMark branding={branding} variant="footer" />
            {branding.footer_tagline ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{branding.footer_tagline}</p>
            ) : null}
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/saas#features" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/saas#plans" className="hover:text-primary transition-colors">
                  Plans
                </Link>
              </li>
              <li>
                <Link href="/saas/demo" className="hover:text-primary transition-colors">
                  Request Demo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/saas/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/saas/community" className="hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/saas/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/saas/careers" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/saas/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/saas/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {year} {branding.site_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
