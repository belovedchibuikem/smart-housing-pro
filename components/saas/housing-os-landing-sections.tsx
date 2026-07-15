"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ShieldCheck,
  Search,
  Building2,
  Users,
  Landmark,
  BadgeCheck,
  Smartphone,
  ArrowRight,
  HelpCircle,
} from "lucide-react"

const CATEGORIES = [
  { label: "Residential", href: "/saas/marketplace?listing_category=residential" },
  { label: "Apartments", href: "/saas/marketplace?listing_category=apartment" },
  { label: "Luxury", href: "/saas/marketplace?listing_category=luxury" },
  { label: "Commercial", href: "/saas/marketplace?listing_category=commercial" },
  { label: "Land", href: "/saas/marketplace?listing_kind=land" },
  { label: "Short lets", href: "/saas/marketplace?listing_category=short-let" },
  { label: "Rentals", href: "/saas/marketplace?listing_type=rental" },
  { label: "Investment", href: "/saas/marketplace?listing_purpose=investment" },
]

const HOW_IT_WORKS = [
  { step: "1", title: "Search verified listings", body: "Filter by type, location, trust score, and purpose." },
  { step: "2", title: "Confirm authenticity", body: "Check badges, QR Property ID, and verification history." },
  { step: "3", title: "Book inspection", body: "Schedule viewings with agents or vendors securely." },
  { step: "4", title: "Transact with confidence", body: "Continue into portals with documents and payments." },
]

const VERIFICATION_STEPS = [
  "Identity & KYC checks",
  "Vendor CAC validation",
  "Title / survey document review",
  "Geo & ownership checks",
  "Human moderation before publish",
]

/**
 * Premium trust / conversion sections for /saas landing — additive, does not replace CMS blocks.
 */
export function HousingOsLandingSections() {
  return (
    <>
      <section className="container mx-auto px-4 py-16 border-t" aria-labelledby="categories-heading">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Smart search</p>
          <h2 id="categories-heading" className="text-3xl font-bold">
            Explore by category
          </h2>
          <p className="text-muted-foreground mt-3">
            Houses, land, commercial, short lets, and investment opportunities — verification first.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((c) => (
            <Button key={c.label} asChild variant="outline" size="sm">
              <Link href={c.href}>{c.label}</Link>
            </Button>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16" aria-labelledby="why-heading">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 id="why-heading" className="text-3xl font-bold">
              Why SmartHousing
            </h2>
            <p className="text-muted-foreground mt-3">
              Nigeria&apos;s housing operating system — marketplace, cooperatives, landlords, agents, and verification in
              one trusted place.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: ShieldCheck, title: "Trust first", body: "Multi-layer verification and QR authenticity checks." },
              { icon: Search, title: "Discover safely", body: "Filters, map search, and scam-resistant badges." },
              { icon: Building2, title: "Manage property", body: "Rentals, allotments, and estate workflows." },
              { icon: Users, title: "Agents & vendors", body: "Professional CRM-ready agent and vendor profiles." },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35 }}
              >
                <Card className="p-6 h-full">
                  <item.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{item.body}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16" aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-3xl font-bold text-center mb-10">
          How it works
        </h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className="text-center space-y-2">
              <div className="mx-auto h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {s.step}
              </div>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16" aria-labelledby="verify-heading">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-start gap-4 mb-8">
            <BadgeCheck className="h-10 w-10 text-primary shrink-0" />
            <div>
              <h2 id="verify-heading" className="text-3xl font-bold">
                Our verification process
              </h2>
              <p className="text-muted-foreground mt-2">
                Feel safer than classified sites. Nothing goes live without review.
              </p>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {VERIFICATION_STEPS.map((step) => (
              <li key={step} className="flex items-center gap-2 rounded-lg border bg-background p-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16" aria-labelledby="solutions-heading">
        <h2 id="solutions-heading" className="text-3xl font-bold text-center mb-10">
          Housing solutions
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: Landmark,
              title: "Cooperatives",
              body: "Savings, land allocation, housing projects, and member finance.",
              href: "/onboard",
            },
            {
              icon: Building2,
              title: "Landlords",
              body: "Units, occupancy, rent collection, and maintenance requests.",
              href: "/onboard?vendor_type=landlord",
            },
            {
              icon: Users,
              title: "Agents & vendors",
              body: "Leads, inspections, commissions, CAC-verified vendor pages.",
              href: "/saas/marketplace/agents",
            },
          ].map((s) => (
            <Card key={s.title} className="p-6 flex flex-col">
              <s.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 flex-1">{s.body}</p>
              <Button asChild variant="link" className="px-0 mt-4 justify-start">
                <Link href={s.href}>
                  Learn more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-16" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 id="faq-heading" className="text-3xl font-bold">
              FAQs
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Are listings anonymous?",
                a: "No. Every listing is tied to a vendor or the SmartHousing Official Vendor until reassigned.",
              },
              {
                q: "How do I verify a property on-site?",
                a: "Scan the QR Property ID or open the verify URL on smarthousing.com.ng.",
              },
              {
                q: "Can landlords manage tenants here?",
                a: "Yes — landlord Tenant Admin tools cover units, leases, waitlists, and maintenance.",
              },
            ].map((item) => (
              <details key={item.q} className="rounded-lg border bg-background p-4">
                <summary className="font-medium cursor-pointer">{item.q}</summary>
                <p className="text-sm text-muted-foreground mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center" aria-labelledby="app-heading">
        <Smartphone className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 id="app-heading" className="text-3xl font-bold">
          Download the mobile app
        </h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Members already manage wallets, contributions, and marketplace discovery on iOS and Android via Smart Housing.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Button asChild>
            <Link href="/saas/marketplace">Open marketplace</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/saas/contact">Contact sales</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
