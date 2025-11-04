"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Settings, Layout, Palette, Save, Globe, Plus, GripVertical, Trash2, Edit, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"
import { useTenant } from "@/lib/tenant/tenant-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PageSection {
  id: string
  type: "hero" | "features" | "testimonials" | "cta" | "properties" | "investments" | "loans" | "stats" | "how-it-works"
  name: string
  visible: boolean
  position: number
  config: Record<string, any>
}

interface LandingPageData {
  id?: string
  template_id?: string
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

const SECTION_TYPES = [
  { value: "hero", label: "Hero Section", icon: "🎯" },
  { value: "features", label: "Features", icon: "⭐" },
  { value: "properties", label: "Properties", icon: "🏠" },
  { value: "investments", label: "Investments", icon: "📈" },
  { value: "loans", label: "Loans", icon: "💰" },
  { value: "stats", label: "Statistics", icon: "📊" },
  { value: "testimonials", label: "Testimonials", icon: "💬" },
  { value: "how-it-works", label: "How It Works", icon: "🔄" },
  { value: "cta", label: "Call to Action", icon: "📢" },
]

export default function LandingPageBuilderPage() {
  const { tenant } = useTenant()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageData, setPageData] = useState<LandingPageData>({
    template_id: "default",
    is_published: false,
    sections: [],
    theme: {
      primary_color: "#FDB11E",
      secondary_color: "#276254",
      accent_color: "#10b981",
      font_family: "Inter",
    },
    seo: {
      title: "FRSC Housing Management System",
      description: "Your trusted partner in housing solutions",
      keywords: "housing, cooperative, FRSC, properties, loans",
    },
  })
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [availableItems, setAvailableItems] = useState<{
    loans: Array<{ id: string; name: string; description?: string }>
    investments: Array<{ id: string; name: string; description?: string }>
    properties: Array<{ id: string; name: string; type?: string; location?: string; price?: number }>
  } | null>(null)
  const [loadingItems, setLoadingItems] = useState(false)
  const router = useRouter()

  // Get preview URL based on tenant context
  const getPreviewUrl = (): string => {
    if (typeof window === 'undefined') return '/'
    
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    const port = window.location.port ? `:${window.location.port}` : ''
    
    // Check if we're in development mode
    const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1'
    
    // Get tenant slug from tenant context or URL
    let tenantSlug: string | null = null
    
    if (tenant?.slug) {
      tenantSlug = tenant.slug
    } else {
      // Try to extract from current URL
      const currentHost = window.location.host
      const parts = currentHost.split('.')
      
      // Check if it's a subdomain (e.g., tenant1.localhost:3000)
      if (isDevelopment && parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== '127') {
        tenantSlug = parts[0]
      } else if (!isDevelopment && parts.length > 2) {
        // Production: tenant.platform.com
        tenantSlug = parts[0]
      }
      
      // Check for tenant query param in development
      if (!tenantSlug && isDevelopment) {
        const urlParams = new URLSearchParams(window.location.search)
        tenantSlug = urlParams.get('tenant')
      }
    }
    
    // Construct preview URL
    if (tenantSlug && isDevelopment) {
      // Development: tenant1.localhost:3000 or localhost:3000?tenant=tenant1
      return `${protocol}//${tenantSlug}.localhost${port}/`
    } else if (tenantSlug && !isDevelopment) {
      // Production: tenant.platform.com
      const domainParts = hostname.split('.')
      const baseDomain = domainParts.slice(-2).join('.') // Get platform.com
      return `${protocol}//${tenantSlug}.${baseDomain}${port}/`
    } else if (tenant?.custom_domain) {
      // Use custom domain if available
      return `${protocol}//${tenant.custom_domain}${port}/`
    }
    
    // Fallback to root
    return '/'
  }

