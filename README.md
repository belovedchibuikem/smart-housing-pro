# FRSC Housing Management System - Multi-Tenant SaaS Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/belovedchibuikem-3779s-projects/v0-housing-management-web-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/vok5ecKa2sX)

## 🏢 Overview

The FRSC Housing Management System is a comprehensive multi-tenant SaaS platform designed for housing cooperatives, real estate management companies, and property management organizations. Built with Next.js 14, TypeScript, and Tailwind CSS, it provides a complete solution for managing members, contributions, loans, investments, properties, and more.

## ✨ Key Features

### 🎯 Multi-Tenancy & SaaS
- **Subdomain-based tenancy** - Each business gets their own subdomain (e.g., `business.platform.com`)
- **Custom domain support** - Businesses can use their own domains with DNS verification
- **White labeling** - Full branding customization (logo, colors, fonts, content)
- **Landing page builder** - Drag-and-drop page builder with templates
- **Package management** - Flexible subscription plans with module-based features

### 👥 Member Management
- **Member registration** - Multi-step registration with IPPIS integration
- **KYC verification** - 4-step KYC process with document upload
- **Member profiles** - Comprehensive member information with NOK details
- **Membership tiers** - Member and Non-Member categories with upgrade flows
- **Bulk operations** - Import members via CSV/Excel

### 💰 Financial Management
- **Contributions** - Monthly contribution tracking and payment
- **Loans** - Multiple loan products with flexible repayment schedules
- **Investments** - Cash and property investment plans with ROI tracking
- **Wallet system** - Internal wallet for transactions and transfers
- **Statutory charges** - Manage and collect statutory fees

### 🏘️ Property Management
- **Property listings** - Browse properties with advanced filters
- **Estate management** - Manage estates, allottees, and maintenance
- **Expression of interest** - Property booking and payment tracking
- **Maintenance requests** - Submit and track maintenance issues
- **Property reports** - Occupancy, revenue, and maintenance analytics

### 💳 Payment Integration
- **Multiple gateways** - Paystack, Remita, Stripe support
- **Payment gateway setup** - Businesses configure their own gateway credentials
- **Wallet payments** - Internal wallet transactions
- **Bank transfers** - Manual payment verification
- **Payment verification** - Admin approval workflow for bank transfers

### 📊 Reports & Analytics
- **Member reports** - KYC status, activity tracking, demographics
- **Financial reports** - Revenue, expenses, profit analysis
- **Contribution reports** - Payment tracking, overdue monitoring
- **Investment reports** - ROI tracking, performance metrics
- **Loan reports** - Disbursement, repayment, default analysis
- **Property reports** - Portfolio management, occupancy rates
- **Mail service reports** - Communication tracking, response times
- **Audit reports** - System activity logs, security audit trail

### 📧 Communication
- **Mail service** - Internal messaging system
- **Bulk messaging** - Send to all members or specific groups
- **Email notifications** - Automated email alerts
- **Document sharing** - Attach files to messages

### 🔐 Security & Access Control
- **Role-based access** - Super Admin, Admin, Manager, Staff, User roles
- **Permission management** - Granular permission control
- **Tenant isolation** - Complete data separation between businesses
- **Audit logging** - Track all system activities
- **Two-factor authentication** - Enhanced security (planned)

