"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building2, Users, Wallet, Home, TrendingUp, Shield } from "lucide-react"
import { PropertyListings } from "@/components/landing/property-listings"
import { InvestmentOpportunities } from "@/components/landing/investment-opportunities"
import { LoanOfferings } from "@/components/landing/loan-offerings"
import { LandingHeader } from "@/components/landing/landing-header"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"

interface PageSection {
  id: string
  type: "hero" | "features" | "testimonials" | "cta" | "properties" | "investments" | "loans" | "stats" | "how-it-works"
  name: string
  visible: boolean
  position: number
  config: Record<string, any>
}

interface LandingPageData {
  is_published: boolean
  sections: PageSection[]
  theme: {
    primary_color: string
    secondary_color: string
    accent_color: string
    font_family: string
  }
  seo: {
    title: string
    description: string
    keywords: string
  }
}

export function DynamicLandingPage() {
  const [pageData, setPageData] = useState<LandingPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const { settings: whiteLabelSettings } = useWhiteLabel()

  useEffect(() => {
    fetchPageData()
  }, [])

  useEffect(() => {
    if (whiteLabelSettings?.is_active) {
      document.documentElement.style.setProperty("--primary", whiteLabelSettings.primary_color)
      document.documentElement.style.setProperty("--secondary", whiteLabelSettings.secondary_color)
      document.documentElement.style.setProperty("--accent", whiteLabelSettings.accent_color)
    } else if (pageData?.theme) {
      document.documentElement.style.setProperty("--primary", pageData.theme.primary_color)
      document.documentElement.style.setProperty("--secondary", pageData.theme.secondary_color)
      document.documentElement.style.setProperty("--accent", pageData.theme.accent_color)
    }
  }, [whiteLabelSettings, pageData])

  const fetchPageData = async () => {
    try {
      const response = await fetch("/api/landing-page")
      const data = await response.json()
      if (data.page) {
        setPageData(data.page)
      }
    } catch (error) {
      console.error("[v0] Error fetching landing page:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderSection = (section: PageSection) => {
    if (!section.visible) return null

    switch (section.type) {
      case "hero":
        return <HeroSection key={section.id} config={section.config} />
      case "properties":
        return (
          <div key={section.id} id="properties">
            <PropertyListings />
          </div>
        )
      case "investments":
        return (
          <div key={section.id} id="investments">
            <InvestmentOpportunities />
          </div>
        )
      case "loans":
        return (
          <div key={section.id} id="loans">
            <LoanOfferings />
          </div>
        )
      case "features":
        return <FeaturesSection key={section.id} config={section.config} />
      case "how-it-works":
        return <HowItWorksSection key={section.id} config={section.config} />
      case "cta":
        return <CTASection key={section.id} config={section.config} />
      case "stats":
        return <StatsSection key={section.id} config={section.config} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!pageData || !pageData.is_published) {
    // Fallback to default landing page if not published
    return <DefaultLandingPage />
  }

  const sortedSections = [...pageData.sections].sort((a, b) => a.position - b.position)

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      {sortedSections.map((section) => renderSection(section))}
      <Footer />
    </div>
  )
}

function HeroSection({ config }: { config: Record<string, any> }) {
  return (
    <section className="container mx-auto px-4 py-20 md:py-32">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Shield className="h-4 w-4" />
          Trusted by FRSC Personnel
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
          {config.title || "Your Path to Homeownership Made Simple"}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
          {config.subtitle || "Join the FRSC Housing Cooperative"}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href={config.cta_link || "/register"}>
            <Button size="lg" className="w-full sm:w-auto">
              {config.cta_text || "Get Started"}
            </Button>
          </Link>
          <Link href="#properties">
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
              Browse Properties
            </Button>
          </Link>
        </div>
        {config.show_stats && (
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">₦2.5B</div>
              <div className="text-sm text-muted-foreground">Total Contributions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">1,200+</div>
              <div className="text-sm text-muted-foreground">Properties Allocated</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function FeaturesSection({ config }: { config: Record<string, any> }) {
  return (
    <section id="features" className="bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{config.title || "Everything You Need"}</h2>
          <p className="text-muted-foreground text-lg">
            {config.subtitle || "Comprehensive tools to manage your housing cooperative membership"}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Membership Management</h3>
            <p className="text-muted-foreground">
              Easy registration with KYC verification. Track your membership status and benefits in real-time.
            </p>
          </Card>
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Digital Wallet</h3>
            <p className="text-muted-foreground">
              Automated monthly contributions with flexible payment options. View your balance and transaction history.
            </p>
          </Card>
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Loan & Mortgage</h3>
            <p className="text-muted-foreground">
              Access affordable housing loans with competitive rates. Flexible repayment schedules tailored to your
              needs.
            </p>
          </Card>
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Property Listings</h3>
            <p className="text-muted-foreground">
              Browse available properties across Nigeria. Filter by location, price, and property type.
            </p>
          </Card>
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Investment Tracking</h3>
            <p className="text-muted-foreground">
              Monitor your property investments and equity growth. Real-time updates on property value appreciation.
            </p>
          </Card>
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Secure & Transparent</h3>
            <p className="text-muted-foreground">
              Bank-level security with complete transparency. All transactions are auditable and compliant.
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection({ config }: { config: Record<string, any> }) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Four simple steps to start your homeownership journey</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
              1
            </div>
            <h3 className="font-semibold text-lg">Register</h3>
            <p className="text-sm text-muted-foreground">Create your account and complete KYC verification</p>
          </div>
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
              2
            </div>
            <h3 className="font-semibold text-lg">Contribute</h3>
            <p className="text-sm text-muted-foreground">Make monthly contributions to build your equity</p>
          </div>
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
              3
            </div>
            <h3 className="font-semibold text-lg">Apply</h3>
            <p className="text-sm text-muted-foreground">Apply for loans or select from available properties</p>
          </div>
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
              4
            </div>
            <h3 className="font-semibold text-lg">Own</h3>
            <p className="text-sm text-muted-foreground">Get your property and start building wealth</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection({ config }: { config: Record<string, any> }) {
  return (
    <section className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
          {config.title || "Ready to Start Your Homeownership Journey?"}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 text-balance">
          {config.description || "Join thousands of FRSC personnel building their future"}
        </p>
        <Link href={config.cta_link || "/register"}>
          <Button size="lg" variant="secondary">
            {config.cta_text || "Register Now"}
          </Button>
        </Link>
      </div>
    </section>
  )
}

function StatsSection({ config }: { config: Record<string, any> }) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">₦2.5B</div>
            <div className="text-sm text-muted-foreground">Total Contributions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
            <div className="text-sm text-muted-foreground">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Satisfaction</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const { settings } = useWhiteLabel()

  return (
    <footer className="border-t py-12 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold">{settings?.company_name || "FRSC HMS"}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {settings?.company_description || "Empowering FRSC personnel with accessible housing solutions."}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#properties" className="hover:text-primary transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="#investments" className="hover:text-primary transition-colors">
                  Investments
                </Link>
              </li>
              <li>
                <Link href="#loans" className="hover:text-primary transition-colors">
                  Loans
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href={settings?.privacy_url || "/privacy"} className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={settings?.terms_url || "/terms"} className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>{settings?.footer_text || "© 2025 FRSC Housing Management System. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  )
}

function DefaultLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection
        config={{
          title: "Your Path to Homeownership Made Simple",
          subtitle:
            "Join the FRSC Housing Cooperative. Save systematically, access affordable loans, and invest in quality properties.",
          cta_text: "Become a Member",
          cta_link: "/register",
          show_stats: true,
        }}
      />
      <div id="properties">
        <PropertyListings />
      </div>
      <div id="investments">
        <InvestmentOpportunities />
      </div>
      <div id="loans">
        <LoanOfferings />
      </div>
      <FeaturesSection
        config={{
          title: "Everything You Need",
          subtitle: "Comprehensive tools to manage your housing cooperative membership",
        }}
      />
      <HowItWorksSection config={{}} />
      <CTASection
        config={{
          title: "Ready to Start Your Homeownership Journey?",
          description: "Join thousands of FRSC personnel who are building their future",
          cta_text: "Register Now",
          cta_link: "/register",
        }}
      />
      <Footer />
    </div>
  )
}
