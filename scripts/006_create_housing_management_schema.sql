-- Housing Management System Schema
-- Core tables for FRSC Housing Cooperative

-- ============================================
-- MEMBERS & USERS
-- ============================================

-- Members Table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, -- References tenants table
    user_id UUID, -- Link to auth user if applicable
    membership_number VARCHAR(50) UNIQUE NOT NULL,
    membership_type VARCHAR(20) NOT NULL, -- member, non-member
    title VARCHAR(10),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10),
    marital_status VARCHAR(20),
    
    -- FRSC Specific
    frsc_id VARCHAR(50),
    ippis_number VARCHAR(50),
    rank VARCHAR(50),
    department VARCHAR(100),
    state_command VARCHAR(100),
    date_of_employment DATE,
    years_of_service INTEGER,
    retirement_date DATE,
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Nigeria',
    
    -- KYC Status
    kyc_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    kyc_verified_at TIMESTAMP,
    kyc_verified_by UUID,
    
    -- Next of Kin
    nok_name VARCHAR(255),
    nok_relationship VARCHAR(50),
    nok_phone VARCHAR(50),
    nok_address TEXT,
    
    -- Account Status
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    joined_date DATE DEFAULT CURRENT_DATE,
    upgraded_at TIMESTAMP, -- When non-member upgraded to member
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member Documents
CREATE TABLE IF NOT EXISTS member_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- passport, id_card, utility_bill, etc.
    document_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by UUID,
    notes TEXT
);

-- ============================================
-- CONTRIBUTIONS
-- ============================================

-- Contribution Plans
CREATE TABLE IF NOT EXISTS contribution_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- monthly, quarterly, yearly
    is_mandatory BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member Contributions
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES contribution_plans(id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50), -- bank_transfer, paystack, remita, wallet
    payment_reference VARCHAR(100),
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LOANS
-- ============================================

-- Loan Products
CREATE TABLE IF NOT EXISTS loan_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    loan_type VARCHAR(50) NOT NULL, -- cash, mortgage, emergency
    
    -- Interest Rates
    member_interest_rate DECIMAL(5, 2) NOT NULL,
    non_member_interest_rate DECIMAL(5, 2) NOT NULL,
    
    -- Loan Limits
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2) NOT NULL,
    
    -- Repayment Terms
    min_tenor_months INTEGER NOT NULL,
    max_tenor_months INTEGER NOT NULL,
    
    -- Cash Loan Specific
    repayment_source VARCHAR(50), -- salary, contribution
    deduction_percentage DECIMAL(5, 2), -- % of salary/contribution
    
    -- Eligibility
    min_membership_months INTEGER,
    requires_guarantor BOOLEAN DEFAULT true,
    num_guarantors INTEGER DEFAULT 2,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Applications
CREATE TABLE IF NOT EXISTS loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    product_id UUID REFERENCES loan_products(id),
    application_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Loan Details
    requested_amount DECIMAL(15, 2) NOT NULL,
    approved_amount DECIMAL(15, 2),
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenor_months INTEGER NOT NULL,
    monthly_repayment DECIMAL(15, 2),
    total_repayment DECIMAL(15, 2),
    
    -- Purpose
    purpose TEXT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, disbursed, completed
    applied_date DATE DEFAULT CURRENT_DATE,
    approved_date DATE,
    approved_by UUID,
    disbursed_date DATE,
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Guarantors
CREATE TABLE IF NOT EXISTS loan_guarantors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    guarantor_member_id UUID REFERENCES members(id),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan Repayments
CREATE TABLE IF NOT EXISTS loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    loan_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROPERTIES
-- ============================================

-- Properties
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    property_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL, -- apartment, duplex, land, commercial
    
    -- Location
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'Nigeria',
    
    -- Details
    description TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    size_sqm DECIMAL(10, 2),
    
    -- Pricing
    price DECIMAL(15, 2) NOT NULL,
    payment_plan VARCHAR(50), -- outright, installment, mortgage
    
    -- Status
    status VARCHAR(20) DEFAULT 'available', -- available, allocated, sold, under_construction
    
    -- Media
    images JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    
    -- Metadata
    features JSONB DEFAULT '[]',
    amenities JSONB DEFAULT '[]',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property Allocations
CREATE TABLE IF NOT EXISTS property_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    allocation_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, completed
    payment_status VARCHAR(20) DEFAULT 'pending',
    total_paid DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- plumbing, electrical, structural, etc.
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    assigned_to UUID,
    estimated_cost DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    scheduled_date DATE,
    completed_date DATE,
    images JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INVESTMENTS
-- ============================================

-- Investment Plans
CREATE TABLE IF NOT EXISTS investment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2),
    roi_percentage DECIMAL(5, 2) NOT NULL,
    duration_months INTEGER NOT NULL,
    risk_level VARCHAR(20), -- low, medium, high
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member Investments
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES investment_plans(id),
    investment_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    expected_return DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, matured, withdrawn
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- WALLET & TRANSACTIONS
-- ============================================

-- Member Wallets
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- credit, debit
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    description TEXT,
    reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STATUTORY CHARGES
-- ============================================

-- Statutory Charge Types
CREATE TABLE IF NOT EXISTS statutory_charge_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    frequency VARCHAR(20), -- one_time, monthly, yearly
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member Statutory Charges
CREATE TABLE IF NOT EXISTS statutory_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    charge_type_id UUID REFERENCES statutory_charge_types(id),
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MAIL SERVICE
-- ============================================

-- Mail Messages
CREATE TABLE IF NOT EXISTS mail_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sender_id UUID, -- NULL for system messages
    sender_type VARCHAR(20), -- admin, member, system
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    recipient_type VARCHAR(20) NOT NULL, -- all, department, individual
    department VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high
    status VARCHAR(20) DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mail Recipients
CREATE TABLE IF NOT EXISTS mail_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES mail_messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES members(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_members_tenant ON members(tenant_id);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_membership_number ON members(membership_number);
CREATE INDEX idx_members_status ON members(status);

CREATE INDEX idx_contributions_tenant ON contributions(tenant_id);
CREATE INDEX idx_contributions_member ON contributions(member_id);
CREATE INDEX idx_contributions_status ON contributions(status);

CREATE INDEX idx_loans_tenant ON loan_applications(tenant_id);
CREATE INDEX idx_loans_member ON loan_applications(member_id);
CREATE INDEX idx_loans_status ON loan_applications(status);

CREATE INDEX idx_properties_tenant ON properties(tenant_id);
CREATE INDEX idx_properties_status ON properties(status);

CREATE INDEX idx_investments_tenant ON investments(tenant_id);
CREATE INDEX idx_investments_member ON investments(member_id);

CREATE INDEX idx_wallets_tenant ON wallets(tenant_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
