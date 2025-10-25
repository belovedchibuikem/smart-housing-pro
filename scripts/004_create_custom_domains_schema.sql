-- Custom Domains Schema
-- This schema manages custom domain configurations for businesses

-- Custom domains table
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255) NOT NULL,
  verification_method VARCHAR(50) DEFAULT 'dns', -- dns, txt, cname
  ssl_status VARCHAR(50) DEFAULT 'pending', -- pending, active, failed
  ssl_certificate_id VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Domain DNS records for verification
CREATE TABLE IF NOT EXISTS domain_dns_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_domain_id UUID NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
  record_type VARCHAR(10) NOT NULL, -- A, CNAME, TXT
  record_name VARCHAR(255) NOT NULL,
  record_value TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_custom_domains_business ON custom_domains(business_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_verified ON custom_domains(is_verified);
CREATE INDEX idx_domain_dns_records_domain ON domain_dns_records(custom_domain_id);
