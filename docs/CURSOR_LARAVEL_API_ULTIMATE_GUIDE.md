# FRSC Housing Management System - Ultimate Laravel API Development Guide for Cursor AI

**Version:** 2.0  
**Target:** Laravel 11.x  
**Database:** MYSQL 8.x+  
**Authentication:** Laravel Sanctum  
**Architecture:** Multi-Tenant SaaS Platform

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Project Setup](#project-setup)
4. [Database Architecture](#database-architecture)
5. [Multi-Tenancy Implementation](#multi-tenancy-implementation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Core API Endpoints](#core-api-endpoints)
8. [Payment Gateway Integration](#payment-gateway-integration)
9. [File Storage & Management](#file-storage--management)
10. [Email & Notifications](#email--notifications)
11. [Testing Strategy](#testing-strategy)
12. [Deployment](#deployment)

---

## 1. Project Overview

### System Description
The FRSC Housing Management System is a comprehensive multi-tenant SaaS platform designed for housing cooperatives. It enables businesses to manage members, properties, loans, investments, contributions, and more through a white-labeled interface.

### Key Features
- **Multi-Tenancy:** Each business operates in isolated database with shared central management
- **White Labeling:** Custom branding, colors, logos, and domain names per tenant
- **Landing Page Builder:** Drag-and-drop page builder for business landing pages
- **Payment Processing:** Integrated Paystack, Remita, Stripe, and manual bank transfers
- **Member Management:** KYC verification, membership tiers, document management
- **Financial Modules:** Loans, investments, contributions, wallets, statutory charges
- **Property Management:** Listings, allocations, maintenance requests
- **Communication:** Internal mail service, notifications
- **Reports & Analytics:** Comprehensive reporting across all modules
- **Role-Based Access:** Granular permissions for super admin, admin, and users

### Technology Stack
\`\`\`
Backend: Laravel 11.x
Database: PostgreSQL 15+
Cache: Redis
Queue: Redis
Storage: AWS S3 / Local
Email: SMTP / SendGrid
Payment: Paystack, Remita, Stripe
\`\`\`

---

## 2. Architecture & Design Patterns

### Clean Architecture Layers

\`\`\`
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Controllers, Resources, Requests)     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Application Layer               │
│     (Services, Use Cases, DTOs)         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│          Domain Layer                   │
│    (Models, Repositories, Events)       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Infrastructure Layer               │
│  (Database, External APIs, Storage)     │
└─────────────────────────────────────────┘
\`\`\`

### Directory Structure

\`\`\`
app/
├── Console/
│   └── Commands/
├── Exceptions/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── Admin/
│   │   │   ├── Auth/
│   │   │   ├── SuperAdmin/
│   │   │   └── User/
│   │   └── Controller.php
│   ├── Middleware/
│   │   ├── TenantMiddleware.php
│   │   ├── CheckRole.php
│   │   └── CheckSubscription.php
│   ├── Requests/
│   │   ├── Admin/
│   │   ├── Auth/
│   │   └── User/
│   └── Resources/
│       ├── Admin/
│       ├── Auth/
│       └── User/
├── Models/
│   ├── Central/
│   │   ├── Tenant.php
│   │   ├── Package.php
│   │   ├── SuperAdmin.php
│   │   └── Module.php
│   └── Tenant/
│       ├── User.php
│       ├── Member.php
│       ├── Property.php
│       ├── Loan.php
│       └── ...
├── Repositories/
│   ├── Contracts/
│   └── Eloquent/
├── Services/
│   ├── Auth/
│   ├── Payment/
│   ├── Tenant/
│   └── ...
├── Events/
├── Listeners/
├── Jobs/
├── Mail/
├── Notifications/
├── Policies/
└── Traits/
    ├── HasTenant.php
    └── UsesUuid.php

database/
├── migrations/
│   ├── central/
│   └── tenant/
├── seeders/
└── factories/

config/
├── tenancy.php
├── payment.php
└── ...

routes/
├── api.php
├── tenant.php
└── central.php

tests/
├── Feature/
│   ├── Auth/
│   ├── Admin/
│   └── User/
└── Unit/
    ├── Services/
    └── Repositories/
\`\`\`

---

## 3. Project Setup

### Step 1: Create Laravel Project

\`\`\`bash
# Create new Laravel 11 project
composer create-project laravel/laravel frsc-housing-api "11.*"

cd frsc-housing-api

# Install required packages
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require stancl/tenancy
composer require intervention/image
composer require maatwebsite/excel
composer require barryvdh/laravel-dompdf
composer require guzzlehttp/guzzle
composer require predis/predis

# Install development packages
composer require --dev laravel/pint
composer require --dev pestphp/pest
composer require --dev pestphp/pest-plugin-laravel
\`\`\`

### Step 2: Environment Configuration

Create `.env` file:

\`\`\`env
APP_NAME="FRSC Housing Management"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Central Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=frsc_central
DB_USERNAME=postgres
DB_PASSWORD=password

# Tenant Database Template
TENANT_DB_HOST=127.0.0.1
TENANT_DB_PORT=5432
TENANT_DB_USERNAME=postgres
TENANT_DB_PASSWORD=password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Queue
QUEUE_CONNECTION=redis

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@frsc-housing.com"
MAIL_FROM_NAME="${APP_NAME}"

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# Payment Gateways (Platform Keys - for testing)
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PAYMENT_URL=https://api.paystack.co

REMITA_MERCHANT_ID=
REMITA_API_KEY=
REMITA_SERVICE_TYPE_ID=
REMITA_API_URL=https://remitademo.net

STRIPE_KEY=
STRIPE_SECRET=

# Platform Settings
PLATFORM_DOMAIN=frsc-housing.com
DEFAULT_SUBDOMAIN_SUFFIX=.frsc-housing.com
\`\`\`

### Step 3: Database Configuration

Update `config/database.php`:

\`\`\`php
<?php

return [
    'default' => env('DB_CONNECTION', 'pgsql'),

    'connections' => [
        // Central database for platform management
        'pgsql' => [
            'driver' => 'pgsql',
            'url' => env('DATABASE_URL'),
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'),
            'database' => env('DB_DATABASE', 'frsc_central'),
            'username' => env('DB_USERNAME', 'postgres'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => 'prefer',
        ],

        // Tenant database template
        'tenant' => [
            'driver' => 'pgsql',
            'host' => env('TENANT_DB_HOST', '127.0.0.1'),
            'port' => env('TENANT_DB_PORT', '5432'),
            'database' => null, // Will be set dynamically
            'username' => env('TENANT_DB_USERNAME', 'postgres'),
            'password' => env('TENANT_DB_PASSWORD', ''),
            'charset' => 'utf8',
            'prefix' => '',
            'prefix_indexes' => true,
            'search_path' => 'public',
            'sslmode' => 'prefer',
        ],
    ],
];
\`\`\`

### Step 4: Install Sanctum

\`\`\`bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
\`\`\`

Update `config/sanctum.php`:

\`\`\`php
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    'expiration' => null,

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
        'validate_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
    ],
];
\`\`\`

---

## 4. Database Architecture

### Central Database Migrations

Create migration files in `database/migrations/central/`:

#### 2024_01_01_000001_create_super_admins_table.php

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('super_admins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('role')->default('super_admin'); // super_admin, support, billing
            $table->json('permissions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            $table->index('email');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('super_admins');
    }
};
\`\`\`

#### 2024_01_01_000002_create_modules_table.php

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('slug');
            $table->index('is_active');
        });

        // Seed default modules
        DB::table('modules')->insert([
            [
                'id' => Str::uuid(),
                'name' => 'Member Management',
                'slug' => 'members',
                'description' => 'Manage cooperative members and KYC',
                'icon' => 'Users',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Contributions',
                'slug' => 'contributions',
                'description' => 'Track member contributions and payments',
                'icon' => 'Wallet',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Loans',
                'slug' => 'loans',
                'description' => 'Loan products and applications',
                'icon' => 'TrendingUp',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Properties',
                'slug' => 'properties',
                'description' => 'Property listings and management',
                'icon' => 'Building2',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Investments',
                'slug' => 'investments',
                'description' => 'Investment plans and tracking',
                'icon' => 'PieChart',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Mortgages',
                'slug' => 'mortgages',
                'description' => 'Mortgage management',
                'icon' => 'Home',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Mail Service',
                'slug' => 'mail',
                'description' => 'Internal messaging system',
                'icon' => 'Mail',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Reports',
                'slug' => 'reports',
                'description' => 'Analytics and reporting',
                'icon' => 'BarChart',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Documents',
                'slug' => 'documents',
                'description' => 'Document management',
                'icon' => 'FileText',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'name' => 'Statutory Charges',
                'slug' => 'statutory',
                'description' => 'Statutory charges management',
                'icon' => 'Receipt',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
\`\`\`

#### 2024_01_01_000003_create_packages_table.php

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'yearly']);
            $table->integer('trial_days')->default(14);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->json('limits')->nullable(); // max_members, max_properties, etc.
            $table->timestamps();
            
            $table->index('slug');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
\`\`\`

#### 2024_01_01_000004_create_package_modules_table.php

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_modules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('package_id')->constrained('packages')->onDelete('cascade');
            $table->foreignUuid('module_id')->constrained('modules')->onDelete('cascade');
            $table->json('limits')->nullable(); // Module-specific limits
            $table->timestamps();
            
            $table->unique(['package_id', 'module_id']);
            $table->index('package_id');
            $table->index('module_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_modules');
    }
};
\`\`\`

#### 2024_01_01_000005_create_tenants_table.php

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
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique(); // Used for subdomain
            $table->string('custom_domain')->unique()->nullable();
            $table->string('logo_url')->nullable();
            $table->string('primary_color', 7)->default('#FDB11E');
            $table->string('secondary_color', 7)->default('#276254');
            $table->string('contact_email')->nullable();
            $table->string('contact_phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['active', 'suspended', 'cancelled'])->default('active');
            $table->enum('subscription_status', ['trial', 'active', 'past_due', 'cancelled'])->default('trial');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->json('settings')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('slug');
            $table->index('custom_domain');
            $table->index('status');
            $table->index('subscription_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
\`\`\`

**Continue with remaining central migrations...**

Due to length constraints, I'll create a comprehensive guide. Let me notify you that this is Part 1 of the documentation.

---

**PART 1 COMPLETE - This documentation covers:**
✅ Project Overview
✅ Architecture & Design Patterns  
✅ Project Setup (Composer, Environment, Database Config)
✅ Database Architecture (Central Database Migrations Started)

**REMAINING PARTS TO DOCUMENT:**
- Complete Central Database Migrations (6 more tables)
- Tenant Database Migrations (20+ tables)
- Multi-Tenancy Implementation
- Authentication & Authorization System
- All API Endpoints (100+ endpoints)
- Payment Gateway Integration
- File Storage & Management
- Email & Notifications
- Testing Strategy
- Deployment Guide

**Would you like me to continue with Part 2?** Type "continue" and I'll proceed with the remaining comprehensive documentation.
