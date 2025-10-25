# FRSC Housing Management System - Complete API Endpoints Specification

This document provides the **exact specification** of all API endpoints based on the current Next.js implementation. Use this as the source of truth for building the Laravel API.

---

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Admin Endpoints](#admin-endpoints)
3. [Domain Management](#domain-management)
4. [Membership Management](#membership-management)
5. [Onboarding](#onboarding)
6. [Payment Processing](#payment-processing)
7. [Subscription Management](#subscription-management)
8. [Super Admin Endpoints](#super-admin-endpoints)
9. [Tenant Management](#tenant-management)
10. [Wallet Management](#wallet-management)

---

## Authentication & Authorization

### Current Status
⚠️ **NOT IMPLEMENTED** - All routes currently have TODO comments for authentication

### Required Implementation
\`\`\`php
// All API routes must implement:
- Bearer token authentication (Laravel Sanctum)
- Role-based access control (RBAC)
- Tenant isolation (multi-tenancy)
- Rate limiting
\`\`\`

### Headers Required for All Requests
\`\`\`
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
X-Tenant-ID: {tenant_id} (optional, can be derived from token)
\`\`\`

---

## Admin Endpoints

### 1. Custom Domains Management

#### GET `/api/admin/custom-domains`
**Purpose:** Fetch all custom domain requests for the authenticated tenant

**Authentication:** Required (Admin role)

**Request Headers:**
\`\`\`
Authorization: Bearer {token}
\`\`\`

**Request Body:** None

**Response (200 OK):**
\`\`\`json
{
  "domains": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "domain_name": "example.com",
      "subdomain": "app",
      "full_domain": "app.example.com",
      "status": "pending|verified|failed",
      "status_message": "Awaiting DNS verification",
      "verification_token": "frsc-verify-abc123",
      "dns_records": [
        {
          "type": "CNAME",
          "name": "app",
          "value": "frsc-housing.vercel.app"
        },
        {
          "type": "TXT",
          "name": "_frsc-verify",
          "value": "frsc-verify-abc123"
        }
      ],
      "requested_at": "2024-01-15T10:00:00Z",
      "verified_at": "2024-01-16T10:00:00Z",
      "ssl_status": "pending|active|failed"
    }
  ]
}
\`\`\`

**Database Tables Used:**
- `custom_domains`
- `domain_dns_records`

---

#### POST `/api/admin/custom-domains`
**Purpose:** Create a new custom domain request

**Authentication:** Required (Admin role)

**Request Body:**
\`\`\`json
{
  "domain_name": "example.com",
  "subdomain": "app"  // Optional, if empty uses root domain
}
\`\`\`

**Validation Rules:**
\`\`\`php
'domain_name' => 'required|string|max:255|regex:/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/',
'subdomain' => 'nullable|string|max:63|regex:/^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$/'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Custom domain request created successfully",
  "domain": {
    "id": "uuid",
    "tenant_id": "uuid",
    "domain_name": "example.com",
    "subdomain": "app",
    "full_domain": "app.example.com",
    "status": "pending",
    "verification_token": "frsc-verify-xyz789",
    "dns_records": [
      {
        "type": "CNAME",
        "name": "app",
        "value": "frsc-housing.vercel.app"
      },
      {
        "type": "TXT",
        "name": "_frsc-verify",
        "value": "frsc-verify-xyz789"
      }
    ],
    "requested_at": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

**Error Responses:**
\`\`\`json
// 400 Bad Request
{
  "error": "Invalid domain format"
}

// 409 Conflict
{
  "error": "Domain already exists"
}
\`\`\`

---

### 2. Landing Page Builder

#### GET `/api/admin/landing-page`
**Purpose:** Fetch landing page configuration for the tenant

**Authentication:** Required (Admin role)

**Response (200 OK):**
\`\`\`json
{
  "page": {
    "id": "uuid",
    "tenant_id": "uuid",
    "is_published": true,
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "name": "Hero Section",
        "visible": true,
        "position": 0,
        "config": {
          "title": "Your Path to Homeownership Made Simple",
          "subtitle": "Join the FRSC Housing Cooperative...",
          "cta_text": "Become a Member",
          "cta_link": "/register",
          "show_stats": true
        }
      },
      {
        "id": "properties-1",
        "type": "properties",
        "name": "Properties",
        "visible": true,
        "position": 1,
        "config": {}
      }
    ],
    "theme": {
      "primary_color": "#FDB11E",
      "secondary_color": "#276254",
      "accent_color": "#10b981",
      "font_family": "Inter"
    },
    "seo": {
      "title": "FRSC Housing Management System",
      "description": "Your trusted partner in housing solutions",
      "keywords": "housing, cooperative, FRSC, properties"
    }
  }
}
\`\`\`

---

#### POST `/api/admin/landing-page`
**Purpose:** Update landing page configuration

**Authentication:** Required (Admin role)

**Request Body:**
\`\`\`json
{
  "sections": [
    {
      "id": "hero-1",
      "type": "hero",
      "name": "Hero Section",
      "visible": true,
      "position": 0,
      "config": {
        "title": "Updated Title",
        "subtitle": "Updated Subtitle"
      }
    }
  ],
  "theme": {
    "primary_color": "#FDB11E",
    "secondary_color": "#276254",
    "accent_color": "#10b981",
    "font_family": "Inter"
  },
  "seo": {
    "title": "New Title",
    "description": "New Description",
    "keywords": "new, keywords"
  }
}
\`\`\`

**Validation Rules:**
\`\`\`php
'sections' => 'required|array',
'sections.*.id' => 'required|string',
'sections.*.type' => 'required|in:hero,features,properties,investments,loans,how-it-works,cta,stats',
'sections.*.visible' => 'required|boolean',
'sections.*.position' => 'required|integer|min:0',
'theme.primary_color' => 'required|regex:/^#[0-9A-F]{6}$/i',
'theme.secondary_color' => 'required|regex:/^#[0-9A-F]{6}$/i',
'seo.title' => 'required|string|max:60',
'seo.description' => 'required|string|max:160'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Landing page saved successfully",
  "page": {
    "id": "uuid",
    "tenant_id": "uuid",
    "sections": [...],
    "theme": {...},
    "seo": {...}
  }
}
\`\`\`

---

#### POST `/api/admin/landing-page/publish`
**Purpose:** Publish or unpublish the landing page

**Authentication:** Required (Admin role)

**Request Body:**
\`\`\`json
{
  "is_published": true
}
\`\`\`

**Validation Rules:**
\`\`\`php
'is_published' => 'required|boolean'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Landing page published"
}
\`\`\`

---

### 3. Payment Gateway Settings

#### GET `/api/admin/payment-gateways`
**Purpose:** Fetch all payment gateway configurations for the tenant

**Authentication:** Required (Admin role)

**Response (200 OK):**
\`\`\`json
{
  "gateways": [
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "gateway_type": "paystack",
      "is_enabled": false,
      "is_test_mode": true,
      "public_key": "pk_test_xxxxx",
      "secret_key": "sk_test_xxxxx",
      "configuration": {},
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "gateway_type": "remita",
      "is_enabled": false,
      "is_test_mode": true,
      "merchant_id": "xxxxx",
      "api_key": "xxxxx",
      "service_type_id": "xxxxx",
      "configuration": {},
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "gateway_type": "stripe",
      "is_enabled": false,
      "is_test_mode": true,
      "public_key": "pk_test_xxxxx",
      "secret_key": "sk_test_xxxxx",
      "configuration": {},
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "tenant_id": "uuid",
      "gateway_type": "manual",
      "is_enabled": true,
      "is_test_mode": false,
      "bank_accounts": [
        {
          "bank_name": "First Bank",
          "account_number": "1234567890",
          "account_name": "FRSC Housing Cooperative"
        }
      ],
      "configuration": {},
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
\`\`\`

---

#### POST `/api/admin/payment-gateways`
**Purpose:** Create or update payment gateway settings

**Authentication:** Required (Admin role)

**Request Body (Paystack):**
\`\`\`json
{
  "gateway_type": "paystack",
  "is_enabled": true,
  "is_test_mode": false,
  "credentials": {
    "public_key": "pk_live_xxxxx",
    "secret_key": "sk_live_xxxxx"
  },
  "configuration": {
    "webhook_url": "https://example.com/webhook"
  }
}
\`\`\`

**Request Body (Remita):**
\`\`\`json
{
  "gateway_type": "remita",
  "is_enabled": true,
  "is_test_mode": false,
  "credentials": {
    "merchant_id": "xxxxx",
    "api_key": "xxxxx",
    "service_type_id": "xxxxx"
  },
  "configuration": {}
}
\`\`\`

**Request Body (Stripe):**
\`\`\`json
{
  "gateway_type": "stripe",
  "is_enabled": true,
  "is_test_mode": false,
  "credentials": {
    "public_key": "pk_live_xxxxx",
    "secret_key": "sk_live_xxxxx"
  },
  "configuration": {}
}
\`\`\`

**Request Body (Manual/Bank Transfer):**
\`\`\`json
{
  "gateway_type": "manual",
  "is_enabled": true,
  "is_test_mode": false,
  "bank_accounts": [
    {
      "bank_name": "First Bank of Nigeria",
      "account_number": "1234567890",
      "account_name": "FRSC Housing Cooperative"
    },
    {
      "bank_name": "GTBank",
      "account_number": "0987654321",
      "account_name": "FRSC Housing Cooperative"
    }
  ],
  "configuration": {}
}
\`\`\`

**Validation Rules:**
\`\`\`php
'gateway_type' => 'required|in:paystack,remita,stripe,manual',
'is_enabled' => 'required|boolean',
'is_test_mode' => 'required|boolean',
'credentials' => 'required_unless:gateway_type,manual|array',
'bank_accounts' => 'required_if:gateway_type,manual|array',
'bank_accounts.*.bank_name' => 'required|string',
'bank_accounts.*.account_number' => 'required|string',
'bank_accounts.*.account_name' => 'required|string'
\`\`\`

**Security Note:**
- All sensitive credentials (secret_key, api_key) must be encrypted before storing in database
- Use Laravel's `encrypt()` and `decrypt()` functions

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Payment gateway settings saved successfully",
  "gateway": {
    "id": "uuid",
    "tenant_id": "uuid",
    "gateway_type": "paystack",
    "is_enabled": true,
    "is_test_mode": false,
    "public_key": "pk_live_xxxxx",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

---

### 4. White Label Settings

#### GET `/api/admin/white-label`
**Purpose:** Fetch white label settings for the tenant

**Authentication:** Required (Admin role)

**Response (200 OK):**
\`\`\`json
{
  "settings": {
    "id": "uuid",
    "tenant_id": "uuid",
    "company_name": "FRSC Housing Cooperative",
    "company_tagline": "Building Dreams Together",
    "company_description": "Your trusted partner in housing solutions",
    "logo_url": "https://storage.example.com/logos/logo.png",
    "logo_dark_url": "https://storage.example.com/logos/logo-dark.png",
    "favicon_url": "https://storage.example.com/favicons/favicon.ico",
    "primary_color": "#FDB11E",
    "secondary_color": "#276254",
    "accent_color": "#10b981",
    "background_color": "#ffffff",
    "text_color": "#1f2937",
    "heading_font": "Inter",
    "body_font": "Inter",
    "login_background_url": "https://storage.example.com/backgrounds/login.jpg",
    "dashboard_hero_url": "https://storage.example.com/backgrounds/dashboard.jpg",
    "email_sender_name": "FRSC Housing",
    "email_reply_to": "support@frsc-housing.com",
    "email_footer_text": "© 2025 FRSC Housing Cooperative",
    "email_logo_url": "https://storage.example.com/logos/email-logo.png",
    "terms_url": "https://example.com/terms",
    "privacy_url": "https://example.com/privacy",
    "support_email": "support@frsc-housing.com",
    "support_phone": "+234 800 000 0000",
    "help_center_url": "https://help.frsc-housing.com",
    "footer_text": "© 2025 FRSC Housing Cooperative. All rights reserved.",
    "footer_links": [
      {
        "label": "About Us",
        "url": "/about"
      },
      {
        "label": "Contact",
        "url": "/contact"
      }
    ],
    "social_links": {
      "facebook": "https://facebook.com/frsc",
      "twitter": "https://twitter.com/frsc",
      "linkedin": "https://linkedin.com/company/frsc"
    },
    "enabled_modules": [
      "properties",
      "loans",
      "investments",
      "contributions",
      "wallet"
    ],
    "custom_css": ".custom-class { color: red; }",
    "is_active": true,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

---

#### POST `/api/admin/white-label`
**Purpose:** Update white label settings

**Authentication:** Required (Admin role)

**Request Body:**
\`\`\`json
{
  "company_name": "FRSC Housing Cooperative",
  "company_tagline": "Building Dreams Together",
  "company_description": "Your trusted partner in housing solutions",
  "logo_url": "https://storage.example.com/logos/logo.png",
  "primary_color": "#FDB11E",
  "secondary_color": "#276254",
  "heading_font": "Inter",
  "body_font": "Inter",
  "email_sender_name": "FRSC Housing",
  "email_reply_to": "support@frsc-housing.com",
  "support_email": "support@frsc-housing.com",
  "support_phone": "+234 800 000 0000",
  "footer_links": [
    {
      "label": "About Us",
      "url": "/about"
    }
  ],
  "social_links": {
    "facebook": "https://facebook.com/frsc"
  },
  "enabled_modules": [
    "properties",
    "loans"
  ],
  "custom_css": ".custom-class { color: red; }",
  "is_active": true
}
\`\`\`

**Validation Rules:**
\`\`\`php
'company_name' => 'required|string|max:255',
'company_tagline' => 'nullable|string|max:255',
'company_description' => 'nullable|string|max:1000',
'logo_url' => 'nullable|url',
'primary_color' => 'required|regex:/^#[0-9A-F]{6}$/i',
'secondary_color' => 'required|regex:/^#[0-9A-F]{6}$/i',
'heading_font' => 'required|string',
'body_font' => 'required|string',
'email_sender_name' => 'nullable|string|max:255',
'email_reply_to' => 'nullable|email',
'support_email' => 'nullable|email',
'support_phone' => 'nullable|string|max:20',
'footer_links' => 'nullable|array',
'footer_links.*.label' => 'required|string',
'footer_links.*.url' => 'required|string',
'social_links' => 'nullable|array',
'enabled_modules' => 'required|array',
'enabled_modules.*' => 'in:properties,loans,investments,contributions,wallet,mail_service',
'custom_css' => 'nullable|string|max:10000',
'is_active' => 'required|boolean'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "White label settings saved successfully",
  "settings": {
    "id": "uuid",
    "tenant_id": "uuid",
    ...
  }
}
\`\`\`

---

## Domain Management

### 1. Add Domain

#### POST `/api/domains/add`
**Purpose:** Add a new custom domain for a business

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "domain": "myhousing.com",
  "businessId": "uuid"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'domain' => 'required|string|regex:/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/',
'businessId' => 'required|uuid|exists:tenants,id'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "domain": {
    "id": "uuid",
    "domain": "myhousing.com",
    "business_id": "uuid",
    "is_verified": false,
    "verification_token": "frsc-verify-abc123",
    "ssl_status": "pending"
  },
  "dns_records": [
    {
      "type": "A",
      "name": "@",
      "value": "76.76.21.21",
      "ttl": 3600
    },
    {
      "type": "TXT",
      "name": "_frsc-verify",
      "value": "frsc-verify-abc123",
      "ttl": 3600
    }
  ]
}
\`\`\`

---

### 2. List Domains

#### GET `/api/domains/list`
**Purpose:** List all domains for a business

**Authentication:** Required

**Request Headers:**
\`\`\`
Authorization: Bearer {token}
X-Business-ID: {business_id}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "domains": [
    {
      "id": "uuid",
      "business_id": "uuid",
      "domain": "myhousing.com",
      "is_verified": true,
      "is_primary": true,
      "ssl_status": "active",
      "verified_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "business_id": "uuid",
      "domain": "housing.mycompany.com",
      "is_verified": false,
      "is_primary": false,
      "ssl_status": "pending",
      "verified_at": null
    }
  ]
}
\`\`\`

---

### 3. Verify Domain

#### POST `/api/domains/verify`
**Purpose:** Verify domain ownership via DNS records

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "domain": "myhousing.com",
  "verificationToken": "frsc-verify-abc123"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'domain' => 'required|string',
'verificationToken' => 'required|string'
\`\`\`

**Response (200 OK - Verified):**
\`\`\`json
{
  "success": true,
  "message": "Domain verified successfully",
  "verified": true
}
\`\`\`

**Response (200 OK - Not Verified):**
\`\`\`json
{
  "success": false,
  "message": "Domain verification failed. Please check your DNS records.",
  "verified": false
}
\`\`\`

---

## Membership Management

### 1. Upgrade Membership

#### POST `/api/membership/upgrade`
**Purpose:** Upgrade user from non-member to member status

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "userId": "uuid",
  "membershipType": "member"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'userId' => 'required|uuid|exists:users,id',
'membershipType' => 'required|in:member'
\`\`\`

**Business Logic:**
- Check if user is already a member
- Update user membership type
- Migrate non-member history:
  - Update loan interest rates to member rates
  - Migrate contribution history
  - Update property access levels
  - Add member badge
- Send confirmation email

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "membership_type": "member",
    "upgraded_at": "2024-01-15T10:00:00Z"
  },
  "message": "Membership upgraded successfully. All your history has been migrated."
}
\`\`\`

**Error Response (400 Bad Request):**
\`\`\`json
{
  "error": "User is already a member"
}
\`\`\`

---

## Onboarding

### 1. Business Onboarding

#### POST `/api/onboard`
**Purpose:** Create a new business (tenant) with admin user

**Authentication:** Not required (public endpoint)

**Request Body:**
\`\`\`json
{
  "businessInfo": {
    "name": "ABC Housing Cooperative",
    "subdomain": "abc-housing",
    "email": "admin@abc-housing.com",
    "phone": "+234 800 000 0000",
    "address": "123 Main Street, Lagos, Nigeria"
  },
  "adminInfo": {
    "name": "John Doe",
    "email": "john@abc-housing.com",
    "password": "SecurePassword123!",
    "password_confirmation": "SecurePassword123!"
  },
  "packageId": "uuid"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'businessInfo.name' => 'required|string|max:255',
'businessInfo.subdomain' => 'required|string|max:63|regex:/^[a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?$/|unique:tenants,slug',
'businessInfo.email' => 'required|email|unique:tenants,email',
'businessInfo.phone' => 'required|string|max:20',
'businessInfo.address' => 'required|string|max:500',
'adminInfo.name' => 'required|string|max:255',
'adminInfo.email' => 'required|email|unique:users,email',
'adminInfo.password' => 'required|string|min:8|confirmed',
'packageId' => 'required|uuid|exists:packages,id'
\`\`\`

**Business Logic:**
1. Create tenant record in central database
2. Create tenant-specific database
3. Run migrations on tenant database
4. Create admin user in tenant database
5. Create subscription record
6. Send verification email to admin
7. Set trial period (14 days)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "business": {
      "id": "uuid",
      "name": "ABC Housing Cooperative",
      "slug": "abc-housing",
      "email": "admin@abc-housing.com",
      "phone": "+234 800 000 0000",
      "address": "123 Main Street, Lagos, Nigeria",
      "package_id": "uuid",
      "status": "trial",
      "trial_ends_at": "2024-01-29T10:00:00Z",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "admin": {
      "id": "uuid",
      "business_id": "uuid",
      "email": "john@abc-housing.com",
      "name": "John Doe",
      "role": "admin",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "message": "Business created successfully. Please check your email to verify your account."
  }
}
\`\`\`

---

## Payment Processing

### 1. Initialize Payment

#### POST `/api/payments/initialize`
**Purpose:** Initialize a payment transaction

**Authentication:** Required

**Request Body (Card Payment via Paystack):**
\`\`\`json
{
  "amount": 50000,
  "email": "user@example.com",
  "paymentMethod": "card",
  "reference": "PAY-1234567890",
  "metadata": {
    "name": "John Doe",
    "phone": "+234 800 000 0000",
    "description": "Loan repayment",
    "loan_id": "uuid",
    "user_id": "uuid"
  }
}
\`\`\`

**Request Body (Remita Payment):**
\`\`\`json
{
  "amount": 50000,
  "email": "user@example.com",
  "paymentMethod": "remita",
  "reference": "PAY-1234567890",
  "metadata": {
    "name": "John Doe",
    "phone": "+234 800 000 0000",
    "description": "Contribution payment"
  }
}
\`\`\`

**Request Body (Wallet Payment):**
\`\`\`json
{
  "amount": 50000,
  "email": "user@example.com",
  "paymentMethod": "wallet",
  "reference": "WALLET-1234567890",
  "metadata": {
    "user_id": "uuid",
    "description": "Property payment"
  }
}
\`\`\`

**Request Body (Bank Transfer):**
\`\`\`json
{
  "amount": 50000,
  "email": "user@example.com",
  "paymentMethod": "bank",
  "reference": "BANK-1234567890",
  "metadata": {
    "description": "Investment payment"
  }
}
\`\`\`

**Validation Rules:**
\`\`\`php
'amount' => 'required|numeric|min:100',
'email' => 'required|email',
'paymentMethod' => 'required|in:card,remita,wallet,bank',
'reference' => 'nullable|string|unique:transactions,reference',
'metadata' => 'nullable|array'
\`\`\`

**Response (200 OK - Card Payment):**
\`\`\`json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/abc123",
    "reference": "PAY-1234567890",
    "accessCode": "abc123xyz"
  }
}
\`\`\`

**Response (200 OK - Remita Payment):**
\`\`\`json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "rrr": "123456789012",
    "status": "pending"
  }
}
\`\`\`

**Response (200 OK - Wallet Payment):**
\`\`\`json
{
  "success": true,
  "message": "Payment successful from wallet",
  "data": {
    "reference": "WALLET-1234567890",
    "status": "completed"
  }
}
\`\`\`

**Response (200 OK - Bank Transfer):**
\`\`\`json
{
  "success": true,
  "message": "Please complete bank transfer and upload evidence",
  "data": {
    "reference": "BANK-1234567890",
    "status": "pending",
    "bankDetails": {
      "bankName": "First Bank of Nigeria",
      "accountNumber": "1234567890",
      "accountName": "FRSC Housing Cooperative"
    }
  }
}
\`\`\`

---

### 2. Verify Payment

#### GET `/api/payments/verify?provider={provider}&reference={reference}`
**Purpose:** Verify payment status with payment gateway

**Authentication:** Required

**Query Parameters:**
\`\`\`
provider: paystack|remita
reference: PAY-1234567890
\`\`\`

**Validation Rules:**
\`\`\`php
'provider' => 'required|in:paystack,remita',
'reference' => 'required|string'
\`\`\`

**Response (200 OK - Paystack):**
\`\`\`json
{
  "success": true,
  "data": {
    "status": "success",
    "reference": "PAY-1234567890",
    "amount": 50000,
    "currency": "NGN",
    "paid_at": "2024-01-15T10:00:00Z",
    "channel": "card",
    "customer": {
      "email": "user@example.com"
    }
  }
}
\`\`\`

**Response (200 OK - Remita):**
\`\`\`json
{
  "success": true,
  "data": {
    "status": "success",
    "rrr": "123456789012",
    "amount": "50000.00",
    "transactiontime": "2024-01-15 10:00:00"
  }
}
\`\`\`

---

### 3. Payment Callback

#### GET `/api/payments/callback?reference={reference}&status={status}`
**Purpose:** Handle payment gateway callback/redirect

**Authentication:** Not required (called by payment gateway)

**Query Parameters:**
\`\`\`
reference: PAY-1234567890
status: success|failed
\`\`\`

**Response:** Redirects to appropriate page
\`\`\`
Success: /dashboard/payments/success?reference=PAY-1234567890
Failed: /dashboard/payments/failed?reference=PAY-1234567890
\`\`\`

---

## Subscription Management

### 1. Initialize Subscription

#### POST `/api/subscriptions/initialize`
**Purpose:** Initialize subscription payment

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "userId": "uuid",
  "packageId": "1",
  "paymentMethod": "paystack"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'userId' => 'required|uuid|exists:users,id',
'packageId' => 'required|string|exists:packages,id',
'paymentMethod' => 'required|in:paystack,remita,wallet'
\`\`\`

**Available Packages:**
\`\`\`json
{
  "1": {
    "name": "Weekly Basic",
    "price": 500,
    "duration": 7
  },
  "2": {
    "name": "Monthly Standard",
    "price": 1500,
    "duration": 30
  },
  "3": {
    "name": "Quarterly Premium",
    "price": 4000,
    "duration": 90
  },
  "4": {
    "name": "Yearly Elite",
    "price": 15000,
    "duration": 365
  }
}
\`\`\`

**Response (200 OK - Paystack):**
\`\`\`json
{
  "success": true,
  "paymentUrl": "https://checkout.paystack.com/abc123",
  "reference": "SUB_1705315200000_uuid"
}
\`\`\`

**Response (200 OK - Remita):**
\`\`\`json
{
  "success": true,
  "rrr": "REM_1705315200000_uuid",
  "paymentUrl": "https://remita.net/pay/abc123"
}
\`\`\`

**Response (200 OK - Wallet):**
\`\`\`json
{
  "success": true,
  "message": "Payment successful from wallet"
}
\`\`\`

---

### 2. Verify Subscription

#### POST `/api/subscriptions/verify`
**Purpose:** Verify subscription payment and activate subscription

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "reference": "SUB_1705315200000_uuid",
  "userId": "uuid",
  "packageId": "2"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'reference' => 'required|string',
'userId' => 'required|uuid|exists:users,id',
'packageId' => 'required|string|exists:packages,id'
\`\`\`

**Business Logic:**
1. Verify payment with gateway
2. Create subscription record
3. Set start and end dates based on package duration
4. Send confirmation email
5. Grant access to platform features

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "subscription": {
    "id": "uuid",
    "user_id": "uuid",
    "package_id": "2",
    "status": "active",
    "start_date": "2024-01-15T10:00:00Z",
    "end_date": "2024-02-15T10:00:00Z",
    "payment_reference": "SUB_1705315200000_uuid",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "message": "Subscription activated successfully"
}
\`\`\`

---

### 3. Renew Subscription

#### POST `/api/subscriptions/renew`
**Purpose:** Renew an expired subscription

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "subscriptionId": "uuid",
  "paymentMethod": "paystack"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'subscriptionId' => 'required|uuid|exists:subscriptions,id',
'paymentMethod' => 'required|in:paystack,remita,wallet'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "reference": "RENEW_1705315200000_uuid",
  "message": "Renewal payment initialized"
}
\`\`\`

---

## Super Admin Endpoints

### 1. Businesses Management

#### GET `/api/super-admin/businesses`
**Purpose:** Fetch all businesses (tenants)

**Authentication:** Required (Super Admin role)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "ABC Housing Cooperative",
      "slug": "abc-housing",
      "status": "active",
      "package_id": "uuid",
      "members_count": 150,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
\`\`\`

---

#### POST `/api/super-admin/businesses`
**Purpose:** Create a new business

**Authentication:** Required (Super Admin role)

**Request Body:**
\`\`\`json
{
  "name": "XYZ Housing Cooperative",
  "slug": "xyz-housing",
  "email": "admin@xyz-housing.com",
  "package_id": "uuid"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'name' => 'required|string|max:255',
'slug' => 'required|string|max:63|unique:tenants,slug',
'email' => 'required|email|unique:tenants,email',
'package_id' => 'required|uuid|exists:packages,id'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "XYZ Housing Cooperative",
    "slug": "xyz-housing",
    "email": "admin@xyz-housing.com",
    "package_id": "uuid",
    "status": "trial",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

---

### 2. Packages Management

#### GET `/api/super-admin/packages`
**Purpose:** Fetch all subscription packages

**Authentication:** Required (Super Admin role)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Starter",
      "price": 50000,
      "billing_cycle": "monthly",
      "features": {
        "max_members": 100,
        "max_properties": 50,
        "max_loans": 20,
        "max_contributions": 100,
        "max_mortgages": 10,
        "role_management": false
      }
    }
  ]
}
\`\`\`

---

#### POST `/api/super-admin/packages`
**Purpose:** Create a new package

**Authentication:** Required (Super Admin role)

**Request Body:**
\`\`\`json
{
  "name": "Enterprise",
  "price": 200000,
  "billing_cycle": "monthly",
  "features": {
    "max_members": 1000,
    "max_properties": 500,
    "max_loans": 200,
    "max_contributions": 1000,
    "max_mortgages": 100,
    "role_management": true,
    "custom_domain": true,
    "white_label": true
  }
}
\`\`\`

**Validation Rules:**
\`\`\`php
'name' => 'required|string|max:255',
'price' => 'required|numeric|min:0',
'billing_cycle' => 'required|in:monthly,quarterly,yearly',
'features' => 'required|array',
'features.max_members' => 'required|integer|min:1',
'features.max_properties' => 'required|integer|min:0',
'features.max_loans' => 'required|integer|min:0',
'features.max_contributions' => 'required|integer|min:0',
'features.max_mortgages' => 'required|integer|min:0',
'features.role_management' => 'required|boolean'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Enterprise",
    "price": 200000,
    "billing_cycle": "monthly",
    "features": {...},
    "created_at": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

---

### 3. Member Subscriptions Management

#### GET `/api/super-admin/member-subscriptions`
**Purpose:** Fetch all member subscriptions across all businesses

**Authentication:** Required (Super Admin role)

**Query Parameters:**
\`\`\`
?business_id=uuid (optional - filter by business)
?status=active|expired|cancelled (optional)
?page=1
?per_page=20
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_id": "uuid",
      "business_name": "ABC Housing Cooperative",
      "member_id": "uuid",
      "member_name": "John Doe",
      "member_email": "john@example.com",
      "package_id": "uuid",
      "package_name": "Monthly Standard",
      "status": "active",
      "start_date": "2024-01-15T10:00:00Z",
      "end_date": "2024-02-15T10:00:00Z",
      "amount_paid": 1500,
      "payment_reference": "SUB_1705315200000_uuid",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150
  }
}
\`\`\`

---

#### POST `/api/super-admin/member-subscriptions`
**Purpose:** Create a member subscription (for manual subscription creation by super admin)

**Authentication:** Required (Super Admin role)

**Request Body:**
\`\`\`json
{
  "business_id": "uuid",
  "member_id": "uuid",
  "package_id": "1",
  "duration_days": 30,
  "payment_method": "manual",
  "amount": 1500,
  "notes": "Manual subscription created by super admin"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'business_id' => 'required|uuid|exists:tenants,id',
'member_id' => 'required|uuid',
'package_id' => 'required|string',
'duration_days' => 'required|integer|min:1',
'payment_method' => 'required|in:manual,paystack,remita,wallet',
'amount' => 'required|numeric|min:0',
'notes' => 'nullable|string|max:1000'
\`\`\`

**Business Logic:**
1. Validate business and member exist
2. Create subscription record
3. Set start_date to now
4. Set end_date to start_date + duration_days
5. Mark as active
6. Send confirmation email to member
7. Log activity

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "member_id": "uuid",
    "package_id": "1",
    "status": "active",
    "start_date": "2024-01-15T10:00:00Z",
    "end_date": "2024-02-15T10:00:00Z",
    "amount_paid": 1500,
    "payment_method": "manual",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "message": "Member subscription created successfully"
}
\`\`\`

---

#### GET `/api/super-admin/member-subscriptions/:id`
**Purpose:** Get member subscription details

**Authentication:** Required (Super Admin role)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business": {
      "id": "uuid",
      "name": "ABC Housing Cooperative",
      "slug": "abc-housing"
    },
    "member": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+234 800 000 0000"
    },
    "package": {
      "id": "1",
      "name": "Monthly Standard",
      "price": 1500,
      "duration": 30
    },
    "status": "active",
    "start_date": "2024-01-15T10:00:00Z",
    "end_date": "2024-02-15T10:00:00Z",
    "amount_paid": 1500,
    "payment_method": "paystack",
    "payment_reference": "SUB_1705315200000_uuid",
    "notes": null,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

---

#### PUT `/api/super-admin/member-subscriptions/:id`
**Purpose:** Update member subscription (extend, cancel, etc.)

**Authentication:** Required (Super Admin role)

**Request Body:**
\`\`\`json
{
  "status": "cancelled",
  "end_date": "2024-02-20T10:00:00Z",
  "notes": "Cancelled due to member request"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'status' => 'sometimes|in:active,expired,cancelled',
'end_date' => 'sometimes|date|after:start_date',
'notes' => 'nullable|string|max:1000'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "end_date": "2024-02-20T10:00:00Z",
    "notes": "Cancelled due to member request",
    "updated_at": "2024-01-16T10:00:00Z"
  },
  "message": "Member subscription updated successfully"
}
\`\`\`

---

### 4. Business Subscriptions Management

#### GET `/api/super-admin/subscriptions`
**Purpose:** Fetch all business subscriptions (platform subscriptions)

**Authentication:** Required (Super Admin role)

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "business_id": "uuid",
      "business_name": "ABC Housing",
      "package_id": "uuid",
      "package_name": "Starter",
      "status": "active",
      "current_period_start": "2024-01-15T10:00:00Z",
      "current_period_end": "2024-02-15T10:00:00Z"
    }
  ]
}
\`\`\`

---

#### POST `/api/super-admin/subscriptions`
**Purpose:** Create a subscription for a business

**Authentication:** Required (Super Admin role)

**Request Body:**
\`\`\`json
{
  "business_id": "uuid",
  "package_id": "uuid",
  "billing_cycle": "monthly"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'business_id' => 'required|uuid|exists:tenants,id',
'package_id' => 'required|uuid|exists:packages,id',
'billing_cycle' => 'required|in:weekly,monthly,quarterly,yearly'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "business_id": "uuid",
    "package_id": "uuid",
    "billing_cycle": "monthly",
    "status": "active",
    "current_period_start": "2024-01-15T10:00:00Z",
    "current_period_end": "2024-02-15T10:00:00Z"
  }
}
\`\`\`

---

### 4. White Label Packages

#### GET `/api/super-admin/white-label-packages`
**Purpose:** Fetch all white label packages

**Authentication:** Required (Super Admin role)

**Response (200 OK):**
\`\`\`json
{
  "packages": [
    {
      "id": "uuid",
      "name": "Basic White Label",
      "description": "Essential branding customization",
      "features": [
        "Custom logo and colors",
        "Company name and tagline",
        "Email branding"
      ],
      "price": 50000,
      "billing_cycle": "monthly",
      "is_active": true
    },
    {
      "id": "uuid",
      "name": "Professional White Label",
      "description": "Advanced branding and customization",
      "features": [
        "All Basic features",
        "Custom domain support",
        "Typography customization",
        "Custom CSS",
        "Footer customization"
      ],
      "price": 150000,
      "billing_cycle": "monthly",
      "is_active": true
    }
  ]
}
\`\`\`

---

#### POST `/api/super-admin/white-label-packages`
**Purpose:** Create a new white label package

**Authentication:** Required (Super Admin role)

**Request Body:**
\`\`\`json
{
  "name": "Enterprise White Label",
  "description": "Complete white label solution",
  "features": [
    "All Professional features",
    "Multiple custom domains",
    "Priority support"
  ],
  "price": 500000,
  "billing_cycle": "monthly",
  "is_active": true
}
\`\`\`

**Validation Rules:**
\`\`\`php
'name' => 'required|string|max:255',
'description' => 'required|string|max:1000',
'features' => 'required|array',
'price' => 'required|numeric|min:0',
'billing_cycle' => 'required|in:monthly,quarterly,yearly',
'is_active' => 'required|boolean'
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "White label package created successfully"
}
\`\`\`

---

## Tenant Management

### 1. Get Current Tenant

#### GET `/api/tenant/current`
**Purpose:** Get current tenant information based on hostname

**Authentication:** Not required (uses hostname)

**Request Headers:**
\`\`\`
Host: abc-housing.frsc-platform.com
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "tenant": {
    "id": "uuid",
    "name": "FRSC Housing Cooperative",
    "slug": "frsc",
    "custom_domain": null,
    "logo_url": null,
    "primary_color": "#FDB11E",
    "secondary_color": "#276254",
    "contact_email": "info@frsc-housing.com",
    "contact_phone": "+234 800 000 0000",
    "address": "Abuja, Nigeria",
    "status": "active",
    "subscription_status": "active",
    "trial_ends_at": null,
    "subscription_ends_at": "2025-12-31T23:59:59Z",
    "settings": {},
    "metadata": {},
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

**Business Logic:**
- Extract subdomain or custom domain from hostname
- Query tenant by slug or custom_domain
- Return tenant configuration
- For localhost, return default/mock tenant

---

## Wallet Management

### 1. Transfer Funds

#### POST `/api/wallet/transfer`
**Purpose:** Transfer funds from one wallet to another

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "amount": 5000,
  "recipientId": "uuid",
  "note": "Payment for services",
  "senderId": "uuid"
}
\`\`\`

**Validation Rules:**
\`\`\`php
'amount' => 'required|numeric|min:100',
'recipientId' => 'required|uuid|exists:users,id',
'note' => 'nullable|string|max:500',
'senderId' => 'required|uuid|exists:users,id'
\`\`\`

**Business Logic:**
1. Verify sender has sufficient balance
2. Verify recipient exists and is active
3. Create debit transaction for sender
4. Create credit transaction for recipient
5. Update both wallet balances
6. Send notifications to both parties
7. Log transaction for audit trail

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Transfer completed successfully",
  "data": {
    "reference": "TRF-1705315200000",
    "amount": 5000,
    "recipientId": "uuid",
    "senderId": "uuid",
    "note": "Payment for services",
    "status": "completed",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
\`\`\`

**Error Response (400 Bad Request):**
\`\`\`json
{
  "error": "Insufficient wallet balance"
}
\`\`\`

---

## Authentication Endpoints (To Be Implemented)

### 1. Register

#### POST `/api/auth/register`
**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "password_confirmation": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+234 800 000 0000",
  "staff_id": "FRSC/2020/12345",
  "rank": "Marshal",
  "department": "Operations",
  "ippis_number": "IPPIS123456",
  "date_of_employment": "2020-01-15",
  "membership_type": "non-member"
}
\`\`\`

---

### 2. Login

#### POST `/api/auth/login`
**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
\`\`\`

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "token": "1|abc123xyz...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "membership_type": "member"
  }
}
\`\`\`

---

### 3. Logout

#### POST `/api/auth/logout`
**Authentication:** Required

**Response (200 OK):**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

---

### 4. Verify OTP

#### POST `/api/auth/verify-otp`
**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "otp": "123456"
}
\`\`\`

---

### 5. Resend OTP

#### POST `/api/auth/resend-otp`
**Request Body:**
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

---

## Missing Endpoints (To Be Implemented)

### User Dashboard
- GET `/api/user/profile` - Get user profile
- PUT `/api/user/profile` - Update user profile
- GET `/api/user/dashboard/stats` - Get dashboard statistics
- GET `/api/user/notifications` - Get user notifications
- PUT `/api/user/notifications/:id/read` - Mark notification as read

### KYC
- POST `/api/kyc/submit` - Submit KYC documents
- GET `/api/kyc/status` - Get KYC status
- PUT `/api/kyc/update` - Update KYC information

### Properties
- GET `/api/properties` - List all properties
- GET `/api/properties/:id` - Get property details
- POST `/api/properties/:id/express-interest` - Express interest in property
- GET `/api/user/properties` - Get user's properties
- GET `/api/user/properties/:id/allottees` - Get property allottees
- POST `/api/user/properties/:id/maintenance` - Submit maintenance request

### Loans
- GET `/api/loans` - List all loan products
- GET `/api/loans/:id` - Get loan product details
- POST `/api/loans/apply` - Apply for loan
- GET `/api/user/loans` - Get user's loans
- GET `/api/user/loans/:id` - Get loan details
- POST `/api/user/loans/:id/repay` - Make loan repayment
- GET `/api/user/loans/:id/schedule` - Get repayment schedule

### Investments
- GET `/api/investments` - List all investment plans
- GET `/api/investments/:id` - Get investment plan details
- POST `/api/investments/subscribe` - Subscribe to investment
- GET `/api/user/investments` - Get user's investments
- GET `/api/user/investments/:id` - Get investment details

### Contributions
- GET `/api/user/contributions` - Get user's contributions
- GET `/api/user/contributions/history` - Get contribution history
- POST `/api/user/contributions/pay` - Make contribution payment

### Wallet
- GET `/api/user/wallet` - Get wallet balance
- GET `/api/user/wallet/transactions` - Get wallet transactions
- POST `/api/user/wallet/top-up` - Top up wallet

### Mail Service
- GET `/api/user/mail` - Get user's mail
- GET `/api/user/mail/:id` - Get mail details
- POST `/api/user/mail/:id/reply` - Reply to mail
- POST `/api/user/mail/send` - Send new mail

### Documents
- GET `/api/user/documents` - Get user's documents
- POST `/api/user/documents/upload` - Upload document
- DELETE `/api/user/documents/:id` - Delete document

### Admin - Members
- GET `/api/admin/members` - List all members
- GET `/api/admin/members/:id` - Get member details
- PUT `/api/admin/members/:id` - Update member
- DELETE `/api/admin/members/:id` - Delete member
- GET `/api/admin/members/pending-kyc` - Get members with pending KYC
- PUT `/api/admin/members/:id/approve-kyc` - Approve member KYC
- PUT `/api/admin/members/:id/reject-kyc` - Reject member KYC

### Admin - Properties
- GET `/api/admin/properties` - List all properties
- POST `/api/admin/properties` - Create property
- GET `/api/admin/properties/:id` - Get property details
- PUT `/api/admin/properties/:id` - Update property
- DELETE `/api/admin/properties/:id` - Delete property
- GET `/api/admin/properties/:id/allottees` - Get property allottees
- POST `/api/admin/properties/:id/allottees` - Add allottee
- GET `/api/admin/properties/maintenance` - Get maintenance requests
- PUT `/api/admin/properties/maintenance/:id` - Update maintenance request

### Admin - Loans
- GET `/api/admin/loans` - List all loan products
- POST `/api/admin/loans` - Create loan product
- GET `/api/admin/loans/:id` - Get loan product details
- PUT `/api/admin/loans/:id` - Update loan product
- DELETE `/api/admin/loans/:id` - Delete loan product
- GET `/api/admin/loan-applications` - Get loan applications
- PUT `/api/admin/loan-applications/:id/approve` - Approve loan
- PUT `/api/admin/loan-applications/:id/reject` - Reject loan
- GET `/api/admin/loan-repayments` - Get loan repayments

### Admin - Investments
- GET `/api/admin/investments` - List all investment plans
- POST `/api/admin/investments` - Create investment plan
- GET `/api/admin/investments/:id` - Get investment plan details
- PUT `/api/admin/investments/:id` - Update investment plan
- DELETE `/api/admin/investments/:id` - Delete investment plan
- GET `/api/admin/investment-subscriptions` - Get investment subscriptions

### Admin - Contributions
- GET `/api/admin/contributions` - Get all contributions
- POST `/api/admin/contributions/bulk-upload` - Bulk upload contributions
- GET `/api/admin/contributions/pending` - Get pending contributions
- PUT `/api/admin/contributions/:id/verify` - Verify contribution

### Admin - Reports
- GET `/api/admin/reports/members` - Get member reports
- GET `/api/admin/reports/financial` - Get financial reports
- GET `/api/admin/reports/contributions` - Get contribution reports
- GET `/api/admin/reports/investments` - Get investment reports
- GET `/api/admin/reports/loans` - Get loan reports
- GET `/api/admin/reports/properties` - Get property reports
- GET `/api/admin/reports/mail-service` - Get mail service reports
- GET `/api/admin/reports/audit` - Get audit reports

### Admin - Statutory Charges
- GET `/api/admin/statutory-charges` - List all statutory charges
- POST `/api/admin/statutory-charges` - Create statutory charge
- PUT `/api/admin/statutory-charges/:id` - Update statutory charge
- DELETE `/api/admin/statutory-charges/:id` - Delete statutory charge

### Admin - Roles & Permissions
- GET `/api/admin/roles` - List all roles
- POST `/api/admin/roles` - Create role
- PUT `/api/admin/roles/:id` - Update role
- DELETE `/api/admin/roles/:id` - Delete role
- GET `/api/admin/users` - List all users
- POST `/api/admin/users` - Create user
- PUT `/api/admin/users/:id` - Update user
- DELETE `/api/admin/users/:id` - Delete user

---

## Database Tables Reference

### Central Database (Multi-Tenancy)
- `tenants` - Business/tenant information
- `packages` - Subscription packages (for businesses)
- `subscriptions` - Business subscriptions to platform
- `member_subscription_packages` - Subscription packages for members (managed by super-admin)
- `member_subscriptions` - Member subscriptions (managed by super-admin)
- `custom_domains` - Custom domain configurations
- `domain_dns_records` - DNS records for domains
- `white_label_packages` - White label package definitions

### Tenant Database (Per Business)
- `users` - User accounts
- `roles` - User roles
- `permissions` - Role permissions
- `properties` - Property listings
- `property_allottees` - Property allottees
- `maintenance_requests` - Maintenance requests
- `loans` - Loan products
- `loan_applications` - Loan applications
- `loan_repayments` - Loan repayments
- `investments` - Investment plans
- `investment_subscriptions` - Investment subscriptions
- `contributions` - User contributions
- `wallets` - User wallets
- `wallet_transactions` - Wallet transactions
- `transactions` - Payment transactions
- `mail_messages` - Mail service messages
- `documents` - User documents
- `kyc_submissions` - KYC submissions
- `statutory_charges` - Statutory charges
- `payment_gateway_settings` - Payment gateway configurations
- `white_label_settings` - White label customization
- `landing_page_configs` - Landing page builder configurations
- `activity_logs` - System activity logs

---

## Security Requirements

### 1. Authentication
- Use Laravel Sanctum for API token authentication
- Implement rate limiting (60 requests per minute for authenticated users)
- Implement CORS properly for frontend domain

### 2. Authorization
- Implement role-based access control (RBAC)
- Roles: super_admin, admin, manager, user
- Use Laravel Policies for authorization

### 3. Data Validation
- Validate all input data using Form Requests
- Sanitize user input to prevent XSS
- Use prepared statements to prevent SQL injection

### 4. Encryption
- Encrypt sensitive data (payment gateway credentials, API keys)
- Use HTTPS for all API communication
- Hash passwords using bcrypt

### 5. Multi-Tenancy
- Ensure tenant isolation at database level
- Validate tenant context in all requests
- Prevent cross-tenant data access

---

## Performance Optimization

### 1. Database
- Add indexes on frequently queried columns
- Use eager loading to prevent N+1 queries
- Implement database query caching

### 2. API Response
- Use API Resources for consistent response formatting
- Implement pagination for list endpoints
- Use HTTP caching headers

### 3. Background Jobs
- Use queues for heavy operations (email sending, report generation)
- Implement job retry logic
- Monitor queue performance

---

## Error Handling

### Standard Error Response Format
\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": ["Validation error message"]
  }
}
\`\`\`

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 422: Unprocessable Entity (validation failed)
- 500: Internal Server Error

---

## Testing Requirements

### 1. Unit Tests
- Test all service classes
- Test all model methods
- Test validation rules

### 2. Feature Tests
- Test all API endpoints
- Test authentication and authorization
- Test multi-tenancy isolation

### 3. Integration Tests
- Test payment gateway integration
- Test email sending
- Test file uploads

---

## Deployment Checklist

- [ ] Set up environment variables
- [ ] Configure database connections
- [ ] Set up queue workers
- [ ] Configure file storage (S3/local)
- [ ] Set up SSL certificates
- [ ] Configure CORS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Performance testing
- [ ] Security audit

---

## Next Steps

1. **Phase 1:** Implement authentication and authorization
2. **Phase 2:** Implement core user dashboard endpoints
3. **Phase 3:** Implement admin dashboard endpoints
4. **Phase 4:** Implement super admin endpoints
5. **Phase 5:** Implement payment processing
6. **Phase 6:** Testing and optimization
7. **Phase 7:** Deployment

---

**Document Version:** 1.0  
**Last Updated:** January 2024  
**Maintained By:** Development Team
0  
**Last Updated:** January 2024  
**Maintained By:** Development Team