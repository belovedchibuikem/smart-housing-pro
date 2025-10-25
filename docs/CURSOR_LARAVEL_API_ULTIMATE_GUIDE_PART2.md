# FRSC Housing Management System - Ultimate Laravel API Guide (Part 2)

**Continuation from Part 1**

---

## 4. Database Architecture (Continued)

### Central Database Migrations (Continued)

#### 2024_01_01_000006_create_subscriptions_table.php

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignUuid('package_id')->constrained('packages')->onDelete('restrict');
            $table->enum('status', ['trial', 'active', 'past_due', 'cancelled', 'expired'])->default('trial');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('payment_reference')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('package_id');
            $table->index('status');
            $table->index('ends_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
\`\`\`

#### 2024_01_01_000007_create_custom_domain_requests_table.php

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
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('domain');
            $table->enum('status', ['pending', 'verifying', 'verified', 'active', 'failed', 'rejected'])->default('pending');
            $table->string('verification_token')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->text('admin_notes')->nullable();
            $table->json('dns_records')->nullable();
            $table->boolean('ssl_enabled')->default(false);
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('domain');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_domain_requests');
    }
};
\`\`\`

#### 2024_01_01_000008_create_white_label_packages_table.php

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('white_label_packages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->enum('billing_cycle', ['one_time', 'monthly', 'yearly']);
            $table->json('features')->nullable(); // custom_domain, remove_branding, custom_css, etc.
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('white_label_packages');
    }
};
\`\`\`

#### 2024_01_01_000009_create_platform_transactions_table.php

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->string('reference')->unique();
            $table->enum('type', ['subscription', 'white_label', 'custom_domain', 'addon']);
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'refunded'])->default('pending');
            $table->string('payment_gateway')->nullable(); // paystack, stripe, bank_transfer
            $table->string('gateway_reference')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('reference');
            $table->index('status');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_transactions');
    }
};
\`\`\`

#### 2024_01_01_000010_create_activity_logs_table.php

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
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade');
            $table->uuidMorphs('causer'); // super_admin or tenant user
            $table->string('action');
            $table->string('module')->nullable();
            $table->text('description');
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            
            $table->index('tenant_id');
            $table->index('causer_type');
            $table->index('causer_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
\`\`\`

### Tenant Database Migrations

Create migration files in `database/migrations/tenant/`:

#### 2024_01_01_100001_create_users_table.php

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
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('phone', 20)->nullable();
            $table->string('avatar_url')->nullable();
            $table->enum('role', ['admin', 'manager', 'staff', 'member'])->default('member');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login')->nullable();
            $table->rememberToken();
            $table->timestamps();
            
            $table->index('email');
            $table->index('role');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
\`\`\`

#### 2024_01_01_100002_create_members_table.php

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->string('member_number')->unique();
            $table->string('staff_id')->nullable();
            $table->string('ippis_number')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->string('nationality')->default('Nigerian');
            $table->string('state_of_origin')->nullable();
            $table->string('lga')->nullable();
            $table->text('residential_address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('rank')->nullable();
            $table->string('department')->nullable();
            $table->string('command_state')->nullable();
            $table->date('employment_date')->nullable();
            $table->integer('years_of_service')->nullable();
            $table->enum('membership_type', ['regular', 'premium', 'vip'])->default('regular');
            $table->enum('kyc_status', ['pending', 'submitted', 'verified', 'rejected'])->default('pending');
            $table->timestamp('kyc_submitted_at')->nullable();
            $table->timestamp('kyc_verified_at')->nullable();
            $table->text('kyc_rejection_reason')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('member_number');
            $table->index('staff_id');
            $table->index('kyc_status');
            $table->index('membership_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
\`\`\`

**[Continuing with 30+ more tenant tables...]**

---

## 5. Multi-Tenancy Implementation

### Step 1: Install Tenancy Package

\`\`\`bash
composer require stancl/tenancy
php artisan tenancy:install
\`\`\`

### Step 2: Configure Tenancy

Create `config/tenancy.php`:

\`\`\`php
<?php

return [
    'tenant_model' => \App\Models\Central\Tenant::class,
    
    'id_generator' => \Stancl\Tenancy\UUIDGenerator::class,
    
    'database' => [
        'based_on' => null,
        'prefix' => 'tenant_',
        'suffix' => '',
        'template_tenant_connection' => 'tenant',
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
        'root_override' => [
            'local' => '%storage_path%/app/tenant%tenant_id%',
            'public' => '%storage_path%/app/public/tenant%tenant_id%',
        ],
    ],
    
    'features' => [
        \Stancl\Tenancy\Features\TenantConfig::class,
        \Stancl\Tenancy\Features\UniversalRoutes::class,
        \Stancl\Tenancy\Features\TenantRedirect::class,
    ],
    
    'migration_parameters' => [
        '--force' => true,
        '--path' => [database_path('migrations/tenant')],
        '--realpath' => true,
    ],
    
    'seeder_parameters' => [
        '--class' => 'TenantDatabaseSeeder',
    ],
];
\`\`\`

### Step 3: Create Tenant Model

`app/Models/Central/Tenant.php`:

\`\`\`php
<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends Model implements TenantWithDatabase
{
    use HasFactory, HasUuids, HasDatabase, HasDomains;

    protected $connection = 'pgsql'; // Central database

    protected $fillable = [
        'name',
        'slug',
        'custom_domain',
        'logo_url',
        'primary_color',
        'secondary_color',
        'contact_email',
        'contact_phone',
        'address',
        'status',
        'subscription_status',
        'trial_ends_at',
        'subscription_ends_at',
        'settings',
        'metadata',
    ];

    protected $casts = [
        'settings' => 'array',
        'metadata' => 'array',
        'trial_ends_at' => 'datetime',
        'subscription_ends_at' => 'datetime',
    ];

    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latest();
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function customDomainRequests(): HasMany
    {
        return $this->hasMany(CustomDomainRequest::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PlatformTransaction::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isOnTrial(): bool
    {
        return $this->subscription_status === 'trial' 
            && $this->trial_ends_at 
            && $this->trial_ends_at->isFuture();
    }

    public function hasActiveSubscription(): bool
    {
        return $this->subscription_status === 'active' 
            && $this->subscription_ends_at 
            && $this->subscription_ends_at->isFuture();
    }

    public function getFullDomainAttribute(): string
    {
        return $this->custom_domain ?? $this->slug . env('DEFAULT_SUBDOMAIN_SUFFIX', '.frsc-housing.com');
    }
}
\`\`\`

### Step 4: Create Tenant Middleware

`app/Http/Middleware/TenantMiddleware.php`:

\`\`\`php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Tenancy;
use Stancl\Tenancy\Resolvers\DomainTenantResolver;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    protected $tenancy;
    protected $resolver;

    public function __construct(Tenancy $tenancy, DomainTenantResolver $resolver)
    {
        $this->tenancy = $tenancy;
        $this->resolver = $resolver;
    }

    public function handle(Request $request, Closure $next): Response
    {
        // Extract tenant from subdomain or custom domain
        $host = $request->getHost();
        
        // Try to resolve tenant
        $tenant = $this->resolver->resolve($request);
        
        if (!$tenant) {
            return response()->json([
                'message' => 'Tenant not found',
            ], 404);
        }

        // Check if tenant is active
        if ($tenant->status !== 'active') {
            return response()->json([
                'message' => 'Tenant account is not active',
            ], 403);
        }

        // Initialize tenant context
        $this->tenancy->initialize($tenant);

        return $next($request);
    }
}
\`\`\`

---

## 6. Authentication & Authorization

### Step 1: Create Auth Controllers

`app/Http/Controllers/Api/Auth/RegisterController.php`:

\`\`\`php
<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\Auth\UserResource;
use App\Models\Tenant\User;
use App\Models\Tenant\Member;
use App\Services\Auth\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function __construct(
        protected RegistrationService $registrationService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'first_name' => $request->first_name,
                'last_name' => $request->last_name,
                'phone' => $request->phone,
                'role' => 'member',
                'status' => 'active',
            ]);

            // Create member profile
            $member = Member::create([
                'user_id' => $user->id,
                'member_number' => $this->registrationService->generateMemberNumber(),
                'staff_id' => $request->staff_id,
                'ippis_number' => $request->ippis_number,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'marital_status' => $request->marital_status,
                'nationality' => $request->nationality ?? 'Nigerian',
                'state_of_origin' => $request->state_of_origin,
                'lga' => $request->lga,
                'residential_address' => $request->residential_address,
                'city' => $request->city,
                'state' => $request->state,
                'rank' => $request->rank,
                'department' => $request->department,
                'command_state' => $request->command_state,
                'employment_date' => $request->employment_date,
                'years_of_service' => $request->years_of_service,
                'membership_type' => 'regular',
                'kyc_status' => 'pending',
            ]);

            // Send verification email
            $this->registrationService->sendVerificationEmail($user);

            DB::commit();

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful',
                'user' => new UserResource($user),
                'token' => $token,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
\`\`\`

**[Continue with 100+ more API endpoints...]**

---

**PART 2 SUMMARY:**

This part covers:
✅ Complete Central Database Migrations (11 tables)
✅ Tenant Database Migrations (Started with Users & Members)
✅ Multi-Tenancy Implementation with Stancl/Tenancy
✅ Tenant Model with relationships
✅ Tenant Middleware for request handling
✅ Authentication Controllers (Registration started)

**REMAINING SECTIONS:**
- Complete all Tenant Database Migrations (28 more tables)
- Complete Authentication & Authorization (Login, Logout, Password Reset, OTP, KYC)
- All API Endpoints (User, Admin, Super Admin - 100+ endpoints)
- Payment Gateway Integration (Paystack, Remita, Stripe)
- File Storage & Management
- Email & Notifications
- Testing Strategy
- Deployment Guide

**Total estimated length: 3000+ lines when complete**

Would you like me to continue with Part 3?
