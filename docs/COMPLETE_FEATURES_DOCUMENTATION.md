# FRSC Housing Management System - Complete Features Documentation

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Multi-Tenancy Architecture](#multi-tenancy-architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Core Modules](#core-modules)
5. [Payment System](#payment-system)
6. [White Labeling](#white-labeling)
7. [Landing Page Builder](#landing-page-builder)
8. [Custom Domains](#custom-domains)
9. [Reports & Analytics](#reports--analytics)
10. [API Endpoints](#api-endpoints)
11. [Database Schema](#database-schema)
12. [Security Features](#security-features)

---

## 1. System Overview

The FRSC Housing Management System is a comprehensive multi-tenant SaaS platform designed for housing cooperatives and property management organizations.

### Key Statistics
- **50+ Features** across all modules
- **8 Major Modules** (Contributions, Loans, Investments, Properties, etc.)
- **3 User Portals** (Super Admin, Business Admin, Member)
- **4 Payment Gateways** (Paystack, Remita, Stripe, Manual)
- **8 Report Types** with export capabilities
- **Multi-tenant** with subdomain and custom domain support

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS v4
- **UI Library**: Shadcn UI
- **State Management**: React Context + SWR
- **Charts**: Recharts
- **Database**: PostgreSQL (planned Laravel API)
- **Deployment**: Vercel

---

## 2. Multi-Tenancy Architecture

### Tenant Isolation
Each business (tenant) operates in complete isolation:
- Separate subdomain (e.g., `business.platform.com`)
- Optional custom domain (e.g., `www.business.com`)
- Isolated data storage
- Independent branding and configuration

### Tenant Context
\`\`\`typescript
interface Tenant {
  id: string
  name: string
  slug: string
  subdomain: string
  custom_domain?: string
  logo_url?: string
  status: 'active' | 'suspended' | 'trial'
  subscription_id: string
  created_at: Date
}
\`\`\`

### Middleware Routing
- Extracts tenant from subdomain or custom domain
- Injects tenant context into all requests
- Enforces tenant-scoped queries
- Protects super admin routes

---

## 3. User Roles & Permissions

### Role Hierarchy

#### Super Admin (Platform Level)
**Access**: Platform-wide management
**Permissions**:
- Manage all businesses
- Create/edit subscription packages
- Configure platform modules
- View platform analytics
- Manage super admin team
- Send platform-wide communications

**Dashboard**: `/super-admin`

#### Business Admin (Tenant Level)
**Access**: Full business management
**Permissions**:
- Manage members
- Configure business settings
- Approve loans and investments
- Generate reports
- Manage properties
- Configure payment gateways
- Customize branding (white label)
- Build landing pages
- Request custom domains

**Dashboard**: `/admin`

#### Manager (Tenant Level)
**Access**: Operational management
**Permissions**:
- View member information
- Process contributions
- Review loan applications
- Manage properties
- Generate reports
- Handle mail service

**Dashboard**: `/admin` (limited access)

#### Staff (Tenant Level)
**Access**: Data entry and basic operations
**Permissions**:
- Record contributions
- Update member information
- Process payments
- Handle maintenance requests

**Dashboard**: `/admin` (limited access)

#### Member/User (Tenant Level)
**Access**: Personal account management
**Permissions**:
- View personal dashboard
- Make contributions
- Apply for loans
- Invest in plans
- Browse properties
- Submit maintenance requests
- Use mail service
- View personal reports

**Dashboard**: `/dashboard`

---

## 4. Core Modules

### 4.1 Member Management

#### Registration Flow
1. **Basic Information**
   - Full name, email, phone
   - IPPIS number (auto-populated)
   - Password creation

2. **OTP Verification**
   - Email verification
   - Phone verification

3. **Subscription Selection**
   - Choose membership tier
   - Payment for subscription

4. **KYC Completion**
   - Personal information
   - Employment details
   - Next of kin
   - Document upload

#### KYC Requirements
**Step 1: Personal Information**
- Date of birth
- Gender
- Marital status
- Nationality
- State of origin
- LGA
- Residential address

**Step 2: Employment Information**
- Staff ID
- Rank/Position
- Department/Unit
- Command state
- Date of employment
- Years of service (auto-calculated)

**Step 3: Next of Kin**
- Full name
- Relationship
- Phone number
- Email
- Address

**Step 4: Documents**
- FRSC ID card
- Passport photograph
- Proof of address
- Bank details (Bank name, account number, BVN)

#### Member Features
- Profile management
- Membership upgrade
- Document management
- Activity history
- Notification preferences

---

### 4.2 Contributions Module

#### Features
- Monthly contribution tracking
- Payment history
- Overdue monitoring
- Bulk contribution upload
- Contribution reports

#### Contribution Plans
- Fixed monthly amount
- Percentage of salary
- Custom contribution schedules
- Grace period configuration
- Penalty for late payment

#### Payment Methods
- Wallet
- Paystack
- Remita
- Stripe
- Bank transfer (manual verification)

#### Admin Functions
- Create contribution plans
- Record contributions
- Bulk import contributions
- Generate contribution reports
- Send payment reminders

---

### 4.3 Loans Module

#### Loan Types
1. **Cash Loans**
   - Personal loans
   - Emergency loans
   - Development loans

2. **Property Loans**
   - Mortgage loans
   - Land purchase loans
   - Construction loans

#### Loan Features
- Multiple loan products
- Flexible repayment schedules
- Interest calculation
- Guarantor requirements
- Collateral management
- Loan calculator

#### Loan Application Process
1. Select loan product
2. Enter loan amount and tenor
3. Provide guarantor information
4. Upload required documents
5. Submit for approval

#### Loan Approval Workflow
1. **Pending** - Initial submission
2. **Under Review** - Admin reviewing
3. **Approved** - Loan approved
4. **Disbursed** - Funds released
5. **Active** - Repayment in progress
6. **Completed** - Fully repaid
7. **Rejected** - Application denied

#### Repayment Options
- Monthly deductions
- Lump sum payment
- Partial payments
- Early repayment (with rebate)

#### Loan Product Configuration
- Minimum/maximum amount
- Interest rate
- Repayment period
- Processing fee
- Insurance requirement
- Guarantor count
- Eligibility criteria

---

### 4.4 Investments Module

#### Investment Types
1. **Cash Investments**
   - Fixed deposits
   - Savings plans
   - Investment bonds

2. **Property Investments**
   - Real estate projects
   - Land banking
   - Property development

#### Investment Features
- Multiple investment plans
- ROI tracking
- Investment calculator
- Maturity notifications
- Dividend distribution

#### Investment Plans
- Minimum investment amount
- Expected ROI
- Investment duration
- Risk level
- Payout frequency

---

### 4.5 Property Management

#### Property Features
- Property listings
- Property details with gallery
- Expression of interest
- Payment tracking
- Allottee management
- Maintenance requests

#### Estate Management
- Estate overview
- Property inventory
- Allottee status
- Occupancy tracking
- Maintenance scheduling

#### Property Types
- Residential (apartments, houses, duplexes)
- Commercial (offices, shops)
- Land (plots, acres)

#### Property Status
- Available
- Reserved
- Sold
- Under construction
- Completed

#### Maintenance Requests
- Submit request
- Track status
- Upload photos
- Priority levels
- Assignment to staff
- Resolution tracking

---

### 4.6 Wallet System

#### Wallet Features
- Balance tracking
- Top-up wallet
- Transfer funds
- Transaction history
- Payment for services

#### Wallet Transactions
- Contributions
- Loan repayments
- Investment purchases
- Property payments
- Peer-to-peer transfers

#### Top-up Methods
- Paystack
- Remita
- Stripe
- Bank transfer

---

### 4.7 Mail Service

#### Features
- Internal messaging
- Compose mail
- Inbox management
- Sent items
- Drafts
- Attachments
- Read receipts

#### Admin Features
- Bulk messaging
- Department-wise messaging
- Announcement broadcasts
- Mail templates

---

### 4.8 Statutory Charges

#### Features
- Charge management
- Payment tracking
- Charge history
- Automated billing
- Payment reminders

#### Charge Types
- Registration fees
- Annual dues
- Service charges
- Development levies
- Special assessments

---

## 5. Payment System

### 5.1 Payment Gateway Setup

#### Admin Configuration
Businesses can configure their own payment gateway credentials:

**Paystack**
- Public key
- Secret key
- Test mode toggle
- Webhook URL

**Remita**
- Merchant ID
- API key
- Service type ID
- Test mode toggle

**Stripe**
- Publishable key
- Secret key
- Webhook secret
- Test mode toggle

**Manual/Bank Transfer**
- Bank name
- Account number
- Account name
- Branch
- Payment instructions

#### Payment Flow
1. User initiates payment
2. System checks enabled gateways
3. User selects payment method
4. Payment processed via gateway
5. Webhook verification
6. Transaction recorded
7. User notified

### 5.2 Payment Verification

#### Bank Transfer Verification
1. User uploads payment proof
2. Admin receives notification
3. Admin reviews evidence
4. Admin approves/rejects
5. User notified of status

#### Automatic Verification
- Paystack webhook
- Remita callback
- Stripe webhook
- Real-time status updates

---

## 6. White Labeling

### 6.1 Brand Identity

#### Logo Management
- Header logo
- Footer logo
- Favicon
- Email logo
- Login page logo

#### Color Customization
- Primary color (#FDB11E default)
- Secondary color (#276254 default)
- Accent color
- Background colors
- Text colors
- Button colors

#### Typography
- Heading font family
- Body font family
- Font sizes
- Font weights
- Line heights

### 6.2 Content Customization

#### Company Information
- Company name
- Tagline
- Description
- Contact information
- Social media links

#### Legal Documents
- Terms of service URL
- Privacy policy URL
- Cookie policy URL

#### Footer Content
- Custom footer links
- Copyright text
- Additional information

### 6.3 Email Customization

#### Email Branding
- Email header
- Email footer
- Sender name
- Reply-to email
- Email signature

#### Email Templates
- Welcome email
- OTP verification
- Password reset
- Payment confirmation
- Loan approval
- Investment maturity

### 6.4 Feature Control

#### Module Visibility
Toggle modules on/off:
- Contributions
- Loans
- Investments
- Properties
- Mail service
- Reports
- Statutory charges

#### Navigation Customization
- Reorder menu items
- Hide/show menu items
- Custom menu labels

### 6.5 Advanced Customization

#### Custom CSS
- Inject custom styles
- Override default styles
- Advanced theming

---

## 7. Landing Page Builder

### 7.1 Builder Interface

#### Section Management
- Add sections
- Remove sections
- Reorder sections (drag-and-drop)
- Edit section content
- Preview changes

#### Available Sections
1. **Hero Section**
   - Headline
   - Subheadline
   - CTA buttons
   - Background image
   - Overlay color

2. **Features Section**
   - Feature cards
   - Icons
   - Descriptions
   - Layout options

3. **Statistics Section**
   - Metric cards
   - Numbers
   - Labels
   - Icons

4. **How It Works**
   - Step-by-step process
   - Icons
   - Descriptions

5. **Testimonials**
   - Customer quotes
   - Names
   - Photos
   - Ratings

6. **CTA Section**
   - Call-to-action text
   - Button
   - Background

7. **Properties Showcase**
   - Featured properties
   - Property cards
   - Filters

8. **Investment Plans**
   - Plan cards
   - ROI display
   - CTA buttons

9. **Loan Products**
   - Product cards
   - Interest rates
   - Apply buttons

### 7.2 Theme Customization

#### Colors
- Primary color
- Secondary color
- Accent color
- Background color
- Text color

#### Typography
- Font family
- Heading sizes
- Body text size

#### Layout
- Container width
- Section spacing
- Border radius

### 7.3 SEO Settings

#### Meta Tags
- Page title
- Meta description
- Meta keywords
- OG image
- Twitter card

### 7.4 Templates

#### Pre-built Templates
1. **Default Template**
   - FRSC branding
   - Gold and teal colors
   - All sections included

2. **Modern Template**
   - Clean design
   - Vibrant colors
   - Minimal sections

3. **Classic Template**
   - Traditional layout
   - Professional colors
   - Comprehensive sections

#### Template Application
- One-click template application
- Customize after applying
- Save as custom template

---

## 8. Custom Domains

### 8.1 Domain Management

#### Add Custom Domain
1. Enter domain name
2. Receive DNS instructions
3. Configure DNS records
4. Verify domain
5. SSL certificate issued

#### DNS Configuration
**Required Records**:
- A record: Points to platform IP
- CNAME record: www subdomain
- TXT record: Domain verification

#### Domain Verification
- Automatic verification check
- Verification token
- Status tracking
- Email notifications

#### SSL Certificate
- Automatic SSL provisioning
- Certificate renewal
- HTTPS enforcement

### 8.2 Domain Status

#### Status Types
- **Pending** - Awaiting DNS configuration
- **Verifying** - Checking DNS records
- **Active** - Domain verified and live
- **Failed** - Verification failed
- **Expired** - Domain expired

### 8.3 Super Admin Review

#### Domain Requests
- View all domain requests
- Approve/reject requests
- Add admin notes
- Track verification status

---

## 9. Reports & Analytics

### 9.1 Member Reports

#### Statistics
- Total members
- Active members
- Pending KYC
- New members (this month)

#### Reports
- Member list with filters
- KYC status report
- Activity report
- Demographics report

#### Export Options
- PDF
- Excel
- CSV

### 9.2 Financial Reports

#### Statistics
- Total revenue
- Total expenses
- Net profit
- Monthly revenue

#### Reports
- Income statement
- Cash flow report
- Transaction history
- Payment method breakdown

### 9.3 Contribution Reports

#### Statistics
- Total contributions
- Paid contributions
- Pending contributions
- Overdue contributions

#### Reports
- Contribution summary
- Payment history
- Defaulter list
- Contribution trends

### 9.4 Investment Reports

#### Statistics
- Total investments
- Active investments
- Matured investments
- Total ROI

#### Reports
- Investment portfolio
- Performance report
- Maturity schedule
- ROI analysis

### 9.5 Loan Reports

#### Statistics
- Total loans
- Active loans
- Completed loans
- Default rate

#### Reports
- Loan portfolio
- Repayment schedule
- Default analysis
- Interest income

### 9.6 Property Reports

#### Statistics
- Total properties
- Available properties
- Sold properties
- Occupancy rate

#### Reports
- Property inventory
- Sales report
- Maintenance report
- Revenue by property

### 9.7 Mail Service Reports

#### Statistics
- Total messages
- Sent messages
- Received messages
- Response rate

#### Reports
- Communication log
- Department activity
- Response time analysis

### 9.8 Audit Reports

#### Statistics
- Total activities
- User activities
- Admin activities
- System events

#### Reports
- Activity log
- Security audit
- Module usage
- User access log

---

## 10. API Endpoints

### 10.1 Authentication

\`\`\`
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
POST   /api/auth/verify-otp        - Verify OTP
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
\`\`\`

### 10.2 Members

\`\`\`
GET    /api/members                - List members
GET    /api/members/:id            - Get member details
POST   /api/members                - Create member
PUT    /api/members/:id            - Update member
DELETE /api/members/:id            - Delete member
POST   /api/members/bulk-upload    - Bulk import members
\`\`\`

### 10.3 Contributions

\`\`\`
GET    /api/contributions          - List contributions
GET    /api/contributions/:id      - Get contribution details
POST   /api/contributions          - Record contribution
PUT    /api/contributions/:id      - Update contribution
POST   /api/contributions/bulk     - Bulk import contributions
\`\`\`

### 10.4 Loans

\`\`\`
GET    /api/loans                  - List loans
GET    /api/loans/:id              - Get loan details
POST   /api/loans                  - Apply for loan
PUT    /api/loans/:id              - Update loan
POST   /api/loans/:id/approve      - Approve loan
POST   /api/loans/:id/disburse     - Disburse loan
POST   /api/loans/:id/repay        - Make repayment
\`\`\`

### 10.5 Investments

\`\`\`
GET    /api/investments            - List investments
GET    /api/investments/:id        - Get investment details
POST   /api/investments            - Make investment
PUT    /api/investments/:id        - Update investment
POST   /api/investments/:id/mature - Mature investment
\`\`\`

### 10.6 Properties

\`\`\`
GET    /api/properties             - List properties
GET    /api/properties/:id         - Get property details
POST   /api/properties             - Create property
PUT    /api/properties/:id         - Update property
DELETE /api/properties/:id         - Delete property
POST   /api/properties/:id/interest - Express interest
\`\`\`

### 10.7 Wallet

\`\`\`
GET    /api/wallet/balance         - Get wallet balance
POST   /api/wallet/top-up          - Top up wallet
POST   /api/wallet/transfer        - Transfer funds
GET    /api/wallet/transactions    - Transaction history
\`\`\`

### 10.8 Payments

\`\`\`
POST   /api/payments/initialize    - Initialize payment
POST   /api/payments/verify        - Verify payment
POST   /api/payments/callback      - Payment callback
\`\`\`

### 10.9 Reports

\`\`\`
GET    /api/reports/members        - Member reports
GET    /api/reports/financial      - Financial reports
GET    /api/reports/contributions  - Contribution reports
GET    /api/reports/investments    - Investment reports
GET    /api/reports/loans          - Loan reports
GET    /api/reports/properties     - Property reports
GET    /api/reports/audit          - Audit reports
\`\`\`

### 10.10 Admin

\`\`\`
GET    /api/admin/dashboard        - Admin dashboard stats
GET    /api/admin/settings         - Get settings
PUT    /api/admin/settings         - Update settings
POST   /api/admin/white-label      - Update white label
POST   /api/admin/landing-page     - Update landing page
POST   /api/admin/payment-gateways - Configure payment gateways
POST   /api/admin/custom-domains   - Request custom domain
\`\`\`

### 10.11 Super Admin

\`\`\`
GET    /api/super-admin/businesses - List businesses
POST   /api/super-admin/businesses - Create business
GET    /api/super-admin/packages   - List packages
POST   /api/super-admin/packages   - Create package
GET    /api/super-admin/subscriptions - List subscriptions
POST   /api/super-admin/subscriptions - Create subscription
GET    /api/super-admin/domains    - List domain requests
POST   /api/super-admin/domains/:id/approve - Approve domain
\`\`\`

---

## 11. Database Schema

### 11.1 Multi-Tenancy Tables

\`\`\`sql
-- Tenants
tenants (
  id, name, slug, subdomain, custom_domain,
  logo_url, status, subscription_id,
  created_at, updated_at
)

-- Packages
packages (
  id, name, description, price, billing_cycle,
  max_members, max_properties, features,
  created_at, updated_at
)

-- Subscriptions
subscriptions (
  id, tenant_id, package_id, status,
  start_date, end_date, auto_renew,
  created_at, updated_at
)
\`\`\`

### 11.2 User Tables

\`\`\`sql
-- Users
users (
  id, tenant_id, email, password, first_name,
  last_name, phone, role, status, ippis_number,
  created_at, updated_at
)

-- KYC
kyc_submissions (
  id, user_id, personal_info, employment_info,
  nok_info, documents, status, verified_at,
  created_at, updated_at
)
\`\`\`

### 11.3 Financial Tables

\`\`\`sql
-- Contributions
contributions (
  id, tenant_id, user_id, amount, payment_date,
  payment_method, status, reference,
  created_at, updated_at
)

-- Loans
loans (
  id, tenant_id, user_id, loan_product_id,
  amount, interest_rate, tenor, status,
  disbursed_at, created_at, updated_at
)

-- Investments
investments (
  id, tenant_id, user_id, investment_plan_id,
  amount, expected_roi, maturity_date, status,
  created_at, updated_at
)
\`\`\`

### 11.4 Property Tables

\`\`\`sql
-- Properties
properties (
  id, tenant_id, title, description, type,
  price, location, status, images,
  created_at, updated_at
)

-- Estates
estates (
  id, tenant_id, name, location, total_units,
  occupied_units, amenities,
  created_at, updated_at
)
\`\`\`

### 11.5 Configuration Tables

\`\`\`sql
-- White Label Settings
white_label_settings (
  id, tenant_id, logo_url, primary_color,
  secondary_color, font_family, custom_css,
  created_at, updated_at
)

-- Payment Gateway Settings
payment_gateway_settings (
  id, tenant_id, gateway_name, credentials,
  is_enabled, is_test_mode,
  created_at, updated_at
)

-- Landing Pages
landing_pages (
  id, tenant_id, sections, theme, seo_settings,
  is_published, created_at, updated_at
)

-- Custom Domains
custom_domains (
  id, tenant_id, domain, verification_token,
  status, dns_records, ssl_status,
  created_at, updated_at
)
\`\`\`

---

## 12. Security Features

### 12.1 Authentication
- Password hashing (bcrypt)
- JWT tokens
- Session management
- OTP verification
- Password reset flow

### 12.2 Authorization
- Role-based access control (RBAC)
- Permission-based access
- Tenant-scoped queries
- API route protection

### 12.3 Data Security
- Tenant isolation
- Encrypted sensitive data
- SQL injection prevention
- XSS protection
- CSRF protection

### 12.4 Audit Logging
- User activity tracking
- Admin action logging
- System event logging
- Security event monitoring

### 12.5 Compliance
- GDPR compliance
- Data export
- Data deletion
- Privacy policy
- Terms of service

---

## 13. Integration Points

### 13.1 Payment Gateways
- Paystack API
- Remita API
- Stripe API
- Webhook handling

### 13.2 Email Service
- SMTP configuration
- Email templates
- Transactional emails
- Bulk emails

### 13.3 SMS Service
- SMS gateway integration
- OTP delivery
- Notifications

### 13.4 Storage
- Vercel Blob
- AWS S3
- File upload
- Document management

### 13.5 Analytics
- Google Analytics
- Custom event tracking
- User behavior analytics

---

## 14. Performance Optimization

### 14.1 Frontend
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies

### 14.2 Backend
- Database indexing
- Query optimization
- API caching
- Rate limiting

### 14.3 Deployment
- CDN integration
- Edge caching
- Load balancing
- Auto-scaling

---

## 15. Monitoring & Logging

### 15.1 Application Monitoring
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring
- Alert system

### 15.2 Logging
- Application logs
- Error logs
- Access logs
- Audit logs

---

**Document Version**: 2.0.0  
**Last Updated**: January 2025  
**Status**: Complete and Production Ready

---

This documentation covers all features implemented in the FRSC Housing Management System. For API-specific details, refer to the Laravel API Documentation. For mobile app development, refer to the Flutter Mobile App Documentation.
