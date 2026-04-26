"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building2, Users, Wallet, TrendingUp, Shield, Zap, BarChart3, Check, ArrowRight, Star, Sparkles } from "lucide-react"
import { SaaSHeader } from "@/components/saas/saas-header"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"

/** Central business subscription package (from GET /onboarding/packages) */
interface OnboardingPackage {
  id: string
  name: string
  slug: string
  description: string | null
  price: string | number
  billing_cycle: string
  is_featured: boolean
  display_features?: string[]
  tagline?: string | null
  usd_hint?: string | null
  custom_pricing?: boolean
  limits?: Record<string, any>
}

function billingPeriodSuffix(cycle: string | undefined): string {
  if (!cycle) return "/ Year"
  if (cycle === "yearly" || cycle === "year") return "/ Year"
  if (cycle === "monthly") return "/ month"
  if (cycle === "quarterly") return "/ quarter"
  if (cycle === "weekly") return "/ week"
  return ` / ${cycle}`
}

function planFeaturesFromApi(pkg: OnboardingPackage): string[] {
  if (Array.isArray(pkg.display_features) && pkg.display_features.length) {
    return pkg.display_features
  }
  const fromLimits = pkg.limits?.display_features
  if (Array.isArray(fromLimits) && fromLimits.length) {
    return fromLimits
  }
  return []
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
    ]).then(([sectionsRes, testimonialsRes, packagesRes]) => {
      if (sectionsRes.success) {
        setSections(sectionsRes.sections)
      }
      if (testimonialsRes.success) {
        setTestimonials(testimonialsRes.testimonials)
      }
      if (packagesRes.success && Array.isArray(packagesRes.packages)) {
        setBusinessPackages(packagesRes.packages)
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      {/* SaaS Platform Indicator Badge */}
      <div className="absolute top-4 right-4 z-50 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
        SaaS Platform
      </div>
      <SaaSLandingContent sections={sections} testimonials={testimonials} businessPackages={businessPackages} />
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
}: {
  sections: PageSection[]
  testimonials: any[]
  businessPackages: OnboardingPackage[]
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

      {/* Plans Section — same central packages as business subscription (packages table) */}
      <section id="plans" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {plansSection?.title || "SmartHousing Subscription Plans"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {plansSection?.subtitle || "Flexible Plans for Every Real Estate Business"}
            </p>
            <p className="text-muted-foreground text-base mt-4 leading-relaxed">{plansIntro}</p>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {useApiPlans
              ? businessPackages.map((pkg) => {
                  const isContact = Boolean(pkg.custom_pricing ?? pkg.limits?.custom_pricing)
                  const featured = Boolean(pkg.is_featured)
                  const tagline = String(pkg.tagline || pkg.limits?.tagline || "")
                  const showTag = tagline && tagline !== "Most Popular"
                  const usd = pkg.usd_hint || pkg.limits?.usd_hint
                  const featList = planFeaturesFromApi(pkg)
                  return (
                    <Card
                      key={pkg.id}
                      className={`p-6 flex flex-col h-full ${
                        featured ? "border-primary border-2 shadow-lg relative" : ""
                      }`}
                    >
                      {featured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </div>
                      )}
                      <div className="text-center mb-5 min-h-[5.5rem]">
                        <h3 className="text-xl font-bold">
                          {pkg.name} Plan{showTag ? ` (${tagline})` : ""}
                        </h3>
                        {pkg.description && (
                          <p className="text-muted-foreground text-sm mt-2 text-left sm:text-center">{pkg.description}</p>
                        )}
                        <div className="mt-4 flex flex-col items-center">
                          {isContact ? (
                            <span className="text-2xl sm:text-3xl font-bold">Custom pricing</span>
                          ) : (
                            <div className="flex items-baseline justify-center gap-1 flex-wrap">
                              <span className="text-2xl sm:text-3xl font-bold">
                                ₦{Number(pkg.price).toLocaleString()}
                              </span>
                              <span className="text-muted-foreground text-sm">
                                {billingPeriodSuffix(pkg.billing_cycle)}
                              </span>
                            </div>
                          )}
                          {usd && !isContact && (
                            <span className="text-xs text-muted-foreground mt-1">({String(usd)})</span>
                          )}
                        </div>
                      </div>
                      {featList.length > 0 && (
                        <ul className="space-y-2.5 mb-6 flex-1 text-left">
                          {featList.map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {isContact ? (
                        <Button className="w-full mt-auto" variant="outline" asChild>
                          <Link href="/saas/contact">Contact us</Link>
                        </Button>
                      ) : (
                        <Button className="w-full mt-auto" variant={featured ? "default" : "outline"} asChild>
                          <Link href="/onboard">Get started</Link>
                        </Button>
                      )}
                    </Card>
                  )
                })
              : FALLBACK_PLAN_MARKETING.map((plan) => {
                  const isContact = plan.customPricing
                  const featured = plan.is_featured
                  return (
                    <Card
                      key={plan.name}
                      className={`p-6 flex flex-col h-full ${
                        featured ? "border-primary border-2 shadow-lg relative" : ""
                      }`}
                    >
                      {featured && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                          Most Popular
                        </div>
                      )}
                      <div className="text-center mb-5 min-h-[5.5rem]">
                        <h3 className="text-xl font-bold">
                          {plan.name} Plan {plan.tagline && plan.tagline !== "Most Popular" ? `(${plan.tagline})` : ""}
                        </h3>
                        {plan.tagline === "Most Popular" && !featured && null}
                        <p className="text-muted-foreground text-sm mt-2 text-left sm:text-center">{plan.description}</p>
                        <div className="mt-4 flex flex-col items-center">
                          {isContact ? (
                            <span className="text-2xl sm:text-3xl font-bold">Custom pricing</span>
                          ) : (
                            <div className="flex items-baseline justify-center gap-1 flex-wrap">
                              <span className="text-2xl sm:text-3xl font-bold">₦{plan.priceLabel}</span>
                              <span className="text-muted-foreground text-sm">{plan.period}</span>
                            </div>
                          )}
                          {plan.usdHint && !isContact && (
                            <span className="text-xs text-muted-foreground mt-1">({plan.usdHint})</span>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-2.5 mb-6 flex-1 text-left">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                      {isContact ? (
                        <Button className="w-full mt-auto" variant="outline" asChild>
                          <Link href="/saas/contact">Contact us</Link>
                        </Button>
                      ) : (
                        <Button className="w-full mt-auto" variant={featured ? "default" : "outline"} asChild>
                          <Link href="/onboard">Get started</Link>
                        </Button>
                      )}
                    </Card>
                  )
                })}
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

      {/* Footer */}
      <footer className="border-t py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold">
                <Building2 className="h-6 w-6 text-primary" />
                <span>CoopHub</span>
              </div>
              <p className="text-sm text-muted-foreground">The complete platform for housing cooperative management.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#plans" className="hover:text-primary transition-colors">
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
            <p>&copy; 2025 CoopHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </React.Fragment>
  )
}
