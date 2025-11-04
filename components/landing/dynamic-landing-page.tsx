"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Building2, Users, Wallet, Home, TrendingUp, Shield, Zap, BarChart3, Smartphone, Award, Handshake, Heart, FileCheck, Star, ArrowRight, Sparkles } from "lucide-react"
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
  template_id?: string
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

interface DynamicLandingPageProps {
  isTenantPage?: boolean
}

interface PlansData {
  loans: any[]
  investments: any[]
}

export function DynamicLandingPage({ isTenantPage = true }: DynamicLandingPageProps) {
  const [pageData, setPageData] = useState<LandingPageData | null>(null)
  const [plansData, setPlansData] = useState<PlansData>({ loans: [], investments: [] })
  const [propertiesData, setPropertiesData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { settings: whiteLabelSettings } = useWhiteLabel()

  useEffect(() => {
    fetchPageData()
    
    // Refresh data every 30 seconds to pick up theme changes
    const interval = setInterval(() => {
      fetchPageData()
    }, 30000)
    
    // Listen for template change events to refresh immediately
    const handleTemplateChange = () => {
      console.log("[Landing Page] Template change detected, refreshing...")
      fetchPageData()
    }
    
    window.addEventListener('landing-page-template-changed', handleTemplateChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('landing-page-template-changed', handleTemplateChange)
    }
  }, [])

  // Apply theme colors and font family reactively
  useEffect(() => {
    if (!pageData && !whiteLabelSettings) {
      console.log("[Landing Page] No page data or white label settings, skipping theme application")
      return
    }
    
    // Get or create style element for theme injection
    // Insert it at the end of head to ensure it overrides default CSS
    let styleElement = document.getElementById('dynamic-theme-styles') as HTMLStyleElement
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'dynamic-theme-styles'
      // Insert at the end of head to ensure it comes after default CSS
      document.head.appendChild(styleElement)
    }
    
    const root = document.documentElement
    
    // Landing page theme takes priority over white label settings for the landing page
    if (pageData?.theme) {
      // Apply landing page theme
      const primaryColor = pageData.theme.primary_color || "#FDB11E"
      const secondaryColor = pageData.theme.secondary_color || "#276254"
      const accentColor = pageData.theme.accent_color || "#10b981"
      const fontFamily = pageData.theme.font_family || "Inter"
      
      console.log("[Landing Page] Applying theme from pageData:", {
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        themeObject: pageData.theme,
      })
      
      // Inject CSS with :root selector in style tag - this will override default CSS due to cascade order
      // Also update related theme variables that Tailwind uses
      styleElement.textContent = `
        :root {
          --primary: ${primaryColor};
          --secondary: ${secondaryColor};
          --accent: ${accentColor};
          --ring: ${primaryColor};
          --chart-1: ${primaryColor};
          --chart-2: ${secondaryColor};
          --sidebar-primary: ${primaryColor};
          --sidebar-ring: ${primaryColor};
          --font-sans: "${fontFamily}", system-ui, -apple-system, sans-serif;
        }
        body {
          font-family: "${fontFamily}", system-ui, -apple-system, sans-serif;
        }
      `
      
      // Also set directly on root for immediate effect (backup)
      root.style.setProperty("--primary", primaryColor)
      root.style.setProperty("--secondary", secondaryColor)
      root.style.setProperty("--accent", accentColor)
      root.style.setProperty("--ring", primaryColor)
      root.style.setProperty("--chart-1", primaryColor)
      root.style.setProperty("--chart-2", secondaryColor)
      root.style.setProperty("--sidebar-primary", primaryColor)
      root.style.setProperty("--sidebar-ring", primaryColor)
      root.style.setProperty("--font-sans", `"${fontFamily}", system-ui, -apple-system, sans-serif`)
      document.body.style.fontFamily = `"${fontFamily}", system-ui, -apple-system, sans-serif`
      
      // Force a repaint to ensure styles are applied
      requestAnimationFrame(() => {
        // Trigger a reflow to ensure CSS updates are applied
        void root.offsetHeight
      })
    } else if (whiteLabelSettings?.is_active) {
      // Fallback to white label theme if landing page theme is not available
      const primaryColor = whiteLabelSettings.primary_color || "#FDB11E"
      const secondaryColor = whiteLabelSettings.secondary_color || "#276254"
      const accentColor = whiteLabelSettings.accent_color || "#10b981"
      const fontFamily = ("font_family" in whiteLabelSettings ? (whiteLabelSettings as any).font_family : undefined) || "Inter"
      
      console.log("[Landing Page] Applying white label theme (fallback):", { primaryColor, secondaryColor, accentColor, fontFamily })
      
      // Inject CSS with :root selector in style tag - this will override default CSS due to cascade order
      // Also update related theme variables that Tailwind uses
      styleElement.textContent = `
        :root {
          --primary: ${primaryColor};
          --secondary: ${secondaryColor};
          --accent: ${accentColor};
          --ring: ${primaryColor};
          --chart-1: ${primaryColor};
          --chart-2: ${secondaryColor};
          --sidebar-primary: ${primaryColor};
          --sidebar-ring: ${primaryColor};
          --font-sans: "${fontFamily}", system-ui, -apple-system, sans-serif;
        }
        body {
          font-family: "${fontFamily}", system-ui, -apple-system, sans-serif;
        }
      `
      
      // Also set directly on root for immediate effect (backup)
      root.style.setProperty("--primary", primaryColor)
      root.style.setProperty("--secondary", secondaryColor)
      root.style.setProperty("--accent", accentColor)
      root.style.setProperty("--ring", primaryColor)
      root.style.setProperty("--chart-1", primaryColor)
      root.style.setProperty("--chart-2", secondaryColor)
      root.style.setProperty("--sidebar-primary", primaryColor)
      root.style.setProperty("--sidebar-ring", primaryColor)
      root.style.setProperty("--font-sans", `"${fontFamily}", system-ui, -apple-system, sans-serif`)
      document.body.style.fontFamily = `"${fontFamily}", system-ui, -apple-system, sans-serif`
    } else {
      console.log("[Landing Page] No theme found in pageData or white label settings:", { pageData, whiteLabelSettings })
      // Remove style element if no theme
      if (styleElement) {
        styleElement.textContent = ''
      }
    }
    
    // Cleanup function
    return () => {
      // Optionally remove style element on unmount, but we'll keep it for persistence
      // if (styleElement) styleElement.remove()
    }
  }, [whiteLabelSettings, pageData])

  const fetchPageData = async () => {
    try {
      // Add cache-busting timestamp to prevent stale data
      const response = await fetch(`/api/landing-page?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      })
      const data = await response.json()
      console.log("[Landing Page] Fetched data:", {
        hasPage: !!data.page,
        theme: data.page?.theme,
        timestamp: new Date().toISOString(),
      })
      
      if (data.page) {
        setPageData(data.page)
        
        // Log theme data for debugging
        if (data.page.theme) {
          console.log("[Landing Page] Theme data:", data.page.theme)
        }
      }
      if (data.plans) {
        setPlansData(data.plans)
      }
      if (data.properties) {
        setPropertiesData(data.properties)
      }
    } catch (error) {
      console.error("[Landing Page] Error fetching landing page:", error)
    } finally {
      setLoading(false)
    }
  }

  const renderSection = (section: PageSection) => {
    if (!section.visible) return null
    const templateId = pageData?.template_id || "default"

    switch (section.type) {
      case "hero":
        return <HeroSection key={section.id} config={section.config} templateId={templateId} />
      case "properties":
        return (
          <div key={section.id} id="properties">
            <PropertyListings properties={propertiesData} config={section.config} />
          </div>
        )
      case "investments":
        return (
          <div key={section.id} id="investments">
            <InvestmentOpportunities plans={plansData.investments} config={section.config} />
          </div>
        )
      case "loans":
        return (
          <div key={section.id} id="loans">
            <LoanOfferings products={plansData.loans} config={section.config} />
          </div>
        )
      case "features":
        return <FeaturesSection key={section.id} config={section.config} templateId={templateId} />
      case "how-it-works":
        return <HowItWorksSection key={section.id} config={section.config} templateId={templateId} />
      case "cta":
        return <CTASection key={section.id} config={section.config} templateId={templateId} />
      case "stats":
        return <StatsSection key={section.id} config={section.config} templateId={templateId} />
      case "testimonials":
        return <TestimonialsSection key={section.id} config={section.config} templateId={templateId} />
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
    <div className="min-h-screen bg-background relative">
      {/* Tenant Page Indicator Badge */}
      {isTenantPage && (
        <div className="absolute top-4 right-4 z-50 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
          Tenant Portal
        </div>
      )}
      <LandingHeader isTenantPage={isTenantPage} />
      {sortedSections.map((section) => renderSection(section))}
      <Footer isTenantPage={isTenantPage} />
    </div>
  )
}

function HeroSection({ config, templateId = "default" }: { config: Record<string, any>; templateId?: string }) {
  if (templateId === "modern") {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-medium mb-6 shadow-lg">
              <Sparkles className="h-4 w-4" />
              Next-Generation Housing Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              {config.title || "Welcome to the Future of Smart Housing"}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
              {config.subtitle || "Experience seamless, technology-driven housing solutions"}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href={config.cta_link || "/register"}>
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  {config.cta_text || "Start Your Journey"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#properties">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-2 backdrop-blur-sm bg-background/50">
                  Explore Properties
                </Button>
              </Link>
            </div>
            {config.show_stats && (
              <div className="grid grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
                <div className="p-6 rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/20 shadow-lg">
                  <div className="text-4xl font-extrabold text-primary mb-2">5,000+</div>
                  <div className="text-sm text-muted-foreground font-medium">Active Members</div>
                </div>
                <div className="p-6 rounded-2xl bg-background/60 backdrop-blur-sm border border-secondary/20 shadow-lg">
                  <div className="text-4xl font-extrabold text-secondary mb-2">₦2.5B</div>
                  <div className="text-sm text-muted-foreground font-medium">Total Contributions</div>
                </div>
                <div className="p-6 rounded-2xl bg-background/60 backdrop-blur-sm border border-accent/20 shadow-lg">
                  <div className="text-4xl font-extrabold text-accent mb-2">1,200+</div>
                  <div className="text-sm text-muted-foreground font-medium">Properties Allocated</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (templateId === "classic") {
    return (
      <section className="relative bg-gradient-to-b from-background to-muted/30 border-b-2 border-primary/20">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <Award className="h-4 w-4" />
              Established Since 2010
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              {config.title || "A Legacy of Trust & Excellence in Housing"}
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto my-6"></div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {config.subtitle || "For over a decade, we've been helping families achieve their dream"}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link href={config.cta_link || "/register"}>
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 font-semibold shadow-md hover:shadow-lg transition-shadow">
                  {config.cta_text || "Join Our Community"}
                </Button>
              </Link>
              <Link href="#properties">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2">
                  View Properties
                </Button>
              </Link>
            </div>
            {config.show_stats && (
              <div className="grid grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto border-t border-border">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'Georgia, serif' }}>5,000+</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">Trusted Members</div>
                </div>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'Georgia, serif' }}>₦2.5B</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">Total Contributions</div>
                </div>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'Georgia, serif' }}>1,200+</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">Properties Delivered</div>
                </div>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-primary mb-2" style={{ fontFamily: 'Georgia, serif' }}>98%</div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wide">Satisfaction Rate</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default template
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

function FeaturesSection({ config, templateId = "default" }: { config: Record<string, any>; templateId?: string }) {
  const features = config.features || []
  const iconMap: Record<string, any> = {
    Zap, Shield, BarChart3, Smartphone, Users, TrendingUp, Home, Building2, Wallet,
    Award, Handshake, Heart, FileCheck
  }

  if (templateId === "modern") {
    return (
      <section id="features" className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-semibold mb-6">
              {config.title || "Why Choose Our Platform"}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {config.title || "Why Choose Our Platform"}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {config.subtitle || "Cutting-edge features that make housing accessible and simple"}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: any, index: number) => {
              const Icon = iconMap[feature.icon] || Shield
              return (
                <Card key={index} className="p-8 space-y-5 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 group relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  if (templateId === "classic") {
    return (
      <section id="features" className="py-20 bg-gradient-to-b from-background to-muted/20 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-5 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              {config.title || "Why Members Trust Us"}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              {config.title || "Why Members Trust Us"}
            </h2>
            <div className="w-20 h-0.5 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {config.subtitle || "Built on a foundation of excellence and member satisfaction"}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: any, index: number) => {
              const Icon = iconMap[feature.icon] || Shield
              return (
                <Card key={index} className="p-8 space-y-5 hover:shadow-xl transition-all duration-300 border-2 border-border/50 hover:border-primary/50 bg-background group">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:border-primary transition-colors">
                      <Icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Default template
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
          {features.length > 0 ? (
            features.map((feature: any, index: number) => {
              const Icon = iconMap[feature.icon] || Shield
              return (
                <Card key={index} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              )
            })
          ) : (
            <>
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
                  Access affordable housing loans with competitive rates. Flexible repayment schedules tailored to your needs.
                </p>
              </Card>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection({ config, templateId = "default" }: { config: Record<string, any>; templateId?: string }) {
  const steps = config.steps || []

  if (templateId === "modern") {
    return (
      <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {config.title || "Your Path to Homeownership"}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {config.subtitle || "Simple steps to achieve your housing goals"}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto relative">
            {steps.map((step: any, index: number) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary via-accent to-transparent transform translate-x-1/2 z-0"></div>
                )}
                <div className="relative z-10 text-center space-y-5 group">
                  <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-extrabold text-white shadow-xl group-hover:scale-110 transition-transform">
                      {step.step || index + 1}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (templateId === "classic") {
    return (
      <section className="py-20 bg-background border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              {config.title || "Your Journey to Homeownership"}
            </h2>
            <div className="w-20 h-0.5 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {config.subtitle || "A proven process trusted by thousands of members"}
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-10 max-w-6xl mx-auto">
            {steps.map((step: any, index: number) => (
              <div key={index} className="text-center space-y-6 relative">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute inset-2 border-2 border-primary rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary" style={{ fontFamily: 'Georgia, serif' }}>
                      {step.step || index + 1}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-border transform translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default template
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{config.title || "How It Works"}</h2>
          <p className="text-muted-foreground text-lg">{config.subtitle || "Four simple steps to start your homeownership journey"}</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {(steps.length > 0 ? steps : [
            { step: 1, title: "Register", description: "Create your account and complete KYC verification" },
            { step: 2, title: "Contribute", description: "Make monthly contributions to build your equity" },
            { step: 3, title: "Apply", description: "Apply for loans or select from available properties" },
            { step: 4, title: "Own", description: "Get your property and start building wealth" },
          ]).map((step: any, index: number) => (
            <div key={index} className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                {step.step || index + 1}
              </div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ config, templateId = "default" }: { config: Record<string, any>; templateId?: string }) {
  if (templateId === "modern") {
    return (
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 text-white leading-tight">
              {config.title || "Ready to Transform Your Housing Journey?"}
            </h2>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white/90 leading-relaxed">
              {config.description || "Join thousands of satisfied members and start building your future today"}
            </p>
            <Link href={config.cta_link || "/register"}>
              <Button size="lg" variant="secondary" className="text-lg px-10 py-7 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 bg-white text-primary hover:bg-white/90">
                {config.cta_text || "Get Started Free"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  if (templateId === "classic") {
    return (
      <section className="bg-gradient-to-b from-primary to-secondary text-primary-foreground py-20 border-t-4 border-accent">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="inline-block px-5 py-2 bg-white/10 border border-white/20 text-white text-sm font-semibold mb-6">
              {config.title || "Begin Your Homeownership Journey Today"}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              {config.title || "Begin Your Homeownership Journey Today"}
            </h2>
            <div className="w-24 h-1 bg-white/30 mx-auto mb-6"></div>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-white/90 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {config.description || "Join a community built on trust, integrity, and proven results. Your dream home awaits."}
            </p>
            <Link href={config.cta_link || "/register"}>
              <Button size="lg" variant="secondary" className="text-base px-10 py-6 shadow-xl hover:shadow-2xl transition-shadow bg-white text-primary hover:bg-white/95 font-semibold">
                {config.cta_text || "Become a Member"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Default template
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

function TestimonialsSection({ config, templateId = "default" }: { config: Record<string, any>; templateId?: string }) {
  const testimonials = config.testimonials || []

  if (templateId === "modern") {
    return (
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-semibold mb-6">
              {config.title || "Success Stories"}
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {config.title || "Success Stories"}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {config.subtitle || "Hear from members who achieved their housing dreams"}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial: any, index: number) => (
              <Card key={index} className="p-8 space-y-6 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 group bg-gradient-to-br from-background to-muted/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-1 text-yellow-400 mb-4">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic text-base leading-relaxed mb-6">"{testimonial.content}"</p>
                  <div className="pt-6 border-t border-border/50">
                    <p className="font-bold text-lg mb-1">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (templateId === "classic") {
    return (
      <section className="py-20 bg-muted/20 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block px-5 py-2 bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
              {config.title || "Member Testimonials"}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              {config.title || "Member Testimonials"}
            </h2>
            <div className="w-20 h-0.5 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {config.subtitle || "Stories of success from our valued members"}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {testimonials.map((testimonial: any, index: number) => (
              <Card key={index} className="p-6 space-y-5 hover:shadow-xl transition-all duration-300 border-2 border-border/50 bg-background group">
                <div className="flex items-center gap-1 text-yellow-500 mb-4">
                  {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground italic text-sm leading-relaxed mb-6" style={{ fontFamily: 'Georgia, serif' }}>
                  "{testimonial.content}"
                </p>
                <div className="pt-6 border-t-2 border-border/50">
                  <p className="font-bold mb-1" style={{ fontFamily: 'Georgia, serif' }}>{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Default template
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {config.title || "What Our Members Say"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {config.subtitle || "Real stories from satisfied members"}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(testimonials.length > 0 ? testimonials : [
            {
              name: "John Doe",
              role: "Member since 2020",
              content: "The best decision I made was joining this cooperative. Professional service and excellent support throughout.",
              rating: 5,
            },
            {
              name: "Jane Smith",
              role: "Member since 2019",
              content: "I've been able to secure my dream home thanks to the flexible loan options and supportive team.",
              rating: 5,
            },
            {
              name: "Michael Brown",
              role: "Member since 2021",
              content: "The investment opportunities have helped me build wealth while contributing to the cooperative's growth.",
              rating: 5,
            },
          ]).map((testimonial: any, index: number) => (
            <Card key={index} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
              <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              <div className="pt-4 border-t">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection({ config, templateId = "default" }: { config: Record<string, any>; templateId?: string }) {
  const stats = config.stats || []
  const iconMap: Record<string, any> = {
    Users, Building2, TrendingUp, Shield, BarChart3, Award
  }

  if (templateId === "modern") {
    return (
      <section className="py-24 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {config.title || "Our Impact in Numbers"}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {config.subtitle || "Real results from real members"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {(stats.length > 0 ? stats : [
              { label: "Active Members", value: "0", icon: "Users" },
              { label: "Properties Available", value: "0", icon: "Building2" },
              { label: "Total Loans Disbursed", value: "₦0", icon: "TrendingUp" },
              { label: "Investment Returns", value: "0%", icon: "BarChart3" },
            ]).map((stat: any, index: number) => {
              const Icon = iconMap[stat.icon] || TrendingUp
              return (
                <Card key={index} className="p-8 text-center hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 group bg-gradient-to-br from-background to-muted/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-4xl md:text-5xl font-extrabold text-primary mb-3 group-hover:scale-105 transition-transform">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  if (templateId === "classic") {
    return (
      <section className="py-20 bg-background border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Georgia, serif' }}>
              {config.title || "Our Commitment by the Numbers"}
            </h2>
            <div className="w-20 h-0.5 bg-primary mx-auto mb-6"></div>
            <p className="text-lg text-muted-foreground leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {config.subtitle || "Measurable results that demonstrate our impact"}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {(stats.length > 0 ? stats : [
              { label: "Trusted Members", value: "0", icon: "Users" },
              { label: "Properties Delivered", value: "0", icon: "Building2" },
              { label: "Loans Disbursed", value: "₦0", icon: "TrendingUp" },
              { label: "Member Satisfaction", value: "98%", icon: "Award" },
            ]).map((stat: any, index: number) => {
              const Icon = iconMap[stat.icon] || TrendingUp
              return (
                <Card key={index} className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-border/50 bg-background group">
                  <div className="h-16 w-16 rounded-lg bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:border-primary transition-colors">
                    <Icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-4" style={{ fontFamily: 'Georgia, serif' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </section>
    )
  }

  // Default template
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {config.title || "Our Impact"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {config.subtitle || "Numbers that matter"}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {(stats.length > 0 ? stats : [
            { label: "Active Members", value: "0", icon: "Users" },
            { label: "Properties Available", value: "0", icon: "Building2" },
            { label: "Total Loans Disbursed", value: "₦0", icon: "TrendingUp" },
            { label: "Member Satisfaction", value: "98%", icon: "Shield" },
          ]).map((stat: any, index: number) => {
            const Icon = iconMap[stat.icon] || TrendingUp
            return (
              <div key={index} className="text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Footer({ isTenantPage = true }: { isTenantPage?: boolean }) {
  const { settings } = useWhiteLabel()

  return (
    <footer className="border-t py-12 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-bold">{settings?.company_name || "FRSC HMS"}</span>
              {isTenantPage && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Tenant</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {"company_description" in (settings || {}) ? (settings as any).company_description : "Empowering FRSC personnel with accessible housing solutions."}
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
                <Link href={("privacy_url" in (settings || {}) ? (settings as any).privacy_url : undefined) || "/privacy"} className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href={("terms_url" in (settings || {}) ? (settings as any).terms_url : undefined) || "/terms"} className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>{"footer_text" in (settings || {}) ? (settings as any).footer_text : "© 2025 FRSC Housing Management System. All rights reserved."}</p>
        </div>
      </div>
    </footer>
  )
}

function DefaultLandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Tenant Page Indicator Badge */}
      <div className="absolute top-4 right-4 z-50 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm">
        Tenant Portal
      </div>
      <LandingHeader isTenantPage={true} />
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
      <Footer isTenantPage={true} />
    </div>
  )
}
