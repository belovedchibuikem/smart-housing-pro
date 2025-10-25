# Laravel API Implementation Guide for FRSC Housing Management System

## Overview
This guide provides step-by-step instructions for implementing the Laravel backend API for the FRSC Housing Management System.

## Prerequisites
- PHP 8.1 or higher
- Composer
- MySQL 8.0 or higher
- Laravel 10.x
- Redis (optional, for caching and queues)

## Installation Steps

### 1. Create Laravel Project
\`\`\`bash
composer create-project laravel/laravel frsc-housing-api
cd frsc-housing-api
\`\`\`

### 2. Install Required Packages
\`\`\`bash
# Authentication
composer require laravel/sanctum

# Payment Gateways
composer require unicodeveloper/laravel-paystack
composer require remita/remita-php

# File Storage
composer require league/flysystem-aws-s3-v3

# API Documentation
composer require darkaonline/l5-swagger

# Image Processing
composer require intervention/image

# Excel Export
composer require maatwebsite/excel

# PDF Generation
composer require barryvdh/laravel-dompdf
\`\`\`

### 3. Environment Configuration
\`\`\`env
APP_NAME="FRSC Housing Management"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.frsc-housing.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=frsc_housing
DB_USERNAME=root
DB_PASSWORD=

# Sanctum
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,frsc-housing.com

# Payment Gateways
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_PAYMENT_URL=https://api.paystack.co

REMITA_MERCHANT_ID=
REMITA_SERVICE_TYPE_ID=
REMITA_API_KEY=
REMITA_API_URL=https://remitademo.net/remita/exapp/api/v1/send/api

# File Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_URL=

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@frsc-housing.com
MAIL_FROM_NAME="${APP_NAME}"

# Queue
QUEUE_CONNECTION=redis

# Cache
CACHE_DRIVER=redis

# Session
SESSION_DRIVER=redis
\`\`\`

### 4. Database Setup
\`\`\`bash
# Create database
mysql -u root -p
CREATE DATABASE frsc_housing;
exit;

# Run migrations
php artisan migrate
\`\`\`

### 5. Sanctum Setup
\`\`\`bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
\`\`\`

## Project Structure

\`\`\`
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   ├── RegisterController.php
│   │   │   │   └── LogoutController.php
│   │   │   ├── User/
│   │   │   │   ├── ProfileController.php
│   │   │   │   └── MembershipController.php
│   │   │   ├── Contribution/
│   │   │   │   └── ContributionController.php
│   │   │   ├── Loan/
│   │   │   │   ├── LoanController.php
│   │   │   │   ├── LoanPlanController.php
│   │   │   │   └── RepaymentController.php
│   │   │   ├── Investment/
│   │   │   │   ├── InvestmentController.php
│   │   │   │   └── InvestmentPlanController.php
│   │   │   ├── Property/
│   │   │   │   └── PropertyController.php
│   │   │   ├── Wallet/
│   │   │   │   └── WalletController.php
│   │   │   ├── Mail/
│   │   │   │   └── MailController.php
│   │   │   ├── Report/
│   │   │   │   └── ReportController.php
│   │   │   ├── StatutoryCharge/
│   │   │   │   └── StatutoryChargeController.php
│   │   │   ├── PropertyManagement/
│   │   │   │   ├── EstateController.php
│   │   │   │   ├── AllotmentController.php
│   │   │   │   └── MaintenanceController.php
│   │   │   ├── Mortgage/
│   │   │   │   └── MortgageController.php
│   │   │   ├── Document/
│   │   │   │   └── DocumentController.php
│   │   │   ├── Blockchain/
│   │   │   │   └── BlockchainController.php
│   │   │   └── Admin/
│   │   │       ├── DashboardController.php
│   │   │       ├── UserController.php
│   │   │       ├── ContributionController.php
│   │   │       ├── LoanController.php
│   │   │       ├── InvestmentController.php
│   │   │       ├── PropertyController.php
│   │   │       ├── WalletController.php
│   │   │       ├── StatutoryChargeController.php
│   │   │       ├── PropertyManagementController.php
│   │   │       └── SettingsController.php
│   ├── Middleware/
│   │   ├── CheckMembershipType.php
│   │   ├── CheckAdmin.php
│   │   └── LogActivity.php
│   ├── Requests/
│   │   ├── Auth/
│   │   │   ├── LoginRequest.php
│   │   │   └── RegisterRequest.php
│   │   ├── Contribution/
│   │   │   └── MakeContributionRequest.php
│   │   ├── Loan/
│   │   │   └── ApplyLoanRequest.php
│   │   └── ...
│   └── Resources/
│       ├── UserResource.php
│       ├── ContributionResource.php
│       ├── LoanResource.php
│       └── ...
├── Models/
│   ├── User.php
│   ├── NextOfKin.php
│   ├── Contribution.php
│   ├── LoanPlan.php
│   ├── Loan.php
│   ├── LoanRepayment.php
│   ├── InvestmentPlan.php
│   ├── Investment.php
│   ├── Property.php
│   ├── PropertySubscription.php
│   ├── Wallet.php
│   ├── WalletTransaction.php
│   ├── WithdrawalRequest.php
│   ├── Message.php
│   ├── MessageRecipient.php
│   ├── StatutoryChargeType.php
│   ├── StatutoryChargePayment.php
│   ├── Estate.php
│   ├── Allotment.php
│   ├── MaintenanceRequest.php
│   ├── Mortgage.php
│   ├── Document.php
│   ├── BlockchainRecord.php
│   ├── ActivityLog.php
│   └── SystemSetting.php
├── Services/
│   ├── PaymentService.php
│   ├── PaystackService.php
│   ├── RemitaService.php
│   ├── WalletService.php
│   ├── LoanService.php
│   ├── InvestmentService.php
│   ├── NotificationService.php
│   ├── ReportService.php
│   └── BlockchainService.php
├── Jobs/
│   ├── SendEmailNotification.php
│   ├── ProcessPayment.php
│   ├── GenerateInvestmentCertificate.php
│   └── UpdateLoanStatus.php
├── Events/
│   ├── ContributionMade.php
│   ├── LoanApproved.php
│   ├── InvestmentMatured.php
│   └── PaymentReceived.php
├── Listeners/
│   ├── SendContributionNotification.php
│   ├── SendLoanApprovalNotification.php
│   └── SendInvestmentMaturityNotification.php
└── Traits/
    ├── HasWallet.php
    ├── Payable.php
    └── Loggable.php

database/
├── migrations/
│   ├── 2024_01_01_000001_create_users_table.php
│   ├── 2024_01_01_000002_create_next_of_kin_table.php
│   ├── 2024_01_01_000003_create_contributions_table.php
│   └── ...
├── seeders/
│   ├── DatabaseSeeder.php
│   ├── UserSeeder.php
│   ├── LoanPlanSeeder.php
│   ├── InvestmentPlanSeeder.php
│   └── StatutoryChargeTypeSeeder.php
└── factories/
    ├── UserFactory.php
    ├── ContributionFactory.php
    └── ...

routes/
├── api.php
└── web.php

tests/
├── Feature/
│   ├── Auth/
│   │   ├── LoginTest.php
│   │   └── RegisterTest.php
│   ├── Contribution/
│   │   └── ContributionTest.php
│   └── ...
└── Unit/
    ├── Services/
    │   ├── PaymentServiceTest.php
    │   └── WalletServiceTest.php
    └── ...
\`\`\`

## Key Implementation Examples

### 1. User Model with Membership Type
\`\`\`php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use App\Traits\HasWallet;

class User extends Authenticatable
{
    use HasApiTokens, HasWallet;

    protected $fillable = [
        'member_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'membership_type',
        'previous_member_id',
        'role',
        'status',
        'ippis_number',
        'department',
        'rank',
        'id_type',
        'id_number',
        'date_of_birth',
        'address',
        'state',
        'lga',
        'profile_picture',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_of_birth' => 'date',
    ];

    // Relationships
    public function nextOfKin()
    {
        return $this->hasOne(NextOfKin::class);
    }

    public function contributions()
    {
        return $this->hasMany(Contribution::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function investments()
    {
        return $this->hasMany(Investment::class);
    }

    // Scopes
    public function scopeMembers($query)
    {
        return $query->where('membership_type', 'member');
    }

    public function scopeNonMembers($query)
    {
        return $query->where('membership_type', 'non-member');
    }

    // Accessors
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function isMember()
    {
        return $this->membership_type === 'member';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}
\`\`\`

### 2. Authentication Controller
\`\`\`php
<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        // Generate member ID
        $memberIdPrefix = $validated['membership_type'] === 'member' ? 'FRSC-M-' : 'FRSC-NM-';
        $lastUser = User::where('member_id', 'like', $memberIdPrefix . '%')
            ->orderBy('id', 'desc')
            ->first();
        
        $nextNumber = $lastUser ? intval(substr($lastUser->member_id, -3)) + 1 : 1;
        $memberId = $memberIdPrefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        // Create user
        $user = User::create([
            'member_id' => $memberId,
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'membership_type' => $validated['membership_type'],
            'id_type' => $validated['id_type'],
            'id_number' => $validated['id_number'],
            'ippis_number' => $validated['ippis_number'] ?? null,
            'department' => $validated['department'] ?? null,
            'rank' => $validated['rank'] ?? null,
        ]);

        // Create wallet for user
        $user->wallet()->create(['balance' => 0]);

        // Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'membership_type' => $user->membership_type,
                    'member_id' => $user->member_id,
                ],
                'token' => $token,
            ],
        ], 201);
    }
}
\`\`\`

### 3. Loan Service with Member/Non-Member Interest Rates
\`\`\`php
<?php

namespace App\Services;

use App\Models\Loan;
use App\Models\LoanPlan;
use App\Models\User;

class LoanService
{
    public function calculateLoanDetails(LoanPlan $loanPlan, User $user, float $amount, int $tenureMonths)
    {
        // Determine interest rate based on membership type
        $interestRate = $user->isMember() 
            ? $loanPlan->interest_rate_member 
            : $loanPlan->interest_rate_non_member;

        // Calculate total interest
        $totalInterest = ($amount * $interestRate * $tenureMonths) / (100 * 12);
        
        // Calculate total repayment
        $totalRepayment = $amount + $totalInterest;
        
        // Calculate monthly repayment
        $monthlyRepayment = $totalRepayment / $tenureMonths;

        return [
            'interest_rate' => $interestRate,
            'total_interest' => round($totalInterest, 2),
            'total_repayment' => round($totalRepayment, 2),
            'monthly_repayment' => round($monthlyRepayment, 2),
        ];
    }

    public function applyForLoan(User $user, array $data)
    {
        $loanPlan = LoanPlan::findOrFail($data['loan_plan_id']);

        // Check if non-member can apply for this loan
        if (!$user->isMember() && !$loanPlan->available_for_non_members) {
            throw new \Exception('This loan is only available for members');
        }

        // Calculate loan details
        $loanDetails = $this->calculateLoanDetails(
            $loanPlan,
            $user,
            $data['amount'],
            $data['tenure_months']
        );

        // Generate reference
        $reference = 'LOAN-' . date('Y') . '-' . str_pad(Loan::count() + 1, 3, '0', STR_PAD_LEFT);

        // Create loan
        $loan = $user->loans()->create([
            'loan_plan_id' => $loanPlan->id,
            'reference' => $reference,
            'amount' => $data['amount'],
            'interest_rate' => $loanDetails['interest_rate'],
            'tenure_months' => $data['tenure_months'],
            'monthly_repayment' => $loanDetails['monthly_repayment'],
            'total_repayment' => $loanDetails['total_repayment'],
            'balance' => $loanDetails['total_repayment'],
            'purpose' => $data['purpose'],
            'guarantor_1' => $data['guarantor_1'],
            'guarantor_2' => $data['guarantor_2'],
            'supporting_documents' => $data['supporting_documents'] ?? [],
            'status' => 'pending',
        ]);

        return $loan;
    }
}
\`\`\`

### 4. Payment Service with Multiple Gateways
\`\`\`php
<?php

namespace App\Services;

use App\Models\User;
use App\Services\PaystackService;
use App\Services\RemitaService;

class PaymentService
{
    protected $paystackService;
    protected $remitaService;

    public function __construct(PaystackService $paystackService, RemitaService $remitaService)
    {
        $this->paystackService = $paystackService;
        $this->remitaService = $remitaService;
    }

    public function initiatePayment(User $user, float $amount, string $reference, string $paymentMethod, array $paymentDetails = [])
    {
        switch ($paymentMethod) {
            case 'paystack':
            case 'card':
                return $this->paystackService->initializePayment($user, $amount, $reference);
            
            case 'remita':
                return $this->remitaService->initializePayment($user, $amount, $reference);
            
            case 'wallet':
                return $this->processWalletPayment($user, $amount, $reference);
            
            default:
                throw new \Exception('Invalid payment method');
        }
    }

    protected function processWalletPayment(User $user, float $amount, string $reference)
    {
        if ($user->wallet->balance < $amount) {
            throw new \Exception('Insufficient wallet balance');
        }

        $user->wallet->debit($amount, "Payment for {$reference}");

        return [
            'status' => 'success',
            'reference' => $reference,
            'message' => 'Payment successful',
        ];
    }

    public function verifyPayment(string $reference, string $paymentMethod)
    {
        switch ($paymentMethod) {
            case 'paystack':
            case 'card':
                return $this->paystackService->verifyPayment($reference);
            
            case 'remita':
                return $this->remitaService->verifyPayment($reference);
            
            default:
                throw new \Exception('Invalid payment method');
        }
    }
}
\`\`\`

### 5. Wallet Trait
\`\`\`php
<?php

namespace App\Traits;

use App\Models\Wallet;
use App\Models\WalletTransaction;

trait HasWallet
{
    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function walletTransactions()
    {
        return $this->hasManyThrough(WalletTransaction::class, Wallet::class);
    }

    public function creditWallet(float $amount, string $description)
    {
        $wallet = $this->wallet;
        $balanceBefore = $wallet->balance;
        $balanceAfter = $balanceBefore + $amount;

        $wallet->update([
            'balance' => $balanceAfter,
            'total_credits' => $wallet->total_credits + $amount,
        ]);

        $reference = 'TXN-' . date('Y') . '-' . str_pad(WalletTransaction::count() + 1, 6, '0', STR_PAD_LEFT);

        $wallet->transactions()->create([
            'reference' => $reference,
            'type' => 'credit',
            'amount' => $amount,
            'description' => $description,
            'status' => 'completed',
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
        ]);

        return $wallet->fresh();
    }

    public function debitWallet(float $amount, string $description)
    {
        $wallet = $this->wallet;

        if ($wallet->balance < $amount) {
            throw new \Exception('Insufficient wallet balance');
        }

        $balanceBefore = $wallet->balance;
        $balanceAfter = $balanceBefore - $amount;

        $wallet->update([
            'balance' => $balanceAfter,
            'total_debits' => $wallet->total_debits + $amount,
        ]);

        $reference = 'TXN-' . date('Y') . '-' . str_pad(WalletTransaction::count() + 1, 6, '0', STR_PAD_LEFT);

        $wallet->transactions()->create([
            'reference' => $reference,
            'type' => 'debit',
            'amount' => $amount,
            'description' => $description,
            'status' => 'completed',
            'balance_before' => $balanceBefore,
            'balance_after' => $balanceAfter,
        ]);

        return $wallet->fresh();
    }
}
\`\`\`

### 6. API Routes
\`\`\`php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LogoutController;

// Public routes
Route::prefix('v1')->group(function () {
    // Authentication
    Route::post('/auth/register', [RegisterController::class, 'register']);
    Route::post('/auth/login', [LoginController::class, 'login']);
    
    // Public property listings
    Route::get('/properties', [PropertyController::class, 'index']);
    Route::get('/properties/{id}', [PropertyController::class, 'show']);
    
    // Public investment plans
    Route::get('/investments/plans', [InvestmentPlanController::class, 'index']);
    Route::get('/investments/plans/{id}', [InvestmentPlanController::class, 'show']);
    
    // Public loan plans
    Route::get('/loans/plans', [LoanPlanController::class, 'index']);
});

// Protected routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/auth/logout', [LogoutController::class, 'logout']);
    Route::post('/auth/refresh', [LoginController::class, 'refresh']);
    
    // User profile
    Route::get('/user/profile', [ProfileController::class, 'show']);
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::post('/user/profile/picture', [ProfileController::class, 'uploadPicture']);
    Route::post('/user/upgrade-membership', [MembershipController::class, 'upgrade']);
    
    // Contributions
    Route::get('/contributions/summary', [ContributionController::class, 'summary']);
    Route::get('/contributions/history', [ContributionController::class, 'history']);
    Route::post('/contributions', [ContributionController::class, 'store']);
    Route::get('/contributions/{reference}/verify', [ContributionController::class, 'verify']);
    
    // Loans
    Route::post('/loans/apply', [LoanController::class, 'apply']);
    Route::get('/loans/my-loans', [LoanController::class, 'myLoans']);
    Route::get('/loans/{loanId}/schedule', [LoanController::class, 'schedule']);
    Route::post('/loans/{loanId}/repay', [RepaymentController::class, 'repay']);
    
    // Investments
    Route::post('/investments/invest', [InvestmentController::class, 'invest']);
    Route::get('/investments/my-investments', [InvestmentController::class, 'myInvestments']);
    Route::post('/investments/{investmentId}/withdraw', [InvestmentController::class, 'withdraw']);
    
    // Properties
    Route::post('/properties/{propertyId}/interest', [PropertyController::class, 'expressInterest']);
    Route::post('/properties/{propertyId}/subscribe', [PropertyController::class, 'subscribe']);
    Route::get('/properties/my-properties', [PropertyController::class, 'myProperties']);
    Route::post('/properties/subscriptions/{subscriptionId}/pay', [PropertyController::class, 'makePayment']);
    
    // Wallet
    Route::get('/wallet/balance', [WalletController::class, 'balance']);
    Route::get('/wallet/transactions', [WalletController::class, 'transactions']);
    Route::post('/wallet/fund', [WalletController::class, 'fund']);
    Route::get('/wallet/fund/{reference}/verify', [WalletController::class, 'verifyFunding']);
    Route::post('/wallet/withdraw', [WalletController::class, 'withdraw']);
    
    // Mail Service
    Route::get('/mail/inbox', [MailController::class, 'inbox']);
    Route::get('/mail/sent', [MailController::class, 'sent']);
    Route::get('/mail/drafts', [MailController::class, 'drafts']);
    Route::get('/mail/{messageId}', [MailController::class, 'show']);
    Route::post('/mail/send', [MailController::class, 'send']);
    Route::post('/mail/drafts', [MailController::class, 'saveDraft']);
    Route::patch('/mail/{messageId}/read-status', [MailController::class, 'updateReadStatus']);
    Route::patch('/mail/{messageId}/star', [MailController::class, 'toggleStar']);
    Route::delete('/mail/{messageId}', [MailController::class, 'delete']);
    
    // Reports
    Route::get('/reports/contributions', [ReportController::class, 'contributions']);
    Route::get('/reports/investments', [ReportController::class, 'investments']);
    Route::get('/reports/loans', [ReportController::class, 'loans']);
    Route::get('/reports/properties', [ReportController::class, 'properties']);
    Route::get('/reports/financial-summary', [ReportController::class, 'financialSummary']);
    
    // Statutory Charges
    Route::get('/statutory-charges/types', [StatutoryChargeController::class, 'types']);
    Route::post('/statutory-charges/pay', [StatutoryChargeController::class, 'pay']);
    Route::get('/statutory-charges/history', [StatutoryChargeController::class, 'history']);
    
    // Property Management
    Route::get('/property-management/estates', [EstateController::class, 'index']);
    Route::get('/property-management/estates/{estateId}', [EstateController::class, 'show']);
    Route::get('/property-management/my-allotments', [AllotmentController::class, 'myAllotments']);
    Route::post('/property-management/maintenance-requests', [MaintenanceController::class, 'store']);
    Route::get('/property-management/maintenance-requests', [MaintenanceController::class, 'index']);
    
    // Mortgages
    Route::get('/mortgages/plans', [MortgageController::class, 'plans']);
    Route::post('/mortgages/apply', [MortgageController::class, 'apply']);
    Route::get('/mortgages/my-mortgages', [MortgageController::class, 'myMortgages']);
    
    // Documents
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::delete('/documents/{documentId}', [DocumentController::class, 'destroy']);
    
    // Blockchain
    Route::get('/blockchain/properties', [BlockchainController::class, 'properties']);
    Route::post('/blockchain/register', [BlockchainController::class, 'register']);
    
    // Admin routes
    Route::prefix('admin')->middleware('check.admin')->group(function () {
        Route::get('/dashboard/stats', [Admin\DashboardController::class, 'stats']);
        
        // User management with KYC
        Route::get('/members', [Admin\UserController::class, 'index']);
        Route::get('/members/{memberId}', [Admin\UserController::class, 'show']);
        Route::post('/members', [Admin\UserController::class, 'store']);
        Route::put('/members/{memberId}', [Admin\UserController::class, 'update']);
        Route::post('/members/{memberId}/kyc-action', [Admin\UserController::class, 'kycAction']);
        Route::post('/members/{memberId}/send-email', [Admin\UserController::class, 'sendEmail']);
        Route::post('/members/{memberId}/approve-upgrade', [Admin\UserController::class, 'approveUpgrade']);
        
        // Roles & Permissions
        Route::get('/roles', [Admin\RoleController::class, 'index']);
        Route::post('/roles', [Admin\RoleController::class, 'store']);
        Route::get('/roles/{roleId}', [Admin\RoleController::class, 'show']);
        Route::put('/roles/{roleId}', [Admin\RoleController::class, 'update']);
        Route::delete('/roles/{roleId}', [Admin\RoleController::class, 'destroy']);
        Route::post('/users/{userId}/assign-role', [Admin\UserController::class, 'assignRole']);
        
        // Contribution management
        Route::get('/contributions', [Admin\ContributionController::class, 'index']);
        Route::get('/contributions/{contributionId}', [Admin\ContributionController::class, 'show']);
        Route::post('/contributions/{contributionId}/approve', [Admin\ContributionController::class, 'approve']);
        Route::post('/contributions/{contributionId}/reject', [Admin\ContributionController::class, 'reject']);
        Route::post('/contributions/{contributionId}/verify', [Admin\ContributionController::class, 'verify']);
        
        // Loan management
        Route::get('/loans', [Admin\LoanController::class, 'index']);
        Route::post('/loans/{loanId}/review', [Admin\LoanController::class, 'review']);
        Route::post('/loans/plans', [Admin\LoanController::class, 'createPlan']);
        
        // Loan Products
        Route::get('/loan-products', [Admin\LoanProductController::class, 'index']);
        Route::get('/loan-products/{productId}', [Admin\LoanProductController::class, 'show']);
        Route::put('/loan-products/{productId}', [Admin\LoanProductController::class, 'update']);
        Route::delete('/loan-products/{productId}', [Admin\LoanProductController::class, 'destroy']);
        
        // Investment management
        Route::get('/investments', [Admin\InvestmentController::class, 'index']);
        Route::get('/investment-plans/{planId}', [Admin\InvestmentController::class, 'showPlan']);
        Route::put('/investment-plans/{planId}', [Admin\InvestmentController::class, 'updatePlan']);
        Route::post('/investments/plans', [Admin\InvestmentController::class, 'createPlan']);
        Route::post('/investments/{investmentId}/approve-withdrawal', [Admin\InvestmentController::class, 'approveWithdrawal']);
        
        // Property management
        Route::get('/properties', [Admin\PropertyController::class, 'index']);
        Route::post('/properties', [Admin\PropertyController::class, 'store']);
        
        // EOI Forms
        Route::get('/eoi-forms', [Admin\EOIController::class, 'index']);
        Route::get('/eoi-forms/{eoiId}', [Admin\EOIController::class, 'show']);
        Route::get('/eoi-forms/{eoiId}/download', [Admin\EOIController::class, 'download']);
        
        // Mortgages
        Route::get('/mortgages', [Admin\MortgageController::class, 'index']);
        Route::get('/mortgages/{mortgageId}', [Admin\MortgageController::class, 'show']);
        Route::get('/mortgages/{mortgageId}/download-agreement', [Admin\MortgageController::class, 'downloadAgreement']);
        
        // Statutory charges - Enhanced
        Route::get('/statutory-charges/types', [Admin\StatutoryChargeController::class, 'types']);
        Route::post('/statutory-charges/types', [Admin\StatutoryChargeController::class, 'createType']);
        Route::put('/statutory-charges/types/{typeId}', [Admin\StatutoryChargeController::class, 'updateType']);
        Route::get('/statutory-charges/payments', [Admin\StatutoryChargeController::class, 'payments']);
        Route::get('/statutory-charges/departments', [Admin\StatutoryChargeController::class, 'departments']);
        Route::post('/statutory-charges/payments/{paymentId}/allocate', [Admin\StatutoryChargeController::class, 'allocate']);
        
        // Estate management - Enhanced
        Route::get('/property-management/estates', [Admin\PropertyManagementController::class, 'estates']);
        Route::get('/property-management/estates/{estateId}', [Admin\PropertyManagementController::class, 'showEstate']);
        Route::post('/property-management/estates', [Admin\PropertyManagementController::class, 'createEstate']);
        Route::get('/property-management/allottees', [Admin\PropertyManagementController::class, 'allottees']);
        Route::get('/property-management/allottees/{allotteeId}', [Admin\PropertyManagementController::class, 'showAllottee']);
        Route::post('/property-management/allottees', [Admin\PropertyManagementController::class, 'createAllotment']);
        Route::get('/property-management/maintenance-requests', [Admin\PropertyManagementController::class, 'maintenanceRequests']);
        Route::get('/property-management/maintenance-requests/{requestId}', [Admin\PropertyManagementController::class, 'showMaintenanceRequest']);
        Route::patch('/property-management/maintenance-requests/{requestId}', [Admin\PropertyManagementController::class, 'updateMaintenanceRequest']);
        
        // Wallet management
        Route::get('/wallets', [Admin\WalletController::class, 'index']);
        Route::get('/wallets/{walletId}', [Admin\WalletController::class, 'show']);
        Route::get('/wallets/export', [Admin\WalletController::class, 'export']);
        Route::post('/wallets/withdrawals/{withdrawalId}/approve', [Admin\WalletController::class, 'approveWithdrawal']);
        
        // Subscription Packages
        Route::get('/subscriptions/packages', [Admin\SubscriptionController::class, 'packages']);
        Route::get('/subscriptions/packages/{packageId}', [Admin\SubscriptionController::class, 'showPackage']);
        Route::put('/subscriptions/packages/{packageId}', [Admin\SubscriptionController::class, 'updatePackage']);
        
        // Blockchain
        Route::get('/blockchain/properties', [Admin\BlockchainController::class, 'properties']);
        Route::get('/blockchain/properties/{recordId}', [Admin\BlockchainController::class, 'showRecord']);
        Route::put('/blockchain/properties/{recordId}', [Admin\BlockchainController::class, 'updateRecord']);
        
        // Activity Logs
        Route::get('/activity-logs', [Admin\ActivityLogController::class, 'index']);
        
        // Documents
        Route::get('/documents', [Admin\DocumentController::class, 'index']);
        Route::post('/documents', [Admin\DocumentController::class, 'store']);
        Route::get('/documents/{documentId}/download', [Admin\DocumentController::class, 'download']);
        Route::delete('/documents/{documentId}', [Admin\DocumentController::class, 'destroy']);
        
        // Mail statistics
        Route::get('/mail/statistics', [Admin\MailController::class, 'statistics']);
        
        // System settings
        Route::get('/settings', [Admin\SettingsController::class, 'index']);
        Route::put('/settings', [Admin\SettingsController::class, 'update']);
    });
});

// Webhooks
Route::post('/webhooks/payment', [WebhookController::class, 'payment']);
Route::post('/webhooks/blockchain', [WebhookController::class, 'blockchain']);
\`\`\`

### 7. Middleware for Admin Check
\`\`\`php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}
\`\`\`

### 8. Database Seeders
\`\`\`php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LoanPlan;

class LoanPlanSeeder extends Seeder
{
    public function run()
    {
        $loanPlans = [
            [
                'name' => 'Personal Loan',
                'description' => 'Quick personal loan for members',
                'loan_type' => 'personal',
                'max_amount' => 500000,
                'min_amount' => 50000,
                'interest_rate_member' => 5,
                'interest_rate_non_member' => 8,
                'max_tenure_months' => 12,
                'processing_fee' => 2500,
                'available_for_non_members' => true,
                'eligibility' => 'Must have contributed for at least 6 months',
                'required_documents' => ['Valid ID', 'Proof of employment'],
                'status' => 'active',
            ],
            [
                'name' => 'Housing Loan',
                'description' => 'Loan for housing purposes',
                'loan_type' => 'housing',
                'max_amount' => 5000000,
                'min_amount' => 500000,
                'interest_rate_member' => 7,
                'interest_rate_non_member' => 10,
                'max_tenure_months' => 60,
                'processing_fee' => 25000,
                'available_for_non_members' => false,
                'eligibility' => 'Must be a member for at least 2 years',
                'required_documents' => ['Valid ID', 'Proof of employment', 'Property documents'],
                'status' => 'active',
            ],
            [
                'name' => 'Emergency Loan',
                'description' => 'Quick loan for emergencies',
                'loan_type' => 'emergency',
                'max_amount' => 100000,
                'min_amount' => 10000,
                'interest_rate_member' => 3,
                'interest_rate_non_member' => 6,
                'max_tenure_months' => 6,
                'processing_fee' => 1000,
                'available_for_non_members' => true,
                'eligibility' => 'Must have contributed for at least 3 months',
                'required_documents' => ['Valid ID'],
                'status' => 'active',
            ],
        ];

        foreach ($loanPlans as $plan) {
            LoanPlan::create($plan);
        }
    }
}
\`\`\`

## Testing

### Feature Test Example
\`\`\`php
<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_member()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '08012345678',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'membership_type' => 'member',
            'id_type' => 'NIN',
            'id_number' => '12345678901',
            'ippis_number' => 'IPPIS123456',
            'department' => 'Engineering',
            'rank' => 'Senior Officer',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'first_name',
                        'last_name',
                        'email',
                        'membership_type',
                        'member_id',
                    ],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'membership_type' => 'member',
        ]);
    }

    public function test_user_can_register_as_non_member()
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@example.com',
            'phone' => '08098765432',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'membership_type' => 'non-member',
            'id_type' => 'Drivers License',
            'id_number' => 'DL123456789',
        ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('users', [
            'email' => 'jane@example.com',
            'membership_type' => 'non-member',
        ]);
    }
}
\`\`\`

## Deployment Checklist

### Pre-Deployment
- [ ] Run all tests: `php artisan test`
- [ ] Check code quality: `php artisan insights`
- [ ] Update .env with production values
- [ ] Set APP_DEBUG=false
- [ ] Set APP_ENV=production
- [ ] Generate application key: `php artisan key:generate`
- [ ] Clear and cache config: `php artisan config:cache`
- [ ] Clear and cache routes: `php artisan route:cache`
- [ ] Optimize autoloader: `composer install --optimize-autoloader --no-dev`

### Database
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Seed initial data: `php artisan db:seed --force`
- [ ] Backup database

### Security
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable firewall rules
- [ ] Set up SSL certificates
- [ ] Configure secure headers

### Monitoring
- [ ] Set up error logging (Sentry, Bugsnag)
- [ ] Configure application monitoring
- [ ] Set up database monitoring
- [ ] Configure server monitoring
- [ ] Set up uptime monitoring

### Performance
- [ ] Enable OPcache
- [ ] Configure Redis for caching
- [ ] Set up queue workers
- [ ] Enable CDN for static assets
- [ ] Optimize database queries
- [ ] Set up database indexing

## Maintenance

### Regular Tasks
- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Backup database daily
- Review security patches weekly
- Monitor disk space usage
- Check queue workers status

### Scaling Considerations
- Use load balancers for high traffic
- Implement database replication
- Use Redis cluster for caching
- Set up horizontal scaling for queue workers
- Implement CDN for static assets
- Use database connection pooling

---

This implementation guide provides a comprehensive foundation for building the Laravel backend API for the FRSC Housing Management System. Follow the structure and examples provided to ensure consistency and maintainability throughout the project.
