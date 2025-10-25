-- White Label Settings Schema
-- Stores branding and customization settings for each tenant

CREATE TABLE IF NOT EXISTS white_label_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Brand Identity
  company_name VARCHAR(255),
  company_tagline TEXT,
  company_description TEXT,
  logo_url TEXT,
  logo_dark_url TEXT, -- Logo for dark mode
  favicon_url TEXT,
  
  -- Color Scheme
  primary_color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color
  secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
  accent_color VARCHAR(7) DEFAULT '#10b981',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#1f2937',
  
  -- Typography
  heading_font VARCHAR(100) DEFAULT 'Inter',
  body_font VARCHAR(100) DEFAULT 'Inter',
  
  -- Brand Assets
  login_background_url TEXT,
  dashboard_hero_url TEXT,
  
  -- Email Branding
  email_sender_name VARCHAR(255),
  email_reply_to VARCHAR(255),
  email_footer_text TEXT,
  email_logo_url TEXT,
  
  -- Content Customization
  terms_url TEXT,
  privacy_url TEXT,
  support_email VARCHAR(255),
  support_phone VARCHAR(50),
  help_center_url TEXT,
  
  -- Footer Content
  footer_text TEXT,
  footer_links JSONB DEFAULT '[]', -- Array of {label, url}
  social_links JSONB DEFAULT '{}', -- {facebook, twitter, linkedin, instagram}
  
  -- Feature Control
  enabled_modules JSONB DEFAULT '["properties", "loans", "investments", "contributions", "wallet"]',
  
  -- Custom CSS
  custom_css TEXT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

-- Create index for faster lookups
CREATE INDEX idx_white_label_tenant ON white_label_settings(tenant_id);
CREATE INDEX idx_white_label_active ON white_label_settings(tenant_id, is_active);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_white_label_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER white_label_settings_updated_at
  BEFORE UPDATE ON white_label_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_white_label_settings_updated_at();

-- Insert default white label settings for existing tenants
INSERT INTO white_label_settings (tenant_id, company_name)
SELECT id, name
FROM tenants
ON CONFLICT (tenant_id) DO NOTHING;

COMMENT ON TABLE white_label_settings IS 'Stores white label branding and customization settings for each tenant';
COMMENT ON COLUMN white_label_settings.enabled_modules IS 'JSON array of enabled feature modules';
COMMENT ON COLUMN white_label_settings.custom_css IS 'Custom CSS for advanced branding customization';
