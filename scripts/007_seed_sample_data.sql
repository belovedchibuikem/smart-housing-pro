-- Seed Sample Data for Development/Testing

-- Create a sample tenant (FRSC Housing Cooperative)
INSERT INTO tenants (
    id,
    name,
    slug,
    custom_domain,
    primary_color,
    secondary_color,
    contact_email,
    contact_phone,
    address,
    status,
    subscription_status,
    trial_ends_at,
    subscription_ends_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'FRSC Housing Cooperative',
    'frsc',
    NULL,
    '#FDB11E',
    '#276254',
    'info@frsc-housing.com',
    '+234 800 000 0000',
    'Abuja, Nigeria',
    'active',
    'active',
    NULL,
    '2025-12-31 23:59:59'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    contact_email = EXCLUDED.contact_email;

-- Link FRSC tenant to Professional package
INSERT INTO tenant_subscriptions (
    tenant_id,
    package_id,
    status,
    current_period_start,
    current_period_end
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    id,
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '30 days'
FROM packages
WHERE slug = 'professional'
ON CONFLICT DO NOTHING;

-- Create sample contribution plans
INSERT INTO contribution_plans (tenant_id, name, description, amount, frequency, is_mandatory, is_active)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Monthly Contribution', 'Standard monthly contribution for all members', 5000.00, 'monthly', true, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Building Fund', 'Special contribution for building projects', 10000.00, 'quarterly', false, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Emergency Fund', 'Emergency fund contribution', 2000.00, 'monthly', false, true)
ON CONFLICT DO NOTHING;

-- Create sample loan products
INSERT INTO loan_products (
    tenant_id,
    name,
    description,
    loan_type,
    member_interest_rate,
    non_member_interest_rate,
    min_amount,
    max_amount,
    min_tenor_months,
    max_tenor_months,
    repayment_source,
    deduction_percentage,
    requires_guarantor,
    num_guarantors,
    is_active
) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Personal Loan',
        'Short-term personal loan for members',
        'cash',
        5.00,
        8.00,
        50000.00,
        500000.00,
        6,
        24,
        'salary',
        25.00,
        true,
        2,
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Housing Loan',
        'Long-term loan for housing projects',
        'mortgage',
        6.00,
        10.00,
        1000000.00,
        10000000.00,
        12,
        240,
        'salary',
        30.00,
        true,
        2,
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Emergency Loan',
        'Quick access emergency loan',
        'emergency',
        4.00,
        7.00,
        20000.00,
        200000.00,
        3,
        12,
        'contribution',
        20.00,
        false,
        1,
        true
    )
ON CONFLICT DO NOTHING;

-- Create sample investment plans
INSERT INTO investment_plans (
    tenant_id,
    name,
    description,
    min_amount,
    max_amount,
    roi_percentage,
    duration_months,
    risk_level,
    is_active
) VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Fixed Deposit',
        'Low-risk fixed deposit investment',
        100000.00,
        5000000.00,
        8.00,
        12,
        'low',
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Property Development',
        'Medium-risk property development investment',
        500000.00,
        10000000.00,
        15.00,
        24,
        'medium',
        true
    ),
    (
        '550e8400-e29b-41d4-a716-446655440000',
        'Cooperative Bonds',
        'High-return cooperative bonds',
        1000000.00,
        NULL,
        20.00,
        36,
        'high',
        true
    )
ON CONFLICT DO NOTHING;

-- Create sample statutory charge types
INSERT INTO statutory_charge_types (
    tenant_id,
    name,
    description,
    amount,
    frequency,
    is_active
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440000', 'Registration Fee', 'One-time registration fee for new members', 10000.00, 'one_time', true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Annual Membership Fee', 'Annual membership renewal fee', 5000.00, 'yearly', true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Development Levy', 'Quarterly development levy', 3000.00, 'quarterly', true)
ON CONFLICT DO NOTHING;