  // Template definitions (same as templates page)
  const templates = [
    {
      id: "default",
      name: "Default",
      description: "Original FRSC Housing Management landing page design",
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
      description: "Clean and modern design with bold typography and vibrant colors",
      sections: [
        {
          type: "hero",
          name: "Hero Section",
          config: {
            title: "Transform Your Future with Smart Housing Solutions",
            subtitle: "Experience the future of cooperative housing with cutting-edge technology and seamless member services.",
            cta_text: "Get Started Today",
            cta_link: "/register",
            show_stats: false,
          },
        },
        {
          type: "features",
          name: "Features",
          config: {
            title: "Powerful Features for Modern Living",
            subtitle: "Everything you need in one comprehensive platform",
            features: [
              { icon: "Zap", title: "Lightning Fast", description: "Instant processing and real-time updates" },
              { icon: "Shield", title: "Secure & Safe", description: "Bank-level security for all transactions" },
              { icon: "BarChart3", title: "Smart Analytics", description: "Data-driven insights for better decisions" },
              { icon: "Smartphone", title: "Mobile First", description: "Access everything from your mobile device" },
            ],
          },
        },
        {
          type: "properties",
          name: "Properties",
          config: {
            title: "Premium Properties",
            subtitle: "Discover your next home from our premium collection",
            limit: 4,
          },
        },
        {
          type: "investments",
          name: "Investment Opportunities",
          config: {
            title: "Smart Investment Plans",
            subtitle: "Maximize returns with our curated investment opportunities",
            limit: 3,
          },
        },
        {
          type: "stats",
          name: "Statistics",
          config: {
            title: "By The Numbers",
            subtitle: "See what we've achieved together",
            stats: [
              { label: "Happy Members", value: "0", icon: "Users" },
              { label: "Properties Listed", value: "0", icon: "Building2" },
              { label: "Loans Approved", value: "₦0", icon: "TrendingUp" },
              { label: "Investment Returns", value: "0%", icon: "BarChart3" },
            ],
          },
        },
        {
          type: "cta",
          name: "Call to Action",
          config: {
            title: "Ready to Join the Future of Housing?",
            description: "Start your journey today and experience the difference",
            cta_text: "Sign Up Now",
            cta_link: "/register",
          },
        },
      ],
      theme: {
        primary_color: "#3b82f6",
        secondary_color: "#1e40af",
        accent_color: "#f59e0b",
        font_family: "Poppins",
      },
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional professional layout with elegant styling",
      sections: [
        {
          type: "hero",
          name: "Hero Section",
          config: {
            title: "Building Trust, One Home at a Time",
            subtitle: "Join Nigeria's most trusted housing cooperative. Decades of experience serving our members with integrity and excellence.",
            cta_text: "Become a Member",
            cta_link: "/register",
            show_stats: true,
          },
        },
        {
          type: "features",
          name: "Features",
          config: {
            title: "Why Choose Us",
            subtitle: "Proven track record of excellence and member satisfaction",
            features: [
              { icon: "Award", title: "Established Excellence", description: "Years of trusted service and proven results" },
              { icon: "Handshake", title: "Member-Focused", description: "Your success is our priority" },
              { icon: "TrendingUp", title: "Growing Together", description: "Building wealth and communities" },
              { icon: "Heart", title: "Trusted Partnership", description: "Reliable and transparent operations" },
            ],
          },
        },
        {
          type: "properties",
          name: "Properties",
          config: {
            title: "Featured Properties",
            subtitle: "Carefully selected properties in prime locations",
            limit: 6,
          },
        },
        {
          type: "loans",
          name: "Loan Products",
          config: {
            title: "Flexible Financing Solutions",
            subtitle: "Competitive rates and flexible terms for all your needs",
            limit: 4,
          },
        },
        {
          type: "testimonials",
          name: "Testimonials",
          config: {
            title: "What Our Members Say",
            subtitle: "Real stories from satisfied members",
            testimonials: [
              { name: "John Doe", role: "Member since 2020", content: "The best decision I made was joining this cooperative.", rating: 5 },
              { name: "Jane Smith", role: "Member since 2019", content: "Professional service and excellent support throughout.", rating: 5 },
            ],
          },
        },
        {
          type: "cta",
          name: "Call to Action",
          config: {
            title: "Join Our Growing Community",
            description: "Become part of a legacy of trust and excellence",
            cta_text: "Register Today",
            cta_link: "/register",
          },
        },
      ],
      theme: {
        primary_color: "#1f2937",
        secondary_color: "#374151",
        accent_color: "#dc2626",
        font_family: "Georgia",
      },
    },
  ]

