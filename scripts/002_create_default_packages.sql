-- Create Default Subscription Packages

-- Starter Package
INSERT INTO packages (name, slug, description, price, billing_cycle, trial_days, is_active, is_featured, limits)
VALUES (
    'Starter',
    'starter',
    'Perfect for small cooperatives getting started',
    29.99,
    'monthly',
    14,
    true,
    false,
    '{
        "max_members": 100,
        "max_properties": 20,
        "max_loan_products": 5,
        "max_contribution_plans": 3,
        "max_investment_plans": 2,
        "storage_gb": 5,
        "max_admins": 2
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    limits = EXCLUDED.limits;

-- Professional Package
INSERT INTO packages (name, slug, description, price, billing_cycle, trial_days, is_active, is_featured, limits)
VALUES (
    'Professional',
    'professional',
    'For growing cooperatives with advanced needs',
    79.99,
    'monthly',
    14,
    true,
    true,
    '{
        "max_members": 500,
        "max_properties": 100,
        "max_loan_products": 20,
        "max_contribution_plans": 10,
        "max_investment_plans": 10,
        "storage_gb": 25,
        "max_admins": 5
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    limits = EXCLUDED.limits;

-- Enterprise Package
INSERT INTO packages (name, slug, description, price, billing_cycle, trial_days, is_active, is_featured, limits)
VALUES (
    'Enterprise',
    'enterprise',
    'Unlimited features for large organizations',
    199.99,
    'monthly',
    14,
    true,
    false,
    '{
        "max_members": -1,
        "max_properties": -1,
        "max_loan_products": -1,
        "max_contribution_plans": -1,
        "max_investment_plans": -1,
        "storage_gb": 100,
        "max_admins": -1
    }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    limits = EXCLUDED.limits;

-- Link all modules to all packages (can be customized later)
INSERT INTO package_modules (package_id, module_id, limits)
SELECT p.id, m.id, '{}'::jsonb
FROM packages p
CROSS JOIN modules m
ON CONFLICT (package_id, module_id) DO NOTHING;
