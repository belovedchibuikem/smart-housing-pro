-- Multi-tenancy Foundation Schema
-- This script creates the core tables for the SaaS platform

-- ============================================
-- SUPER ADMIN & PLATFORM TABLES
-- ============================================

-- Super Admin Users Table
CREATE TABLE IF NOT EXISTS super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'super_admin', -- super_admin, support, billing
    permissions JSONB DEFAULT '[]', -- Array of permission strings
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Super Admin Roles Table
CREATE TABLE IF NOT EXISTS super_admin_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]', -- Array of permission strings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules Table (Available features in the platform)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default modules
INSERT INTO modules (name, slug, description, icon) VALUES
('Member Management', 'members', 'Manage cooperative members and KYC', 'Users'),
('Contributions', 'contributions', 'Track member contributions and payments', 'Wallet'),
('Loans', 'loans', 'Loan products and applications', 'TrendingUp'),
('Properties', 'properties', 'Property listings and management', 'Building2'),
('Investments', 'investments', 'Investment plans and tracking', 'PieChart'),
('Mortgages', 'mortgages', 'Mortgage management', 'Home'),
('Mail Service', 'mail', 'Internal messaging system', 'Mail'),
('Reports', 'reports', 'Analytics and reporting', 'BarChart'),
('Documents', 'documents', 'Document management', 'FileText'),
('Statutory Charges', 'statutory', 'Statutory charges management', 'Receipt')
ON CONFLICT (slug) DO NOTHING;

-- Subscription Packages Table
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL, -- monthly, yearly
    trial_days INTEGER DEFAULT 14,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    limits JSONB DEFAULT '{}', -- JSON object with limits
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Package Modules (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS package_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    limits JSONB DEFAULT '{}', -- Module-specific limits
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(package_id, module_id)
);

-- ============================================
-- TENANT (BUSINESS) TABLES
-- ============================================

-- Tenants/Businesses Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- Used for subdomain
    custom_domain VARCHAR(255) UNIQUE,
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#FDB11E',
    secondary_color VARCHAR(7) DEFAULT '#276254',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, cancelled
    subscription_status VARCHAR(20) DEFAULT 'trial', -- trial, active, past_due, cancelled
    trial_ends_at TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Subscriptions Table
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id),
    status VARCHAR(20) DEFAULT 'active', -- active, past_due, cancelled
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Usage Tracking
CREATE TABLE IF NOT EXISTS tenant_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    module_slug VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL, -- members_count, properties_count, etc.
    current_value INTEGER DEFAULT 0,
    limit_value INTEGER,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, module_slug, metric_name, period_start)
);

-- Tenant Invoices
CREATE TABLE IF NOT EXISTS tenant_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES tenant_subscriptions(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    due_date TIMESTAMP NOT NULL,
    paid_at TIMESTAMP,
    stripe_invoice_id VARCHAR(255),
    invoice_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Admins (Business Admin Users)
CREATE TABLE IF NOT EXISTS tenant_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_owner BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, email)
);

-- ============================================
-- LANDING PAGE BUILDER TABLES
-- ============================================

-- Landing Page Templates
CREATE TABLE IF NOT EXISTS landing_page_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    template_data JSONB NOT NULL, -- Complete page structure
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Landing Pages
CREATE TABLE IF NOT EXISTS tenant_landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES landing_page_templates(id),
    page_data JSONB NOT NULL, -- Customized page structure
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id)
);

-- ============================================
-- SUPER ADMIN MAIL SERVICE
-- ============================================

-- Super Admin Messages
CREATE TABLE IF NOT EXISTS super_admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES super_admins(id),
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL, -- tenant_admins, all_members, specific_tenant
    tenant_id UUID REFERENCES tenants(id), -- NULL for all tenants
    status VARCHAR(20) DEFAULT 'draft', -- draft, sent, scheduled
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    recipient_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message Recipients Tracking
CREATE TABLE IF NOT EXISTS message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES super_admin_messages(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(50) NOT NULL, -- tenant_admin, member
    tenant_id UUID REFERENCES tenants(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed, opened
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PLATFORM ANALYTICS
-- ============================================

-- Platform Analytics
CREATE TABLE IF NOT EXISTS platform_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, metric_name)
);

-- Tenant Activity Logs
CREATE TABLE IF NOT EXISTS tenant_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    actor_type VARCHAR(50) NOT NULL, -- super_admin, tenant_admin, system
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenant_subscriptions_tenant ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_usage_tenant ON tenant_usage(tenant_id);
CREATE INDEX idx_tenant_admins_tenant ON tenant_admins(tenant_id);
CREATE INDEX idx_tenant_admins_email ON tenant_admins(email);
CREATE INDEX idx_tenant_activity_logs_tenant ON tenant_activity_logs(tenant_id);
CREATE INDEX idx_tenant_activity_logs_created ON tenant_activity_logs(created_at);
