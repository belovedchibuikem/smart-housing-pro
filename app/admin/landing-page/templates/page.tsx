"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

export default function LandingPageTemplatesPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const templates = [
    {
      id: "default",
      name: "Default",
      description: "Original FRSC Housing Management landing page design",
      thumbnail: "/professional-housing-cooperative-website-with-hero.jpg",
      sections: [
        {
          type: "hero",
          name: "Hero Section",
          config: {
            title: "Your Path to Homeownership Made Simple",
            subtitle: "Join the FRSC Housing Cooperative and start your journey to owning your dream home.",
            cta_text: "Become a Member",
            cta_link: "/register",
            show_stats: true,
          },
        },
        {
          type: "properties",
          name: "Properties",
          config: {
            title: "Available Properties",
            subtitle: "Explore our curated selection of properties",
            limit: 6,
          },
        },
        {
          type: "investments",
          name: "Investment Opportunities",
          config: {
            title: "Investment Opportunities",
            subtitle: "Grow your wealth with our investment plans",
            limit: 6,
          },
        },
        {
          type: "loans",
          name: "Loan Products",
          config: {
            title: "Loan Products",
            subtitle: "Flexible loan options for all your needs",
            limit: 6,
          },
        },
        {
          type: "features",
          name: "Features",
          config: {
            title: "Everything You Need",
            subtitle: "Comprehensive tools to manage your housing cooperative membership",
            features: [
              { icon: "Users", title: "Member Management", description: "Complete KYC verification and member profiles" },
              { icon: "Wallet", title: "Contribution Tracking", description: "Automated payment collection and history" },
              { icon: "TrendingUp", title: "Loan Management", description: "Flexible loan products and repayment tracking" },
              { icon: "Building2", title: "Property Management", description: "Property listings and allotment tracking" },
            ],
          },
        },
        {
          type: "how-it-works",
          name: "How It Works",
          config: {
            title: "How It Works",
            subtitle: "Simple steps to get started",
            steps: [
              { step: 1, title: "Register", description: "Create your account and complete KYC" },
              { step: 2, title: "Contribute", description: "Start making regular contributions" },
              { step: 3, title: "Apply", description: "Apply for loans or investments" },
              { step: 4, title: "Benefit", description: "Enjoy housing and financial benefits" },
            ],
          },
        },
        {
          type: "stats",
          name: "Statistics",
          config: {
            title: "Our Impact",
            subtitle: "Numbers that matter",
            stats: [
              { label: "Active Members", value: "0", icon: "Users" },
              { label: "Properties Available", value: "0", icon: "Building2" },
              { label: "Total Loans Disbursed", value: "₦0", icon: "TrendingUp" },
              { label: "Member Satisfaction", value: "98%", icon: "Shield" },
            ],
          },
        },
        {
          type: "cta",
          name: "Call to Action",
          config: {
            title: "Ready to Start Your Homeownership Journey?",
            description: "Join thousands of members who are building their future",
            cta_text: "Register Now",
            cta_link: "/register",
          },
        },
      ],
      theme: {
        primary_color: "#FDB11E",
        secondary_color: "#276254",
        accent_color: "#10b981",
        font_family: "Inter",
      },
    },
    {
      id: "modern",
      name: "Modern",
      description: "Bold, sleek design with gradient accents and contemporary UI patterns",
      thumbnail: "/modern-website-template.png",
      sections: [
        {
          type: "hero",
          name: "Hero Section",
          config: {
            title: "Welcome to the Future of Smart Housing",
            subtitle: "Experience seamless, technology-driven housing solutions designed for modern living. Join thousands who are transforming their housing journey.",
            cta_text: "Start Your Journey",
            cta_link: "/register",
            show_stats: true,
          },
        },
        {
          type: "features",
          name: "Features",
          config: {
            title: "Why Choose Our Platform",
            subtitle: "Cutting-edge features that make housing accessible and simple",
            features: [
              { icon: "Zap", title: "Instant Processing", description: "Real-time updates and lightning-fast transactions" },
              { icon: "Shield", title: "Bank-Level Security", description: "Your data and funds protected with enterprise-grade security" },
              { icon: "BarChart3", title: "Smart Insights", description: "AI-powered analytics to guide your financial decisions" },
              { icon: "Smartphone", title: "Mobile Optimized", description: "Full functionality on any device, anywhere, anytime" },
              { icon: "Users", title: "Community Driven", description: "Join a thriving community of like-minded homeowners" },
              { icon: "TrendingUp", title: "Growth Focused", description: "Build wealth through smart investments and property ownership" },
            ],
          },
        },
        {
          type: "how-it-works",
          name: "How It Works",
          config: {
            title: "Your Path to Homeownership",
            subtitle: "Simple steps to achieve your housing goals",
            steps: [
              { step: 1, title: "Sign Up", description: "Create your account in minutes with simple verification" },
              { step: 2, title: "Explore", description: "Browse properties, loans, and investment opportunities" },
              { step: 3, title: "Contribute", description: "Start building your equity with flexible contribution plans" },
              { step: 4, title: "Achieve", description: "Get approved for loans or invest in your dream property" },
            ],
          },
        },
        {
          type: "properties",
          name: "Properties",
          config: {
            title: "Featured Properties",
            subtitle: "Handpicked properties in prime locations across Nigeria",
            limit: 6,
            data_source: "all_active",
          },
        },
        {
          type: "investments",
          name: "Investment Opportunities",
          config: {
            title: "Grow Your Wealth",
            subtitle: "Diversified investment plans with competitive returns",
            limit: 4,
            data_source: "all_active",
          },
        },
        {
          type: "loans",
          name: "Loan Products",
          config: {
            title: "Flexible Financing",
            subtitle: "Tailored loan products to suit every need and budget",
            limit: 4,
            data_source: "all_active",
          },
        },
        {
          type: "testimonials",
          name: "Testimonials",
          config: {
            title: "Success Stories",
            subtitle: "Hear from members who achieved their housing dreams",
            testimonials: [
              { name: "Adebayo Johnson", role: "Property Owner", content: "This platform made my dream of owning a home a reality. The process was smooth and transparent.", rating: 5 },
              { name: "Chinwe Okafor", role: "Member since 2021", content: "Excellent service and support. I've never experienced anything like this before.", rating: 5 },
              { name: "Emeka Nwosu", role: "Investor", content: "The investment opportunities here have helped me build substantial wealth. Highly recommended!", rating: 5 },
            ],
          },
        },
        {
          type: "stats",
          name: "Statistics",
          config: {
            title: "Our Impact in Numbers",
            subtitle: "Real results from real members",
            stats: [
              { label: "Active Members", value: "0", icon: "Users" },
              { label: "Properties Available", value: "0", icon: "Building2" },
              { label: "Total Loans Disbursed", value: "₦0", icon: "TrendingUp" },
              { label: "Investment Returns", value: "0%", icon: "BarChart3" },
            ],
          },
        },
        {
          type: "cta",
          name: "Call to Action",
          config: {
            title: "Ready to Transform Your Housing Journey?",
            description: "Join thousands of satisfied members and start building your future today",
            cta_text: "Get Started Free",
            cta_link: "/register",
          },
        },
      ],
      theme: {
        primary_color: "#6366f1",
        secondary_color: "#8b5cf6",
        accent_color: "#ec4899",
        font_family: "Inter",
      },
    },
    {
      id: "classic",
      name: "Classic",
      description: "Elegant, timeless design with refined typography and professional aesthetics",
      thumbnail: "/classic-website-template.png",
      sections: [
        {
          type: "hero",
          name: "Hero Section",
          config: {
            title: "A Legacy of Trust & Excellence in Housing",
            subtitle: "For over a decade, we've been helping families achieve their dream of homeownership through integrity, transparency, and unwavering commitment to our members' success.",
            cta_text: "Join Our Community",
            cta_link: "/register",
            show_stats: true,
          },
        },
        {
          type: "features",
          name: "Features",
          config: {
            title: "Why Members Trust Us",
            subtitle: "Built on a foundation of excellence and member satisfaction",
            features: [
              { icon: "Award", title: "Proven Track Record", description: "Decades of successful operations and member satisfaction" },
              { icon: "Shield", title: "Financial Security", description: "Regulated and audited operations ensuring member funds safety" },
              { icon: "Handshake", title: "Member-Centric", description: "Every decision made with our members' best interests at heart" },
              { icon: "TrendingUp", title: "Sustainable Growth", description: "Building long-term wealth through strategic investments" },
              { icon: "Heart", title: "Community Values", description: "Fostering relationships and supporting member aspirations" },
              { icon: "FileCheck", title: "Transparency", description: "Clear processes and open communication at every step" },
            ],
          },
        },
        {
          type: "how-it-works",
          name: "How It Works",
          config: {
            title: "Your Journey to Homeownership",
            subtitle: "A proven process trusted by thousands of members",
            steps: [
              { step: 1, title: "Registration", description: "Complete your membership registration and verification" },
              { step: 2, title: "Contribution", description: "Start your monthly contributions to build equity" },
              { step: 3, title: "Application", description: "Apply for loans or express interest in properties" },
              { step: 4, title: "Ownership", description: "Receive your property allocation and begin your journey" },
            ],
          },
        },
        {
          type: "properties",
          name: "Properties",
          config: {
            title: "Premium Property Collection",
            subtitle: "Exclusive properties in prime locations, carefully curated for our members",
            limit: 6,
            data_source: "all_active",
          },
        },
        {
          type: "investments",
          name: "Investment Opportunities",
          config: {
            title: "Wealth Building Solutions",
            subtitle: "Conservative investment plans with guaranteed returns",
            limit: 3,
            data_source: "all_active",
          },
        },
        {
          type: "loans",
          name: "Loan Products",
          config: {
            title: "Affordable Financing Options",
            subtitle: "Competitive interest rates and flexible repayment terms",
            limit: 4,
            data_source: "all_active",
          },
        },
        {
          type: "testimonials",
          name: "Testimonials",
          config: {
            title: "Member Testimonials",
            subtitle: "Stories of success from our valued members",
            testimonials: [
              { name: "Oluwaseun Adeyemi", role: "Member since 2018", content: "The cooperative has been instrumental in helping me secure my first home. Their professionalism and support throughout the process was exceptional.", rating: 5 },
              { name: "Ngozi Okafor", role: "Property Owner", content: "I've been a member for five years and the returns on my investments have been outstanding. Highly trustworthy organization.", rating: 5 },
              { name: "Ibrahim Mohammed", role: "Member since 2019", content: "The loan facility helped me expand my business. Simple application process and quick approval. Highly recommended!", rating: 5 },
              { name: "Amina Hassan", role: "Member since 2020", content: "What I love most is the transparency. Every transaction is clear, and the customer service is always helpful and responsive.", rating: 5 },
            ],
          },
        },
        {
          type: "stats",
          name: "Statistics",
          config: {
            title: "Our Commitment by the Numbers",
            subtitle: "Measurable results that demonstrate our impact",
            stats: [
              { label: "Trusted Members", value: "0", icon: "Users" },
              { label: "Properties Delivered", value: "0", icon: "Building2" },
              { label: "Loans Disbursed", value: "₦0", icon: "TrendingUp" },
              { label: "Member Satisfaction", value: "98%", icon: "Award" },
            ],
          },
        },
        {
          type: "cta",
          name: "Call to Action",
          config: {
            title: "Begin Your Homeownership Journey Today",
            description: "Join a community built on trust, integrity, and proven results. Your dream home awaits.",
            cta_text: "Become a Member",
            cta_link: "/register",
          },
        },
      ],
      theme: {
        primary_color: "#1e3a8a",
        secondary_color: "#1e40af",
        accent_color: "#b91c1c",
        font_family: "Georgia",
      },
    },
  ]

  // Fetch current template on page load
  useEffect(() => {
    const fetchCurrentTemplate = async () => {
      try {
        const data = await apiFetch<{ success: boolean; data?: { template_id?: string } }>("/admin/landing-page", {
          method: "GET",
        })

        if (data.success && data.data?.template_id) {
          setCurrentTemplate(data.data.template_id)
        } else {
          // Default to "default" if no template is set
          setCurrentTemplate("default")
        }
      } catch (error) {
        console.error("[Landing Page Templates] Error fetching current template:", error)
        // Default to "default" on error
        setCurrentTemplate("default")
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentTemplate()
  }, [])

  const applyTemplate = async () => {
    if (!selectedTemplate) return

    setApplying(true)
    try {
      const template = templates.find((t) => t.id === selectedTemplate)
      if (!template) return

      // Create sections based on template
      const sections = template.sections.map((section, index) => ({
        id: `${section.type}-${Date.now()}-${index}`,
        type: section.type,
        name: section.name,
        visible: true,
        position: index,
        config: section.config || {},
      }))

      const data = await apiFetch<{ success: boolean; message?: string; data?: any }>("/admin/landing-page", {
        method: "POST",
        body: {
          template_id: template.id,
          sections,
          theme: template.theme,
          seo: {
            title: "FRSC Housing Management System",
            description: "Your trusted partner in housing solutions",
            keywords: "housing, cooperative, FRSC, properties, investments, loans",
          },
          is_published: false,
        },
      })

      if (data.success) {
        // Update current template state
        setCurrentTemplate(template.id)
        
        sonnerToast.success("Template applied successfully!", {
          description: "You can now customize it in the page builder.",
          duration: 5000,
        })
        
        // Dispatch event to trigger immediate refresh in preview
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('landing-page-template-changed', {
            detail: { template_id: template.id }
          }))
        }
        
        router.push("/admin/landing-page")
      }
    } catch (error) {
      console.error("[Landing Page Templates] Error applying template:", error)
      sonnerToast.error("Failed to apply template", {
        description: "Please try again or contact support if the issue persists.",
        duration: 5000,
      })
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Choose a Template</h1>
        <p className="text-muted-foreground mt-1">Select a template to start building your landing page</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const isCurrentTemplate = currentTemplate === template.id
          const isSelected = selectedTemplate === template.id
          
          return (
            <Card
              key={template.id}
              className={`overflow-hidden cursor-pointer transition-all relative ${
                isSelected ? "ring-2 ring-primary" : isCurrentTemplate ? "ring-2 ring-green-500" : "hover:shadow-lg"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              {/* Current Template Badge */}
              {isCurrentTemplate && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Currently Active
                  </Badge>
                </div>
              )}
              
              <div className="relative">
                <img
                  src={template.thumbnail || "/placeholder.svg"}
                  alt={template.name}
                  className="w-full h-48 object-cover"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                {isCurrentTemplate && !isSelected && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  {isCurrentTemplate && (
                    <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.sections.map((section, idx) => (
                    <span key={`${template.id}-${section.type}-${idx}`} className="text-xs bg-muted px-2 py-1 rounded">
                      {section.type}
                    </span>
                  ))}
                </div>
                <Button className="w-full mt-4" variant={isSelected ? "default" : isCurrentTemplate ? "secondary" : "outline"}>
                  {isSelected ? "Selected" : isCurrentTemplate ? "Currently Active" : "Select"}
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      {selectedTemplate && (
        <div className="mt-6 flex justify-end">
          <Button size="lg" onClick={applyTemplate} disabled={applying}>
            {applying ? "Applying..." : "Continue with Selected Template"}
          </Button>
        </div>
      )}
    </div>
  )
}