  useEffect(() => {
    fetchPageData()
    fetchAvailableItems()
  }, [])

  const fetchAvailableItems = async () => {
    setLoadingItems(true)
    try {
      const data = await apiFetch<{
        loans: Array<{ id: string; name: string; description?: string }>
        investments: Array<{ id: string; name: string; description?: string }>
        properties: Array<{ id: string; name: string; type?: string; location?: string; price?: number }>
      }>("/admin/landing-page/available-items")
      setAvailableItems(data)
    } catch (error) {
      console.error("[v0] Error fetching available items:", error)
    } finally {
      setLoadingItems(false)
    }
  }

  const fetchPageData = async () => {
    try {
      const data = await apiFetch<{ page: LandingPageData }>("/admin/landing-page")
      if (data.page) {
        setPageData(data.page)
      }
    } catch (error) {
      console.error("[v0] Error fetching landing page data:", error)
      sonnerToast.error("Failed to load landing page data")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    console.log("[Landing Page] Save button clicked")
    setSaving(true)
    
    try {
      // Ensure theme has all required fields with defaults
      const theme = {
        primary_color: pageData.theme.primary_color || "#FDB11E",
        secondary_color: pageData.theme.secondary_color || "#276254",
        accent_color: pageData.theme.accent_color || "#10b981",
        font_family: pageData.theme.font_family || "Inter",
      }

      const payload = {
        template_id: pageData.template_id || "default",
        sections: pageData.sections,
        theme: theme,
        seo: pageData.seo,
      }

      console.log("[Landing Page] Saving payload:", JSON.stringify(payload, null, 2))

      let data
      try {
        data = await apiFetch<{ 
          success: boolean; 
          message?: string; 
          error?: string; 
          errors?: Record<string, string[]>;
          page?: LandingPageData;
        }>("/admin/landing-page", {
        method: "POST",
          body: payload,
        })
        console.log("[Landing Page] API Response:", JSON.stringify(data, null, 2))
      } catch (fetchError: any) {
        console.error("[Landing Page] API Fetch Error:", fetchError)
        // Check if it's a validation error (422)
        if (fetchError?.status === 422 || fetchError?.response?.status === 422) {
          const errorData = fetchError?.response?.data || fetchError?.data || {}
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat().join(", ")
            sonnerToast.error(`Validation Error: ${errorMessages}`, {
              duration: 5000,
            })
            setSaving(false)
            return
          }
        }
        throw fetchError
      }

      if (data?.success) {
        // Update local state with saved data
        if (data.page) {
          console.log("[Landing Page] Updating page data with saved data")
          setPageData(data.page)
        }
        
        sonnerToast.success(data.message || "Landing page saved successfully", {
          duration: 3000,
        })
        
        // Refresh to get latest from server
        await fetchPageData()
      } else {
        // Handle validation errors
        if (data?.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ")
          sonnerToast.error(`Validation Error: ${errorMessages}`, {
            duration: 5000,
          })
        } else {
          const errorMsg = data?.error || data?.message || "Failed to save"
          console.error("[Landing Page] Save failed:", errorMsg)
          sonnerToast.error(errorMsg, {
            duration: 5000,
          })
        }
      }
    } catch (error: any) {
      console.error("[Landing Page] Unexpected error saving:", error)
      const errorMessage = error?.message || error?.error || error?.toString() || "Failed to save landing page"
      console.error("[Landing Page] Error details:", {
        message: errorMessage,
        error: error,
        stack: error?.stack,
      })
      
      sonnerToast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setSaving(false)
      console.log("[Landing Page] Save completed")
    }
  }

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return

    setSaving(true)
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

      // Update template_id in pageData
      const updatedPageData = {
        ...pageData,
        template_id: template.id,
        sections,
        theme: template.theme,
      }

      // Save immediately to database
      const data = await apiFetch<{ success: boolean; message?: string; data?: any }>("/admin/landing-page", {
        method: "POST",
        body: {
          template_id: template.id,
          sections,
          theme: template.theme,
          seo: pageData.seo, // Keep existing SEO settings
          is_published: pageData.is_published, // Keep publish status
        },
      })

