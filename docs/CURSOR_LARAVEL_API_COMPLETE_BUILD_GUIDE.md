# CURSOR AI: Complete Laravel API Build Guide for FRSC Housing Management System

## 🎯 OBJECTIVE
Build a complete Laravel 11 REST API for a multi-tenant SaaS housing cooperative management system with the following tech stack:
- **Framework**: Laravel 11
- **Database**: PostgreSQL
- **Authentication**: Laravel Sanctum (API tokens)
- **Architecture**: Multi-tenant with tenant isolation
- **API Style**: RESTful with JSON responses
- **Colors**: Primary #FDB11E (Gold), Secondary #276254 (Teal-Green)

---

## 📋 TABLE OF CONTENTS
1. [Project Setup & Configuration](#1-project-setup--configuration)
2. [Database Architecture & Migrations](#2-database-architecture--migrations)
3. [Multi-Tenancy Implementation](#3-multi-tenancy-implementation)
4. [Authentication System](#4-authentication-system)
5. [Core Modules Implementation](#5-core-modules-implementation)
6. [Payment Gateway Integration](#6-payment-gateway-integration)
7. [White Label & Customization](#7-white-label--customization)
8. [API Endpoints Documentation](#8-api-endpoints-documentation)
9. [Testing & Deployment](#9-testing--deployment)

---

## 1. PROJECT SETUP & CONFIGURATION

### Step 1.1: Create New Laravel Project
\`\`\`bash
composer create-project laravel/laravel frsc-housing-api
cd frsc-housing-api
php artisan --version # Should be Laravel 11.x
\`\`\`

### Step 1.2: Install Required Packages
\`\`\`bash
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require intervention/image
composer require barryvdh/laravel-cors
composer require guzzlehttp/guzzle
composer require league/flysystem-aws-s3-v3
\`\`\`

### Step 1.3: Environment Configuration
Create `.env` file with these configurations:

\`\`\`env
APP_NAME="FRSC Housing Management API"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=frsc_housing
DB_USERNAME=postgres
DB_PASSWORD=

# Multi-tenancy
TENANT_COLUMN=tenant_id
CENTRAL_DOMAIN=api.frschousing.com

# Payment Gateways
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
REMITA_MERCHANT_ID=
REMITA_API_KEY=
REMITA_SERVICE_TYPE_ID=
STRIPE_KEY=
STRIPE_SECRET=

# File Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@frschousing.com
MAIL_FROM_NAME="${APP_NAME}"
\`\`\`

### Step 1.4: Configure CORS
In `config/cors.php`:
\`\`\`php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'], // Update in production
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
\`\`\`

---

## 2. DATABASE ARCHITECTURE & MIGRATIONS

### Step 2.1: Core Multi-Tenancy Tables

Create migration: `php artisan make:migration create_tenants_table`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('subdomain')->unique();
            $table->string('custom_domain')->nullable()->unique();
            $table->enum('status', ['active', 'suspended', 'inactive'])->default('active');
            $table->foreignId('subscription_package_id')->nullable()->constrained('subscription_packages');
            $table->timestamp('subscription_start_date')->nullable();
            $table->timestamp('subscription_end_date')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('subdomain');
            $table->index('custom_domain');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
\`\`\`

### Step 2.2: Subscription Packages Table

Create migration: `php artisan make:migration create_subscription_packages_table`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'yearly']);
            $table->integer('max_users')->default(10);
            $table->integer('max_properties')->default(50);
            $table->boolean('custom_domain_enabled')->default(false);
            $table->boolean('white_label_enabled')->default(false);
            $table->boolean('api_access_enabled')->default(false);
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_packages');
    }
};
\`\`\`

### Step 2.3: Users Table (Enhanced)

Create migration: `php artisan make:migration create_users_table`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            
            // FRSC Specific Fields
            $table->string('staff_id')->nullable()->unique();
            $table->string('ippis_number')->nullable()->unique();
            $table->string('rank')->nullable();
            $table->string('department')->nullable();
            $table->string('command_state')->nullable();
            $table->date('date_of_employment')->nullable();
            $table->integer('years_of_service')->nullable();
            
            // KYC Fields
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->string('nationality')->default('Nigerian');
            $table->string('state_of_origin')->nullable();
            $table->string('lga')->nullable();
            $table->text('residential_address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            
            // Bank Details
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->string('bvn')->nullable();
            
            // Next of Kin
            $table->string('nok_name')->nullable();
            $table->string('nok_relationship')->nullable();
            $table->string('nok_phone')->nullable();
            $table->string('nok_email')->nullable();
            $table->text('nok_address')->nullable();
            
            // Status & Verification
            $table->enum('kyc_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('kyc_rejection_reason')->nullable();
            $table->enum('membership_status', ['non_member', 'member', 'premium'])->default('non_member');
            $table->decimal('wallet_balance', 15, 2)->default(0);
            
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('tenant_id');
            $table->index('email');
            $table->index('staff_id');
            $table->index('kyc_status');
            $table->index('membership_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
\`\`\`

### Step 2.4: Properties Table

Create migration: `php artisan make:migration create_properties_table`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('title');
            $table->string('property_code')->unique();
            $table->text('description');
            $table->enum('type', ['apartment', 'duplex', 'bungalow', 'land', 'commercial']);
            $table->enum('status', ['available', 'reserved', 'sold', 'under_construction']);
            $table->decimal('price', 15, 2);
            $table->string('location');
            $table->string('state');
            $table->string('city');
            $table->text('address');
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->decimal('size_sqm', 10, 2)->nullable();
            $table->json('features')->nullable();
            $table->json('images')->nullable();
            $table->json('documents')->nullable();
            $table->integer('total_units')->default(1);
            $table->integer('available_units')->default(1);
            $table->date('completion_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('tenant_id');
            $table->index('property_code');
            $table->index('type');
            $table->index('status');
            $table->index(['state', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
\`\`\`

### Step 2.5: Investment Plans Table

Create migration: `php artisan make:migration create_investment_plans_table`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('investment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->decimal('minimum_amount', 15, 2);
            $table->decimal('maximum_amount', 15, 2)->nullable();
            $table->decimal('roi_percentage', 5, 2);
            $table->enum('roi_type', ['monthly', 'quarterly', 'yearly']);
            $table->integer('duration_months');
            $table->boolean('is_active')->default(true);
            $table->json('features')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('tenant_id');
            $table->index('is_active');
        });

        Schema::create('investments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('investment_plan_id')->constrained('investment_plans');
            $table->string('investment_code')->unique();
            $table->decimal('amount', 15, 2);
            $table->decimal('expected_return', 15, 2);
            $table->decimal('total_earned', 15, 2)->default(0);
            $table->date('start_date');
            $table->date('maturity_date');
            $table->enum('status', ['active', 'matured', 'cancelled'])->default('active');
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('tenant_id');
            $table->index('user_id');
            $table->index('investment_code');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('investments');
        Schema::dropIfExists('investment_plans');
    }
};
\`\`\`

### Step 2.6: Loan System Tables

Create migration: `php artisan make:migration create_loan_system_tables`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('loan_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->decimal('minimum_amount', 15, 2);
            $table->decimal('maximum_amount', 15, 2);
            $table->decimal('interest_rate', 5, 2);
            $table->enum('interest_type', ['flat', 'reducing_balance']);
            $table->integer('minimum_tenor_months');
            $table->integer('maximum_tenor_months');
            $table->decimal('processing_fee_percentage', 5, 2)->default(0);
            $table->decimal('insurance_fee_percentage', 5, 2)->default(0);
            $table->boolean('requires_guarantor')->default(true);
            $table->integer('guarantor_count')->default(2);
            $table->boolean('is_active')->default(true);
            $table->json('eligibility_criteria')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('tenant_id');
            $table->index('is_active');
        });

        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('loan_product_id')->constrained('loan_products');
            $table->string('loan_code')->unique();
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('interest_amount', 15, 2);
            $table->decimal('processing_fee', 15, 2)->default(0);
            $table->decimal('insurance_fee', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->decimal('monthly_repayment', 15, 2);
            $table->integer('tenor_months');
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);
            $table->date('disbursement_date')->nullable();
            $table->date('first_repayment_date')->nullable();
            $table->date('final_repayment_date')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'defaulted'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('tenant_id');
            $table->index('user_id');
            $table->index('loan_code');
            $table->index('status');
        });

        Schema::create('loan_guarantors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('loan_id')->constrained('loans')->onDelete('cascade');
            $table->foreignId('guarantor_user_id')->constrained('users');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
            
            $table->index('loan_id');
            $table->index('guarantor_user_id');
        });

        Schema::create('loan_repayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('loan_id')->constrained('loans')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->string('payment_reference')->unique();
            $table->decimal('amount', 15, 2);
            $table->enum('payment_method', ['wallet', 'bank_transfer', 'paystack', 'remita', 'stripe', 'salary_deduction']);
            $table->date('payment_date');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('completed');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('loan_id');
            $table->index('payment_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_repayments');
        Schema::dropIfExists('loan_guarantors');
        Schema::dropIfExists('loans');
        Schema::dropIfExists('loan_products');
    }
};
\`\`\`

### Step 2.7: Contributions & Wallet Tables

Create migration: `php artisan make:migration create_contributions_wallet_tables`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contribution_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->decimal('monthly_amount', 10, 2);
            $table->integer('due_day')->default(25); // Day of month
            $table->boolean('auto_deduct')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('tenant_id');
        });

        Schema::create('contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('payment_reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('month'); // Format: YYYY-MM
            $table->enum('payment_method', ['wallet', 'bank_transfer', 'paystack', 'remita', 'stripe']);
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('user_id');
            $table->index('month');
            $table->index('status');
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('transaction_reference')->unique();
            $table->enum('type', ['credit', 'debit']);
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('description');
            $table->enum('category', ['deposit', 'withdrawal', 'transfer', 'contribution', 'loan_repayment', 'investment', 'refund']);
            $table->string('payment_method')->nullable();
            $table->string('payment_reference')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('completed');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('user_id');
            $table->index('transaction_reference');
            $table->index('type');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('contributions');
        Schema::dropIfExists('contribution_settings');
    }
};
\`\`\`

### Step 2.8: Payment Gateway Settings Table

Create migration: `php artisan make:migration create_payment_gateway_settings_table`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_gateway_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->enum('gateway', ['paystack', 'remita', 'stripe', 'manual']);
            $table->boolean('is_enabled')->default(false);
            $table->boolean('is_test_mode')->default(true);
            $table->text('public_key')->nullable();
            $table->text('secret_key')->nullable();
            $table->text('merchant_id')->nullable();
            $table->text('api_key')->nullable();
            $table->json('bank_accounts')->nullable(); // For manual gateway
            $table->json('additional_settings')->nullable();
            $table->timestamps();
            
            $table->unique(['tenant_id', 'gateway']);
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_gateway_settings');
    }
};
\`\`\`

### Step 2.9: White Label Settings Table

Create migration: `php artisan make:migration create_white_label_settings_table`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('white_label_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained('tenants')->onDelete('cascade');
            
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
            $table->json('footer_links')->nullable();
            $table->json('social_links')->nullable();
            
            // Features
            $table->json('enabled_modules')->nullable();
            $table->text('custom_css')->nullable();
            
            $table->timestamps();
            
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('white_label_settings');
    }
};
\`\`\`

### Step 2.10: Custom Domain Requests Table

Create migration: `php artisan make:migration create_custom_domain_requests_table`

\`\`\`php
<?php

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
            $table->string('domain_name');
            $table->enum('status', ['pending', 'approved', 'rejected', 'active'])->default('pending');
            $table->string('verification_token')->nullable();
            $table->boolean('dns_verified')->default(false);
            $table->boolean('ssl_enabled')->default(false);
            $table->text('admin_notes')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('domain_name');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_domain_requests');
    }
};
\`\`\`

### Step 2.11: Landing Page Builder Tables

Create migration: `php artisan make:migration create_landing_page_builder_tables`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_page_configurations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->unique()->constrained('tenants')->onDelete('cascade');
            $table->json('sections'); // Array of section configurations
            $table->json('theme')->nullable(); // Colors, fonts, etc.
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_keywords')->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_page_configurations');
    }
};
\`\`\`

### Step 2.12: Documents & KYC Tables

Create migration: `php artisan make:migration create_documents_kyc_tables`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('document_type', ['frsc_id', 'passport', 'proof_of_address', 'bank_statement', 'other']);
            $table->string('file_name');
            $table->string('file_url');
            $table->string('file_type');
            $table->integer('file_size');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('user_id');
            $table->index('document_type');
        });

        Schema::create('admin_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('file_name');
            $table->string('file_url');
            $table->string('file_type');
            $table->integer('file_size');
            $table->boolean('is_public')->default(false);
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_documents');
        Schema::dropIfExists('user_documents');
    }
};
\`\`\`

### Step 2.13: Mail Service Tables

Create migration: `php artisan make:migration create_mail_service_tables`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mail_departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('tenant_id');
        });

        Schema::create('mail_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('mail_departments');
            $table->string('subject');
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'resolved', 'closed'])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('user_id');
            $table->index('department_id');
            $table->index('status');
        });

        Schema::create('mail_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mail_message_id')->constrained('mail_messages')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users');
            $table->text('message');
            $table->json('attachments')->nullable();
            $table->timestamps();
            
            $table->index('mail_message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mail_replies');
        Schema::dropIfExists('mail_messages');
        Schema::dropIfExists('mail_departments');
    }
};
\`\`\`

### Step 2.14: Property Management Tables

Create migration: `php artisan make:migration create_property_management_tables`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('property_allotments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties');
            $table->foreignId('user_id')->constrained('users');
            $table->string('allotment_code')->unique();
            $table->decimal('purchase_price', 15, 2);
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->decimal('balance', 15, 2);
            $table->enum('payment_plan', ['outright', 'installment']);
            $table->integer('installment_months')->nullable();
            $table->decimal('monthly_payment', 15, 2)->nullable();
            $table->date('allotment_date');
            $table->date('expected_completion_date')->nullable();
            $table->enum('status', ['pending', 'active', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('property_id');
            $table->index('user_id');
            $table->index('allotment_code');
        });

        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties');
            $table->foreignId('user_id')->constrained('users');
            $table->string('request_code')->unique();
            $table->string('title');
            $table->text('description');
            $table->enum('category', ['plumbing', 'electrical', 'structural', 'painting', 'other']);
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->json('images')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->foreignId('assigned_to')->nullable()->constrained('users');
            $table->decimal('estimated_cost', 10, 2)->nullable();
            $table->decimal('actual_cost', 10, 2)->nullable();
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->text('completion_notes')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('property_id');
            $table->index('user_id');
            $table->index('status');
        });

        Schema::create('statutory_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties');
            $table->string('charge_type'); // e.g., 'land_use_charge', 'development_levy'
            $table->decimal('amount', 10, 2);
            $table->string('year');
            $table->date('due_date');
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->date('paid_date')->nullable();
            $table->string('payment_reference')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('property_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statutory_charges');
        Schema::dropIfExists('maintenance_requests');
        Schema::dropIfExists('property_allotments');
    }
};
\`\`\`

### Step 2.15: Activity Logs & Audit Trail

Create migration: `php artisan make:migration create_activity_logs_table`

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action');
            $table->string('module');
            $table->text('description');
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('user_id');
            $table->index('module');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
\`\`\`

---

## 3. MULTI-TENANCY IMPLEMENTATION

### Step 3.1: Create Tenant Middleware

Create file: `app/Http/Middleware/TenantMiddleware.php`

\`\`\`php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Tenant;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = $this->identifyTenant($request);
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found'
            ], 404);
        }
        
        if ($tenant->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Tenant account is not active'
            ], 403);
        }
        
        // Set tenant in app container
        app()->instance('tenant', $tenant);
        
        // Set tenant ID in config for query scoping
        config(['app.tenant_id' => $tenant->id]);
        
        return $next($request);
    }
    
    private function identifyTenant(Request $request): ?Tenant
    {
        // Try to identify tenant from subdomain
        $host = $request->getHost();
        $subdomain = explode('.', $host)[0];
        
        $tenant = Tenant::where('subdomain', $subdomain)->first();
        
        if ($tenant) {
            return $tenant;
        }
        
        // Try to identify from custom domain
        $tenant = Tenant::where('custom_domain', $host)->first();
        
        if ($tenant) {
            return $tenant;
        }
        
        // Try to identify from X-Tenant-ID header (for API calls)
        if ($request->hasHeader('X-Tenant-ID')) {
            return Tenant::find($request->header('X-Tenant-ID'));
        }
        
        return null;
    }
}
\`\`\`

### Step 3.2: Create Tenant Scope Trait

Create file: `app/Traits/BelongsToTenant.php`

\`\`\`php
<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        // Automatically scope all queries to current tenant
        static::addGlobalScope('tenant', function (Builder $builder) {
            if ($tenantId = config('app.tenant_id')) {
                $builder->where('tenant_id', $tenantId);
            }
        });
        
        // Automatically set tenant_id when creating
        static::creating(function (Model $model) {
            if (!$model->tenant_id && $tenantId = config('app.tenant_id')) {
                $model->tenant_id = $tenantId;
            }
        });
    }
    
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
\`\`\`

### Step 3.3: Apply Trait to All Tenant-Scoped Models

Example for User model in `app/Models/User.php`:

\`\`\`php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\BelongsToTenant;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, BelongsToTenant, HasRoles;
    
    protected $fillable = [
        'tenant_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'avatar',
        'staff_id',
        'ippis_number',
        'rank',
        'department',
        'command_state',
        'date_of_employment',
        'years_of_service',
        'date_of_birth',
        'gender',
        'marital_status',
        'nationality',
        'state_of_origin',
        'lga',
        'residential_address',
        'city',
        'state',
        'bank_name',
        'account_number',
        'account_name',
        'bvn',
        'nok_name',
        'nok_relationship',
        'nok_phone',
        'nok_email',
        'nok_address',
        'kyc_status',
        'membership_status',
        'wallet_balance',
    ];
    
    protected $hidden = [
        'password',
        'remember_token',
    ];
    
    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_employment' => 'date',
        'date_of_birth' => 'date',
        'wallet_balance' => 'decimal:2',
    ];
}
\`\`\`

**Apply the `BelongsToTenant` trait to ALL models that have `tenant_id`:**
- Property
- Investment
- InvestmentPlan
- Loan
- LoanProduct
- Contribution
- WalletTransaction
- PaymentGatewaySetting
- WhiteLabelSetting
- CustomDomainRequest
- LandingPageConfiguration
- UserDocument
- AdminDocument
- MailDepartment
- MailMessage
- PropertyAllotment
- MaintenanceRequest
- StatutoryCharge
- ActivityLog

---

## 4. AUTHENTICATION SYSTEM

### Step 4.1: Create Authentication Controller

Create file: `app/Http/Controllers/Api/AuthController.php`

\`\`\`php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'staff_id' => 'required|string|unique:users',
            'ippis_number' => 'required|string|unique:users',
            'rank' => 'required|string',
            'department' => 'required|string',
            'command_state' => 'required|string',
            'date_of_employment' => 'required|date',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Calculate years of service
        $dateOfEmployment = new \DateTime($request->date_of_employment);
        $now = new \DateTime();
        $yearsOfService = $now->diff($dateOfEmployment)->y;
        
        $user = User::create([
            'tenant_id' => config('app.tenant_id'),
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'staff_id' => $request->staff_id,
            'ippis_number' => $request->ippis_number,
            'rank' => $request->rank,
            'department' => $request->department,
            'command_state' => $request->command_state,
            'date_of_employment' => $request->date_of_employment,
            'years_of_service' => $yearsOfService,
            'kyc_status' => 'pending',
            'membership_status' => 'non_member',
        ]);
        
        // Assign default role
        $user->assignRole('member');
        
        // Generate OTP for email verification
        $otp = rand(100000, 999999);
        // TODO: Store OTP in cache or database
        // TODO: Send OTP via email
        
        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please verify your email.',
            'data' => [
                'user' => $user,
                'requires_otp' => true
            ]
        ], 201);
    }
    
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // TODO: Verify OTP from cache/database
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }
        
        $user->email_verified_at = now();
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }
    
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }
        
        if (!$user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email first'
            ], 403);
        }
        
        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user->load('roles'),
                'token' => $token
            ]
        ]);
    }
    
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
    
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load('roles', 'permissions')
        ]);
    }
    
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'avatar' => 'sometimes|image|max:2048',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        if ($request->hasFile('avatar')) {
            // TODO: Upload to S3 and get URL
            $avatarUrl = ''; // Upload logic here
            $user->avatar = $avatarUrl;
        }
        
        $user->update($request->only(['first_name', 'last_name', 'phone']));
        
        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }
    
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }
        
        $user->password = Hash::make($request->new_password);
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}
\`\`\`

### Step 4.2: Register Authentication Routes

In `routes/api.php`:

\`\`\`php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
});
\`\`\`

---

## 5. CORE MODULES IMPLEMENTATION

### Step 5.1: KYC Controller

Create file: `app/Http/Controllers/Api/KycController.php`

\`\`\`php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KycController extends Controller
{
    public function submitKyc(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date_of_birth' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'marital_status' => 'required|in:single,married,divorced,widowed',
            'state_of_origin' => 'required|string',
            'lga' => 'required|string',
            'residential_address' => 'required|string',
            'city' => 'required|string',
            'state' => 'required|string',
            'bank_name' => 'required|string',
            'account_number' => 'required|string|size:10',
            'account_name' => 'required|string',
            'bvn' => 'required|string|size:11',
            'nok_name' => 'required|string',
            'nok_relationship' => 'required|string',
            'nok_phone' => 'required|string',
            'nok_email' => 'required|email',
            'nok_address' => 'required|string',
            'frsc_id_document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'passport_photo' => 'required|file|mimes:jpg,jpeg,png|max:2048',
            'proof_of_address' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        
        // Update user KYC information
        $user->update([
            'date_of_birth' => $request->date_of_birth,
            'gender' => $request->gender,
            'marital_status' => $request->marital_status,
            'state_of_origin' => $request->state_of_origin,
            'lga' => $request->lga,
            'residential_address' => $request->residential_address,
            'city' => $request->city,
            'state' => $request->state,
            'bank_name' => $request->bank_name,
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'bvn' => $request->bvn,
            'nok_name' => $request->nok_name,
            'nok_relationship' => $request->nok_relationship,
            'nok_phone' => $request->nok_phone,
            'nok_email' => $request->nok_email,
            'nok_address' => $request->nok_address,
            'kyc_status' => 'pending',
        ]);
        
        // Upload documents
        $documents = [
            'frsc_id' => $request->file('frsc_id_document'),
            'passport' => $request->file('passport_photo'),
            'proof_of_address' => $request->file('proof_of_address'),
        ];
        
        foreach ($documents as $type => $file) {
            // TODO: Upload to S3
            $fileUrl = ''; // Upload logic here
            
            UserDocument::create([
                'tenant_id' => config('app.tenant_id'),
                'user_id' => $user->id,
                'document_type' => $type,
                'file_name' => $file->getClientOriginalName(),
                'file_url' => $fileUrl,
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'verification_status' => 'pending',
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'KYC submitted successfully. Awaiting verification.',
            'data' => $user
        ]);
    }
    
    public function getKycStatus(Request $request)
    {
        $user = $request->user();
        $documents = UserDocument::where('user_id', $user->id)->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'kyc_status' => $user->kyc_status,
                'kyc_rejection_reason' => $user->kyc_rejection_reason,
                'documents' => $documents
            ]
        ]);
    }
}
\`\`\`

### Step 5.2: Properties Controller

Create file: `app/Http/Controllers/Api/PropertyController.php`

\`\`\`php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PropertyController extends Controller
{
    public function index(Request $request)
    {
        $query = Property::query();
        
        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('state')) {
            $query->where('state', $request->state);
        }
        
        if ($request->has('city')) {
            $query->where('city', $request->city);
        }
        
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        
        if ($request->has('bedrooms')) {
            $query->where('bedrooms', $request->bedrooms);
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }
        
        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $properties = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $properties
        ]);
    }
    
    public function show($id)
    {
        $property = Property::find($id);
        
        if (!$property) {
            return response()->json([
                'success' => false,
                'message' => 'Property not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $property
        ]);
    }
    
    public function expressInterest(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'payment_plan' => 'required|in:outright,installment',
            'installment_months' => 'required_if:payment_plan,installment|integer|min:6|max:60',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $property = Property::find($id);
        
        if (!$property) {
            return response()->json([
                'success' => false,
                'message' => 'Property not found'
            ], 404);
        }
        
        if ($property->status !== 'available' || $property->available_units < 1) {
            return response()->json([
                'success' => false,
                'message' => 'Property is not available'
            ], 400);
        }
        
        // TODO: Create property allotment record
        // TODO: Send notification to admin
        
        return response()->json([
            'success' => true,
            'message' => 'Expression of interest submitted successfully'
        ]);
    }
}
\`\`\`

### Step 5.3: Investments Controller

Create file: `app/Http/Controllers/Api/InvestmentController.php`

\`\`\`php
<?php

namespace App\Http/Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvestmentPlan;
use App\Models\Investment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class InvestmentController extends Controller
{
    public function getPlans()
    {
        $plans = InvestmentPlan::where('is_active', true)->get();
        
        return response()->json([
            'success' => true,
            'data' => $plans
        ]);
    }
    
    public function createInvestment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'investment_plan_id' => 'required|exists:investment_plans,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:wallet,bank_transfer,paystack,remita,stripe',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $plan = InvestmentPlan::find($request->investment_plan_id);
        
        if ($request->amount < $plan->minimum_amount) {
            return response()->json([
                'success' => false,
                'message' => "Minimum investment amount is {$plan->minimum_amount}"
            ], 400);
        }
        
        if ($plan->maximum_amount && $request->amount > $plan->maximum_amount) {
            return response()->json([
                'success' => false,
                'message' => "Maximum investment amount is {$plan->maximum_amount}"
            ], 400);
        }
        
        $user = $request->user();
        
        // Calculate expected return
        $expectedReturn = $request->amount * (1 + ($plan->roi_percentage / 100) * ($plan->duration_months / 12));
        
        // Calculate dates
        $startDate = now();
        $maturityDate = now()->addMonths($plan->duration_months);
        
        $investment = Investment::create([
            'tenant_id' => config('app.tenant_id'),
            'user_id' => $user->id,
            'investment_plan_id' => $plan->id,
            'investment_code' => 'INV-' . strtoupper(Str::random(10)),
            'amount' => $request->amount,
            'expected_return' => $expectedReturn,
            'start_date' => $startDate,
            'maturity_date' => $maturityDate,
            'status' => 'active',
        ]);
        
        // TODO: Process payment based on payment_method
        
        return response()->json([
            'success' => true,
            'message' => 'Investment created successfully',
            'data' => $investment->load('investmentPlan')
        ], 201);
    }
    
    public function getUserInvestments(Request $request)
    {
        $investments = Investment::where('user_id', $request->user()->id)
            ->with('investmentPlan')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $investments
        ]);
    }
    
    public function getInvestmentDetails($id, Request $request)
    {
        $investment = Investment::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with('investmentPlan')
            ->first();
        
        if (!$investment) {
            return response()->json([
                'success' => false,
                'message' => 'Investment not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $investment
        ]);
    }
}
\`\`\`

### Step 5.4: Loans Controller

Create file: `app/Http/Controllers/Api/LoanController.php`

\`\`\`php
<?php

namespace App\Http/Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoanProduct;
use App\Models\Loan;
use App\Models\LoanGuarantor;
use App\Models\LoanRepayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class LoanController extends Controller
{
    public function getProducts()
    {
        $products = LoanProduct::where('is_active', true)->get();
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
    
    public function applyForLoan(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'loan_product_id' => 'required|exists:loan_products,id',
            'amount' => 'required|numeric|min:0',
            'tenor_months' => 'required|integer|min:1',
            'guarantors' => 'required|array|min:1',
            'guarantors.*.user_id' => 'required|exists:users,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $product = LoanProduct::find($request->loan_product_id);
        $user = $request->user();
        
        // Validate amount
        if ($request->amount < $product->minimum_amount || $request->amount > $product->maximum_amount) {
            return response()->json([
                'success' => false,
                'message' => "Loan amount must be between {$product->minimum_amount} and {$product->maximum_amount}"
            ], 400);
        }
        
        // Validate tenor
        if ($request->tenor_months < $product->minimum_tenor_months || $request->tenor_months > $product->maximum_tenor_months) {
            return response()->json([
                'success' => false,
                'message' => "Loan tenor must be between {$product->minimum_tenor_months} and {$product->maximum_tenor_months} months"
            ], 400);
        }
        
        // Validate guarantor count
        if (count($request->guarantors) < $product->guarantor_count) {
            return response()->json([
                'success' => false,
                'message' => "This loan requires {$product->guarantor_count} guarantors"
            ], 400);
        }
        
        // Calculate loan details
        $principalAmount = $request->amount;
        $interestAmount = ($principalAmount * $product->interest_rate * $request->tenor_months) / 100;
        $processingFee = ($principalAmount * $product->processing_fee_percentage) / 100;
        $insuranceFee = ($principalAmount * $product->insurance_fee_percentage) / 100;
        $totalAmount = $principalAmount + $interestAmount + $processingFee + $insuranceFee;
        $monthlyRepayment = $totalAmount / $request->tenor_months;
        
        $loan = Loan::create([
            'tenant_id' => config('app.tenant_id'),
            'user_id' => $user->id,
            'loan_product_id' => $product->id,
            'loan_code' => 'LOAN-' . strtoupper(Str::random(10)),
            'principal_amount' => $principalAmount,
            'interest_amount' => $interestAmount,
            'processing_fee' => $processingFee,
            'insurance_fee' => $insuranceFee,
            'total_amount' => $totalAmount,
            'monthly_repayment' => $monthlyRepayment,
            'tenor_months' => $request->tenor_months,
            'balance' => $totalAmount,
            'status' => 'pending',
        ]);
        
        // Add guarantors
        foreach ($request->guarantors as $guarantor) {
            LoanGuarantor::create([
                'loan_id' => $loan->id,
                'guarantor_user_id' => $guarantor['user_id'],
                'status' => 'pending',
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Loan application submitted successfully',
            'data' => $loan->load('loanProduct', 'guarantors')
        ], 201);
    }
    
    public function getUserLoans(Request $request)
    {
        $loans = Loan::where('user_id', $request->user()->id)
            ->with('loanProduct', 'guarantors')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $loans
        ]);
    }
    
    public function getLoanDetails($id, Request $request)
    {
        $loan = Loan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with('loanProduct', 'guarantors', 'repayments')
            ->first();
        
        if (!$loan) {
            return response()->json([
                'success' => false,
                'message' => 'Loan not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $loan
        ]);
    }
    
    public function repayLoan(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|in:wallet,bank_transfer,paystack,remita,stripe,salary_deduction',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $loan = Loan::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();
        
        if (!$loan) {
            return response()->json([
                'success' => false,
                'message' => 'Loan not found'
            ], 404);
        }
        
        if ($loan->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Loan is not active'
            ], 400);
        }
        
        if ($request->amount > $loan->balance) {
            return response()->json([
                'success' => false,
                'message' => 'Amount exceeds loan balance'
            ], 400);
        }
        
        $repayment = LoanRepayment::create([
            'tenant_id' => config('app.tenant_id'),
            'loan_id' => $loan->id,
            'user_id' => $request->user()->id,
            'payment_reference' => 'REP-' . strtoupper(Str::random(10)),
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'payment_date' => now(),
            'status' => 'completed',
        ]);
        
        // Update loan
        $loan->amount_paid += $request->amount;
        $loan->balance -= $request->amount;
        
        if ($loan->balance <= 0) {
            $loan->status = 'completed';
        }
        
        $loan->save();
        
        // TODO: Process payment based on payment_method
        
        return response()->json([
            'success' => true,
            'message' => 'Loan repayment successful',
            'data' => [
                'repayment' => $repayment,
                'loan' => $loan
            ]
        ]);
    }
}
\`\`\`

### Step 5.5: Wallet Controller

Create file: `app/Http/Controllers/Api/WalletController.php`

\`\`\`php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WalletController extends Controller
{
    public function getBalance(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $user->wallet_balance
            ]
        ]);
    }
    
    public function getTransactions(Request $request)
    {
        $query = WalletTransaction::where('user_id', $request->user()->id);
        
        // Filters
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }
        
        $perPage = $request->get('per_page', 20);
        $transactions = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }
    
    public function topUp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:100',
            'payment_method' => 'required|in:bank_transfer,paystack,remita,stripe',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // TODO: Initialize payment with selected gateway
        // TODO: Return payment URL/reference
        
        return response()->json([
            'success' => true,
            'message' => 'Payment initialized',
            'data' => [
                'payment_reference' => 'PAY-' . strtoupper(Str::random(10)),
                'payment_url' => 'https://payment-gateway.com/pay/...'
            ]
        ]);
    }
    
    public function transfer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_email' => 'required|email|exists:users,email',
            'amount' => 'required|numeric|min:100',
            'description' => 'nullable|string|max:255',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $sender = $request->user();
        $recipient = User::where('email', $request->recipient_email)->first();
        
        if ($sender->id === $recipient->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot transfer to yourself'
            ], 400);
        }
        
        if ($sender->wallet_balance < $request->amount) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient wallet balance'
            ], 400);
        }
        
        DB::beginTransaction();
        
        try {
            $reference = 'TRF-' . strtoupper(Str::random(10));
            
            // Debit sender
            $senderBalanceBefore = $sender->wallet_balance;
            $sender->wallet_balance -= $request->amount;
            $sender->save();
            
            WalletTransaction::create([
                'tenant_id' => config('app.tenant_id'),
                'user_id' => $sender->id,
                'transaction_reference' => $reference,
                'type' => 'debit',
                'amount' => $request->amount,
                'balance_before' => $senderBalanceBefore,
                'balance_after' => $sender->wallet_balance,
                'description' => $request->description ?? "Transfer to {$recipient->first_name} {$recipient->last_name}",
                'category' => 'transfer',
                'status' => 'completed',
            ]);
            
            // Credit recipient
            $recipientBalanceBefore = $recipient->wallet_balance;
            $recipient->wallet_balance += $request->amount;
            $recipient->save();
            
            WalletTransaction::create([
                'tenant_id' => config('app.tenant_id'),
                'user_id' => $recipient->id,
                'transaction_reference' => $reference,
                'type' => 'credit',
                'amount' => $request->amount,
                'balance_before' => $recipientBalanceBefore,
                'balance_after' => $recipient->wallet_balance,
                'description' => "Transfer from {$sender->first_name} {$sender->last_name}",
                'category' => 'transfer',
                'status' => 'completed',
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Transfer successful',
                'data' => [
                    'reference' => $reference,
                    'new_balance' => $sender->wallet_balance
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Transfer failed'
            ], 500);
        }
    }
}
\`\`\`

---

## 6. PAYMENT GATEWAY INTEGRATION

### Step 6.1: Paystack Service

Create file: `app/Services/PaymentGateways/PaystackService.php`

\`\`\`php
<?php

namespace App\Services\PaymentGateways;

use GuzzleHttp\Client;
use App\Models\PaymentGatewaySetting;

class PaystackService
{
    protected $client;
    protected $secretKey;
    protected $baseUrl;
    
    public function __construct()
    {
        $this->client = new Client();
        
        // Get tenant-specific settings
        $settings = PaymentGatewaySetting::where('gateway', 'paystack')
            ->where('is_enabled', true)
            ->first();
        
        if ($settings) {
            $this->secretKey = $settings->secret_key;
            $this->baseUrl = $settings->is_test_mode 
                ? 'https://api.paystack.co' 
                : 'https://api.paystack.co';
        }
    }
    
    public function initializePayment($email, $amount, $reference, $callbackUrl)
    {
        try {
            $response = $this->client->post("{$this->baseUrl}/transaction/initialize", [
                'headers' => [
                    'Authorization' => "Bearer {$this->secretKey}",
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'email' => $email,
                    'amount' => $amount * 100, // Convert to kobo
                    'reference' => $reference,
                    'callback_url' => $callbackUrl,
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            
            return [
                'success' => true,
                'authorization_url' => $data['data']['authorization_url'],
                'access_code' => $data['data']['access_code'],
                'reference' => $data['data']['reference'],
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function verifyPayment($reference)
    {
        try {
            $response = $this->client->get("{$this->baseUrl}/transaction/verify/{$reference}", [
                'headers' => [
                    'Authorization' => "Bearer {$this->secretKey}",
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            
            if ($data['data']['status'] === 'success') {
                return [
                    'success' => true,
                    'amount' => $data['data']['amount'] / 100, // Convert from kobo
                    'reference' => $data['data']['reference'],
                    'paid_at' => $data['data']['paid_at'],
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Payment not successful'
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
\`\`\`

### Step 6.2: Remita Service

Create file: `app/Services/PaymentGateways/RemitaService.php`

\`\`\`php
<?php

namespace App\Services\PaymentGateways;

use GuzzleHttp\Client;
use App\Models\PaymentGatewaySetting;

class RemitaService
{
    protected $client;
    protected $merchantId;
    protected $apiKey;
    protected $serviceTypeId;
    protected $baseUrl;
    
    public function __construct()
    {
        $this->client = new Client();
        
        // Get tenant-specific settings
        $settings = PaymentGatewaySetting::where('gateway', 'remita')
            ->where('is_enabled', true)
            ->first();
        
        if ($settings) {
            $this->merchantId = $settings->merchant_id;
            $this->apiKey = $settings->api_key;
            $additionalSettings = json_decode($settings->additional_settings, true);
            $this->serviceTypeId = $additionalSettings['service_type_id'] ?? '';
            $this->baseUrl = $settings->is_test_mode 
                ? 'https://remitademo.net' 
                : 'https://login.remita.net';
        }
    }
    
    public function initializePayment($email, $amount, $reference, $description)
    {
        try {
            $hash = hash('sha512', $this->merchantId . $this->serviceTypeId . $reference . $amount . $this->apiKey);
            
            $response = $this->client->post("{$this->baseUrl}/remita/exapp/api/v1/send/api/echannelsvc/merchant/api/paymentinit", [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => "remitaConsumerKey={$this->merchantId},remitaConsumerToken={$hash}",
                ],
                'json' => [
                    'serviceTypeId' => $this->serviceTypeId,
                    'amount' => $amount,
                    'orderId' => $reference,
                    'payerName' => $email,
                    'payerEmail' => $email,
                    'payerPhone' => '',
                    'description' => $description,
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            
            return [
                'success' => true,
                'rrr' => $data['RRR'],
                'payment_url' => "{$this->baseUrl}/remita/ecomm/{$this->merchantId}/{$data['RRR']}/{$hash}/pay.reg",
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function verifyPayment($rrr)
    {
        try {
            $hash = hash('sha512', $rrr . $this->apiKey . $this->merchantId);
            
            $response = $this->client->get("{$this->baseUrl}/remita/exapp/api/v1/send/api/echannelsvc/{$this->merchantId}/{$rrr}/{$hash}/status.reg", [
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ]);
            
            $data = json_decode($response->getBody(), true);
            
            if ($data['status'] === '00' || $data['status'] === '01') {
                return [
                    'success' => true,
                    'amount' => $data['amount'],
                    'rrr' => $rrr,
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Payment not successful'
            ];
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
\`\`\`

### Step 6.3: Payment Controller

Create file: `app/Http/Controllers/Api/PaymentController.php`

\`\`\`php
<?php

namespace App\Http/Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentGateways\PaystackService;
use App\Services\PaymentGateways\RemitaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function initializePayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:100',
            'gateway' => 'required|in:paystack,remita,stripe',
            'purpose' => 'required|string',
            'callback_url' => 'required|url',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $user = $request->user();
        $reference = 'PAY-' . strtoupper(Str::random(15));
        
        switch ($request->gateway) {
            case 'paystack':
                $service = new PaystackService();
                $result = $service->initializePayment(
                    $user->email,
                    $request->amount,
                    $reference,
                    $request->callback_url
                );
                break;
                
            case 'remita':
                $service = new RemitaService();
                $result = $service->initializePayment(
                    $user->email,
                    $request->amount,
                    $reference,
                    $request->purpose
                );
                break;
                
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Gateway not supported'
                ], 400);
        }
        
        if ($result['success']) {
            // TODO: Store payment record in database
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => $result['message']
        ], 400);
    }
    
    public function verifyPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reference' => 'required|string',
            'gateway' => 'required|in:paystack,remita,stripe',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        switch ($request->gateway) {
            case 'paystack':
                $service = new PaystackService();
                $result = $service->verifyPayment($request->reference);
                break;
                
            case 'remita':
                $service = new RemitaService();
                $result = $service->verifyPayment($request->reference);
                break;
                
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Gateway not supported'
                ], 400);
        }
        
        if ($result['success']) {
            // TODO: Update payment record and credit wallet/complete transaction
            
            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully',
                'data' => $result
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => $result['message']
        ], 400);
    }
}
\`\`\`

---

## 7. WHITE LABEL & CUSTOMIZATION

### Step 7.1: White Label Controller

Create file: `app/Http/Controllers/Api/Admin/WhiteLabelController.php`

\`\`\`php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhiteLabelSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WhiteLabelController extends Controller
{
    public function getSettings()
    {
        $settings = WhiteLabelSetting::where('tenant_id', config('app.tenant_id'))->first();
        
        if (!$settings) {
            // Return default settings
            $settings = new WhiteLabelSetting([
                'primary_color' => '#FDB11E',
                'secondary_color' => '#276254',
                'heading_font' => 'Inter',
                'body_font' => 'Inter',
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }
    
    public function updateSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'nullable|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'favicon_url' => 'nullable|url',
            'login_background_url' => 'nullable|url',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'accent_color' => 'nullable|string|max:7',
            'heading_font' => 'nullable|string',
            'body_font' => 'nullable|string',
            'email_sender_name' => 'nullable|string',
            'email_reply_to' => 'nullable|email',
            'support_email' => 'nullable|email',
            'support_phone' => 'nullable|string',
            'terms_url' => 'nullable|url',
            'privacy_url' => 'nullable|url',
            'footer_links' => 'nullable|array',
            'social_links' => 'nullable|array',
            'enabled_modules' => 'nullable|array',
            'custom_css' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $settings = WhiteLabelSetting::updateOrCreate(
            ['tenant_id' => config('app.tenant_id')],
            $request->all()
        );
        
        return response()->json([
            'success' => true,
            'message' => 'White label settings updated successfully',
            'data' => $settings
        ]);
    }
}
\`\`\`

### Step 7.2: Custom Domain Controller

Create file: `app/Http/Controllers/Api/Admin/CustomDomainController.php`

\`\`\`php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomDomainRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CustomDomainController extends Controller
{
    public function requestDomain(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'domain_name' => 'required|string|regex:/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}$/i',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Check if domain already exists
        $existing = CustomDomainRequest::where('domain_name', $request->domain_name)->first();
        
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Domain already requested'
            ], 400);
        }
        
        $domainRequest = CustomDomainRequest::create([
            'tenant_id' => config('app.tenant_id'),
            'domain_name' => $request->domain_name,
            'verification_token' => Str::random(32),
            'status' => 'pending',
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Domain request submitted successfully',
            'data' => $domainRequest
        ], 201);
    }
    
    public function getDomainRequests()
    {
        $requests = CustomDomainRequest::where('tenant_id', config('app.tenant_id'))
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $requests
        ]);
    }
    
    public function getDomainRequest($id)
    {
        $request = CustomDomainRequest::where('id', $id)
            ->where('tenant_id', config('app.tenant_id'))
            ->first();
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Domain request not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => $request
        ]);
    }
}
\`\`\`

### Step 7.3: Landing Page Builder Controller

Create file: `app/Http/Controllers/Api/Admin/LandingPageController.php`

\`\`\`php
<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPageConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LandingPageController extends Controller
{
    public function getConfiguration()
    {
        $config = LandingPageConfiguration::where('tenant_id', config('app.tenant_id'))->first();
        
        if (!$config) {
            // Return default configuration
            $config = new LandingPageConfiguration([
                'sections' => [],
                'theme' => [
                    'primary_color' => '#FDB11E',
                    'secondary_color' => '#276254',
                    'font_family' => 'Inter',
                ],
                'is_published' => false,
            ]);
        }
        
        return response()->json([
            'success' => true,
            'data' => $config
        ]);
    }
    
    public function updateConfiguration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sections' => 'required|array',
            'theme' => 'nullable|array',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $config = LandingPageConfiguration::updateOrCreate(
            ['tenant_id' => config('app.tenant_id')],
            $request->all()
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Landing page configuration updated successfully',
            'data' => $config
        ]);
    }
    
    public function publish()
    {
        $config = LandingPageConfiguration::where('tenant_id', config('app.tenant_id'))->first();
        
        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'No configuration found'
            ], 404);
        }
        
        $config->is_published = true;
        $config->published_at = now();
        $config->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Landing page published successfully'
        ]);
    }
    
    public function unpublish()
    {
        $config = LandingPageConfiguration::where('tenant_id', config('app.tenant_id'))->first();
        
        if (!$config) {
            return response()->json([
                'success' => false,
                'message' => 'No configuration found'
            ], 404);
        }
        
        $config->is_published = false;
        $config->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Landing page unpublished successfully'
        ]);
    }
}
\`\`\`

---

## 8. API ENDPOINTS DOCUMENTATION

### Complete API Routes Structure

In `routes/api.php`:

\`\`\`php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KycController;
use App\Http\Controllers\Api\PropertyController;
use App\Http\Controllers\Api\InvestmentController;
use App\Http\Controllers\Api\LoanController;
use App\Http\Controllers\Api\WalletController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\Admin\WhiteLabelController;
use App\Http\Controllers\Api\Admin\CustomDomainController;
use App\Http\Controllers\Api\Admin\LandingPageController;

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Protected routes (require authentication and tenant)
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });
    
    // KYC
    Route::prefix('kyc')->group(function () {
        Route::post('/submit', [KycController::class, 'submitKyc']);
        Route::get('/status', [KycController::class, 'getKycStatus']);
    });
    
    // Properties
    Route::prefix('properties')->group(function () {
        Route::get('/', [PropertyController::class, 'index']);
        Route::get('/{id}', [PropertyController::class, 'show']);
        Route::post('/{id}/express-interest', [PropertyController::class, 'expressInterest']);
    });
    
    // Investments
    Route::prefix('investments')->group(function () {
        Route::get('/plans', [InvestmentController::class, 'getPlans']);
        Route::post('/', [InvestmentController::class, 'createInvestment']);
        Route::get('/my-investments', [InvestmentController::class, 'getUserInvestments']);
        Route::get('/{id}', [InvestmentController::class, 'getInvestmentDetails']);
    });
    
    // Loans
    Route::prefix('loans')->group(function () {
        Route::get('/products', [LoanController::class, 'getProducts']);
        Route::post('/apply', [LoanController::class, 'applyForLoan']);
        Route::get('/my-loans', [LoanController::class, 'getUserLoans']);
        Route::get('/{id}', [LoanController::class, 'getLoanDetails']);
        Route::post('/{id}/repay', [LoanController::class, 'repayLoan']);
    });
    
    // Wallet
    Route::prefix('wallet')->group(function () {
        Route::get('/balance', [WalletController::class, 'getBalance']);
        Route::get('/transactions', [WalletController::class, 'getTransactions']);
        Route::post('/top-up', [WalletController::class, 'topUp']);
        Route::post('/transfer', [WalletController::class, 'transfer']);
    });
    
    // Payments
    Route::prefix('payments')->group(function () {
        Route::post('/initialize', [PaymentController::class, 'initializePayment']);
        Route::post('/verify', [PaymentController::class, 'verifyPayment']);
    });
    
    // Admin routes
    Route::middleware(['role:admin|super_admin'])->prefix('admin')->group(function () {
        
        // White Label
        Route::prefix('white-label')->group(function () {
            Route::get('/', [WhiteLabelController::class, 'getSettings']);
            Route::put('/', [WhiteLabelController::class, 'updateSettings']);
        });
        
        // Custom Domains
        Route::prefix('custom-domains')->group(function () {
            Route::post('/', [CustomDomainController::class, 'requestDomain']);
            Route::get('/', [CustomDomainController::class, 'getDomainRequests']);
            Route::get('/{id}', [CustomDomainController::class, 'getDomainRequest']);
        });
        
        // Landing Page Builder
        Route::prefix('landing-page')->group(function () {
            Route::get('/', [LandingPageController::class, 'getConfiguration']);
            Route::put('/', [LandingPageController::class, 'updateConfiguration']);
            Route::post('/publish', [LandingPageController::class, 'publish']);
            Route::post('/unpublish', [LandingPageController::class, 'unpublish']);
        });
    });
});
\`\`\`

---

## 9. TESTING & DEPLOYMENT

### Step 9.1: Run Migrations

\`\`\`bash
php artisan migrate
\`\`\`

### Step 9.2: Seed Database

Create seeders for:
- Subscription packages
- Roles and permissions
- Sample tenant
- Sample users

\`\`\`bash
php artisan db:seed
\`\`\`

### Step 9.3: Test API Endpoints

Use Postman or similar tool to test all endpoints.

### Step 9.4: Deploy to Production

1. Set up production database
2. Configure environment variables
3. Run migrations
4. Set up SSL certificates
5. Configure web server (Nginx/Apache)
6. Set up queue workers for background jobs
7. Configure cron jobs for scheduled tasks

---

## 🎉 COMPLETION CHECKLIST

- [ ] Laravel 11 project created
- [ ] All packages installed
- [ ] Database migrations created and run
- [ ] Multi-tenancy middleware implemented
- [ ] Authentication system complete
- [ ] All core modules implemented (Properties, Investments, Loans, Wallet)
- [ ] Payment gateways integrated (Paystack, Remita, Stripe)
- [ ] White label system implemented
- [ ] Custom domain management implemented
- [ ] Landing page builder implemented
- [ ] API routes registered
- [ ] API tested
- [ ] Documentation complete
- [ ] Deployed to production

---

## 📞 SUPPORT

For questions or issues during implementation, refer to:
- Laravel Documentation: https://laravel.com/docs
- Laravel Sanctum: https://laravel.com/docs/sanctum
- Spatie Permissions: https://spatie.be/docs/laravel-permission

---

**END OF LARAVEL API BUILD GUIDE**