### 🎨 Customization
- **White label settings** - Brand identity, colors, typography
- **Landing page builder** - Visual page editor with sections
- **Email templates** - Customize email branding
- **Custom domains** - Use your own domain name
- **Theme customization** - Light/dark mode support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Payment gateway accounts (Paystack, Remita, or Stripe)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/your-repo/frsc-housing-management.git
cd frsc-housing-management
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. **Set up environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your configuration:
\`\`\`env
# Platform
NEXT_PUBLIC_PLATFORM_DOMAIN=https://yourplatform.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/frsc_housing

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx
PAYSTACK_SECRET_KEY=sk_test_xxx

# Remita
REMITA_MERCHANT_ID=xxx
REMITA_API_KEY=xxx
REMITA_SERVICE_TYPE_ID=xxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
\`\`\`

4. **Set up the database**
\`\`\`bash
# Run all SQL scripts in order
psql -U your_user -d frsc_housing -f scripts/001_create_multi_tenancy_schema.sql
psql -U your_user -d frsc_housing -f scripts/002_create_default_packages.sql
psql -U your_user -d frsc_housing -f scripts/003_create_landing_page_builder_schema.sql
psql -U your_user -d frsc_housing -f scripts/004_create_custom_domains_schema.sql
psql -U your_user -d frsc_housing -f scripts/005_create_super_admin_features_schema.sql
psql -U your_user -d frsc_housing -f scripts/006_create_housing_management_schema.sql
psql -U your_user -d frsc_housing -f scripts/007_seed_sample_data.sql
psql -U your_user -d frsc_housing -f scripts/008_create_payment_gateway_settings.sql
psql -U your_user -d frsc_housing -f scripts/009_create_white_label_settings.sql
psql -U your_user -d frsc_housing -f scripts/010_create_custom_domain_requests.sql
psql -U your_user -d frsc_housing -f scripts/011_create_landing_page_builder.sql
\`\`\`

5. **Run the development server**
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. **Access the application**
- Platform: http://localhost:3000
- Super Admin: http://localhost:3000/super-admin
- Business Admin: http://business.localhost:3000/admin (requires subdomain setup)

## 📁 Project Structure

\`\`\`
frsc-housing-management/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication pages
│   ├── admin/                    # Business admin dashboard
│   ├── dashboard/                # User dashboard
│   ├── super-admin/              # Platform super admin
│   ├── api/                      # API routes
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── admin/                    # Admin components
│   ├── dashboard/                # User dashboard components
│   ├── super-admin/              # Super admin components
│   ├── landing/                  # Landing page components
│   ├── kyc/                      # KYC components
│   ├── properties/               # Property components
│   ├── loans/                    # Loan components
│   └── ui/                       # Shadcn UI components
├── lib/                          # Utilities and helpers
│   ├── context/                  # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── payment/                  # Payment integrations
│   ├── tenant/                   # Tenant utilities
│   ├── types/                    # TypeScript types
│   └── utils.ts                  # Utility functions
├── scripts/                      # Database scripts
├── public/                       # Static assets
└── docs/                         # Documentation

\`\`\`

## 🎨 Design System

### Color Palette
- **Primary Gold**: #FDB11E - Main brand color
- **Secondary Teal**: #276254 - Accent color
- **Background**: #FAFAFA - Light background
- **Text**: #1A1A1A - Primary text
- **Muted**: #6B7280 - Secondary text

### Typography
- **Headings**: Inter (sans-serif)
- **Body**: Inter (sans-serif)
- **Monospace**: JetBrains Mono

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Laravel API Documentation](docs/LARAVEL_API_DOCUMENTATION_V2_SAAS.md)** - Complete API reference
- **[Flutter Mobile App Documentation](docs/FLUTTER_MOBILE_APP_DOCUMENTATION_V2_SAAS.md)** - Mobile app guide
- **[API Implementation Guide](docs/API_IMPLEMENTATION_GUIDE.md)** - Step-by-step API setup
- **[SaaS Transformation Summary](docs/SAAS_TRANSFORMATION_SUMMARY.md)** - Multi-tenancy overview
- **[Flutter Design Specifications](docs/FLUTTER_DESIGN_SPECIFICATIONS.md)** - Mobile UI/UX specs
- **[Flutter Component Library](docs/FLUTTER_COMPONENT_LIBRARY.md)** - Reusable widgets
- **[Flutter Implementation Roadmap](docs/FLUTTER_IMPLEMENTATION_ROADMAP.md)** - Development phases

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI
- **State Management**: React Context + SWR
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend (Planned)
- **Framework**: Laravel 10+
- **Database**: PostgreSQL
- **Authentication**: Laravel Sanctum
- **API**: RESTful API
- **Queue**: Laravel Queue
- **Storage**: AWS S3 / Vercel Blob

### Mobile (Planned)
- **Framework**: Flutter 3.x
- **Language**: Dart
- **State Management**: Provider / Riverpod
- **HTTP Client**: Dio
- **Local Storage**: Hive / Shared Preferences

## 🌐 Deployment

### Vercel Deployment
The application is optimized for Vercel deployment:

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Configure custom domain** (optional)
4. **Deploy** - Automatic deployments on push

### DNS Configuration
For multi-tenancy support:
- Set up wildcard subdomain: `*.yourplatform.com`
- Configure SSL certificates
- Point to Vercel nameservers

## 🧪 Testing

\`\`\`bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run linting
npm run lint

# Type checking
npm run type-check
\`\`\`

## 📈 Roadmap

### Phase 1: Core Platform (✅ Completed)
- [x] Multi-tenancy infrastructure
- [x] Super admin dashboard
- [x] Business onboarding
- [x] Member management
- [x] Financial modules
- [x] Property management
- [x] Payment integration

### Phase 2: Advanced Features (✅ Completed)
- [x] White labeling
- [x] Landing page builder
- [x] Custom domains
- [x] Payment gateway setup
- [x] Advanced reports
- [x] KYC system

### Phase 3: API & Mobile (🚧 In Progress)
- [ ] Laravel API development
- [ ] Flutter mobile app
- [ ] API documentation
- [ ] Mobile app testing

### Phase 4: Enhancements (📋 Planned)
- [ ] Two-factor authentication
- [ ] Advanced analytics
- [ ] Email service integration
- [ ] SMS notifications
- [ ] Automated backups
- [ ] Performance optimization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support and questions:
- **Email**: support@frschousing.com
- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues

## 🙏 Acknowledgments

- Built with [v0.app](https://v0.app)
- UI components from [Shadcn UI](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

**Version**: 2.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready

---

## 🔗 Quick Links

- [Live Demo](https://vercel.com/belovedchibuikem-3779s-projects/v0-housing-management-web-app)
- [v0 Project](https://v0.app/chat/projects/vok5ecKa2sX)
- [API Documentation](docs/LARAVEL_API_DOCUMENTATION_V2_SAAS.md)
- [Mobile App Guide](docs/FLUTTER_MOBILE_APP_DOCUMENTATION_V2_SAAS.md)