      if (data.success) {
        // Update local state immediately for real-time preview
        setPageData(updatedPageData)
        
        // Close dialog and reset selection
        setTemplateDialogOpen(false)
        setSelectedTemplate(null)
        
        // Show success notification
        sonnerToast.success(`${template.name} template applied successfully!`, {
          description: "Your landing page has been updated in real-time.",
          duration: 5000,
        })
        
        // Trigger a refresh of the landing page preview if it's open
        // This will be handled by the 30-second auto-refresh in dynamic-landing-page.tsx
        // But we can also trigger it manually if needed
        if (typeof window !== 'undefined') {
          // Dispatch a custom event to trigger refresh in preview window
          window.dispatchEvent(new CustomEvent('landing-page-template-changed', {
            detail: { template_id: template.id }
          }))
        }
      }
    } catch (error) {
      console.error("[Landing Page Builder] Error applying template:", error)
      sonnerToast.error("Failed to apply template", {
        description: "Please try again or contact support if the issue persists.",
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    const newPublishState = !pageData.is_published
    setPageData((prev) => ({ ...prev, is_published: newPublishState }))

    try {
      const data = await apiFetch<{ success: boolean; message?: string }>("/admin/landing-page/publish", {
        method: "POST",
        body: { is_published: newPublishState },
      })

      if (data.success) {
        sonnerToast.success(newPublishState ? "Landing page published" : "Landing page unpublished")
      }
    } catch (error) {
      console.error("[v0] Error publishing landing page:", error)
      sonnerToast.error("Failed to update publish status")
      setPageData((prev) => ({ ...prev, is_published: !newPublishState }))
    }
  }

  const addSection = (type: string) => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      type: type as any,
      name: SECTION_TYPES.find((t) => t.value === type)?.label || type,
      visible: true,
      position: pageData.sections.length,
      config: getDefaultConfig(type),
    }
    setPageData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
  }

  const getDefaultConfig = (type: string): Record<string, any> => {
    switch (type) {
      case "hero":
        return {
          title: "Your Path to Homeownership Made Simple",
          subtitle: "Join the FRSC Housing Cooperative",
          cta_text: "Get Started",
          cta_link: "/register",
          show_stats: true,
        }
      case "features":
        return {
          title: "Everything You Need",
          subtitle: "Comprehensive tools for your housing journey",
          features: [
            { icon: "Users", title: "Membership Management", description: "Easy registration with KYC verification" },
            { icon: "Wallet", title: "Digital Wallet", description: "Automated monthly contributions" },
            { icon: "TrendingUp", title: "Loan & Mortgage", description: "Access affordable housing loans" },
          ],
        }
      case "cta":
        return {
          title: "Ready to Start Your Journey?",
          description: "Join thousands of FRSC personnel building their future",
          cta_text: "Register Now",
          cta_link: "/register",
        }
      default:
        return {}
    }
  }

  const removeSection = (id: string) => {
    setPageData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id).map((s, idx) => ({ ...s, position: idx })),
    }))
  }

  const toggleSectionVisibility = (id: string) => {
    setPageData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s)),
    }))
  }

  const updateSectionConfig = (id: string, config: Record<string, any>) => {
    setPageData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, config: { ...s.config, ...config } } : s)),
    }))
  }

  // Apply theme changes reactively in the page builder for live preview
  useEffect(() => {
    if (!pageData?.theme) return
    
    const root = document.documentElement
    const primaryColor = pageData.theme.primary_color || "#FDB11E"
    const secondaryColor = pageData.theme.secondary_color || "#276254"
    const accentColor = pageData.theme.accent_color || "#10b981"
    const fontFamily = pageData.theme.font_family || "Inter"
    
    // Set CSS custom properties for immediate preview in page builder
    root.style.setProperty("--primary", primaryColor)
    root.style.setProperty("--secondary", secondaryColor)
    root.style.setProperty("--accent", accentColor)
    root.style.setProperty("--font-sans", `"${fontFamily}", system-ui, -apple-system, sans-serif`)
    document.body.style.fontFamily = `"${fontFamily}", system-ui, -apple-system, sans-serif`
    root.style.fontFamily = `"${fontFamily}", system-ui, -apple-system, sans-serif`
  }, [pageData?.theme])

  const handleDragStart = (id: string) => {
    setDraggedSection(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedSection || draggedSection === targetId) return

    const sections = [...pageData.sections]
    const draggedIdx = sections.findIndex((s) => s.id === draggedSection)
    const targetIdx = sections.findIndex((s) => s.id === targetId)

    const [removed] = sections.splice(draggedIdx, 1)
    sections.splice(targetIdx, 0, removed)

    setPageData((prev) => ({
      ...prev,
      sections: sections.map((s, idx) => ({ ...s, position: idx })),
    }))
  }

  const handleDragEnd = () => {
    setDraggedSection(null)
  }

  const activeSecData = pageData.sections.find((s) => s.id === activeSection)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Landing Page Builder</h1>
          <p className="text-muted-foreground mt-1">Customize your business landing page</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Change Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Change Template</DialogTitle>
                <DialogDescription>
                  Select a new template to apply. This will replace your current sections and theme. Your current content will be lost.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.sections.slice(0, 4).map((section, idx) => (
                          <span key={`${template.id}-${section.type}-${idx}`} className="text-xs bg-muted px-2 py-1 rounded">
                            {section.type}
                          </span>
                        ))}
                        {template.sections.length > 4 && (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            +{template.sections.length - 4} more
                          </span>
                        )}
                      </div>
                      <Button
                        className="w-full"
                        variant={selectedTemplate === template.id ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedTemplate(template.id)
                        }}
                      >
                        {selectedTemplate === template.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyTemplate}
                  disabled={!selectedTemplate || saving}
                >
                  {saving ? "Applying..." : "Apply Template"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline"
            onClick={() => {
              const previewUrl = getPreviewUrl()
              window.open(previewUrl, '_blank', 'noopener,noreferrer')
            }}
          >
              <Eye className="h-4 w-4 mr-2" />
              Preview
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant={pageData.is_published ? "secondary" : "default"} onClick={handlePublish}>
            <Globe className="h-4 w-4 mr-2" />
            {pageData.is_published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sections">
            <Layout className="h-4 w-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Settings className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Page Sections</h3>
                <p className="text-sm text-muted-foreground mt-1">Drag to reorder, click to edit content</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                    <DialogDescription>Choose a section type to add to your landing page</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {SECTION_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-center gap-2 bg-transparent"
                        onClick={() => {
                          addSection(type.value)
                          sonnerToast.success(`${type.label} section added successfully`)
                        }}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm">{type.label}</span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {pageData.sections.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sections added yet. Click "Add Section" to get started.</p>
                </div>
              ) : (
                pageData.sections.map((section) => (
                  <Card
                    key={section.id}
                    className={`p-4 cursor-move hover:border-primary transition-colors ${
                      !section.visible ? "opacity-50" : ""
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(section.id)}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                          <span>{SECTION_TYPES.find((t) => t.value === section.type)?.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-medium">{section.name}</h4>
                          <p className="text-sm text-muted-foreground">{section.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={section.visible} onCheckedChange={() => toggleSectionVisibility(section.id)} />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveSection(section.id)
                            setEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>

          {/* Section Editor Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit {activeSecData?.name}</DialogTitle>
                <DialogDescription>Customize the content and settings for this section</DialogDescription>
              </DialogHeader>
              {activeSecData && (
                <div className="space-y-4 mt-4">
                  {activeSecData.type === "hero" && (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea
                          value={activeSecData.config.subtitle || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { subtitle: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>CTA Button Text</Label>
                          <Input
                            value={activeSecData.config.cta_text || ""}
                            onChange={(e) => updateSectionConfig(activeSecData.id, { cta_text: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA Link</Label>
                          <Input
                            value={activeSecData.config.cta_link || ""}
                            onChange={(e) => updateSectionConfig(activeSecData.id, { cta_link: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Show Statistics</Label>
                        <Switch
                          checked={activeSecData.config.show_stats || false}
                          onCheckedChange={(checked) => updateSectionConfig(activeSecData.id, { show_stats: checked })}
                        />
                      </div>
                    </>
                  )}
                  {activeSecData.type === "cta" && (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={activeSecData.config.description || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Button Text</Label>
                          <Input
                            value={activeSecData.config.cta_text || ""}
                            onChange={(e) => updateSectionConfig(activeSecData.id, { cta_text: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Button Link</Label>
                          <Input
                            value={activeSecData.config.cta_link || ""}
                            onChange={(e) => updateSectionConfig(activeSecData.id, { cta_link: e.target.value })}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {activeSecData.type === "features" && (
                    <>
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Subtitle</Label>
                        <Input
                          value={activeSecData.config.subtitle || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { subtitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Features (JSON array)</Label>
                        <Textarea
                          value={JSON.stringify(activeSecData.config.features || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const features = JSON.parse(e.target.value)
                              updateSectionConfig(activeSecData.id, { features })
                            } catch (err) {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={8}
                          placeholder='[{"icon": "Users", "title": "Feature Title", "description": "Feature description"}]'
                        />
                      </div>
                    </>
                  )}
                  {(activeSecData.type === "properties" || activeSecData.type === "investments" || activeSecData.type === "loans") && (
                    <>
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Subtitle</Label>
                        <Textarea
                          value={activeSecData.config.subtitle || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { subtitle: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Source</Label>
                        <Select
                          value={activeSecData.config.data_source || "all_active"}
                          onValueChange={(value) => {
                            const config = { ...activeSecData.config, data_source: value }
                            if (value === "all_active") {
                              delete config.selected_ids
                            }
                            updateSectionConfig(activeSecData.id, config)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all_active">All Active Items</SelectItem>
                            <SelectItem value="selected">Selected Items Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Choose whether to show all active items or select specific ones
                        </p>
                      </div>
                      {activeSecData.config.data_source === "selected" && (
                        <div className="space-y-2">
                          <Label>Select Items</Label>
                          {loadingItems ? (
                            <p className="text-sm text-muted-foreground">Loading items...</p>
                          ) : (
                            <ScrollArea className="h-48 border rounded-md p-4">
                              <div className="space-y-2">
                                {(activeSecData.type === "loans" ? availableItems?.loans : 
                                  activeSecData.type === "investments" ? availableItems?.investments : 
                                  availableItems?.properties)?.map((item) => {
                                  const selectedIds = activeSecData.config.selected_ids || []
                                  const isSelected = selectedIds.includes(item.id)
                                  return (
                                    <div key={item.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`item-${item.id}`}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          const currentIds = activeSecData.config.selected_ids || []
                                          const newIds = checked
                                            ? [...currentIds, item.id]
                                            : currentIds.filter((id: string) => id !== item.id)
                                          updateSectionConfig(activeSecData.id, {
                                            ...activeSecData.config,
                                            selected_ids: newIds,
                                          })
                                        }}
                                      />
                                      <label
                                        htmlFor={`item-${item.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                      >
                                        {item.name}
                                        {item.description && (
                                          <span className="text-xs text-muted-foreground block">
                                            {item.description}
                                          </span>
                                        )}
                                        {"location" in item && item.location && (
                                          <span className="text-xs text-muted-foreground block">
                                            {item.location}
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                  )
                                })}
                              </div>
                            </ScrollArea>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {activeSecData.config.selected_ids?.length || 0} item(s) selected
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Sort By</Label>
                          <Select
                            value={activeSecData.config.sort_by || (activeSecData.type === "properties" ? "created_at" : "name")}
                            onValueChange={(value) =>
                              updateSectionConfig(activeSecData.id, { ...activeSecData.config, sort_by: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {activeSecData.type === "properties" ? (
                                <>
                                  <SelectItem value="created_at">Date Added</SelectItem>
                                  <SelectItem value="name">Name</SelectItem>
                                  <SelectItem value="price">Price</SelectItem>
                                </>
                              ) : (
                                <>
                                  <SelectItem value="name">Name</SelectItem>
                                  {activeSecData.type === "loans" ? (
                                    <SelectItem value="interest_rate">Interest Rate</SelectItem>
                                  ) : (
                                    <SelectItem value="expected_return_rate">Return Rate</SelectItem>
                                  )}
                                  <SelectItem value="created_at">Date Added</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Sort Order</Label>
                          <Select
                            value={activeSecData.config.sort_order || (activeSecData.type === "properties" ? "desc" : "asc")}
                            onValueChange={(value) =>
                              updateSectionConfig(activeSecData.id, { ...activeSecData.config, sort_order: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Ascending</SelectItem>
                              <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Display Limit</Label>
                        <Input
                          type="number"
                          value={activeSecData.config.limit || 6}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { ...activeSecData.config, limit: parseInt(e.target.value) || 6 })}
                          min={1}
                          max={12}
                        />
                        <p className="text-xs text-muted-foreground">Maximum number of items to display (1-12)</p>
                      </div>
                    </>
                  )}
                  {activeSecData.type === "stats" && (
                    <>
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Subtitle</Label>
                        <Input
                          value={activeSecData.config.subtitle || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { subtitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Statistics (JSON array)</Label>
                        <Textarea
                          value={JSON.stringify(activeSecData.config.stats || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const stats = JSON.parse(e.target.value)
                              updateSectionConfig(activeSecData.id, { stats })
                            } catch (err) {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={8}
                          placeholder='[{"label": "Label", "value": "Value", "icon": "Users"}]'
                        />
                      </div>
                    </>
                  )}
                  {activeSecData.type === "how-it-works" && (
                    <>
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Subtitle</Label>
                        <Input
                          value={activeSecData.config.subtitle || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { subtitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Steps (JSON array)</Label>
                        <Textarea
                          value={JSON.stringify(activeSecData.config.steps || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const steps = JSON.parse(e.target.value)
                              updateSectionConfig(activeSecData.id, { steps })
                            } catch (err) {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={8}
                          placeholder='[{"step": 1, "title": "Step Title", "description": "Step description"}]'
                        />
                      </div>
                    </>
                  )}
                  {activeSecData.type === "testimonials" && (
                    <>
                      <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input
                          value={activeSecData.config.title || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section Subtitle</Label>
                        <Input
                          value={activeSecData.config.subtitle || ""}
                          onChange={(e) => updateSectionConfig(activeSecData.id, { subtitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Testimonials (JSON array)</Label>
                        <Textarea
                          value={JSON.stringify(activeSecData.config.testimonials || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const testimonials = JSON.parse(e.target.value)
                              updateSectionConfig(activeSecData.id, { testimonials })
                            } catch (err) {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={8}
                          placeholder='[{"name": "Name", "role": "Role", "content": "Testimonial", "rating": 5}]'
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Theme Customization</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="mb-2 block">Primary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={pageData.theme.primary_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, primary_color: e.target.value },
                      }))
                    }
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    value={pageData.theme.primary_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, primary_color: e.target.value },
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Secondary Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={pageData.theme.secondary_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, secondary_color: e.target.value },
                      }))
                    }
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    value={pageData.theme.secondary_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, secondary_color: e.target.value },
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Accent Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={pageData.theme.accent_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, accent_color: e.target.value },
                      }))
                    }
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    value={pageData.theme.accent_color}
                    onChange={(e) =>
                      setPageData((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, accent_color: e.target.value },
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Font Family</Label>
                <Select
                  value={pageData.theme.font_family}
                  onValueChange={(value) =>
                    setPageData((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, font_family: value },
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input
                  value={pageData.seo.title}
                  onChange={(e) =>
                    setPageData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, title: e.target.value },
                    }))
                  }
                  placeholder="Enter page title"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={pageData.seo.description}
                  onChange={(e) =>
                    setPageData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, description: e.target.value },
                    }))
                  }
                  rows={3}
                  placeholder="Enter meta description for SEO"
                />
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={pageData.seo.keywords}
                  onChange={(e) =>
                    setPageData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, keywords: e.target.value },
                    }))
                  }
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
