# FRSC Housing Management System - Laravel API Documentation (SaaS Multi-Tenant Version)

## Table of Contents
1. [Overview](#overview)
2. [Multi-Tenancy Architecture](#multi-tenancy-architecture)
3. [Authentication](#authentication)
4. [Tenant Management](#tenant-management)
5. [Super Admin Endpoints](#super-admin-endpoints)
6. [Business Admin Endpoints](#business-admin-endpoints)
7. [User Endpoints](#user-endpoints)
8. [Payment Integration](#payment-integration)
9. [Database Schema](#database-schema)
10. [Implementation Guide](#implementation-guide)

---

## Overview

**Platform Type:** Multi-Tenant SaaS

**Base URLs:**
- Platform API: `https://api.yourplatform.com/api/v1`
- Tenant API: `https://{tenant-slug}.yourplatform.com/api/v1` or `https://{custom-domain}/api/v1`

**Authentication:** Bearer Token (JWT) with Tenant Context

**Content-Type:** `application/json`

**Theme Colors:**
- Primary: `#FDB11E` (Gold/Orange)
- Secondary: `#276254` (Dark Teal/Green)

**Response Format:**
\`\`\`json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "meta": {
    "current_page": 1,
    "total": 100,
    "per_page": 15
  }
}
\`\`\`

---

## Multi-Tenancy Architecture

### Tenant Resolution

The API uses multiple methods to identify the tenant:

1. **Subdomain**: `business-name.yourplatform.com`
2. **Custom Domain**: `business.com`
3. **Header**: `X-Tenant-ID: {tenant_id}`
4. **Token**: Tenant context embedded in JWT

### Tenant Context Middleware

\`\`\`php
<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Tenant;

class TenantContext
{
    public function handle($request, Closure $next)
    {
        $tenant = $this->resolveTenant($request);
        
        if (!$tenant) {
            return response()->json([
                'success' => false,
                'message' => 'Tenant not found'
            ], 404);
        }
        
        // Set tenant context
        app()->instance('tenant', $tenant);
        config(['database.connections.tenant.database' => $tenant->database_name]);
        
        return $next($request);
    }
    
    private function resolveTenant($request)
    {
        // Try subdomain
        $host = $request->getHost();
        $parts = explode('.', $host);
        
        if (count($parts) >= 3) {
            $slug = $parts[0];
            return Tenant::where('slug', $slug)->first();
        }
        
        // Try custom domain
        return Tenant::where('custom_domain', $host)->first();
    }
}
\`\`\`

### Database Structure

**Shared Database (Platform Level):**
- `tenants` - Business/tenant information
- `packages` - Subscription packages
- `modules` - Available platform modules
- `super_admins` - Platform administrators
- `subscriptions` - Tenant subscriptions
- `invoices` - Billing invoices

**Tenant Database (Per Business):**
- `users` - Business members
- `contributions` - Member contributions
- `loans` - Loan applications
- `properties` - Property listings
- `investments` - Investment records
- All other business-specific data

---

## Authentication

### Platform-Level Authentication (Super Admin)

**POST** `/api/v1/super-admin/auth/login`

**Request:**
\`\`\`json
{
  "email": "superadmin@platform.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "superadmin@platform.com",
      "role": "super_admin"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "permissions": ["manage_businesses", "manage_packages", "view_analytics"]
  }
}
\`\`\`

### Tenant-Level Authentication (Business Admin/User)

**POST** `/api/v1/auth/login`

**Headers:**
- `X-Tenant-ID: {tenant_id}` (optional if using subdomain/custom domain)

**Request:**
\`\`\`json
{
  "email": "user@business.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "member_id": "FRSC-M-001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@business.com",
      "role": "user",
      "membership_type": "member"
    },
    "tenant": {
      "id": 1,
      "name": "FRSC Lagos",
      "slug": "frsc-lagos",
      "custom_domain": "frsclagos.com"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
\`\`\`

### Business Registration (Onboarding)

**POST** `/api/v1/onboard`

**Request:**
\`\`\`json
{
  "business_name": "FRSC Lagos Housing Cooperative",
  "slug": "frsc-lagos",
  "admin_name": "John Doe",
  "admin_email": "admin@frsclagos.com",
  "admin_phone": "08012345678",
  "admin_password": "password123",
  "package_id": 2,
  "industry": "government",
  "country": "Nigeria",
  "state": "Lagos"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Business registered successfully",
  "data": {
    "tenant": {
      "id": 1,
      "name": "FRSC Lagos Housing Cooperative",
      "slug": "frsc-lagos",
      "subdomain": "frsc-lagos.yourplatform.com",
      "status": "trial"
    },
    "admin": {
      "id": 1,
      "name": "John Doe",
      "email": "admin@frsclagos.com"
    },
    "subscription": {
      "package": "Professional",
      "trial_ends_at": "2024-02-15T00:00:00Z",
      "status": "trial"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
\`\`\`

---

## Tenant Management

### Get Tenant Information

**GET** `/api/v1/tenant/info`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "FRSC Lagos Housing Cooperative",
    "slug": "frsc-lagos",
    "custom_domain": "frsclagos.com",
    "logo": "https://cdn.example.com/logos/frsc-lagos.png",
    "theme": {
      "primary_color": "#FDB11E",
      "secondary_color": "#276254"
    },
    "subscription": {
      "package": "Professional",
      "status": "active",
      "expires_at": "2025-01-15T00:00:00Z",
      "modules": ["loans", "contributions", "properties", "investments"]
    },
    "limits": {
      "max_members": 1000,
      "max_properties": 50,
      "max_loan_products": 10,
      "current_members": 450,
      "current_properties": 12,
      "current_loan_products": 5
    }
  }
}
\`\`\`

### Update Tenant Settings

**PUT** `/api/v1/tenant/settings`

**Headers:** `Authorization: Bearer {token}` (Admin only)

**Request:**
\`\`\`json
{
  "name": "FRSC Lagos Housing Cooperative",
  "logo": "base64_encoded_image",
  "theme": {
    "primary_color": "#FDB11E",
    "secondary_color": "#276254"
  },
  "contact_email": "info@frsclagos.com",
  "contact_phone": "08012345678"
}
\`\`\`

---

## Super Admin Endpoints

### Dashboard Statistics

**GET** `/api/v1/super-admin/dashboard/stats`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "total_businesses": 150,
    "active_businesses": 120,
    "trial_businesses": 25,
    "suspended_businesses": 5,
    "total_revenue": 15000000,
    "monthly_recurring_revenue": 2500000,
    "total_members": 45000,
    "growth": {
      "businesses": 15,
      "revenue": 25,
      "members": 30
    }
  }
}
\`\`\`

### Manage Businesses

**GET** `/api/v1/super-admin/businesses`

**Query Parameters:**
- `status`: active, trial, suspended, past_due
- `package_id`: Filter by package
- `search`: Search by name or slug
- `page`: Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "FRSC Lagos Housing Cooperative",
      "slug": "frsc-lagos",
      "status": "active",
      "package": "Professional",
      "members_count": 450,
      "subscription_expires_at": "2025-01-15T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 150,
    "per_page": 20
  }
}
\`\`\`

**GET** `/api/v1/super-admin/businesses/{id}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "FRSC Lagos Housing Cooperative",
    "slug": "frsc-lagos",
    "custom_domain": "frsclagos.com",
    "status": "active",
    "admin": {
      "name": "John Doe",
      "email": "admin@frsclagos.com"
    },
    "subscription": {
      "package": "Professional",
      "status": "active",
      "started_at": "2024-01-15T00:00:00Z",
      "expires_at": "2025-01-15T00:00:00Z",
      "amount": 50000
    },
    "usage": {
      "members": 450,
      "properties": 12,
      "loan_products": 5,
      "storage_used": "2.5 GB"
    },
    "limits": {
      "max_members": 1000,
      "max_properties": 50,
      "max_loan_products": 10,
      "max_storage": "10 GB"
    }
  }
}
\`\`\`

### Manage Packages

**GET** `/api/v1/super-admin/packages`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Free Trial",
      "price": 0,
      "billing_cycle": "monthly",
      "features": {
        "max_members": 50,
        "max_properties": 5,
        "max_loan_products": 2,
        "modules": ["contributions", "loans"]
      },
      "subscribers_count": 25
    },
    {
      "id": 2,
      "name": "Professional",
      "price": 50000,
      "billing_cycle": "monthly",
      "features": {
        "max_members": 1000,
        "max_properties": 50,
        "max_loan_products": 10,
        "modules": ["contributions", "loans", "properties", "investments"]
      },
      "subscribers_count": 85
    }
  ]
}
\`\`\`

**POST** `/api/v1/super-admin/packages`

**Request:**
\`\`\`json
{
  "name": "Enterprise",
  "description": "For large organizations",
  "price": 150000,
  "billing_cycle": "monthly",
  "trial_days": 14,
  "features": {
    "max_members": 5000,
    "max_properties": 200,
    "max_loan_products": 50,
    "max_contribution_plans": 20,
    "max_storage": "50 GB",
    "modules": ["all"]
  }
}
\`\`\`

### Manage Subscriptions

**GET** `/api/v1/super-admin/subscriptions`

**Query Parameters:**
- `status`: active, trial, past_due, cancelled
- `package_id`: Filter by package

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "business": {
        "id": 1,
        "name": "FRSC Lagos",
        "slug": "frsc-lagos"
      },
      "package": "Professional",
      "status": "active",
      "amount": 50000,
      "started_at": "2024-01-15T00:00:00Z",
      "expires_at": "2025-01-15T00:00:00Z",
      "auto_renew": true
    }
  ]
}
\`\`\`

### Send Platform-Wide Communication

**POST** `/api/v1/super-admin/mail/send`

**Request:**
\`\`\`json
{
  "recipients": "all_businesses", // or "all_members", "specific_businesses"
  "business_ids": [1, 2, 3], // if specific_businesses
  "subject": "Platform Update",
  "message": "We've added new features...",
  "send_to_admins": true,
  "send_to_members": false
}
\`\`\`

---

## Business Admin Endpoints

All business admin endpoints require tenant context and admin role.

### Dashboard Statistics

**GET** `/api/v1/admin/dashboard/stats`

**Headers:** 
- `Authorization: Bearer {token}`
- `X-Tenant-ID: {tenant_id}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "total_members": 450,
    "total_non_members": 120,
    "active_loans": 85,
    "total_contributions": 125000000,
    "total_investments": 85000000,
    "pending_approvals": {
      "loans": 15,
      "kyc": 8,
      "withdrawals": 5
    },
    "revenue_this_month": 15000000
  }
}
\`\`\`

### Member Management with KYC

**GET** `/api/v1/admin/members`

**Query Parameters:**
- `status`: pending_kyc, active, inactive
- `membership_type`: member, non-member
- `search`: Search by name, email, member ID

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "member_id": "FRSC-M-001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "membership_type": "member",
      "kyc_status": "verified",
      "status": "active",
      "total_contributions": 500000,
      "active_loans": 1,
      "registered_at": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

**POST** `/api/v1/admin/members/{id}/kyc-action`

**Request:**
\`\`\`json
{
  "action": "approve", // or "reject"
  "reason": "All documents verified" // required if reject
}
\`\`\`

### Loan Management

**GET** `/api/v1/admin/loans`

**Query Parameters:**
- `status`: pending, approved, active, rejected, completed
- `loan_plan_id`: Filter by loan plan

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "LOAN-2024-001",
      "member": {
        "id": 1,
        "name": "John Doe",
        "member_id": "FRSC-M-001"
      },
      "loan_plan": "Personal Loan",
      "amount": 500000,
      "interest_rate": 5,
      "tenure_months": 12,
      "monthly_repayment": 43750,
      "status": "pending",
      "applied_at": "2024-01-15T00:00:00Z"
    }
  ]
}
\`\`\`

**POST** `/api/v1/admin/loans/{id}/review`

**Request:**
\`\`\`json
{
  "action": "approve", // or "reject"
  "notes": "Approved based on credit history",
  "disbursement_method": "wallet" // or "bank_transfer"
}
\`\`\`

### Loan Products Management

**GET** `/api/v1/admin/loan-products`

**POST** `/api/v1/admin/loan-products`

**Request:**
\`\`\`json
{
  "name": "Housing Loan",
  "description": "Loan for housing purposes",
  "loan_type": "housing",
  "max_amount": 5000000,
  "min_amount": 500000,
  "interest_rate_member": 7,
  "interest_rate_non_member": 10,
  "max_tenure_months": 60,
  "processing_fee": 25000,
  "available_for_non_members": false,
  "repayment_method": "cash", // or "salary_deduction"
  "cash_repayment_config": {
    "deduction_percentage": 30,
    "min_monthly_payment": 50000
  }
}
\`\`\`

### Statutory Charges Management

**GET** `/api/v1/admin/statutory-charges/types`

**POST** `/api/v1/admin/statutory-charges/types`

**Request:**
\`\`\`json
{
  "name": "Development Levy",
  "description": "Annual development levy",
  "amount": 25000,
  "frequency": "annual",
  "applicable_to": "all", // or "members_only", "non_members_only"
  "department": "Finance"
}
\`\`\`

**GET** `/api/v1/admin/statutory-charges/payments`

**POST** `/api/v1/admin/statutory-charges/payments/{id}/allocate`

**Request:**
\`\`\`json
{
  "department": "Engineering",
  "allocation_percentage": 40
}
\`\`\`

### Property Management

**GET** `/api/v1/admin/property-management/estates`

**POST** `/api/v1/admin/property-management/estates`

**Request:**
\`\`\`json
{
  "name": "FRSC Estate Phase 1",
  "location": "Lekki, Lagos",
  "total_units": 50,
  "available_units": 30,
  "description": "Modern housing estate",
  "amenities": ["24/7 Security", "Power Supply", "Water Supply"]
}
\`\`\`

**GET** `/api/v1/admin/property-management/allottees`

**POST** `/api/v1/admin/property-management/allottees`

**Request:**
\`\`\`json
{
  "member_id": 1,
  "estate_id": 1,
  "unit_number": "A-12",
  "allotment_date": "2024-01-15",
  "possession_date": "2024-06-15"
}
\`\`\`

**GET** `/api/v1/admin/property-management/maintenance-requests`

**PATCH** `/api/v1/admin/property-management/maintenance-requests/{id}`

**Request:**
\`\`\`json
{
  "status": "in_progress", // or "completed", "rejected"
  "assigned_to": "John Maintenance",
  "notes": "Work started on 2024-01-20"
}
\`\`\`

---

## User Endpoints

All user endpoints require tenant context and authentication.

### User Profile

**GET** `/api/v1/user/profile`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "member_id": "FRSC-M-001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "membership_type": "member",
    "ippis_number": "IPPIS123456",
    "years_of_service": "27 yrs and 0 months",
    "wallet_balance": 150000,
    "total_contributions": 500000,
    "active_loans": 1,
    "kyc_status": "verified"
  }
}
\`\`\`

### Contributions

**GET** `/api/v1/contributions/summary`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "total_contributions": 500000,
    "this_month": 25000,
    "last_contribution": {
      "amount": 25000,
      "date": "2024-01-15T00:00:00Z"
    },
    "contribution_history": [
      {
        "month": "January 2024",
        "amount": 25000,
        "status": "completed"
      }
    ]
  }
}
\`\`\`

**POST** `/api/v1/contributions`

**Request:**
\`\`\`json
{
  "amount": 25000,
  "payment_method": "paystack", // or "remita", "wallet"
  "payment_details": {
    "card_number": "4084084084084081" // if card payment
  }
}
\`\`\`

### Loans

**POST** `/api/v1/loans/apply`

**Request:**
\`\`\`json
{
  "loan_plan_id": 1,
  "amount": 500000,
  "tenure_months": 12,
  "purpose": "Home renovation",
  "guarantor_1": {
    "name": "Jane Doe",
    "member_id": "FRSC-M-002",
    "phone": "08098765432"
  },
  "guarantor_2": {
    "name": "Bob Smith",
    "member_id": "FRSC-M-003",
    "phone": "08087654321"
  }
}
\`\`\`

**GET** `/api/v1/loans/my-loans`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "LOAN-2024-001",
      "loan_plan": "Personal Loan",
      "amount": 500000,
      "interest_rate": 5,
      "monthly_repayment": 43750,
      "balance": 350000,
      "status": "active",
      "next_payment_date": "2024-02-15"
    }
  ]
}
\`\`\`

**POST** `/api/v1/loans/{id}/repay`

**Request:**
\`\`\`json
{
  "amount": 43750,
  "payment_method": "wallet" // or "paystack", "remita"
}
\`\`\`

### Properties

**GET** `/api/v1/properties`

**Query Parameters:**
- `type`: residential, commercial
- `location`: Filter by location
- `min_price`: Minimum price
- `max_price`: Maximum price

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "3 Bedroom Apartment",
      "description": "Modern apartment in prime location",
      "type": "residential",
      "location": "Lekki, Lagos",
      "price": 25000000,
      "images": ["url1", "url2"],
      "features": ["3 bedrooms", "2 bathrooms", "Parking"],
      "status": "available"
    }
  ]
}
\`\`\`

**POST** `/api/v1/properties/{id}/interest`

**Request:**
\`\`\`json
{
  "message": "I'm interested in this property",
  "preferred_contact": "email"
}
\`\`\`

### Investments

**POST** `/api/v1/investments/invest`

**Request:**
\`\`\`json
{
  "investment_plan_id": 1,
  "amount": 100000,
  "payment_method": "wallet"
}
\`\`\`

**GET** `/api/v1/investments/my-investments`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "INV-2024-001",
      "plan": "Fixed Deposit",
      "amount": 100000,
      "roi_percentage": 15,
      "expected_return": 115000,
      "maturity_date": "2024-12-31",
      "status": "active"
    }
  ]
}
\`\`\`

### Wallet

**GET** `/api/v1/wallet/balance`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "balance": 150000,
    "total_credits": 500000,
    "total_debits": 350000
  }
}
\`\`\`

**POST** `/api/v1/wallet/fund`

**Request:**
\`\`\`json
{
  "amount": 50000,
  "payment_method": "paystack"
}
\`\`\`

**POST** `/api/v1/wallet/withdraw`

**Request:**
\`\`\`json
{
  "amount": 25000,
  "bank_account": {
    "bank_name": "GTBank",
    "account_number": "0123456789",
    "account_name": "John Doe"
  }
}
\`\`\`

### Statutory Charges

**GET** `/api/v1/statutory-charges/types`

**POST** `/api/v1/statutory-charges/pay`

**Request:**
\`\`\`json
{
  "charge_type_id": 1,
  "payment_method": "wallet"
}
\`\`\`

### Property Management (User Side)

**GET** `/api/v1/property-management/my-allotments`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "estate": "FRSC Estate Phase 1",
      "unit_number": "A-12",
      "allotment_date": "2024-01-15",
      "possession_date": "2024-06-15",
      "status": "allotted"
    }
  ]
}
\`\`\`

**POST** `/api/v1/property-management/maintenance-requests`

**Request:**
\`\`\`json
{
  "allotment_id": 1,
  "category": "plumbing",
  "description": "Leaking pipe in bathroom",
  "priority": "high",
  "images": ["base64_image1", "base64_image2"]
}
\`\`\`

### Mail Service

**GET** `/api/v1/mail/inbox`

**GET** `/api/v1/mail/sent`

**POST** `/api/v1/mail/send`

**Request:**
\`\`\`json
{
  "recipients": [1, 2, 3], // user IDs
  "subject": "Meeting Reminder",
  "message": "Don't forget about tomorrow's meeting",
  "attachments": ["base64_file1"]
}
\`\`\`

---

## Payment Integration

### Initialize Payment

**POST** `/api/v1/payments/initialize`

**Request:**
\`\`\`json
{
  "amount": 25000,
  "payment_method": "paystack", // or "remita"
  "reference": "CONT-2024-001",
  "callback_url": "https://yourapp.com/payment/callback"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "abc123",
    "reference": "CONT-2024-001"
  }
}
\`\`\`

### Verify Payment

**GET** `/api/v1/payments/verify/{reference}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "reference": "CONT-2024-001",
    "amount": 25000,
    "status": "success",
    "payment_method": "paystack",
    "paid_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

---

## Database Schema

### Shared Database Tables

\`\`\`sql
-- Tenants
CREATE TABLE tenants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    database_name VARCHAR(100) NOT NULL,
    logo VARCHAR(255),
    theme_primary_color VARCHAR(7) DEFAULT '#FDB11E',
    theme_secondary_color VARCHAR(7) DEFAULT '#276254',
    status ENUM('trial', 'active', 'suspended', 'cancelled') DEFAULT 'trial',
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Packages
CREATE TABLE packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    billing_cycle ENUM('monthly', 'yearly') DEFAULT 'monthly',
    trial_days INT DEFAULT 14,
    max_members INT,
    max_properties INT,
    max_loan_products INT,
    max_contribution_plans INT,
    max_storage_gb INT,
    modules JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions
CREATE TABLE subscriptions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id BIGINT NOT NULL,
    package_id BIGINT NOT NULL,
    status ENUM('trial', 'active', 'past_due', 'cancelled') DEFAULT 'trial',
    started_at TIMESTAMP,
    expires_at TIMESTAMP,
    auto_renew BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- Super Admins
CREATE TABLE super_admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'super_admin',
    permissions JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Tenant Database Tables

\`\`\`sql
-- Users (per tenant)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    member_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    membership_type ENUM('member', 'non-member') DEFAULT 'member',
    role ENUM('user', 'admin') DEFAULT 'user',
    ippis_number VARCHAR(50),
    staff_id VARCHAR(50),
    rank VARCHAR(100),
    date_of_first_employment DATE,
    command_department VARCHAR(100),
    unit VARCHAR(100),
    kyc_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contributions
CREATE TABLE contributions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    reference VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Loan Plans
CREATE TABLE loan_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    loan_type VARCHAR(50),
    max_amount DECIMAL(12, 2),
    min_amount DECIMAL(12, 2),
    interest_rate_member DECIMAL(5, 2),
    interest_rate_non_member DECIMAL(5, 2),
    max_tenure_months INT,
    processing_fee DECIMAL(10, 2),
    available_for_non_members BOOLEAN DEFAULT TRUE,
    repayment_method ENUM('salary_deduction', 'cash') DEFAULT 'salary_deduction',
    cash_repayment_config JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans
CREATE TABLE loans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    loan_plan_id BIGINT NOT NULL,
    reference VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenure_months INT NOT NULL,
    monthly_repayment DECIMAL(10, 2) NOT NULL,
    total_repayment DECIMAL(12, 2) NOT NULL,
    balance DECIMAL(12, 2) NOT NULL,
    status ENUM('pending', 'approved', 'active', 'rejected', 'completed') DEFAULT 'pending',
    disbursed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (loan_plan_id) REFERENCES loan_plans(id)
);

-- Properties
CREATE TABLE properties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('residential', 'commercial') DEFAULT 'residential',
    location VARCHAR(255),
    price DECIMAL(12, 2) NOT NULL,
    images JSON,
    features JSON,
    status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments
CREATE TABLE investments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    investment_plan_id BIGINT NOT NULL,
    reference VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    roi_percentage DECIMAL(5, 2) NOT NULL,
    expected_return DECIMAL(12, 2) NOT NULL,
    maturity_date DATE NOT NULL,
    status ENUM('active', 'matured', 'withdrawn') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Wallets
CREATE TABLE wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    balance DECIMAL(12, 2) DEFAULT 0,
    total_credits DECIMAL(12, 2) DEFAULT 0,
    total_debits DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Statutory Charge Types
CREATE TABLE statutory_charge_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    frequency ENUM('one-time', 'monthly', 'quarterly', 'annual') DEFAULT 'annual',
    applicable_to ENUM('all', 'members_only', 'non_members_only') DEFAULT 'all',
    department VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estates
CREATE TABLE estates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    total_units INT,
    available_units INT,
    description TEXT,
    amenities JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allotments
CREATE TABLE allotments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    estate_id BIGINT NOT NULL,
    unit_number VARCHAR(50),
    allotment_date DATE,
    possession_date DATE,
    status ENUM('allotted', 'possessed', 'cancelled') DEFAULT 'allotted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (estate_id) REFERENCES estates(id)
);

-- Maintenance Requests
CREATE TABLE maintenance_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    allotment_id BIGINT NOT NULL,
    category VARCHAR(100),
    description TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed', 'rejected') DEFAULT 'pending',
    images JSON,
    assigned_to VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (allotment_id) REFERENCES allotments(id)
);
\`\`\`

---

## Implementation Guide

### Step 1: Setup Multi-Tenancy

\`\`\`php
// config/database.php
'connections' => [
    'landlord' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST'),
        'database' => env('DB_DATABASE'),
        'username' => env('DB_USERNAME'),
        'password' => env('DB_PASSWORD'),
    ],
    'tenant' => [
        'driver' => 'mysql',
        'host' => env('DB_HOST'),
        'database' => '', // Set dynamically
        'username' => env('DB_USERNAME'),
        'password' => env('DB_PASSWORD'),
    ],
],
\`\`\`

### Step 2: Create Tenant Model

\`\`\`php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $connection = 'landlord';
    
    protected $fillable = [
        'name', 'slug', 'custom_domain', 'database_name',
        'logo', 'theme_primary_color', 'theme_secondary_color',
        'status', 'trial_ends_at'
    ];
    
    protected $casts = [
        'trial_ends_at' => 'datetime',
    ];
    
    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }
    
    public function configure()
    {
        config(['database.connections.tenant.database' => $this->database_name]);
        DB::purge('tenant');
        DB::reconnect('tenant');
    }
}
\`\`\`

### Step 3: Payment Service Integration

\`\`\`php
<?php

namespace App\Services;

class PaymentService
{
    public function initializePayment($amount, $reference, $method)
    {
        switch ($method) {
            case 'paystack':
                return $this->initializePaystack($amount, $reference);
            case 'remita':
                return $this->initializeRemita($amount, $reference);
            default:
                throw new \Exception('Invalid payment method');
        }
    }
    
    private function initializePaystack($amount, $reference)
    {
        $paystack = new \Yabacon\Paystack(env('PAYSTACK_SECRET_KEY'));
        
        try {
            $tranx = $paystack->transaction->initialize([
                'amount' => $amount * 100, // Convert to kobo
                'email' => auth()->user()->email,
                'reference' => $reference,
                'callback_url' => route('payment.callback'),
            ]);
            
            return [
                'authorization_url' => $tranx->data->authorization_url,
                'access_code' => $tranx->data->access_code,
                'reference' => $tranx->data->reference,
            ];
        } catch (\Exception $e) {
            throw new \Exception('Payment initialization failed: ' . $e->getMessage());
        }
    }
    
    private function initializeRemita($amount, $reference)
    {
        // Remita implementation
        $remita = new \RemitaPayment([
            'merchantId' => env('REMITA_MERCHANT_ID'),
            'apiKey' => env('REMITA_API_KEY'),
            'serviceTypeId' => env('REMITA_SERVICE_TYPE_ID'),
        ]);
        
        $response = $remita->initializePayment([
            'amount' => $amount,
            'orderId' => $reference,
            'payerName' => auth()->user()->full_name,
            'payerEmail' => auth()->user()->email,
            'payerPhone' => auth()->user()->phone,
        ]);
        
        return $response;
    }
}
\`\`\`

### Step 4: Tenant Seeder

\`\`\`php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\Package;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class TenantSeeder extends Seeder
{
    public function run()
    {
        $package = Package::where('name', 'Professional')->first();
        
        $tenant = Tenant::create([
            'name' => 'FRSC Lagos Housing Cooperative',
            'slug' => 'frsc-lagos',
            'database_name' => 'tenant_frsc_lagos',
            'theme_primary_color' => '#FDB11E',
            'theme_secondary_color' => '#276254',
            'status' => 'active',
        ]);
        
        // Create tenant database
        DB::statement("CREATE DATABASE IF NOT EXISTS {$tenant->database_name}");
        
        // Configure tenant connection
        $tenant->configure();
        
        // Run migrations for tenant
        Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);
        
        // Create subscription
        $tenant->subscription()->create([
            'package_id' => $package->id,
            'status' => 'active',
            'started_at' => now(),
            'expires_at' => now()->addYear(),
        ]);
    }
}
\`\`\`

---

## Best Practices

1. **Always validate tenant context** before processing requests
2. **Use database transactions** for critical operations
3. **Implement proper error handling** with meaningful messages
4. **Log all payment transactions** for audit purposes
5. **Use queues** for sending emails and processing heavy tasks
6. **Implement rate limiting** to prevent abuse
7. **Cache frequently accessed data** (packages, settings)
8. **Use API versioning** for backward compatibility
9. **Implement proper CORS** for frontend integration
10. **Monitor tenant usage** against package limits

---

This documentation provides a comprehensive guide for implementing the multi-tenant SaaS version of the FRSC Housing Management System with Laravel. All endpoints follow RESTful conventions and include proper tenant isolation, authentication, and error handling.
\`\`\`

Now let me create the updated Flutter mobile app documentation:
