"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building2, Users, Wallet, TrendingUp, Shield, Zap, BarChart3, Check, ArrowRight, Star, Sparkles } from "lucide-react"
import { SaaSHeader } from "@/components/saas/saas-header"
import { PricingPlanCard, type PricingPlanDisplay } from "@/components/saas/pricing-plan-card"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { marketingFeaturesFromPackage } from "@/lib/subscription/package-modules"
import {
  fetchMarketplaceListings,
  type MarketplaceListing,
} from "@/lib/api/marketplace"
import { MarketplaceListingCard } from "@/components/marketplace/listing-card"

/** Central business subscription package (from GET /onboarding/packages) */
interface OnboardingPackage {
  id: string
  name: string
  slug: string
  description: string | null
  price: string | number
  billing_cycle: string
  trial_days?: number
  is_featured: boolean
  display_features?: string[]
  tagline?: string | null
  usd_hint?: string | null
  custom_pricing?: boolean
  limits?: Record<string, any>
  modules?: Array<{
    id: string
    name: string
    slug: string
  }>
}

function planFeaturesFromApi(pkg: OnboardingPackage): string[] {
  return marketingFeaturesFromPackage(pkg)
}

function apiPackageToPlan(pkg: OnboardingPackage): PricingPlanDisplay {
  const isContact = Boolean(pkg.custom_pricing ?? pkg.limits?.custom_pricing)
  const price = Number(pkg.price)
  return {
    id: pkg.id,
    name: pkg.name,
    tagline: pkg.tagline ?? pkg.limits?.tagline ?? null,
    description: pkg.description,
    priceNgn: Number.isFinite(price) ? price : null,
    usdHint: pkg.usd_hint ?? pkg.limits?.usd_hint ?? null,
    billingCycle: pkg.billing_cycle,
    customPricing: isContact,
    isFeatured: Boolean(pkg.is_featured),
    trialDays: pkg.trial_days,
    features: planFeaturesFromApi(pkg),
    modules: pkg.modules,
    ctaHref: isContact ? "/saas/contact" : "/onboard",
    ctaLabel: isContact ? "Contact sales" : "Get started",
    ctaVariant: pkg.is_featured ? "default" : "outline",
  }
}

function fallbackPlanToDisplay(plan: (typeof FALLBACK_PLAN_MARKETING)[number]): PricingPlanDisplay {
  const price = parseInt(plan.priceLabel.replace(/,/g, ""), 10)
  return {
    name: plan.name,
    tagline: plan.tagline,
    description: plan.description,
    priceNgn: plan.customPricing ? null : price,
    priceLabel: plan.customPricing ? undefined : `₦${plan.priceLabel}`,
    usdHint: plan.usdHint,
    billingCycle: "yearly",
    customPricing: plan.customPricing,
    isFeatured: plan.is_featured,
    features: plan.features,
    ctaHref: plan.customPricing ? "/saas/contact" : "/onboard",
    ctaLabel: plan.customPricing ? "Contact sales" : "Get started",
    ctaVariant: plan.is_featured ? "default" : "outline",
  }
}

interface PageSection {
  id: string
  section_type: string
  section_key: string
  title: string | null
  subtitle: string | null
  content: Record<string, any>
  media: any[]
  metadata: Record<string, any>
}

export default function SaaSLandingPage() {
  const [sections, setSections] = useState<PageSection[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [businessPackages, setBusinessPackages] = useState<OnboardingPackage[]>([])
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([])
  useEffect(() => {
    Promise.all([
      apiFetch<{ success: boolean; sections: PageSection[] }>("/public/saas/pages/home").catch(() => ({
        success: false,
        sections: [],
      })),
      apiFetch<{ success: boolean; testimonials: any[] }>("/public/saas/testimonials").catch(() => ({
        success: false,
        testimonials: [],
      })),
      apiFetch<{ success: boolean; packages: OnboardingPackage[] }>("/onboarding/packages").catch(() => ({
        success: false,
        packages: [],
      })),
      fetchMarketplaceListings({ sort: "newest", per_page: 6 }).catch(() => ({
        data: [] as MarketplaceListing[],
        pagination: { current_page: 1, last_page: 1, per_page: 6, total: 0 },
      })),
    ]).then(([sectionsRes, testimonialsRes, packagesRes, listingsRes]) => {
      if (sectionsRes.success) {
        setSections(sectionsRes.sections)
      }
      if (testimonialsRes.success) {
        setTestimonials(testimonialsRes.testimonials)
      }
      if (packagesRes.success && Array.isArray(packagesRes.packages)) {
        setBusinessPackages(packagesRes.packages)
      }
      setMarketplaceListings(listingsRes.data || [])
    })
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      {/* SaaS Platform Indicator Badge */}
      <div className="absolute top-4 right-4 z-50 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
        SaaS Platform
      </div>
      <SaaSLandingContent
        sections={sections}
        testimonials={testimonials}
        businessPackages={businessPackages}
        marketplaceListings={marketplaceListings}
      />
    </div>
  )
}

const WHY_CHOOSE_SMART_HOUSING = [
  { title: "All-in-One Platform", description: "for real estate operations" },
  { title: "Multi-Vendor Exposure", description: "to expand your reach" },
  { title: "Affordable Entry Point", description: "for startups" },
  { title: "Scalable Plans", description: "as your business grows" },
  { title: "Free Updates", description: "& continuous improvement" },
  { title: "Secure & Transparent", description: "system" },
] as const

/**
 * Shown if central packages API is empty (offline or no seed).
 * Mirrors the SmartHousing product template; amounts are NGN / year.
 */
const FALLBACK_PLAN_MARKETING: {
  name: string
  tagline?: string
  priceLabel: string
  usdHint?: string
  period: string
  customPricing?: boolean
  description: string
  features: string[]
  is_featured: boolean
}[] = [
  {
    name: "Starter",
    tagline: "For Beginners",
    priceLabel: "120,000",
    usdHint: "~$80",
    period: "/ Year",
    description: "Perfect for small realtors and emerging housing businesses looking to establish a digital presence.",
    is_featured: false,
    features: [
      "Access to SmartHousing Web App",
      "Basic Vendor Profile",
      "Limited Property Listings",
      "Deposit Management Access (Free Tools)",
      "Standard Support",
      "Basic Analytics Dashboard",
    ],
  },
  {
    name: "Growth",
    tagline: "Most Popular",
    priceLabel: "300,000",
    usdHint: "~$200",
    period: "/ Year",
    description: "Ideal for growing real estate businesses ready to scale operations and increase visibility.",
    is_featured: true,
    features: [
      "Everything in Starter Plan",
      "Increased Property Listings",
      "Investment Management Access",
      "Advanced Dashboard & Reporting",
      "In-App Notifications",
      "Priority Listing Visibility",
      "Email & In-App Support",
    ],
  },
  {
    name: "Professional",
    tagline: "Full Business Access",
    priceLabel: "500,000",
    usdHint: "~$330",
    period: "/ Year",
    description: "Designed for established real estate companies, developers, and housing cooperatives.",
    is_featured: false,
    features: [
      "Unlimited Property Listings",
      "Full Access to All Core Modules",
      "Investment & Payout Management",
      "Role & Permission Management",
      "Referral Programme Access",
      "Real-Time Analytics Dashboard",
      "Priority Customer Support",
      "Custom Branding Options",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Custom Solution",
    customPricing: true,
    priceLabel: "Custom",
    period: "Pricing",
    description:
      "Built for large housing cooperatives, institutions, and organizations requiring full customization and advanced control.",
    is_featured: false,
    features: [
      "Everything in Professional Plan",
      "Dedicated Web Instance (Own Platform)",
      "Full Customization & Branding",
      "Optional Administrative Modules",
      "API Integration",
      "Dedicated Account Manager",
      "Onboarding & Staff Training",
      "Continuous Consultation & Strategy Support",
    ],
  },
]

function SaaSLandingContent({
  sections,
  testimonials,
  businessPackages,
  marketplaceListings,
}: {
  sections: PageSection[]
  testimonials: any[]
  businessPackages: OnboardingPackage[]
  marketplaceListings: MarketplaceListing[]
}) {
  // Find sections by type
  const heroSection = sections.find((s) => s.section_type === "hero")
  const statsSection = sections.find((s) => s.section_type === "stats")
  const featuresSection = sections.find((s) => s.section_type === "features")
  const plansSection = sections.find((s) => s.section_type === "plans")
  const ctaSection = sections.find((s) => s.section_type === "cta")

  // Default fallback data
  const defaultFeatures = [
    {
      icon: Users,
      title: "Member Management",
      description: "Complete KYC verification, member profiles, and automated onboarding workflows.",
    },
    {
      icon: Wallet,
      title: "Contribution Tracking",
      description: "Automated payment collection, contribution history, and financial reporting.",
    },
    {
      icon: TrendingUp,
      title: "Loan Management",
      description: "Flexible loan products, application processing, and repayment tracking.",
    },
    {
      icon: Building2,
      title: "Property Management",
      description: "Property listings, allotment tracking, and maintenance management.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Real-time dashboards, financial reports, and business intelligence.",
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Bank-level security, role-based access, and audit trails.",
    },
  ]

  const features = featuresSection?.content?.items || defaultFeatures

  const plansIntro =
    plansSection?.content?.intro ||
    "SmartHousing offers flexible subscription plans designed to empower real estate developers, realtors, and housing businesses of all sizes to operate efficiently on a powerful multi-vendor platform."

  const useApiPlans = businessPackages.length > 0
  const planCards: PricingPlanDisplay[] = useApiPlans
    ? businessPackages.map(apiPackageToPlan)
    : FALLBACK_PLAN_MARKETING.map(fallbackPlanToDisplay)

  return (
    <React.Fragment>
      <SaaSHeader />

      {/* Hero Section */}
      {heroSection && (
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {heroSection.content?.badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Zap className="h-4 w-4" />
                {heroSection.content.badge}
              </div>
            )}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              {heroSection.title || "Manage Your Housing Cooperative with Confidence"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              {heroSection.subtitle ||
                "All-in-one platform for member management, contributions, loans, and property allocation. Built for cooperatives, by cooperative experts."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/saas/marketplace">Browse Marketplace</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/onboard?vendor_type=landlord">List as Landlord</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/onboard">
                  {heroSection.content?.cta_text || "Start Free Trial"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {heroSection.content?.secondary_cta_text && (
                <Button size="lg" variant="outline" asChild>
                  <Link href={heroSection.content?.secondary_cta_link || "#plans"}>
                    {heroSection.content.secondary_cta_text}
                  </Link>
                </Button>
              )}
            </div>
            {heroSection.content?.benefits && (
              <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground flex-wrap">
                {heroSection.content.benefits.map((benefit: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    {benefit}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Stats Section */}
      {statsSection && statsSection.content?.stats && (
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {statsSection.content.stats.map((stat: { value: string; label: string }, idx: number) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest verified marketplace listings from all tenants */}
      {marketplaceListings.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Marketplace</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Latest properties from verified vendors</h2>
              <p className="text-muted-foreground text-lg">
                Browse houses and land listed by cooperatives and landlords across the platform.
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="shrink-0">
              <Link href="/saas/marketplace">
                View all listings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {marketplaceListings.map((listing) => (
              <MarketplaceListingCard
                key={`${listing.tenant_slug}-${listing.listing_kind}-${listing.id}`}
                listing={listing}
              />
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      {featuresSection && (
        <section id="features" className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {featuresSection.title || "Everything You Need to Succeed"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {featuresSection.subtitle || "Powerful features designed specifically for housing cooperatives and their unique needs."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: any, idx: number) => {
              const Icon = feature.icon ? (() => {
                const iconMap: Record<string, any> = { Users, Wallet, TrendingUp, Building2, BarChart3, Shield }
                return iconMap[feature.icon] || Users
              })() : Users
              return (
                <Card key={feature.title || idx} className="p-6 hover:shadow-lg transition-shadow">
                  {feature.icon && (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Plans Section — central packages from Super Admin → Packages */}
      <section id="plans" className="bg-gradient-to-b from-muted/50 to-background py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              {plansSection?.title || "SmartHousing Subscription Plans"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {plansSection?.subtitle || "Flexible plans for every real estate business"}
            </p>
            <p className="text-muted-foreground text-base mt-4 leading-relaxed">{plansIntro}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Prices in Nigerian Naira (NGN). USD amounts are approximate guides for international buyers.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto items-stretch">
            {planCards.map((plan) => (
              <PricingPlanCard key={plan.id ?? plan.name} plan={plan} />
            ))}
          </div>

          <div className="max-w-4xl mx-auto mt-16 text-center">
            <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Why Choose SmartHousing Subscription?
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              A multi-vendor real estate platform that grows with you from day one to enterprise scale.
            </p>
            <ul className="grid sm:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
              {WHY_CHOOSE_SMART_HOUSING.map((row) => (
                <li
                  key={row.title}
                  className="flex items-start gap-3 rounded-lg border bg-card/50 p-4 shadow-sm"
                >
                  <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium">{row.title}</span>{" "}
                    <span className="text-muted-foreground">{row.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Cooperatives Nationwide</h2>
            <p className="text-muted-foreground text-lg">See what our customers have to say about their experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id || testimonial.name} className="p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">{testimonial.content}</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                    {testimonial.company && ` • ${testimonial.company}`}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      {ctaSection && (
        <section className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              {ctaSection.title || "Ready to Transform Your Cooperative?"}
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 text-balance">
              {ctaSection.subtitle ||
                "Join dozens of cooperatives already using CoopHub to streamline operations and delight their members."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href={ctaSection.content?.cta_link || "/onboard"}>
                  {ctaSection.content?.cta_text || "Start Free Trial"}
                </Link>
              </Button>
              {ctaSection.content?.secondary_cta_text && (
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  asChild
                >
                  <Link href={ctaSection.content?.secondary_cta_link || "#plans"}>
                    {ctaSection.content.secondary_cta_text}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

    </React.Fragment>
  )
}
