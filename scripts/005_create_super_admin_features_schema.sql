-- Super Admin Advanced Features Schema

-- Super admin roles and permissions
CREATE TABLE IF NOT EXISTS super_admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Super admin users
CREATE TABLE IF NOT EXISTS super_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES super_admin_roles(id),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Super admin activity logs
CREATE TABLE IF NOT EXISTS super_admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID NOT NULL REFERENCES super_admin_users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  business_id UUID REFERENCES businesses(id),
  metadata JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Super admin mail templates
CREATE TABLE IF NOT EXISTS super_admin_mail_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Super admin sent mails
CREATE TABLE IF NOT EXISTS super_admin_sent_mails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID NOT NULL REFERENCES super_admin_users(id),
  template_id UUID REFERENCES super_admin_mail_templates(id),
  recipient_type VARCHAR(50) NOT NULL, -- business_admin, all_members, specific_business
  recipient_ids JSONB DEFAULT '[]',
  business_id UUID REFERENCES businesses(id),
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default super admin roles
INSERT INTO super_admin_roles (name, description, permissions) VALUES
('Super Administrator', 'Full access to all platform features', '{"all": true}'),
('Business Manager', 'Manage businesses and subscriptions', '{"businesses": ["read", "update"], "subscriptions": ["read", "update"]}'),
('Support Agent', 'View businesses and provide support', '{"businesses": ["read"], "support": ["read", "create"]}');

-- Create indexes
CREATE INDEX idx_super_admin_users_email ON super_admin_users(email);
CREATE INDEX idx_super_admin_users_role ON super_admin_users(role_id);
CREATE INDEX idx_super_admin_activity_logs_admin ON super_admin_activity_logs(super_admin_id);
CREATE INDEX idx_super_admin_activity_logs_business ON super_admin_activity_logs(business_id);
CREATE INDEX idx_super_admin_sent_mails_admin ON super_admin_sent_mails(super_admin_id);
CREATE INDEX idx_super_admin_sent_mails_business ON super_admin_sent_mails(business_id);
