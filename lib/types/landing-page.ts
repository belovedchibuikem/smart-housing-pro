export interface LandingPageTemplate {
  id: string
  name: string
  description: string
  thumbnail_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BusinessLandingPage {
  id: string
  business_id: string
  template_id: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface LandingPageSection {
  id: string
  landing_page_id: string
  section_type: "hero" | "features" | "testimonials" | "cta" | "pricing" | "about" | "contact"
  position: number
  is_visible: boolean
  config: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LandingPageTheme {
  id: string
  landing_page_id: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  logo_url: string | null
  favicon_url: string | null
  created_at: string
  updated_at: string
}

export interface HeroSectionConfig {
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  background_image?: string
  show_stats?: boolean
}

export interface FeaturesSectionConfig {
  title: string
  subtitle?: string
  features: Array<{
    icon: string
    title: string
    description: string
  }>
}

export interface TestimonialsSectionConfig {
  title: string
  testimonials: Array<{
    name: string
    role: string
    content: string
    avatar?: string
    rating: number
  }>
}

export interface CTASectionConfig {
  title: string
  description: string
  cta_text: string
  cta_link: string
  background_color?: string
}
