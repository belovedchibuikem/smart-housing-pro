-- Payment Gateway Settings Schema
-- Stores payment gateway credentials and configuration for each tenant

CREATE TABLE IF NOT EXISTS payment_gateway_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  gateway_type VARCHAR(50) NOT NULL, -- 'paystack', 'remita', 'stripe', 'manual'
  is_enabled BOOLEAN DEFAULT false,
  is_test_mode BOOLEAN DEFAULT true,
  
  -- Encrypted credentials (use pgcrypto for encryption)
  public_key TEXT,
  secret_key TEXT,
  merchant_id TEXT,
  api_key TEXT,
  service_type_id TEXT,
  
  -- Gateway-specific configuration
  configuration JSONB DEFAULT '{}',
  
  -- Manual payment gateway settings
  bank_accounts JSONB DEFAULT '[]', -- Array of bank account details for manual payments
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  
  UNIQUE(tenant_id, gateway_type)
);

-- Create index for faster lookups
CREATE INDEX idx_payment_gateway_tenant ON payment_gateway_settings(tenant_id);
CREATE INDEX idx_payment_gateway_enabled ON payment_gateway_settings(tenant_id, is_enabled);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_payment_gateway_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_gateway_settings_updated_at
  BEFORE UPDATE ON payment_gateway_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_gateway_settings_updated_at();

-- Insert default manual payment gateway for existing tenants
INSERT INTO payment_gateway_settings (tenant_id, gateway_type, is_enabled, is_test_mode)
SELECT id, 'manual', true, false
FROM tenants
ON CONFLICT (tenant_id, gateway_type) DO NOTHING;

COMMENT ON TABLE payment_gateway_settings IS 'Stores payment gateway credentials and configuration for multi-tenant system';
COMMENT ON COLUMN payment_gateway_settings.gateway_type IS 'Type of payment gateway: paystack, remita, stripe, or manual';
COMMENT ON COLUMN payment_gateway_settings.bank_accounts IS 'JSON array of bank account details for manual payment gateway';
