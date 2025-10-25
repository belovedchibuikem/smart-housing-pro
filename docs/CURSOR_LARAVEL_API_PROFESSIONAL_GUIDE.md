# CURSOR AI IDE - Professional Laravel API Development Guide
## FRSC Housing Management Multi-Tenant SaaS Platform
### Senior Laravel Developer Edition

> **Purpose**: This document provides enterprise-grade, production-ready instructions for building the complete Laravel API backend using senior-level best practices, design patterns, and architectural decisions.

---

## Table of Contents

### Part 1: Foundation & Architecture
1. [Project Setup & Professional Architecture](#1-project-setup--professional-architecture)
2. [Database Design with Optimization](#2-database-design-with-optimization)
3. [Multi-Tenancy with Stancl/Tenancy](#3-multi-tenancy-implementation)
4. [Authentication & Authorization (Sanctum + Permissions)](#4-authentication--authorization)

### Part 2: Core Business Logic
5. [User Dashboard APIs (Complete)](#5-user-dashboard-apis)
6. [Admin Dashboard APIs (Complete)](#6-admin-dashboard-apis)
7. [Super Admin Dashboard APIs (Complete)](#7-super-admin-dashboard-apis)
8. [SaaS & Business Landing Page APIs](#8-saas--business-landing-page-apis)

### Part 3: Advanced Features
9. [Payment Gateway Integration (Multi-Gateway)](#9-payment-gateway-integration)
10. [White Label System](#10-white-label-system)
11. [Landing Page Builder APIs](#11-landing-page-builder-apis)
12. [File Storage & CDN Integration](#12-file-storage--cdn-integration)

### Part 4: Quality & Deployment
13. [Email & Notification System](#13-email--notification-system)
14. [Testing Strategy (Unit, Feature, Integration)](#14-testing-strategy)
15. [Performance Optimization](#15-performance-optimization)
16. [Security Best Practices](#16-security-best-practices)
17. [API Documentation (Swagger/OpenAPI)](#17-api-documentation)
18. [Deployment & DevOps](#18-deployment--devops)

---

## 1. Project Setup & Professional Architecture

### 1.1 Initialize Laravel 11 Project with Professional Structure

\`\`\`bash
# Create Laravel 11 project
composer create-project laravel/laravel frsc-housing-api "11.*"
cd frsc-housing-api

# Install core packages
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require stancl/tenancy
composer require stripe/stripe-php
composer require unicodeveloper/laravel-paystack
composer require league/flysystem-aws-s3-v3
composer require intervention/image
composer require spatie/laravel-query-builder
composer require spatie/laravel-activitylog
composer require laravel/horizon
composer require predis/predis

# Install development packages
composer require --dev laravel/pint
composer require --dev pestphp/pest
composer require --dev pestphp/pest-plugin-laravel
composer require --dev barryvdh/laravel-ide-helper
composer require --dev nunomaduro/larastan
composer require --dev darkaonline/l5-swagger

# Generate IDE helper files
php artisan ide-helper:generate
php artisan ide-helper:models
php artisan ide-helper:meta
\`\`\`

### 1.2 Professional Project Structure

\`\`\`
frsc-housing-api/
├── app/
│   ├── Actions/              # Single-purpose action classes
│   │   ├── Loan/
│   │   │   ├── ApproveLoanAction.php
│   │   │   ├── DisburseLoanAction.php
│   │   │   └── CalculateLoanRepaymentAction.php
│   │   ├── Payment/
│   │   │   ├── InitializePaymentAction.php
│   │   │   └── VerifyPaymentAction.php
│   │   └── Tenant/
│   │       ├── CreateTenantAction.php
│   │       └── ProvisionTenantDatabaseAction.php
│   │
│   ├── Data/                 # Data Transfer Objects (DTOs)
│   │   ├── LoanApplicationData.php
│   │   ├── PaymentData.php
│   │   └── UserRegistrationData.php
│   │
│   ├── Enums/                # PHP 8.1+ Enums
│   │   ├── LoanStatus.php
│   │   ├── PaymentMethod.php
│   │   ├── MembershipType.php
│   │   └── KYCStatus.php
│   │
│   ├── Events/               # Domain events
│   │   ├── LoanApproved.php
│   │   ├── PaymentReceived.php
│   │   └── KYCSubmitted.php
│   │
│   ├── Exceptions/           # Custom exceptions
│   │   ├── InsufficientBalanceException.php
│   │   ├── LoanEligibilityException.php
│   │   └── TenantNotFoundException.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── V1/      # API versioning
│   │   │   │   │   ├── Auth/
│   │   │   │   │   │   ├── LoginController.php
│   │   │   │   │   │   ├── RegisterController.php
│   │   │   │   │   │   └── PasswordResetController.php
│   │   │   │   │   ├── User/
│   │   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   │   ├── ProfileController.php
│   │   │   │   │   │   ├── LoanController.php
│   │   │   │   │   │   ├── InvestmentController.php
│   │   │   │   │   │   ├── PropertyController.php
│   │   │   │   │   │   ├── WalletController.php
│   │   │   │   │   │   ├── ContributionController.php
│   │   │   │   │   │   └── KYCController.php
│   │   │   │   │   ├── Admin/
│   │   │   │   │   │   ├── DashboardController.php
│   │   │   │   │   │   ├── MemberController.php
│   │   │   │   │   │   ├── LoanController.php
│   │   │   │   │   │   ├── PropertyController.php
│   │   │   │   │   │   ├── ReportController.php
│   │   │   │   │   │   ├── PaymentGatewayController.php
│   │   │   │   │   │   ├── WhiteLabelController.php
│   │   │   │   │   │   └── LandingPageController.php
│   │   │   │   │   └── SuperAdmin/
│   │   │   │   │       ├── TenantController.php
│   │   │   │   │       ├── PackageController.php
│   │   │   │   │       ├── SubscriptionController.php
│   │   │   │   │       └── DomainRequestController.php
│   │   ├── Middleware/
│   │   │   ├── IdentifyTenant.php
│   │   │   ├── CheckSubscription.php
│   │   │   ├── EnsureKYCApproved.php
│   │   │   └── CheckFeatureAccess.php
│   │   ├── Requests/         # Form Request Validation
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── RegisterRequest.php
│   │   │   ├── Loan/
│   │   │   │   ├── StoreLoanApplicationRequest.php
│   │   │   │   └── ApproveLoanRequest.php
│   │   │   └── Payment/
│   │   │       └── InitializePaymentRequest.php
│   │   └── Resources/        # API Resources
│   │       ├── UserResource.php
│   │       ├── LoanResource.php
│   │       ├── PropertyResource.php
│   │       └── Collections/
│   │           ├── LoanCollection.php
│   │           └── PropertyCollection.php
│   │
│   ├── Jobs/                 # Queue jobs
│   │   ├── ProcessLoanDisbursement.php
│   │   ├── GenerateMonthlyStatements.php
│   │   ├── SendPaymentReminders.php
│   │   └── ProcessBulkContributions.php
│   │
│   ├── Listeners/            # Event listeners
│   │   ├── SendLoanApprovalNotification.php
│   │   ├── UpdateWalletBalance.php
│   │   └── LogUserActivity.php
│   │
│   ├── Models/
│   │   ├── Central/          # Central database models
│   │   │   ├── Tenant.php
│   │   │   ├── SubscriptionPackage.php
│   │   │   ├── Subscription.php
│   │   │   └── CustomDomainRequest.php
│   │   └── Tenant/           # Tenant database models
│   │       ├── User.php
│   │       ├── Loan.php
│   │       ├── Property.php
│   │       ├── Investment.php
│   │       └── ... (all tenant models)
│   │
│   ├── Observers/            # Model observers
│   │   ├── LoanObserver.php
│   │   ├── UserObserver.php
│   │   └── PaymentObserver.php
│   │
│   ├── Policies/             # Authorization policies
│   │   ├── LoanPolicy.php
│   │   ├── PropertyPolicy.php
│   │   └── UserPolicy.php
│   │
│   ├── Repositories/         # Repository pattern
│   │   ├── Contracts/
│   │   │   ├── LoanRepositoryInterface.php
│   │   │   ├── UserRepositoryInterface.php
│   │   │   └── PropertyRepositoryInterface.php
│   │   └── Eloquent/
│   │       ├── LoanRepository.php
│   │       ├── UserRepository.php
│   │       └── PropertyRepository.php
│   │
│   ├── Services/             # Business logic services
│   │   ├── Auth/
│   │   │   └── AuthService.php
│   │   ├── Payment/
│   │   │   ├── PaymentService.php
│   │   │   ├── PaystackService.php
│   │   │   ├── StripeService.php
│   │   │   └── RemitaService.php
│   │   ├── Loan/
│   │   │   ├── LoanService.php
│   │   │   └── LoanCalculationService.php
│   │   ├── Tenant/
│   │   │   └── TenantService.php
│   │   ├── WhiteLabel/
│   │   │   └── WhiteLabelService.php
│   │   └── Notification/
│   │       └── NotificationService.php
│   │
│   └── Traits/               # Reusable traits
│       ├── HasWallet.php
│       ├── HasContributions.php
│       └── LogsActivity.php
│
├── config/
│   ├── tenancy.php
│   ├── payment.php
│   └── white-label.php
│
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── central/          # Central database migrations
│   │   └── tenant/           # Tenant database migrations
│   └── seeders/
│       ├── Central/
│       │   └── PackageSeeder.php
│       └── Tenant/
│           ├── RoleSeeder.php
│           └── DemoDataSeeder.php
│
├── routes/
│   ├── api.php               # Central API routes
│   ├── tenant.php            # Tenant API routes
│   └── web.php
│
└── tests/
    ├── Feature/
    │   ├── Auth/
    │   ├── Loan/
    │   └── Payment/
    └── Unit/
        ├── Services/
        └── Actions/
\`\`\`

### 1.3 Environment Configuration (.env)

\`\`\`env
APP_NAME="FRSC Housing Management API"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.frschousing.com
APP_TIMEZONE=Africa/Lagos

# Central Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=frsc_housing_central
DB_USERNAME=root
DB_PASSWORD=

# Tenant Database Template
TENANT_DB_CONNECTION=tenant
TENANT_DB_HOST=127.0.0.1
TENANT_DB_PORT=3306
TENANT_DB_USERNAME=root
TENANT_DB_PASSWORD=

# Redis
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1

# Queue
QUEUE_CONNECTION=redis
QUEUE_FAILED_DRIVER=database

# Cache
CACHE_DRIVER=redis
CACHE_PREFIX=frsc_

# Session
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Payment Gateways (Central - for SaaS subscriptions)
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PAYMENT_URL=https://api.paystack.co
PAYSTACK_MERCHANT_EMAIL=

STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

REMITA_MERCHANT_ID=
REMITA_API_KEY=
REMITA_SERVICE_TYPE_ID=
REMITA_API_URL=https://remitademo.net/remita/exapp/api/v1/send/api

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=frsc-housing-files
AWS_USE_PATH_STYLE_ENDPOINT=false
AWS_URL=

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@frschousing.com"
MAIL_FROM_NAME="${APP_NAME}"

# Logging
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,frschousing.com
SANCTUM_GUARD=web

# Horizon
HORIZON_DOMAIN=horizon.frschousing.com
HORIZON_PATH=horizon

# Application Settings
DEFAULT_CURRENCY=NGN
DEFAULT_TIMEZONE=Africa/Lagos
PAGINATION_PER_PAGE=15
MAX_UPLOAD_SIZE=10240
TRIAL_DAYS=14
\`\`\`

---

## 2. Database Design with Optimization

### 2.1 Central Database Migrations (Multi-Tenant Management)

#### Create Tenants Table with Indexes

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
            $table->string('tenant_id', 50)->unique();
            $table->string('business_name');
            $table->string('subdomain', 100)->unique();
            $table->string('custom_domain', 255)->nullable()->unique();
            $table->boolean('custom_domain_verified')->default(false);
            $table->string('database_name', 100);
            $table->enum('status', ['active', 'suspended', 'inactive', 'trial'])->default('trial');
            $table->foreignId('package_id')->constrained('subscription_packages');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('subscription_ends_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index(['subdomain', 'status']);
            $table->index('custom_domain');
            $table->index('status');
            $table->index('subscription_ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
\`\`\`

#### Create Subscription Packages Table

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
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->text('description')->nullable();
            $table->decimal('monthly_price', 10, 2);
            $table->decimal('annual_price', 10, 2);
            
            // Limits
            $table->integer('max_members')->default(100);
            $table->integer('max_properties')->default(10);
            $table->integer('max_admins')->default(5);
            $table->integer('max_storage_gb')->default(5);
            
            // Features
            $table->boolean('custom_domain_enabled')->default(false);
            $table->boolean('white_label_enabled')->default(false);
            $table->boolean('api_access_enabled')->default(false);
            $table->boolean('advanced_reports_enabled')->default(false);
            $table->boolean('priority_support_enabled')->default(false);
            $table->json('features')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('trial_days')->default(14);
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
            
            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_packages');
    }
};
\`\`\`

### 2.2 Tenant Database Migrations (Business-Specific Data)

#### Users Table with Comprehensive Fields

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
            $table->string('member_id', 50)->unique();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            
            // Employment Information
            $table->string('staff_id', 50)->nullable()->index();
            $table->string('ippis_number', 50)->nullable()->unique();
            $table->string('rank', 100)->nullable();
            $table->string('department', 100)->nullable();
            $table->string('command_state', 100)->nullable();
            $table->date('employment_date')->nullable();
            $table->integer('years_of_service')->nullable();
            
            // Personal Information
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->string('nationality', 100)->default('Nigerian');
            $table->string('state_of_origin', 100)->nullable();
            $table->string('lga', 100)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            
            // KYC Information
            $table->enum('kyc_status', ['pending', 'submitted', 'approved', 'rejected'])->default('pending');
            $table->timestamp('kyc_submitted_at')->nullable();
            $table->timestamp('kyc_approved_at')->nullable();
            $table->text('kyc_rejection_reason')->nullable();
            
            // Membership Information
            $table->enum('membership_type', ['non-member', 'associate', 'full-member', 'life-member'])->default('non-member');
            $table->timestamp('membership_upgraded_at')->nullable();
            $table->decimal('membership_fee_paid', 10, 2)->default(0);
            
            // Financial Information (denormalized for performance)
            $table->decimal('wallet_balance', 15, 2)->default(0)->index();
            $table->decimal('contribution_balance', 15, 2)->default(0);
            $table->decimal('total_contributions', 15, 2)->default(0);
            $table->decimal('total_loans', 15, 2)->default(0);
            $table->decimal('total_investments', 15, 2)->default(0);
            
            // Account Status
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
            
            // Composite indexes for common queries
            $table->index(['email', 'status']);
            $table->index(['kyc_status', 'membership_type']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
\`\`\`

---

## 3. Multi-Tenancy Implementation

### 3.1 Tenant Model with Business Logic

\`\`\`php
<?php
// app/Models/Central/Tenant.php

namespace App\Models\Central;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, SoftDeletes;

    protected $connection = 'mysql';
    
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

    // Relationships
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

    // Business Logic Methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isOnTrial(): bool
    {
        return $this->status === 'trial' && 
               $this->trial_ends_at && 
               $this->trial_ends_at->isFuture();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription_ends_at && 
               $this->subscription_ends_at->isFuture();
    }

    public function canAccess(): bool
    {
        return $this->isActive() && 
               ($this->isOnTrial() || $this->hasActiveSubscription());
    }

    public function hasFeature(string $feature): bool
    {
        return $this->package->hasFeature($feature);
    }

    public function withinLimit(string $limit, int $current): bool
    {
        $maxLimit = $this->package->{"max_{$limit}"} ?? PHP_INT_MAX;
        return $current < $maxLimit;
    }
}
\`\`\`

### 3.2 Tenant Service with Professional Patterns

\`\`\`php
<?php
// app/Services/Tenant/TenantService.php

namespace App\Services\Tenant;

use App\Models\Central\Tenant;
use App\Models\Central\SubscriptionPackage;
use App\Actions\Tenant\CreateTenantAction;
use App\Actions\Tenant\ProvisionTenantDatabaseAction;
use App\Exceptions\TenantCreationException;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TenantService
{
    public function __construct(
        private CreateTenantAction $createTenantAction,
        private ProvisionTenantDatabaseAction $provisionDatabaseAction
    ) {}

    public function createTenant(array $data): Tenant
    {
        DB::beginTransaction();
        
        try {
            // Generate unique identifiers
            $tenantId = $this->generateUniqueTenantId($data['business_name']);
            $subdomain = $this->generateUniqueSubdomain($data['business_name']);
            $databaseName = "tenant_{$tenantId}";

            // Create tenant record
            $tenant = $this->createTenantAction->execute([
                'tenant_id' => $tenantId,
                'business_name' => $data['business_name'],
                'subdomain' => $subdomain,
                'database_name' => $databaseName,
                'status' => 'trial',
                'package_id' => $data['package_id'],
                'trial_ends_at' => now()->addDays(config('app.trial_days', 14)),
                'metadata' => $data['metadata'] ?? [],
            ]);

            // Provision tenant database
            $this->provisionDatabaseAction->execute($tenant, $data);

            DB::commit();

            Log::info("Tenant created successfully", ['tenant_id' => $tenant->tenant_id]);

            return $tenant->fresh();
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Tenant creation failed", [
                'error' => $e->getMessage(),
                'data' => $data
            ]);
            throw new TenantCreationException("Failed to create tenant: " . $e->getMessage());
        }
    }

    private function generateUniqueTenantId(string $businessName): string
    {
        $base = Str::slug($businessName);
        $tenantId = $base;
        $counter = 1;

        while (Tenant::where('tenant_id', $tenantId)->exists()) {
            $tenantId = "{$base}-{$counter}";
            $counter++;
        }

        return $tenantId;
    }

    private function generateUniqueSubdomain(string $businessName): string
    {
        $base = Str::slug($businessName);
        $domain = config('app.domain', 'frschousing.com');
        $subdomain = "{$base}.{$domain}";
        $counter = 1;

        while (Tenant::where('subdomain', $subdomain)->exists()) {
            $subdomain = "{$base}-{$counter}.{$domain}";
            $counter++;
        }

        return $subdomain;
    }

    public function suspendTenant(Tenant $tenant, string $reason): bool
    {
        $tenant->update([
            'status' => 'suspended',
            'metadata' => array_merge($tenant->metadata ?? [], [
                'suspension_reason' => $reason,
                'suspended_at' => now()->toIso8601String(),
            ]),
        ]);

        Log::warning("Tenant suspended", [
            'tenant_id' => $tenant->tenant_id,
            'reason' => $reason
        ]);

        return true;
    }

    public function reactivateTenant(Tenant $tenant): bool
    {
        $tenant->update([
            'status' => 'active',
            'metadata' => array_merge($tenant->metadata ?? [], [
                'reactivated_at' => now()->toIso8601String(),
            ]),
        ]);

        Log::info("Tenant reactivated", ['tenant_id' => $tenant->tenant_id]);

        return true;
    }
}
\`\`\`

---

## 4. Authentication & Authorization

### 4.1 Professional Auth Controller with Form Requests

\`\`\`php
<?php
// app/Http/Controllers/Api/V1/Auth/LoginController.php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function __invoke(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated('email'),
            $request->validated('password'),
            $request->ip()
        );

        if (!$result['success']) {
            return response()->json([
                'message' => $result['message'],
            ], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
            'token_type' => 'Bearer',
            'expires_in' => config('sanctum.expiration', 525600), // minutes
        ]);
    }
}
\`\`\`

\`\`\`php
<?php
// app/Http/Requests/Auth/LoginRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required',
            'email.email' => 'Please provide a valid email address',
            'password.required' => 'Password is required',
            'password.min' => 'Password must be at least 8 characters',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
\`\`\`

\`\`\`php
<?php
// app/Services/Auth/AuthService.php

namespace App\Services\Auth;

use App\Models\Tenant\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(string $email, string $password, string $ip): array
    {
        // Rate limiting
        $key = "login:{$ip}";
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return [
                'success' => false,
                'message' => "Too many login attempts. Please try again in {$seconds} seconds.",
            ];
        }

        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            RateLimiter::hit($key, 60); // 1 minute lockout
            return [
                'success' => false,
                'message' => 'Invalid credentials',
            ];
        }

        if ($user->status !== 'active') {
            return [
                'success' => false,
                'message' => 'Your account is inactive. Please contact support.',
            ];
        }

        // Clear rate limiter on successful login
        RateLimiter::clear($key);

        // Update last login
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $ip,
        ]);

        // Create token
        $token = $user->createToken('auth_token', ['*'], now()->addYear())->plainTextToken;

        return [
            'success' => true,
            'user' => $user->load('roles', 'permissions'),
            'token' => $token,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
\`\`\`

---

## 5. User Dashboard APIs (Complete)

### 5.1 Dashboard Controller with Statistics

\`\`\`php
<?php
// app/Http/Controllers/Api/V1/User/DashboardController.php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Cache dashboard stats for 5 minutes
        $stats = Cache::remember("user_dashboard_{$user->id}", 300, function () use ($user) {
            return [
                'financial' => [
                    'wallet_balance' => $user->wallet_balance,
                    'contribution_balance' => $user->contribution_balance,
                    'total_contributions' => $user->total_contributions,
                    'total_loans' => $user->total_loans,
                    'total_investments' => $user->total_investments,
                ],
                'counts' => [
                    'active_loans' => $user->loans()->where('status', 'active')->count(),
                    'active_investments' => $user->investments()->where('status', 'active')->count(),
                    'pending_allotments' => $user->propertyAllotments()->where('status', 'pending')->count(),
                    'unread_notifications' => $user->notifications()->where('is_read', false)->count(),
                    'pending_maintenance' => $user->maintenanceRequests()->where('status', 'pending')->count(),
                ],
                'membership' => [
                    'type' => $user->membership_type,
                    'kyc_status' => $user->kyc_status,
                    'member_since' => $user->created_at->format('Y-m-d'),
                    'years_of_service' => $user->years_of_service,
                ],
            ];
        });

        // Recent transactions (not cached)
        $recentTransactions = $user->walletTransactions()
            ->latest()
            ->take(5)
            ->get(['id', 'transaction_code', 'type', 'amount', 'category', 'description', 'created_at']);

        // Upcoming payments
        $upcomingPayments = $user->loanRepayments()
            ->where('status', 'pending')
            ->where('due_date', '>=', now())
            ->orderBy('due_date')
            ->take(5)
            ->with('loan:id,loan_number,principal_amount')
            ->get(['id', 'loan_id', 'amount', 'due_date', 'status']);

        return response()->json([
            'stats' => $stats,
            'recent_transactions' => $recentTransactions,
            'upcoming_payments' => $upcomingPayments,
        ]);
    }
}
\`\`\`

### 5.2 Loan Controller with Repository Pattern

\`\`\`php
<?php
// app/Http/Controllers/Api/V1/User/LoanController.php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Loan\StoreLoanApplicationRequest;
use App\Http\Resources\LoanResource;
use App\Http\Resources\Collections\LoanCollection;
use App\Repositories\Contracts\LoanRepositoryInterface;
use App\Services\Loan\LoanService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LoanController extends Controller
{
    public function __construct(
        private LoanRepositoryInterface $loanRepository,
        private LoanService $loanService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $loans = $this->loanRepository->getUserLoans(
            $request->user()->id,
            $request->input('status'),
            $request->input('per_page', 15)
        );

        return response()->json([
            'loans' => new LoanCollection($loans),
        ]);
    }

    public function store(StoreLoanApplicationRequest $request): JsonResponse
    {
        $loan = $this->loanService->applyForLoan(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Loan application submitted successfully',
            'loan' => new LoanResource($loan),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $loan = $this->loanRepository->findByIdAndUser($id, $request->user()->id);

        if (!$loan) {
            return response()->json([
                'message' => 'Loan not found',
            ], 404);
        }

        return response()->json([
            'loan' => new LoanResource($loan->load('loanPlan', 'repayments')),
        ]);
    }
}
\`\`\`

---

**This is Part 1 of the Professional Laravel API Guide. The document continues with:**

- Complete Admin Dashboard APIs (Members, Loans, Properties, Reports, Payment Gateways, White Label, Landing Page Builder)
- Complete Super Admin Dashboard APIs (Tenants, Packages, Subscriptions, Domain Requests)
- SaaS & Business Landing Page APIs
- Payment Gateway Integration (Multi-Gateway with Strategy Pattern)
- White Label System Implementation
- Landing Page Builder APIs
- File Storage & CDN
- Email & Notifications
- Testing Strategy
- Performance Optimization
- Security Best Practices
- API Documentation
- Deployment

**Total estimated length: 3000+ lines of production-ready code with best practices.**

Would you like me to continue with the remaining sections?
