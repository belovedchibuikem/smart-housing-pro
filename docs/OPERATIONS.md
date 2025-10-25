# Operations Guide

## Environment Variables

Backend (.env):
- APP_URL: e.g. http://localhost:8000
- PAYMENT_CALLBACK_URL: e.g. ${APP_URL}/api/payments/callback
- PAYSTACK_PUBLIC_KEY, PAYSTACK_SECRET_KEY
- REMITA_MERCHANT_ID, REMITA_API_KEY, REMITA_SERVICE_TYPE_ID
- STRIPE_SECRET, STRIPE_PUBLIC
- TENANCY_DB_PREFIX, TENANCY_DB_SUFFIX, TENANCY_TEMPLATE_CONNECTION

Frontend (.env.local):
- NEXT_PUBLIC_API_BASE_URL: e.g. http://localhost:8000/api

## Tenancy & Domains
- Use subdomains or custom domains per tenant. The frontend forwards `X-Forwarded-Host` to the API to resolve tenant context.
- Provision tenant via `POST /api/super-admin/tenants` with `name`, `slug`, and optional `custom_domain`.

## Payments & Webhooks
- Configure provider keys in API env.
- Set webhook URLs:
  - Paystack: `${APP_URL}/api/payments/webhook/paystack`
  - Stripe: `${APP_URL}/api/payments/webhook/stripe`
  - Remita: `${APP_URL}/api/payments/webhook/remita`
- Wallet funding is credited automatically on successful webhook events.

## Seeding
- Tenant seeder initializes roles and default landing page config.

## CI
- GitHub Actions `.github/workflows/ci.yml` validates API PHP syntax and lints/builds frontend.
