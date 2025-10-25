-- Landing Page Builder Schema

-- Landing pages table
CREATE TABLE IF NOT EXISTS landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    theme JSONB DEFAULT '{
        "primary_color": "#3b82f6",
        "secondary_color": "#8b5cf6",
        "accent_color": "#10b981",
        "font_family": "Inter"
    }'::jsonb,
    seo JSONB DEFAULT '{
        "title": "",
        "description": "",
        "keywords": ""
    }'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Landing page sections table
CREATE TABLE IF NOT EXISTS landing_page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_landing_pages_tenant ON landing_pages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_published ON landing_pages(is_published);
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_page ON landing_page_sections(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_sections_position ON landing_page_sections(landing_page_id, position);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_landing_page_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER landing_pages_updated_at
    BEFORE UPDATE ON landing_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_landing_page_updated_at();

CREATE TRIGGER landing_page_sections_updated_at
    BEFORE UPDATE ON landing_page_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_landing_page_updated_at();

-- Comments
COMMENT ON TABLE landing_pages IS 'Stores landing page configurations for each tenant';
COMMENT ON TABLE landing_page_sections IS 'Stores individual sections of landing pages with their configurations';
COMMENT ON COLUMN landing_pages.theme IS 'Theme settings including colors and fonts';
COMMENT ON COLUMN landing_pages.seo IS 'SEO metadata for the landing page';
COMMENT ON COLUMN landing_page_sections.config IS 'Section-specific configuration data';
