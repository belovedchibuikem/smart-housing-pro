-- Custom Domain Requests Schema
-- Tracks custom domain requests and their verification status

CREATE TYPE domain_status AS ENUM ('pending', 'verifying', 'verified', 'active', 'failed', 'rejected');

CREATE TABLE IF NOT EXISTS custom_domain_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Domain Information
  domain_name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100), -- Optional subdomain (e.g., 'app' in app.example.com)
  full_domain VARCHAR(255) NOT NULL, -- Complete domain with subdomain if any
  
  -- Status
  status domain_status DEFAULT 'pending',
  status_message TEXT,
  
  -- DNS Verification
  verification_token VARCHAR(255) UNIQUE,
  dns_records JSONB DEFAULT '[]', -- Required DNS records for verification
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- SSL Certificate
  ssl_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'issued', 'active', 'failed'
  ssl_issued_at TIMESTAMP WITH TIME ZONE,
  ssl_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin Review
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  
  -- Metadata
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(tenant_id, full_domain)
);

-- Create indexes
CREATE INDEX idx_custom_domain_tenant ON custom_domain_requests(tenant_id);
CREATE INDEX idx_custom_domain_status ON custom_domain_requests(status);
CREATE INDEX idx_custom_domain_verification ON custom_domain_requests(verification_token);
CREATE INDEX idx_custom_domain_full_domain ON custom_domain_requests(full_domain);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_custom_domain_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER custom_domain_requests_updated_at
  BEFORE UPDATE ON custom_domain_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_domain_requests_updated_at();

-- Function to generate verification token
CREATE OR REPLACE FUNCTION generate_domain_verification_token()
RETURNS TEXT AS $$
BEGIN
  RETURN 'frsc-verify-' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE custom_domain_requests IS 'Tracks custom domain requests and verification status for tenants';
COMMENT ON COLUMN custom_domain_requests.dns_records IS 'JSON array of required DNS records for domain verification';
COMMENT ON COLUMN custom_domain_requests.verification_token IS 'Unique token for DNS TXT record verification';
