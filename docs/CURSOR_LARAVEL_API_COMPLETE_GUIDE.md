# CURSOR AI IDE - Complete Laravel API Development Guide
## FRSC Housing Management Multi-Tenant SaaS Platform

> **Purpose**: This document provides comprehensive, step-by-step instructions for building the complete Laravel API backend for the FRSC Housing Management System using Cursor AI IDE. Follow this guide sequentially to build a production-ready multi-tenant SaaS API.

---

## Table of Contents
1. [Project Setup & Architecture](#1-project-setup--architecture)
2. [Database Design & Migrations](#2-database-design--migrations)
3. [Multi-Tenancy Implementation](#3-multi-tenancy-implementation)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Core API Endpoints](#5-core-api-endpoints)
6. [Payment Gateway Integration](#6-payment-gateway-integration)
7. [White Label & Customization](#7-white-label--customization)
8. [File Storage & Management](#8-file-storage--management)
9. [Email & Notifications](#9-email--notifications)
10. [Testing & Quality Assurance](#10-testing--quality-assurance)
11. [Deployment & DevOps](#11-deployment--devops)

---

## 1. Project Setup & Architecture

### 1.1 Initialize Laravel Project

\`\`\`bash
# Create new Laravel 11 project
composer create-project laravel/laravel frsc-housing-api
cd frsc-housing-api

# Install required packages
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require stancl/tenancy
composer require stripe/stripe-php
composer require paystack/paystack-php
composer require league/flysystem-aws-s3-v3
composer require intervention/image
composer require barryvdh/laravel-cors
composer require laravel/horizon
composer require predis/predis

# Install development packages
composer require --dev laravel/pint
composer require --dev pestphp/pest
composer require --dev pestphp/pest-plugin-laravel
\`\`\`

### 1.2 Environment Configuration

Create `.env` file with the following structure:

\`\`\`env
APP_NAME="FRSC Housing Management"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.frschousing.com

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=frsc_housing_central
DB_USERNAME=root
DB_PASSWORD=

# Tenant Database Configuration
TENANT_DB_CONNECTION=tenant
TENANT_DB_HOST=127.0.0.1
TENANT_DB_PORT=3306
TENANT_DB_USERNAME=root
TENANT_DB_PASSWORD=

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Payment Gateways (Central - for subscriptions)
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
STRIPE_KEY=
STRIPE_SECRET=
REMITA_MERCHANT_ID=
REMITA_API_KEY=
REMITA_SERVICE_TYPE_ID=

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@frschousing.com"
MAIL_FROM_NAME="${APP_NAME}"

# Queue Configuration
QUEUE_CONNECTION=redis
\`\`\`

### 1.3 Project Structure

\`\`\`
frsc-housing-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── Auth/
│   │   │   │   ├── Admin/
│   │   │   │   ├── User/
│   │   │   │   └── SuperAdmin/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   │   ├── Central/
│   │   └── Tenant/
│   ├── Services/
│   │   ├── PaymentService.php
│   │   ├── TenantService.php
│   │   ├── WhiteLabelService.php
│   │   └── NotificationService.php
│   ├── Repositories/
│   ├── Traits/
│   └── Observers/
├── database/
│   ├── migrations/
│   │   ├── central/
│   │   └── tenant/
│   ├── seeders/
│   └── factories/
├── routes/
│   ├── api.php
│   ├── tenant.php
│   └── central.php
└── tests/
    ├── Feature/
    └── Unit/
\`\`\`

---

## 2. Database Design & Migrations

### 2.1 Central Database (Multi-Tenant Management)

**Purpose**: Manages tenants, subscriptions, and global configurations.

#### Migration: Create Tenants Table

\`\`\`php
<?php
// database/migrations/central/2024_01_01_000001_create_tenants_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->unique(); // e.g., 'frsc-lagos'
            $table->string('business_name');
            $table->string('subdomain')->unique(); // e.g., 'lagos.frschousing.com'
            $table->string('custom_domain')->nullable()->unique();
            $table->boolean('custom_domain_verified')->default(false);
            $table->string('database_name'); // e.g., 'tenant_frsc_lagos'
            $table->enum('status', ['active', 'suspended', 'inactive'])->default('active');
            $table->foreignId('package_id')->constrained('subscription_packages');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->json('metadata')->nullable(); // Additional tenant info
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['subdomain', 'status']);
            $table->index('custom_domain');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
\`\`\`

#### Migration: Create Subscription Packages Table

\`\`\`php
<?php
// database/migrations/central/2024_01_01_000002_create_subscription_packages_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Basic, Professional, Enterprise
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('monthly_price', 10, 2);
            $table->decimal('annual_price', 10, 2);
            $table->integer('max_members')->default(100);
            $table->integer('max_properties')->default(10);
            $table->integer('max_admins')->default(5);
            $table->boolean('custom_domain_enabled')->default(false);
            $table->boolean('white_label_enabled')->default(false);
            $table->boolean('api_access_enabled')->default(false);
            $table->boolean('advanced_reports_enabled')->default(false);
            $table->json('features')->nullable(); // Additional features array
            $table->boolean('is_active')->default(true);
            $table->integer('trial_days')->default(14);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_packages');
    }
};
\`\`\`

#### Migration: Create Subscriptions Table

\`\`\`php
<?php
// database/migrations/central/2024_01_01_000003_create_subscriptions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('package_id')->constrained('subscription_packages');
            $table->enum('billing_cycle', ['monthly', 'annual']);
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['active', 'cancelled', 'expired', 'suspended'])->default('active');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->string('payment_gateway')->nullable(); // paystack, stripe, remita
            $table->string('gateway_subscription_id')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
            $table->index('ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
\`\`\`

#### Migration: Create Custom Domain Requests Table

\`\`\`php
<?php
// database/migrations/central/2024_01_01_000004_create_custom_domain_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_domain_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('domain');
            $table->enum('status', ['pending', 'approved', 'rejected', 'verified'])->default('pending');
            $table->string('verification_token')->unique();
            $table->boolean('dns_verified')->default(false);
            $table->boolean('ssl_verified')->default(false);
            $table->text('admin_notes')->nullable();
            $table->timestamp('requested_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            $table->index(['tenant_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_domain_requests');
    }
};
\`\`\`

### 2.2 Tenant Database (Business-Specific Data)

**Purpose**: Each tenant has their own database with isolated data.

#### Migration: Create Users Table (Tenant)

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000001_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('member_id')->unique(); // e.g., 'MEM-2024-0001'
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            
            // Employment Information
            $table->string('staff_id')->nullable();
            $table->string('ippis_number')->nullable()->unique();
            $table->string('rank')->nullable();
            $table->string('department')->nullable();
            $table->string('command_state')->nullable();
            $table->date('employment_date')->nullable();
            $table->integer('years_of_service')->nullable();
            
            // Personal Information
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->string('nationality')->default('Nigerian');
            $table->string('state_of_origin')->nullable();
            $table->string('lga')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            
            // KYC Information
            $table->enum('kyc_status', ['pending', 'submitted', 'approved', 'rejected'])->default('pending');
            $table->timestamp('kyc_submitted_at')->nullable();
            $table->timestamp('kyc_approved_at')->nullable();
            $table->text('kyc_rejection_reason')->nullable();
            
            // Membership Information
            $table->enum('membership_type', ['non-member', 'associate', 'full-member', 'life-member'])->default('non-member');
            $table->timestamp('membership_upgraded_at')->nullable();
            $table->decimal('membership_fee_paid', 10, 2)->default(0);
            
            // Financial Information
            $table->decimal('wallet_balance', 15, 2)->default(0);
            $table->decimal('contribution_balance', 15, 2)->default(0);
            $table->decimal('total_contributions', 15, 2)->default(0);
            $table->decimal('total_loans', 15, 2)->default(0);
            $table->decimal('total_investments', 15, 2)->default(0);
            
            // Account Status
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['email', 'status']);
            $table->index('member_id');
            $table->index('kyc_status');
            $table->index('membership_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
\`\`\`

#### Migration: Create KYC Documents Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000002_create_kyc_documents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kyc_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('document_type', ['frsc_id', 'passport', 'proof_of_address', 'other']);
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type'); // image/jpeg, application/pdf
            $table->integer('file_size'); // in bytes
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->index(['user_id', 'document_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kyc_documents');
    }
};
\`\`\`

#### Migration: Create Next of Kin Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000003_create_next_of_kin_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('next_of_kin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->enum('relationship', ['spouse', 'parent', 'sibling', 'child', 'other']);
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address');
            $table->timestamps();
            
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('next_of_kin');
    }
};
\`\`\`

#### Migration: Create Bank Accounts Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000004_create_bank_accounts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('bank_name');
            $table->string('account_number');
            $table->string('account_name');
            $table->string('bvn', 11)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_accounts');
    }
};
\`\`\`

#### Migration: Create Properties Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000005_create_properties_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('property_code')->unique(); // e.g., 'PROP-2024-0001'
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['apartment', 'duplex', 'bungalow', 'land', 'commercial']);
            $table->enum('status', ['available', 'reserved', 'sold', 'under_construction']);
            
            // Location
            $table->string('address');
            $table->string('city');
            $table->string('state');
            $table->string('country')->default('Nigeria');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Property Details
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->decimal('size_sqm', 10, 2)->nullable();
            $table->decimal('land_size_sqm', 10, 2)->nullable();
            
            // Pricing
            $table->decimal('price', 15, 2);
            $table->decimal('initial_deposit', 15, 2);
            $table->integer('payment_duration_months')->default(12);
            $table->decimal('monthly_payment', 15, 2)->nullable();
            
            // Media
            $table->json('images')->nullable(); // Array of image URLs
            $table->json('documents')->nullable(); // Array of document URLs
            $table->string('featured_image')->nullable();
            
            // Additional Info
            $table->json('amenities')->nullable(); // Array of amenities
            $table->integer('total_units')->default(1);
            $table->integer('available_units')->default(1);
            $table->boolean('is_featured')->default(false);
            $table->integer('views_count')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['status', 'type']);
            $table->index('property_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
\`\`\`

#### Migration: Create Property Allotments Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000006_create_property_allotments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_allotments', function (Blueprint $table) {
            $table->id();
            $table->string('allotment_code')->unique(); // e.g., 'ALLOT-2024-0001'
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'])->default('pending');
            
            // Payment Information
            $table->decimal('total_amount', 15, 2);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);
            $table->integer('payment_duration_months');
            $table->decimal('monthly_payment', 15, 2);
            $table->date('payment_start_date')->nullable();
            $table->date('payment_end_date')->nullable();
            
            // Dates
            $table->timestamp('applied_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            
            // Additional Info
            $table->text('notes')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'status']);
            $table->index('property_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_allotments');
    }
};
\`\`\`

#### Migration: Create Loan Plans Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000007_create_loan_plans_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., 'Personal Loan', 'Emergency Loan'
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['personal', 'emergency', 'business', 'education', 'housing']);
            
            // Loan Terms
            $table->decimal('min_amount', 15, 2);
            $table->decimal('max_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2); // Annual percentage
            $table->enum('interest_type', ['flat', 'reducing_balance'])->default('reducing_balance');
            $table->integer('min_tenor_months');
            $table->integer('max_tenor_months');
            
            // Eligibility
            $table->enum('required_membership', ['non-member', 'associate', 'full-member', 'life-member'])->default('associate');
            $table->decimal('min_contribution_balance', 15, 2)->default(0);
            $table->integer('min_months_as_member')->default(0);
            
            // Repayment Configuration
            $table->enum('repayment_source', ['salary', 'wallet', 'manual'])->default('salary');
            $table->boolean('auto_deduct_from_salary')->default(false);
            $table->decimal('processing_fee_percentage', 5, 2)->default(0);
            $table->decimal('insurance_fee_percentage', 5, 2)->default(0);
            
            // Guarantor Requirements
            $table->integer('guarantors_required')->default(0);
            $table->enum('guarantor_type', ['none', 'member', 'staff', 'any'])->default('none');
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('max_active_loans_per_user')->default(1);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_plans');
    }
};
\`\`\`

#### Migration: Create Loans Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000008_create_loans_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->string('loan_number')->unique(); // e.g., 'LOAN-2024-0001'
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('loan_plan_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'defaulted'])->default('pending');
            
            // Loan Details
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->decimal('interest_amount', 15, 2);
            $table->decimal('processing_fee', 15, 2)->default(0);
            $table->decimal('insurance_fee', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2); // Principal + Interest + Fees
            $table->integer('tenor_months');
            $table->decimal('monthly_repayment', 15, 2);
            
            // Repayment Tracking
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);
            $table->integer('payments_made')->default(0);
            $table->integer('payments_remaining');
            $table->date('next_payment_date')->nullable();
            
            // Dates
            $table->timestamp('applied_at');
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('disbursed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->date('repayment_start_date')->nullable();
            $table->date('repayment_end_date')->nullable();
            
            // Purpose & Notes
            $table->text('purpose')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('admin_notes')->nullable();
            
            // Approval
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->foreignId('disbursed_by')->nullable()->constrained('users');
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'status']);
            $table->index('loan_number');
            $table->index('next_payment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
\`\`\`

#### Migration: Create Loan Repayments Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000009_create_loan_repayments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_repayments', function (Blueprint $table) {
            $table->id();
            $table->string('repayment_code')->unique(); // e.g., 'REP-2024-0001'
            $table->foreignId('loan_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Payment Details
            $table->decimal('amount', 15, 2);
            $table->decimal('principal_paid', 15, 2);
            $table->decimal('interest_paid', 15, 2);
            $table->enum('payment_method', ['salary_deduction', 'wallet', 'bank_transfer', 'card', 'cash']);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            
            // Payment Gateway Info
            $table->string('payment_gateway')->nullable(); // paystack, stripe, remita
            $table->string('transaction_reference')->nullable();
            $table->string('gateway_response')->nullable();
            
            // Dates
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->index(['loan_id', 'status']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_repayments');
    }
};
\`\`\`

#### Migration: Create Investment Plans Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000010_create_investment_plans_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investment_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., 'Fixed Deposit', 'Mutual Fund'
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['fixed_deposit', 'mutual_fund', 'real_estate', 'bonds']);
            
            // Investment Terms
            $table->decimal('min_amount', 15, 2);
            $table->decimal('max_amount', 15, 2)->nullable();
            $table->decimal('roi_percentage', 5, 2); // Return on Investment percentage
            $table->integer('duration_months');
            $table->enum('payout_frequency', ['monthly', 'quarterly', 'annually', 'maturity'])->default('maturity');
            
            // Features
            $table->boolean('allows_top_up')->default(false);
            $table->boolean('allows_early_withdrawal')->default(false);
            $table->decimal('early_withdrawal_penalty', 5, 2)->default(0);
            $table->boolean('auto_rollover')->default(false);
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('max_investors')->nullable();
            $table->integer('current_investors')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investment_plans');
    }
};
\`\`\`

#### Migration: Create Investments Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000011_create_investments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->string('investment_code')->unique(); // e.g., 'INV-2024-0001'
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('investment_plan_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['active', 'matured', 'withdrawn', 'cancelled'])->default('active');
            
            // Investment Details
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('roi_percentage', 5, 2);
            $table->decimal('expected_returns', 15, 2);
            $table->decimal('total_returns', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);
            
            // Dates
            $table->date('start_date');
            $table->date('maturity_date');
            $table->timestamp('matured_at')->nullable();
            $table->timestamp('withdrawn_at')->nullable();
            
            // Additional Info
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['user_id', 'status']);
            $table->index('maturity_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investments');
    }
};
\`\`\`

#### Migration: Create Contributions Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000012_create_contributions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contributions', function (Blueprint $table) {
            $table->id();
            $table->string('contribution_code')->unique(); // e.g., 'CONT-2024-0001'
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Contribution Details
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['monthly', 'voluntary', 'special', 'penalty']);
            $table->enum('payment_method', ['salary_deduction', 'wallet', 'bank_transfer', 'card', 'cash']);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            
            // Payment Gateway Info
            $table->string('payment_gateway')->nullable();
            $table->string('transaction_reference')->nullable();
            $table->string('gateway_response')->nullable();
            
            // Dates
            $table->date('contribution_month'); // YYYY-MM-01 format
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('contribution_month');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contributions');
    }
};
\`\`\`

#### Migration: Create Wallet Transactions Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000013_create_wallet_transactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_code')->unique(); // e.g., 'TXN-2024-0001'
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Transaction Details
            $table->enum('type', ['credit', 'debit']);
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->enum('category', [
                'deposit', 'withdrawal', 'transfer_in', 'transfer_out',
                'loan_disbursement', 'loan_repayment', 'contribution',
                'investment', 'refund', 'fee', 'penalty', 'other'
            ]);
            $table->text('description');
            $table->string('reference')->nullable(); // Related entity reference
            
            // Payment Gateway Info (for deposits)
            $table->string('payment_gateway')->nullable();
            $table->string('transaction_reference')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('completed');
            
            // Transfer Info (if applicable)
            $table->foreignId('recipient_id')->nullable()->constrained('users');
            
            $table->timestamps();
            
            $table->index(['user_id', 'type']);
            $table->index('transaction_code');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
\`\`\`

#### Migration: Create Statutory Charges Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000014_create_statutory_charges_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statutory_charges', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., 'Annual Membership Fee', 'Registration Fee'
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->enum('frequency', ['one_time', 'monthly', 'quarterly', 'annually']);
            $table->enum('applies_to', ['all', 'new_members', 'full_members', 'specific'])->default('all');
            $table->boolean('is_mandatory')->default(true);
            $table->boolean('is_active')->default(true);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->timestamps();
            
            $table->index(['is_active', 'frequency']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statutory_charges');
    }
};
\`\`\`

#### Migration: Create User Statutory Charges Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000015_create_user_statutory_charges_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_statutory_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('statutory_charge_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'paid', 'waived', 'overdue'])->default('pending');
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_reference')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_statutory_charges');
    }
};
\`\`\`

#### Migration: Create Mail Service Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000016_create_mail_service_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mail_service', function (Blueprint $table) {
            $table->id();
            $table->string('mail_code')->unique(); // e.g., 'MAIL-2024-0001'
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('subject');
            $table->text('message');
            $table->enum('department', ['admin', 'finance', 'property', 'loans', 'support', 'general']);
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['pending', 'in_progress', 'resolved', 'closed'])->default('pending');
            $table->json('attachments')->nullable(); // Array of file URLs
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('department');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_service');
    }
};
\`\`\`

#### Migration: Create Mail Replies Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000017_create_mail_replies_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mail_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mail_id')->constrained('mail_service')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->boolean('is_admin_reply')->default(false);
            $table->timestamps();
            
            $table->index('mail_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_replies');
    }
};
\`\`\`

#### Migration: Create Maintenance Requests Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000018_create_maintenance_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_code')->unique(); // e.g., 'MAINT-2024-0001'
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('category', ['plumbing', 'electrical', 'structural', 'painting', 'cleaning', 'other']);
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->json('images')->nullable(); // Array of image URLs
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('completion_notes')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('property_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
};
\`\`\`

#### Migration: Create Documents Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000019_create_documents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('category', ['policy', 'form', 'agreement', 'report', 'certificate', 'other']);
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type'); // application/pdf, image/jpeg, etc.
            $table->integer('file_size'); // in bytes
            $table->boolean('is_public')->default(false); // Visible to all members
            $table->integer('download_count')->default(0);
            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['category', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
\`\`\`

#### Migration: Create Notifications Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000020_create_notifications_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['info', 'success', 'warning', 'error'])->default('info');
            $table->enum('category', [
                'loan', 'contribution', 'investment', 'property', 
                'payment', 'kyc', 'membership', 'system', 'other'
            ]);
            $table->string('action_url')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'is_read']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
\`\`\`

#### Migration: Create Payment Gateway Settings Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000021_create_payment_gateway_settings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_gateway_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('gateway', ['paystack', 'stripe', 'remita', 'manual'])->unique();
            $table->boolean('is_enabled')->default(false);
            $table->boolean('is_test_mode')->default(true);
            
            // Encrypted credentials (use Laravel encryption)
            $table->text('public_key')->nullable();
            $table->text('secret_key')->nullable();
            $table->text('merchant_id')->nullable();
            $table->text('api_key')->nullable();
            $table->text('service_type_id')->nullable();
            
            // Manual payment (bank accounts)
            $table->json('bank_accounts')->nullable(); // Array of bank account objects
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_gateway_settings');
    }
};
\`\`\`

#### Migration: Create White Label Settings Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000022_create_white_label_settings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('white_label_settings', function (Blueprint $table) {
            $table->id();
            
            // Branding
            $table->string('company_name')->nullable();
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->string('login_background_url')->nullable();
            
            // Colors
            $table->string('primary_color')->default('#FDB11E');
            $table->string('secondary_color')->default('#276254');
            $table->string('accent_color')->nullable();
            $table->string('background_color')->nullable();
            $table->string('text_color')->nullable();
            
            // Typography
            $table->string('heading_font')->default('Inter');
            $table->string('body_font')->default('Inter');
            
            // Email Branding
            $table->string('email_sender_name')->nullable();
            $table->string('email_reply_to')->nullable();
            $table->text('email_footer')->nullable();
            
            // Content
            $table->string('support_email')->nullable();
            $table->string('support_phone')->nullable();
            $table->string('terms_url')->nullable();
            $table->string('privacy_url')->nullable();
            $table->json('social_links')->nullable(); // {facebook, twitter, linkedin, instagram}
            $table->json('footer_links')->nullable(); // Array of {title, url}
            
            // Features
            $table->json('enabled_modules')->nullable(); // Array of enabled module names
            $table->text('custom_css')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('white_label_settings');
    }
};
\`\`\`

#### Migration: Create Landing Page Configurations Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000023_create_landing_page_configurations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_page_configurations', function (Blueprint $table) {
            $table->id();
            $table->json('sections'); // Array of section configurations
            $table->json('theme')->nullable(); // Color scheme, fonts, etc.
            $table->json('seo')->nullable(); // Meta title, description, keywords
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_page_configurations');
    }
};
\`\`\`

#### Migration: Create Activity Logs Table

\`\`\`php
<?php
// database/migrations/tenant/2024_01_01_000024_create_activity_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action'); // e.g., 'created', 'updated', 'deleted'
            $table->string('model'); // e.g., 'Loan', 'Property', 'User'
            $table->unsignedBigInteger('model_id')->nullable();
            $table->text('description');
            $table->json('changes')->nullable(); // Before/after values
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->index(['model', 'model_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
\`\`\`

---

## 3. Multi-Tenancy Implementation

### 3.1 Configure Tenancy Package

\`\`\`php
<?php
// config/tenancy.php

return [
    'tenant_model' => \App\Models\Central\Tenant::class,
    
    'id_generator' => \Stancl\Tenancy\TenantDatabaseManagers\MySQLDatabaseManager::class,
    
    'database' => [
        'prefix' => 'tenant_',
        'suffix' => '',
        'template_tenant_connection' => null,
    ],
    
    'redis' => [
        'prefix_base' => 'tenant',
        'prefixed_connections' => ['default'],
    ],
    
    'cache' => [
        'tag_base' => 'tenant',
    ],
    
    'filesystem' => [
        'suffix_base' => 'tenant',
        'disks' => ['local', 'public', 's3'],
    ],
    
    'features' => [
        \Stancl\Tenancy\Features\TenantConfig::class,
        \Stancl\Tenancy\Features\TenantDatabase::class,
        \Stancl\Tenancy\Features\TenantRedis::class,
        \Stancl\Tenancy\Features\TenantCache::class,
        \Stancl\Tenancy\Features\TenantFilesystem::class,
    ],
];
\`\`\`

### 3.2 Create Tenant Model

\`\`\`php
<?php
// app/Models/Central/Tenant.php

namespace App\Models\Central;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    protected $connection = 'mysql'; // Central database
    
    protected $fillable = [
        'tenant_id',
        'business_name',
        'subdomain',
        'custom_domain',
        'custom_domain_verified',
        'database_name',
        'status',
        'package_id',
        'trial_ends_at',
        'subscription_ends_at',
        'metadata',
    ];

    protected $casts = [
        'custom_domain_verified' => 'boolean',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function package()
    {
        return $this->belongsTo(SubscriptionPackage::class, 'package_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function customDomainRequests()
    {
        return $this->hasMany(CustomDomainRequest::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isOnTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription_ends_at && $this->subscription_ends_at->isFuture();
    }
}
\`\`\`

### 3.3 Create Tenant Identification Middleware

\`\`\`php
<?php
// app/Http/Middleware/IdentifyTenant.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Central\Tenant;
use Stancl\Tenancy\Tenancy;

class IdentifyTenant
{
    protected $tenancy;

    public function __construct(Tenancy $tenancy)
    {
        $this->tenancy = $tenancy;
    }

    public function handle(Request $request, Closure $next)
    {
        // Get host from request
        $host = $request->getHost();
        
        // Try to identify tenant by subdomain or custom domain
        $tenant = Tenant::where('subdomain', $host)
            ->orWhere('custom_domain', $host)
            ->where('status', 'active')
            ->first();

        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found or inactive'
            ], 404);
        }

        // Check subscription status
        if (!$tenant->isOnTrial() && !$tenant->hasActiveSubscription()) {
            return response()->json([
                'message' => 'Subscription expired. Please renew your subscription.'
            ], 403);
        }

        // Initialize tenant context
        $this->tenancy->initialize($tenant);

        return $next($request);
    }
}
\`\`\`

### 3.4 Create Tenant Service

\`\`\`php
<?php
// app/Services/TenantService.php

namespace App\Services;

use App\Models\Central\Tenant;
use App\Models\Central\SubscriptionPackage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class TenantService
{
    public function createTenant(array $data): Tenant
    {
        DB::beginTransaction();
        
        try {
            // Generate unique tenant ID and subdomain
            $tenantId = $this->generateTenantId($data['business_name']);
            $subdomain = $this->generateSubdomain($data['business_name']);
            $databaseName = 'tenant_' . $tenantId;

            // Create tenant record
            $tenant = Tenant::create([
                'tenant_id' => $tenantId,
                'business_name' => $data['business_name'],
                'subdomain' => $subdomain,
                'database_name' => $databaseName,
                'status' => 'active',
                'package_id' => $data['package_id'],
                'trial_ends_at' => now()->addDays(14), // 14-day trial
                'metadata' => $data['metadata'] ?? [],
            ]);

            // Create tenant database
            $this->createTenantDatabase($tenant);

            // Run tenant migrations
            $this->runTenantMigrations($tenant);

            // Seed default data
            $this->seedTenantData($tenant, $data);

            DB::commit();

            return $tenant;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    protected function generateTenantId(string $businessName): string
    {
        $base = Str::slug($businessName);
        $tenantId = $base;
        $counter = 1;

        while (Tenant::where('tenant_id', $tenantId)->exists()) {
            $tenantId = $base . '-' . $counter;
            $counter++;
        }

        return $tenantId;
    }

    protected function generateSubdomain(string $businessName): string
    {
        $base = Str::slug($businessName);
        $subdomain = $base . '.' . config('app.domain');
        $counter = 1;

        while (Tenant::where('subdomain', $subdomain)->exists()) {
            $subdomain = $base . '-' . $counter . '.' . config('app.domain');
            $counter++;
        }

        return $subdomain;
    }

    protected function createTenantDatabase(Tenant $tenant): void
    {
        $databaseName = $tenant->database_name;
        
        DB::statement("CREATE DATABASE IF NOT EXISTS `{$databaseName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    }

    protected function runTenantMigrations(Tenant $tenant): void
    {
        tenancy()->initialize($tenant);
        
        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);
        
        tenancy()->end();
    }

    protected function seedTenantData(Tenant $tenant, array $data): void
    {
        tenancy()->initialize($tenant);
        
        // Create admin user
        $admin = \App\Models\Tenant\User::create([
            'member_id' => 'MEM-' . date('Y') . '-0001',
            'first_name' => $data['admin_first_name'],
            'last_name' => $data['admin_last_name'],
            'email' => $data['admin_email'],
            'password' => bcrypt($data['admin_password']),
            'status' => 'active',
            'membership_type' => 'full-member',
            'kyc_status' => 'approved',
        ]);

        // Assign admin role
        $admin->assignRole('admin');

        // Create default payment gateway settings
        \App\Models\Tenant\PaymentGatewaySetting::create([
            'gateway' => 'manual',
            'is_enabled' => true,
            'is_test_mode' => false,
        ]);

        // Create default white label settings
        \App\Models\Tenant\WhiteLabelSetting::create([
            'company_name' => $data['business_name'],
            'primary_color' => '#FDB11E',
            'secondary_color' => '#276254',
        ]);
        
        tenancy()->end();
    }

    public function deleteTenant(Tenant $tenant): bool
    {
        DB::beginTransaction();
        
        try {
            // Drop tenant database
            DB::statement("DROP DATABASE IF EXISTS `{$tenant->database_name}`");
            
            // Delete tenant record
            $tenant->delete();
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
\`\`\`

---

## 4. Authentication & Authorization

### 4.1 Install and Configure Sanctum

\`\`\`bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
\`\`\`

### 4.2 Create Authentication Controller

\`\`\`php
<?php
// app/Http/Controllers/Api/Auth/AuthController.php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Tenant\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'staff_id' => 'nullable|string|max:50',
            'ippis_number' => 'nullable|string|max:50|unique:users',
        ]);

        // Generate member ID
        $lastMember = User::orderBy('id', 'desc')->first();
        $nextNumber = $lastMember ? intval(substr($lastMember->member_id, -4)) + 1 : 1;
        $memberId = 'MEM-' . date('Y') . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        $user = User::create([
            'member_id' => $memberId,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'staff_id' => $validated['staff_id'] ?? null,
            'ippis_number' => $validated['ippis_number'] ?? null,
            'status' => 'active',
            'membership_type' => 'non-member',
            'kyc_status' => 'pending',
        ]);

        // Assign default role
        $user->assignRole('member');

        // Generate OTP for email verification
        $otp = rand(100000, 999999);
        cache()->put("email_verification_{$user->id}", $otp, now()->addMinutes(10));

        // Send OTP email (implement email service)
        // Mail::to($user->email)->send(new VerificationOTP($otp));

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'user' => $user,
            'otp_sent' => true,
        ], 201);
    }

    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'otp' => 'required|string|size:6',
        ]);

        $cachedOtp = cache()->get("email_verification_{$validated['user_id']}");

        if (!$cachedOtp || $cachedOtp != $validated['otp']) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired OTP'],
            ]);
        }

        $user = User::findOrFail($validated['user_id']);
        $user->email_verified_at = now();
        $user->save();

        cache()->forget("email_verification_{$user->id}");

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Your account is inactive. Please contact support.'],
            ]);
        }

        // Update last login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load('roles'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->load('roles', 'permissions'),
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Generate reset token
        $token = Str::random(64);
        cache()->put("password_reset_{$user->id}", $token, now()->addHours(1));

        // Send reset email (implement email service)
        // Mail::to($user->email)->send(new PasswordResetLink($token));

        return response()->json([
            'message' => 'Password reset link sent to your email',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $validated['email'])->first();
        $cachedToken = cache()->get("password_reset_{$user->id}");

        if (!$cachedToken || $cachedToken !== $validated['token']) {
            throw ValidationException::withMessages([
                'token' => ['Invalid or expired reset token'],
            ]);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        cache()->forget("password_reset_{$user->id}");

        return response()->json([
            'message' => 'Password reset successfully',
        ]);
    }
}
\`\`\`

### 4.3 Setup Roles and Permissions

\`\`\`php
<?php
// database/seeders/RolesAndPermissionsSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User Management
            'view_users', 'create_users', 'edit_users', 'delete_users',
            
            // KYC Management
            'view_kyc', 'approve_kyc', 'reject_kyc',
            
            // Property Management
            'view_properties', 'create_properties', 'edit_properties', 'delete_properties',
            'approve_allotments', 'reject_allotments',
            
            // Loan Management
            'view_loans', 'create_loan_plans', 'edit_loan_plans', 'delete_loan_plans',
            'approve_loans', 'reject_loans', 'disburse_loans',
            
            // Investment Management
            'view_investments', 'create_investment_plans', 'edit_investment_plans', 'delete_investment_plans',
            
            // Contribution Management
            'view_contributions', 'record_contributions', 'edit_contributions',
            
            // Financial Management
            'view_financial_reports', 'manage_payments', 'manage_wallet',
            
            // Mail Service
            'view_mail', 'reply_mail', 'assign_mail',
            
            // Maintenance
            'view_maintenance', 'assign_maintenance', 'complete_maintenance',
            
            // Documents
            'view_documents', 'upload_documents', 'delete_documents',
            
            // Settings
            'manage_settings', 'manage_payment_gateways', 'manage_white_label',
            
            // Reports
            'view_reports', 'export_reports',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Super Admin (full access)
        $superAdmin = Role::create(['name' => 'super_admin']);
        $superAdmin->givePermissionTo(Permission::all());

        // Admin (most access)
        $admin = Role::create(['name' => 'admin']);
        $admin->givePermissionTo([
            'view_users', 'create_users', 'edit_users',
            'view_kyc', 'approve_kyc', 'reject_kyc',
            'view_properties', 'create_properties', 'edit_properties',
            'approve_allotments', 'reject_allotments',
            'view_loans', 'approve_loans', 'reject_loans', 'disburse_loans',
            'view_investments', 'view_contributions', 'record_contributions',
            'view_financial_reports', 'manage_payments',
            'view_mail', 'reply_mail', 'assign_mail',
            'view_maintenance', 'assign_maintenance',
            'view_documents', 'upload_documents',
            'view_reports', 'export_reports',
        ]);

        // Finance Manager
        $financeManager = Role::create(['name' => 'finance_manager']);
        $financeManager->givePermissionTo([
            'view_users',
            'view_loans', 'approve_loans', 'reject_loans', 'disburse_loans',
            'view_investments', 'view_contributions', 'record_contributions',
            'view_financial_reports', 'manage_payments',
            'view_reports', 'export_reports',
        ]);

        // Property Manager
        $propertyManager = Role::create(['name' => 'property_manager']);
        $propertyManager->givePermissionTo([
            'view_properties', 'create_properties', 'edit_properties',
            'approve_allotments', 'reject_allotments',
            'view_maintenance', 'assign_maintenance', 'complete_maintenance',
            'view_reports',
        ]);

        // Loan Officer
        $loanOfficer = Role::create(['name' => 'loan_officer']);
        $loanOfficer->givePermissionTo([
            'view_loans', 'approve_loans', 'reject_loans',
            'view_reports',
        ]);

        // Member (basic user)
        $member = Role::create(['name' => 'member']);
        $member->givePermissionTo([
            'view_properties',
            'view_loans',
            'view_investments',
            'view_contributions',
            'view_mail',
            'view_documents',
        ]);
    }
}
\`\`\`

---

## 5. Core API Endpoints

### 5.1 User/Member Endpoints

\`\`\`php
<?php
// app/Http/Controllers/Api/User/ProfileController.php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load([
            'nextOfKin',
            'bankAccounts',
            'kycDocuments',
        ]);

        return response()->json([
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'date_of_birth' => 'sometimes|date',
            'gender' => 'sometimes|in:male,female,other',
            'marital_status' => 'sometimes|in:single,married,divorced,widowed',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $validated = $request->validate([
            'avatar' => 'required|image|max:2048', // 2MB max
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('s3')->delete($user->avatar);
        }

        // Upload new avatar
        $path = $request->file('avatar')->store('avatars', 's3');

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar updated successfully',
            'avatar_url' => Storage::disk('s3')->url($path),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();

        $stats = [
            'wallet_balance' => $user->wallet_balance,
            'contribution_balance' => $user->contribution_balance,
            'total_contributions' => $user->total_contributions,
            'total_loans' => $user->total_loans,
            'total_investments' => $user->total_investments,
            'active_loans_count' => $user->loans()->where('status', 'active')->count(),
            'active_investments_count' => $user->investments()->where('status', 'active')->count(),
            'pending_allotments_count' => $user->propertyAllotments()->where('status', 'pending')->count(),
            'unread_notifications_count' => $user->notifications()->where('is_read', false)->count(),
        ];

        $recentTransactions = $user->walletTransactions()
            ->latest()
            ->take(5)
            ->get();

        $upcomingPayments = $user->loanRepayments()
            ->where('status', 'pending')
            ->where('due_date', '>=', now())
            ->orderBy('due_date')
            ->take(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_transactions' => $recentTransactions,
            'upcoming_payments' => $upcomingPayments,
        ]);
    }
}
\`\`\`

### 5.2 KYC Endpoints

\`\`\`php
<?php
// app/Http/Controllers/Api/User/KYCController.php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Tenant\KYCDocument;
use App\Models\Tenant\NextOfKin;
use App\Models\Tenant\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class KYCController extends Controller
{
    public function submit(Request $request)
    {
        $validated = $request->validate([
            // Personal Information
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'marital_status' => 'required|in:single,married,divorced,widowed',
            'nationality' => 'required|string',
            'state_of_origin' => 'required|string',
            'lga' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            
            // Employment Information
            'staff_id' => 'required|string',
            'rank' => 'required|string',
            'department' => 'required|string',
            'command_state' => 'required|string',
            'employment_date' => 'required|date',
            
            // Next of Kin
            'nok_full_name' => 'required|string',
            'nok_relationship' => 'required|in:spouse,parent,sibling,child,other',
            'nok_phone' => 'required|string',
            'nok_email' => 'nullable|email',
            'nok_address' => 'required|string',
            
            // Bank Details
            'bank_name' => 'required|string',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
            'bvn' => 'required|string|size:11',
            
            // Documents
            'frsc_id' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'passport' => 'required|file|mimes:jpg,jpeg,png|max:2048',
            'proof_of_address' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $user = $request->user();

        DB::beginTransaction();
        
        try {
            // Update user information
            $user->update([
                'date_of_birth' => $validated['date_of_birth'],
                'gender' => $validated['gender'],
                'marital_status' => $validated['marital_status'],
                'nationality' => $validated['nationality'],
                'state_of_origin' => $validated['state_of_origin'],
                'lga' => $validated['lga'],
                'address' => $validated['address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'staff_id' => $validated['staff_id'],
                'rank' => $validated['rank'],
                'department' => $validated['department'],
                'command_state' => $validated['command_state'],
                'employment_date' => $validated['employment_date'],
                'years_of_service' => now()->diffInYears($validated['employment_date']),
                'kyc_status' => 'submitted',
                'kyc_submitted_at' => now(),
            ]);

            // Create or update next of kin
            NextOfKin::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $validated['nok_full_name'],
                    'relationship' => $validated['nok_relationship'],
                    'phone' => $validated['nok_phone'],
                    'email' => $validated['nok_email'],
                    'address' => $validated['nok_address'],
                ]
            );

            // Create or update bank account
            BankAccount::updateOrCreate(
                ['user_id' => $user->id, 'is_primary' => true],
                [
                    'bank_name' => $validated['bank_name'],
                    'account_number' => $validated['account_number'],
                    'account_name' => $validated['account_name'],
                    'bvn' => $validated['bvn'],
                ]
            );

            // Upload documents
            $documents = [
                'frsc_id' => $request->file('frsc_id'),
                'passport' => $request->file('passport'),
                'proof_of_address' => $request->file('proof_of_address'),
            ];

            foreach ($documents as $type => $file) {
                $path = $file->store("kyc/{$user->id}", 's3');
                
                KYCDocument::create([
                    'user_id' => $user->id,
                    'document_type' => $type,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'status' => 'pending',
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'KYC submitted successfully. Awaiting admin approval.',
                'user' => $user->fresh(),
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'kyc_status' => $user->kyc_status,
            'kyc_submitted_at' => $user->kyc_submitted_at,
            'kyc_approved_at' => $user->kyc_approved_at,
            'kyc_rejection_reason' => $user->kyc_rejection_reason,
            'documents' => $user->kycDocuments,
        ]);
    }
}
\`\`\`

---

**Continue to Part 2 for remaining sections...**

This is Part 1 of the comprehensive Laravel API guide. The document continues with:
- Loan Management Endpoints
- Investment Management Endpoints
- Property Management Endpoints
- Payment Gateway Integration
- White Label Implementation
- File Storage
- Email & Notifications
- Testing
- Deployment

Would you like me to continue with Part 2?
