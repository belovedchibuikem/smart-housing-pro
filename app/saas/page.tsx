"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building2, Users, Wallet, TrendingUp, Shield, Zap, BarChart3, Check, ArrowRight, Star } from "lucide-react"
import { SaaSHeader } from "@/components/saas/saas-header"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"

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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch page sections and testimonials
    Promise.all([
      apiFetch<{ success: boolean; sections: PageSection[] }>("/public/saas/pages/home").catch(() => ({
        success: false,
        sections: [],
      })),
      apiFetch<{ success: boolean; testimonials: any[] }>("/public/saas/testimonials").catch(() => ({
        success: false,
        testimonials: [],
      })),
    ]).then(([sectionsRes, testimonialsRes]) => {
      if (sectionsRes.success) {
        setSections(sectionsRes.sections)
      }
      if (testimonialsRes.success) {
        setTestimonials(testimonialsRes.testimonials)
      }
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-background relative">
      {/* SaaS Platform Indicator Badge */}
      <div className="absolute top-4 right-4 z-50 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
        SaaS Platform
      </div>
      <SaaSLandingContent sections={sections} testimonials={testimonials} isLoading={isLoading} />
    </div>
  )
}

function SaaSLandingContent({
  sections,
  testimonials,
  isLoading,
}: {
  sections: PageSection[]
  testimonials: any[]
  isLoading: boolean
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

  // Default plans (fallback if not in API)
  const defaultPlans = [
    {
      name: "Starter",
      price: "29.99",
      description: "Perfect for small cooperatives",
      features: [
        "Up to 100 members registration",
        "20 property listings",
        "5 loan plans",
        "3 contribution plans",
        "2 mortgage plans",
        "5GB storage",
        "Email support",
        "Basic reports",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "79.99",
      description: "For growing organizations",
      features: [
        "Up to 500 members registration",
        "100 property listings",
        "20 loan plans",
        "10 contribution plans",
        "10 mortgage plans",
        "25GB storage",
        "Priority support",
        "Advanced analytics",
        "Custom branding",
        "API access",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "199.99",
      description: "Unlimited everything",
      features: [
        "Unlimited members registration",
        "Unlimited property listings",
        "Unlimited loan plans",
        "Unlimited contribution plans",
        "Unlimited mortgage plans",
        "100GB storage",
        "Role management access",
        "24/7 dedicated support",
        "White-label solution",
        "Custom integrations",
        "SLA guarantee",
      ],
      popular: false,
    },
  ]

  const plans = plansSection?.content?.plans || defaultPlans

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

      {/* Plans Section */}
      <section id="plans" className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {plansSection?.title || "Simple, Transparent Plans"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {plansSection?.subtitle || "Choose the plan that fits your cooperative's size and needs."}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan: any) => (
              <Card
                key={plan.name}
                className={`p-8 ${plan.popular ? "border-primary border-2 shadow-lg relative" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">₦{plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                  <Link href="/onboard">Get Started</Link>
                </Button>
              </Card>
            ))}
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
