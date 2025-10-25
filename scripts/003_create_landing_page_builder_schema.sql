-- Landing Page Builder Schema
-- This schema stores landing page configurations for each business

-- Landing page templates
CREATE TABLE IF NOT EXISTS landing_page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Landing page configurations for businesses
CREATE TABLE IF NOT EXISTS business_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  template_id UUID REFERENCES landing_page_templates(id),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id)
);

-- Landing page sections (hero, features, testimonials, etc.)
CREATE TABLE IF NOT EXISTS landing_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES business_landing_pages(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- hero, features, testimonials, cta, etc.
  position INTEGER NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}', -- Stores section-specific configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Landing page branding/theme settings
CREATE TABLE IF NOT EXISTS landing_page_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_id UUID NOT NULL REFERENCES business_landing_pages(id) ON DELETE CASCADE,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  accent_color VARCHAR(7) DEFAULT '#F59E0B',
  font_family VARCHAR(100) DEFAULT 'Inter',
  logo_url TEXT,
  favicon_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(landing_page_id)
);

-- Insert default templates
INSERT INTO landing_page_templates (name, description, thumbnail_url) VALUES
('Modern', 'Clean and modern design with bold typography', '/templates/modern.jpg'),
('Classic', 'Traditional layout with professional styling', '/templates/classic.jpg'),
('Minimal', 'Minimalist design with focus on content', '/templates/minimal.jpg');

-- Create indexes
CREATE INDEX idx_landing_page_sections_page ON landing_page_sections(landing_page_id);
CREATE INDEX idx_landing_page_sections_position ON landing_page_sections(landing_page_id, position);
