# FRSC Housing Management System - Laravel API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Management](#user-management)
4. [Subscriptions](#subscriptions)
5. [Contributions](#contributions)
6. [Loans](#loans)
7. [Investments](#investments)
8. [Properties](#properties)
9. [Wallet](#wallet)
10. [Mail Service](#mail-service)
11. [Reports](#reports)
12. [Statutory Charges](#statutory-charges)
13. [Property Management](#property-management)
14. [Mortgages](#mortgages)
15. [Documents](#documents)
16. [Blockchain](#blockchain)
17. [Admin Endpoints](#admin-endpoints)
18. [Database Schema](#database-schema)

---

## Overview

**Base URL:** `https://api.frsc-housing.com/api/v1`

**Authentication:** Bearer Token (JWT)

**Content-Type:** `application/json`

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

**Error Response:**
\`\`\`json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
\`\`\`

---

## Authentication

### Register User - UPDATED
**POST** `/auth/register`

**Multi-Step Registration Flow:**
This endpoint handles the complete registration process with 4 steps:
1. Personal Information
2. Employment Details (for members)
3. Next of Kin Information
4. Document Upload

**Request Body:**
\`\`\`json
{
  // Step 1: Personal Information
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "password": "password123",
  "password_confirmation": "password123",
  "membership_type": "member", // or "non-member"
  
  // Step 2: Employment Details (for members only)
  "ippis_number": "IPPIS123456",
  "staff_id": "C-01943",
  "rank": "Corps Commander",
  "date_of_first_employment": "1998-01-01",
  "command_department": "Engineering",
  "unit": "Maintenance Unit",
  
  // Step 3: Next of Kin
  "nok_name": "Jane Doe",
  "nok_relationship": "Spouse",
  "nok_phone": "08098765432",
  "nok_email": "jane@example.com",
  "nok_address": "123 Main Street, Lagos",
  
  // Step 4: Documents (for non-members)
  "id_type": "NIN", // NIN, Drivers License, FRSC ID, International Passport
  "id_number": "12345678901"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Registration successful. Please verify OTP sent to your email.",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "membership_type": "member",
      "member_id": "FRSC-M-001",
      "ippis_number": "IPPIS123456",
      "years_of_service": "27 yrs and 0 months (approximately 27 yrs)",
      "has_subscribed": false
    },
    "otp_sent": true,
    "otp_expires_at": "2024-01-15T10:40:00Z"
  }
}
\`\`\`

### Verify OTP - UPDATED
**POST** `/auth/verify-otp`

After successful OTP verification, users are redirected to the subscription page to choose a membership plan before accessing the dashboard.

**Request Body:**
\`\`\`json
{
  "email": "john@example.com",
  "otp": "123456"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "OTP verified successfully. Please complete your subscription.",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "email_verified_at": "2024-01-15T10:30:00Z",
      "has_subscribed": false
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "redirect_to": "/subscription"
  }
}
\`\`\`

### Resend OTP
**POST** `/auth/resend-otp`

**Request Body:**
\`\`\`json
{
  "email": "john@example.com"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "otp_sent": true,
    "otp_expires_at": "2024-01-15T10:50:00Z"
  }
}
\`\`\`

### Login
**POST** `/auth/login`

**Request Body:**
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "user",
      "membership_type": "member"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
\`\`\`

### Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Logged out successfully"
}
\`\`\`

### Refresh Token
**POST** `/auth/refresh`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
\`\`\`

---

## User Management

### Get User Profile
**GET** `/user/profile`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "membership_type": "member",
    "member_id": "FRSC-M-001",
    
    "employment": {
      "ippis_number": "IPPIS123456",
      "date_of_first_employment": "1998-01-01",
      "years_of_service": "27 yrs and 9 months",
      "command_department": "Engineering",
      "unit": "Maintenance Unit",
      "rank": "Senior Officer"
    },
    
    "next_of_kin": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "phone": "08098765432",
      "email": "jane@example.com",
      "address": "123 Main St, Lagos"
    },
    
    "created_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Update User Profile - UPDATED
**PUT** `/user/profile`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "08012345678",
  
  "employment": {
    "ippis_number": "IPPIS123456",
    "date_of_first_employment": "1998-01-01",
    "command_department": "Engineering",
    "unit": "Maintenance Unit",
    "rank": "Senior Officer"
  },
  
  "next_of_kin": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "08098765432",
    "email": "jane@example.com",
    "address": "123 Main St, Lagos"
  }
}
\`\`\`

### Upload Profile Picture
**POST** `/user/profile/picture`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
profile_picture: [File]
\`\`\`

### Upgrade to Member - UPDATED
**POST** `/user/upgrade-membership`

This endpoint is used when non-members want to upgrade to become members. After successful upgrade, users receive a member badge and their transaction history is preserved.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "ippis_number": "IPPIS123456",
  "staff_id": "C-01943",
  "rank": "Corps Commander",
  "date_of_first_employment": "1998-01-01",
  "command_department": "Engineering",
  "unit": "Maintenance Unit",
  "id_type": "NIN",
  "id_number": "12345678901",
  "supporting_documents": ["doc1.pdf", "doc2.pdf"]
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Membership upgrade successful. Welcome as a member!",
  "data": {
    "status": "approved",
    "previous_member_id": "FRSC-NM-001",
    "new_member_id": "FRSC-M-001",
    "member_badge": "active",
    "years_of_service": "27 yrs and 0 months (approximately 27 yrs)",
    "history_migrated": true,
    "upgrade_date": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Get User Dashboard Status
**GET** `/user/dashboard-status`

Returns user status including membership type and whether they need to upgrade.

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "membership_type": "non-member",
      "member_id": "FRSC-NM-001",
      "has_subscribed": true
    },
    "show_upgrade_alert": true,
    "upgrade_message": "Upgrade to Member status to enjoy lower interest rates and exclusive benefits!",
    "upgrade_url": "/dashboard/subscriptions/upgrade"
  }
}
\`\`\`

---

## Subscriptions

### Get Subscription Packages
**GET** `/subscriptions/packages`

Returns available subscription packages for new users after registration.

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Weekly Basic",
      "duration": "7 days",
      "price": 500,
      "currency": "NGN",
      "features": [
        "Access to all modules",
        "Basic support",
        "Weekly reports",
        "Mobile app access"
      ],
      "is_popular": false
    },
    {
      "id": 2,
      "name": "Monthly Standard",
      "duration": "30 days",
      "price": 1500,
      "currency": "NGN",
      "features": [
        "Access to all modules",
        "Priority support",
        "Daily reports",
        "Mobile app access",
        "Email notifications"
      ],
      "is_popular": true
    }
  ]
}
\`\`\`

### Subscribe to Package
**POST** `/subscriptions/subscribe`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "package_id": 2,
  "payment_method": "paystack" // or "remita", "card", "bank_transfer"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Subscription initiated successfully",
  "data": {
    "subscription_id": 1,
    "package_name": "Monthly Standard",
    "amount": 1500,
    "payment_reference": "SUB-2024-001",
    "payment_url": "https://paystack.com/pay/xyz123",
    "expires_at": "2024-02-15T10:30:00Z"
  }
}
\`\`\`

### Verify Subscription Payment
**POST** `/subscriptions/verify-payment`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "payment_reference": "SUB-2024-001"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Subscription activated successfully",
  "data": {
    "subscription_id": 1,
    "status": "active",
    "package_name": "Monthly Standard",
    "start_date": "2024-01-15",
    "end_date": "2024-02-15",
    "redirect_to": "/dashboard"
  }
}
\`\`\`

---

## Contributions

### Get Contribution Summary
**GET** `/contributions/summary`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "total_contributions": 500000,
    "monthly_contribution": 25000,
    "contribution_balance": 500000,
    "last_contribution_date": "2024-01-15",
    "contribution_status": "active",
    "months_contributed": 20
  }
}
\`\`\`

### Get Contribution History
**GET** `/contributions/history`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 15)
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `status` (optional): Filter by status (completed, pending, failed)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "amount": 25000,
      "payment_method": "Bank Transfer",
      "reference": "CONT-2024-001",
      "status": "completed",
      "payment_date": "2024-01-15T10:30:00Z",
      "description": "Monthly contribution for January 2024"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 20,
    "per_page": 15
  }
}
\`\`\`

### Make Contribution
**POST** `/contributions`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "amount": 25000,
  "payment_method": "card", // card, bank_transfer, wallet, paystack, remita
  "payment_details": {
    "card_number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cvv": "123"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Contribution payment initiated",
  "data": {
    "contribution_id": 1,
    "reference": "CONT-2024-001",
    "amount": 25000,
    "status": "pending",
    "payment_url": "https://payment-gateway.com/pay/xyz123"
  }
}
\`\`\`

### Verify Contribution Payment
**GET** `/contributions/{reference}/verify`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "reference": "CONT-2024-001",
    "status": "completed",
    "amount": 25000,
    "payment_date": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

---

## Loans - UPDATED

### Get Loan Plans - UPDATED
**GET** `/loans/plans`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `membership_type` (optional): Filter by membership type (member, non-member)
- `loan_type` (optional): Filter by loan type

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Personal Loan",
      "description": "Quick personal loan for members",
      "loan_type": "personal",
      "max_amount": 500000,
      "min_amount": 50000,
      "interest_rate_member": 5,
      "interest_rate_non_member": 8,
      "max_tenure_months": 25,
      "loan_to_net_pay_percentage": 40,
      "eligibility": "Must have contributed for at least 6 months",
      "required_documents": ["Valid ID", "Proof of employment"],
      "processing_fee": 2500,
      "available_for_non_members": true
    }
  ]
}
\`\`\`

### Apply for Loan - SIMPLIFIED
**POST** `/loans/apply`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "loan_plan_id": 1,
  "amount": 200000,
  "last_net_pay": 500000,
  "purpose": "Home renovation"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Loan application submitted successfully",
  "data": {
    "loan_id": 1,
    "reference": "LOAN-2024-001",
    "amount": 200000,
    "interest_rate": 5,
    "tenure_months": 25,
    "monthly_repayment": 8400,
    "total_interest": 10000,
    "total_repayment": 210000,
    "status": "pending",
    "applied_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Terminate Loan - NEW
**POST** `/loans/{loanId}/terminate`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "confirmation": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Loan terminated successfully",
  "data": {
    "loan_id": 1,
    "original_balance": 150000,
    "one_month_interest": 625,
    "termination_amount": 150625,
    "cancelled_interest": 5375,
    "payment_reference": "TERM-2024-001",
    "terminated_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

**Error Response (if less than 2 months remaining):**
\`\`\`json
{
  "success": false,
  "message": "Loan can only be terminated 2 months before maturity date",
  "data": {
    "months_remaining": 1,
    "maturity_date": "2024-02-20"
  }
}
\`\`\`

### Get My Loans
**GET** `/loans/my-loans`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, active, completed, rejected)
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "LOAN-2024-001",
      "loan_plan": "Personal Loan",
      "amount": 200000,
      "interest_rate": 5,
      "tenure_months": 12,
      "monthly_repayment": 17083.33,
      "total_repayment": 205000,
      "amount_paid": 51250,
      "balance": 153750,
      "status": "active",
      "disbursement_date": "2024-01-20",
      "next_payment_date": "2024-02-20",
      "applied_at": "2024-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

### Get Loan Repayment Schedule
**GET** `/loans/{loanId}/schedule`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "loan_id": 1,
    "reference": "LOAN-2024-001",
    "schedule": [
      {
        "month": 1,
        "due_date": "2024-02-20",
        "principal": 16666.67,
        "interest": 416.67,
        "total": 17083.33,
        "balance": 183333.33,
        "status": "paid",
        "paid_date": "2024-02-18"
      },
      {
        "month": 2,
        "due_date": "2024-03-20",
        "principal": 16666.67,
        "interest": 416.67,
        "total": 17083.33,
        "balance": 166666.67,
        "status": "pending"
      }
    ]
  }
}
\`\`\`

### Make Loan Repayment
**POST** `/loans/{loanId}/repay`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "amount": 17083.33,
  "payment_method": "wallet", // wallet, card, bank_transfer, paystack, remita
  "payment_details": {}
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Loan repayment successful",
  "data": {
    "payment_id": 1,
    "reference": "REPAY-2024-001",
    "amount": 17083.33,
    "remaining_balance": 136666.67,
    "next_payment_date": "2024-04-20"
  }
}
\`\`\`

---

## Investments

### Get Investment Plans
**GET** `/investments/plans`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Filter by type (money, land, house)
- `status` (optional): Filter by status (active, closed)

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Fixed Deposit Investment",
      "description": "Secure fixed deposit with guaranteed returns",
      "type": "money",
      "minimum_amount": 100000,
      "maximum_amount": 5000000,
      "roi_percentage": 12,
      "duration_months": 12,
      "moratorium_months": 3,
      "status": "active",
      "total_slots": 100,
      "available_slots": 45,
      "closing_date": "2024-12-31",
      "features": ["Guaranteed returns", "Flexible withdrawal after moratorium"],
      "images": [],
      "documents": []
    },
    {
      "id": 2,
      "name": "Lekki Phase 2 Land",
      "description": "Prime land in Lekki Phase 2",
      "type": "land",
      "minimum_amount": 2000000,
      "maximum_amount": 10000000,
      "roi_percentage": 25,
      "duration_months": 24,
      "moratorium_months": 6,
      "status": "active",
      "property_details": {
        "location": "Lekki Phase 2, Lagos",
        "size": "500 sqm",
        "title": "Certificate of Occupancy",
        "coordinates": "6.4474, 3.5560"
      },
      "total_slots": 20,
      "available_slots": 8,
      "closing_date": "2024-06-30",
      "images": [
        "https://storage.com/investments/land1.jpg",
        "https://storage.com/investments/land2.jpg"
      ],
      "documents": [
        {
          "name": "Survey Plan",
          "url": "https://storage.com/docs/survey.pdf"
        },
        {
          "name": "Title Document",
          "url": "https://storage.com/docs/title.pdf"
        }
      ]
    }
  ]
}
\`\`\`

### Get Investment Plan Details
**GET** `/investments/plans/{planId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Lekki Phase 2 Land",
    "description": "Prime land in Lekki Phase 2 with high appreciation potential",
    "type": "land",
    "minimum_amount": 2000000,
    "maximum_amount": 10000000,
    "roi_percentage": 25,
    "duration_months": 24,
    "moratorium_months": 6,
    "property_details": {
      "location": "Lekki Phase 2, Lagos",
      "size": "500 sqm",
      "title": "Certificate of Occupancy",
      "coordinates": "6.4474, 3.5560",
      "amenities": ["Gated estate", "24/7 security", "Good road network"]
    },
    "images": [
      "https://storage.com/investments/land1.jpg",
      "https://storage.com/investments/land2.jpg",
      "https://storage.com/investments/land3.jpg"
    ],
    "documents": [
      {
        "name": "Survey Plan",
        "url": "https://storage.com/docs/survey.pdf",
        "size": "2.5 MB"
      }
    ],
    "total_slots": 20,
    "available_slots": 8,
    "investors_count": 12,
    "total_invested": 24000000,
    "closing_date": "2024-06-30",
    "status": "active"
  }
}
\`\`\`

### Invest in Plan
**POST** `/investments/invest`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "investment_plan_id": 1,
  "amount": 500000,
  "payment_method": "wallet", // wallet, card, bank_transfer, contribution_balance
  "use_contribution_balance": false,
  "contribution_balance_amount": 0
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Investment successful",
  "data": {
    "investment_id": 1,
    "reference": "INV-2024-001",
    "investment_plan": "Fixed Deposit Investment",
    "amount": 500000,
    "expected_return": 560000,
    "roi_percentage": 12,
    "maturity_date": "2025-01-15",
    "certificate_url": "https://storage.com/certificates/INV-2024-001.pdf",
    "status": "active"
  }
}
\`\`\`

### Get My Investments
**GET** `/investments/my-investments`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Filter by type (money, land, house)
- `status` (optional): Filter by status (active, matured, withdrawn)

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "summary": {
      "total_invested": 1500000,
      "total_returns": 180000,
      "active_investments": 3,
      "matured_investments": 1
    },
    "investments": [
      {
        "id": 1,
        "reference": "INV-2024-001",
        "investment_plan": "Fixed Deposit Investment",
        "type": "money",
        "amount": 500000,
        "roi_percentage": 12,
        "expected_return": 560000,
        "current_value": 530000,
        "start_date": "2024-01-15",
        "maturity_date": "2025-01-15",
        "moratorium_end_date": "2024-04-15",
        "status": "active",
        "can_withdraw": false,
        "certificate_url": "https://storage.com/certificates/INV-2024-001.pdf"
      }
    ]
  }
}
\`\`\`

### Withdraw Investment
**POST** `/investments/{investmentId}/withdraw`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "withdrawal_type": "full", // full or partial
  "amount": 530000, // For partial withdrawal
  "reason": "Emergency funds needed"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "data": {
    "withdrawal_id": 1,
    "reference": "WD-2024-001",
    "amount": 530000,
    "penalty": 0,
    "net_amount": 530000,
    "status": "pending",
    "estimated_processing_days": 5
  }
}
\`\`\`

---

## Properties

### Get Properties Listing
**GET** `/properties`

**Query Parameters:**
- `type` (optional): Filter by type (land, house)
- `location` (optional): Filter by location
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price
- `status` (optional): Filter by status (available, sold, reserved)
- `search` (optional): Search by name or description
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "3 Bedroom Duplex - Lekki",
      "description": "Modern 3 bedroom duplex in a serene environment",
      "type": "house",
      "price": 45000000,
      "location": "Lekki Phase 1, Lagos",
      "size": "250 sqm",
      "bedrooms": 3,
      "bathrooms": 4,
      "features": ["Swimming pool", "BQ", "Parking space"],
      "images": [
        "https://storage.com/properties/house1.jpg",
        "https://storage.com/properties/house2.jpg"
      ],
      "status": "available",
      "payment_plan_available": true,
      "down_payment_percentage": 30
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 50,
    "per_page": 15
  }
}
\`\`\`

### Get Property Details
**GET** `/properties/{propertyId}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "3 Bedroom Duplex - Lekki",
    "description": "Modern 3 bedroom duplex in a serene environment with all modern amenities",
    "type": "house",
    "price": 45000000,
    "location": "Lekki Phase 1, Lagos",
    "address": "Plot 123, Admiralty Way, Lekki Phase 1",
    "coordinates": "6.4474, 3.5560",
    "size": "250 sqm",
    "bedrooms": 3,
    "bathrooms": 4,
    "features": ["Swimming pool", "BQ", "Parking space", "24/7 security"],
    "amenities": ["Gym", "Playground", "Shopping mall nearby"],
    "images": [
      "https://storage.com/properties/house1.jpg",
      "https://storage.com/properties/house2.jpg",
      "https://storage.com/properties/house3.jpg"
    ],
    "documents": [
      {
        "name": "Title Document",
        "url": "https://storage.com/docs/title.pdf"
      }
    ],
    "status": "available",
    "payment_plan_available": true,
    "down_payment_percentage": 30,
    "down_payment_amount": 13500000,
    "installment_duration_months": 12,
    "monthly_installment": 2625000,
    "agent": {
      "name": "John Agent",
      "phone": "08012345678",
      "email": "agent@frsc.com"
    }
  }
}
\`\`\`

### Express Interest in Property
**POST** `/properties/{propertyId}/interest`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "payment_type": "outright", // outright or installment
  "message": "I'm interested in this property",
  "preferred_inspection_date": "2024-02-01"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Interest submitted successfully",
  "data": {
    "interest_id": 1,
    "reference": "INT-2024-001",
    "property_name": "3 Bedroom Duplex - Lekki",
    "status": "pending",
    "submitted_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Subscribe to Property (Make Payment)
**POST** `/properties/{propertyId}/subscribe`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "payment_type": "installment", // outright or installment
  "payment_method": "card",
  "amount": 13500000, // Down payment for installment or full amount for outright
  "payment_details": {}
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Property subscription initiated",
  "data": {
    "subscription_id": 1,
    "reference": "SUB-2024-001",
    "property_name": "3 Bedroom Duplex - Lekki",
    "payment_type": "installment",
    "amount_paid": 13500000,
    "balance": 31500000,
    "monthly_installment": 2625000,
    "next_payment_date": "2024-02-15",
    "status": "active"
  }
}
\`\`\`

### Get My Properties
**GET** `/properties/my-properties`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subscription_id": 1,
      "reference": "SUB-2024-001",
      "property_name": "3 Bedroom Duplex - Lekki",
      "property_type": "house",
      "total_cost": 45000000,
      "amount_paid": 13500000,
      "balance": 31500000,
      "payment_type": "installment",
      "monthly_installment": 2625000,
      "next_payment_date": "2024-02-15",
      "status": "active",
      "ownership_percentage": 30,
      "images": ["https://storage.com/properties/house1.jpg"]
    }
  ]
}
\`\`\`

### Make Property Payment
**POST** `/properties/subscriptions/{subscriptionId}/pay`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "amount": 2625000,
  "payment_method": "wallet"
}
\`\`\`

---

## Wallet

### Get Wallet Balance
**GET** `/wallet/balance`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "balance": 150000,
    "total_income": 500000,
    "total_expenses": 350000,
    "pending_transactions": 2
  }
}
\`\`\`

### Get Wallet Transactions
**GET** `/wallet/transactions`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Filter by type (credit, debit)
- `status` (optional): Filter by status (completed, pending, failed)
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)
- `search` (optional): Search by reference or description
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "TXN-2024-001",
      "type": "credit",
      "amount": 50000,
      "description": "Wallet funding via card",
      "status": "completed",
      "balance_before": 100000,
      "balance_after": 150000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 100,
    "per_page": 15
  }
}
\`\`\`

### Add Funds to Wallet
**POST** `/wallet/fund`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "amount": 50000,
  "payment_method": "card", // card, bank_transfer, paystack, remita, ussd
  "payment_details": {
    "card_number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "2025",
    "cvv": "123"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Wallet funding initiated",
  "data": {
    "transaction_id": 1,
    "reference": "FUND-2024-001",
    "amount": 50000,
    "status": "pending",
    "payment_url": "https://payment-gateway.com/pay/xyz123"
  }
}
\`\`\`

### Verify Wallet Funding
**GET** `/wallet/fund/{reference}/verify`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "reference": "FUND-2024-001",
    "amount": 50000,
    "status": "completed",
    "new_balance": 150000
  }
}
\`\`\`

### Request Withdrawal
**POST** `/wallet/withdraw`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "amount": 20000,
  "bank_name": "GTBank",
  "account_number": "0123456789",
  "account_name": "John Doe",
  "reason": "Personal use"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Withdrawal request submitted",
  "data": {
    "withdrawal_id": 1,
    "reference": "WD-2024-001",
    "amount": 20000,
    "status": "pending",
    "estimated_processing_days": 3
  }
}
\`\`\`

---

## Mail Service

### Get Inbox Messages
**GET** `/mail/inbox`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `category` (optional): Filter by category (primary, social, promotions)
- `status` (optional): Filter by status (read, unread)
- `search` (optional): Search by subject or sender
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "from": {
        "name": "Admin",
        "email": "admin@frsc.com"
      },
      "subject": "Welcome to FRSC Housing",
      "preview": "Thank you for joining FRSC Housing Management System...",
      "category": "primary",
      "is_read": false,
      "is_starred": false,
      "has_attachments": true,
      "attachments_count": 2,
      "received_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 50,
    "per_page": 15,
    "unread_count": 5
  }
}
\`\`\`

### Get Sent Messages
**GET** `/mail/sent`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `search` (optional): Search by subject or recipient
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "to": [
        {
          "name": "Jane Doe",
          "email": "jane@example.com"
        }
      ],
      "subject": "Loan Application Update",
      "preview": "Your loan application has been approved...",
      "has_attachments": false,
      "delivery_status": "delivered",
      "sent_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 20,
    "per_page": 15
  }
}
\`\`\`

### Get Draft Messages
**GET** `/mail/drafts`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "to": ["jane@example.com"],
      "subject": "Meeting Request",
      "body": "Hi Jane, I would like to schedule...",
      "has_attachments": false,
      "last_edited": "2024-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

### Get Message Details
**GET** `/mail/{messageId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "from": {
      "name": "Admin",
      "email": "admin@frsc.com",
      "avatar": "https://storage.com/avatars/admin.jpg"
    },
    "to": [
      {
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "cc": [],
    "bcc": [],
    "subject": "Welcome to FRSC Housing",
    "body": "<p>Thank you for joining FRSC Housing Management System...</p>",
    "attachments": [
      {
        "id": 1,
        "name": "welcome_guide.pdf",
        "size": 2500000,
        "type": "application/pdf",
        "url": "https://storage.com/attachments/welcome_guide.pdf"
      }
    ],
    "is_read": true,
    "is_starred": false,
    "category": "primary",
    "received_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Send Message
**POST** `/mail/send`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
to: ["jane@example.com", "bob@example.com"]
cc: ["manager@example.com"]
bcc: []
subject: "Meeting Request"
body: "<p>Hi, I would like to schedule a meeting...</p>"
attachments: [File, File]
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message_id": 1,
    "sent_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Save Draft
**POST** `/mail/drafts`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "to": ["jane@example.com"],
  "cc": [],
  "subject": "Meeting Request",
  "body": "<p>Hi, I would like to schedule...</p>",
  "attachments": []
}
\`\`\`

### Mark as Read/Unread
**PATCH** `/mail/{messageId}/read-status`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "is_read": true
}
\`\`\`

### Star/Unstar Message
**PATCH** `/mail/{messageId}/star`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "is_starred": true
}
\`\`\`

### Delete Message
**DELETE** `/mail/{messageId}`

**Headers:** `Authorization: Bearer {token}`

---

## Reports

### Get Contribution Report
**GET** `/reports/contributions`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)
- `export` (optional): Export format (pdf, excel)

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "summary": {
      "total_contributions": 500000,
      "total_months": 20,
      "average_monthly": 25000,
      "highest_contribution": 30000,
      "lowest_contribution": 20000
    },
    "contributions": [
      {
        "month": "January 2024",
        "amount": 25000,
        "payment_date": "2024-01-15",
        "status": "completed"
      }
    ],
    "chart_data": {
      "labels": ["Jan", "Feb", "Mar"],
      "values": [25000, 25000, 25000]
    }
  }
}
\`\`\`

### Get Investment Report
**GET** `/reports/investments`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Filter by type (money, land, house)
- `status` (optional): Filter by status
- `export` (optional): Export format

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "summary": {
      "total_invested": 1500000,
      "total_returns": 180000,
      "roi_percentage": 12,
      "active_investments": 3,
      "matured_investments": 1
    },
    "investments": [
      {
        "name": "Fixed Deposit Investment",
        "type": "money",
        "amount": 500000,
        "roi": 12,
        "current_value": 530000,
        "status": "active"
      }
    ]
  }
}
\`\`\`

### Get Loan Report
**GET** `/reports/loans`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status
- `export` (optional): Export format

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "summary": {
      "total_borrowed": 200000,
      "total_repaid": 51250,
      "outstanding_balance": 148750,
      "active_loans": 1,
      "completed_loans": 0
    },
    "loans": [
      {
        "reference": "LOAN-2024-001",
        "loan_type": "Personal Loan",
        "amount": 200000,
        "amount_paid": 51250,
        "balance": 148750,
        "status": "active"
      }
    ]
  }
}
\`\`\`

### Get Property Report
**GET** `/reports/properties`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `export` (optional): Export format

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "summary": {
      "total_properties": 2,
      "total_value": 70000000,
      "total_paid": 25000000,
      "outstanding_balance": 45000000
    },
    "properties": [
      {
        "name": "3 Bedroom Duplex - Lekki",
        "type": "house",
        "total_cost": 45000000,
        "amount_paid": 13500000,
        "balance": 31500000,
        "payment_progress": 30
      }
    ]
  }
}
\`\`\`

### Get Financial Summary Report
**GET** `/reports/financial-summary`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `export` (optional): Export format

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "net_worth": 2150000,
    "assets": {
      "contributions": 500000,
      "investments": 1530000,
      "properties": 25000000,
      "wallet": 150000,
      "total": 27180000
    },
    "liabilities": {
      "loans": 148750,
      "property_balance": 45000000,
      "total": 45148750
    },
    "income": {
      "investment_returns": 180000,
      "total": 180000
    },
    "expenses": {
      "loan_repayments": 51250,
      "property_payments": 13500000,
      "total": 13551250
    },
    "monthly_trends": [
      {
        "month": "January 2024",
        "income": 30000,
        "expenses": 42083
      }
    ]
  }
}
\`\`\`

---

## Statutory Charges

### Get Statutory Charge Types
**GET** `/statutory-charges/types`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Title Document Processing (TDP)",
      "code": "TDP",
      "description": "Processing fee for title documents",
      "amount": 50000,
      "department": "Legal Department",
      "required_documents": ["Property documents", "Valid ID"],
      "processing_days": 14
    },
    {
      "id": 2,
      "name": "Building Plan Approval",
      "code": "BPA",
      "description": "Fee for building plan approval",
      "amount": 75000,
      "department": "Engineering Department",
      "required_documents": ["Architectural drawings", "Survey plan"],
      "processing_days": 21
    },
    {
      "id": 3,
      "name": "Building Alteration Fee",
      "code": "BAF",
      "description": "Fee for building alteration approval",
      "amount": 35000,
      "department": "Engineering Department",
      "required_documents": ["Alteration plan", "Original building plan"],
      "processing_days": 10
    }
  ]
}
\`\`\`

### Pay Statutory Charge
**POST** `/statutory-charges/pay`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
charge_type_id: 1
property_reference: "PROP-2024-001"
payment_method: "card"
supporting_documents: [File, File]
notes: "Urgent processing required"
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "payment_id": 1,
    "reference": "SC-2024-001",
    "charge_type": "Title Document Processing (TDP)",
    "amount": 50000,
    "status": "pending",
    "payment_url": "https://payment-gateway.com/pay/xyz123"
  }
}
\`\`\`

### Get Statutory Charge Payment History
**GET** `/statutory-charges/history`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `charge_type` (optional): Filter by charge type
- `status` (optional): Filter by status
- `start_date` (optional): Start date
- `end_date` (optional): End date

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "SC-2024-001",
      "charge_type": "Title Document Processing (TDP)",
      "amount": 50000,
      "property_reference": "PROP-2024-001",
      "status": "completed",
      "department": "Legal Department",
      "payment_date": "2024-01-15",
      "processing_status": "in_progress",
      "estimated_completion": "2024-01-29"
    }
  ]
}
\`\`\`

---

## Property Management

### Get Estates
**GET** `/property-management/estates`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `search` (optional): Search by name or location
- `status` (optional): Filter by status

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "FRSC Estate Phase 1",
      "location": "Lekki, Lagos",
      "total_units": 50,
      "occupied_units": 35,
      "vacant_units": 15,
      "amenities": ["24/7 Security", "Playground", "Gym"],
      "status": "active",
      "images": ["https://storage.com/estates/estate1.jpg"]
    }
  ]
}
\`\`\`

### Get Estate Details
**GET** `/property-management/estates/{estateId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "FRSC Estate Phase 1",
    "location": "Lekki, Lagos",
    "address": "Plot 123, Lekki-Epe Expressway",
    "total_units": 50,
    "occupied_units": 35,
    "vacant_units": 15,
    "unit_types": [
      {
        "type": "2 Bedroom",
        "count": 20,
        "occupied": 15
      },
      {
        "type": "3 Bedroom",
        "count": 30,
        "occupied": 20
      }
    ],
    "amenities": ["24/7 Security", "Playground", "Gym", "Swimming Pool"],
    "facilities": ["Water supply", "Electricity", "Waste management"],
    "status": "active",
    "images": [
      "https://storage.com/estates/estate1.jpg",
      "https://storage.com/estates/estate2.jpg"
    ],
    "manager": {
      "name": "Estate Manager",
      "phone": "08012345678",
      "email": "manager@frsc.com"
    }
  }
}
\`\`\`

### Get My Allotted Properties
**GET** `/property-management/my-allotments`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "estate_name": "FRSC Estate Phase 1",
      "unit_number": "A-15",
      "unit_type": "3 Bedroom",
      "allotment_date": "2024-01-15",
      "occupancy_status": "occupied",
      "move_in_date": "2024-02-01",
      "monthly_maintenance": 15000,
      "last_maintenance_payment": "2024-01-15"
    }
  ]
}
\`\`\`

### Submit Maintenance Request
**POST** `/property-management/maintenance-requests`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
estate_id: 1
unit_number: "A-15"
category: "plumbing" // plumbing, electrical, structural, general
priority: "high" // low, medium, high, urgent
title: "Leaking pipe in kitchen"
description: "The kitchen sink pipe is leaking..."
images: [File, File]
preferred_date: "2024-01-20"
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Maintenance request submitted successfully",
  "data": {
    "request_id": 1,
    "reference": "MR-2024-001",
    "category": "plumbing",
    "priority": "high",
    "status": "pending",
    "estimated_response_time": "24 hours"
  }
}
\`\`\`

### Get My Maintenance Requests
**GET** `/property-management/maintenance-requests`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (pending, in_progress, completed, cancelled)
- `category` (optional): Filter by category

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "MR-2024-001",
      "estate_name": "FRSC Estate Phase 1",
      "unit_number": "A-15",
      "category": "plumbing",
      "priority": "high",
      "title": "Leaking pipe in kitchen",
      "status": "in_progress",
      "submitted_at": "2024-01-15T10:30:00Z",
      "assigned_to": "John Technician",
      "estimated_completion": "2024-01-18"
    }
  ]
}
\`\`\`

---

## Mortgages

### Get Mortgage Plans
**GET** `/mortgages/plans`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Standard Mortgage",
      "description": "Affordable mortgage plan for members",
      "interest_rate": 8,
      "max_amount": 20000000,
      "max_tenure_years": 20,
      "down_payment_percentage": 20,
      "eligibility": "Must be a member for at least 2 years",
      "required_documents": ["Valid ID", "Proof of income", "Bank statements"]
    }
  ]
}
\`\`\`

### Apply for Mortgage
**POST** `/mortgages/apply`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
mortgage_plan_id: 1
property_id: 1
loan_amount: 15000000
tenure_years: 15
down_payment: 3000000
monthly_income: 500000
employment_status: "employed"
employer_name: "FRSC"
years_of_service: 5
supporting_documents: [File, File]
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Mortgage application submitted successfully",
  "data": {
    "application_id": 1,
    "reference": "MTG-2024-001",
    "loan_amount": 15000000,
    "down_payment": 3000000,
    "monthly_repayment": 143000,
    "status": "pending",
    "submitted_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Get My Mortgages
**GET** `/mortgages/my-mortgages`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "MTG-2024-001",
      "property_name": "3 Bedroom Duplex - Lekki",
      "loan_amount": 15000000,
      "interest_rate": 8,
      "tenure_years": 15,
      "monthly_repayment": 143000,
      "amount_paid": 1430000,
      "balance": 13570000,
      "status": "active",
      "next_payment_date": "2024-02-15"
    }
  ]
}
\`\`\`

---

## Documents

### Get My Documents
**GET** `/documents`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `category` (optional): Filter by category (personal, property, loan, investment)
- `search` (optional): Search by name

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Loan Agreement",
      "category": "loan",
      "type": "application/pdf",
      "size": 2500000,
      "reference": "LOAN-2024-001",
      "url": "https://storage.com/documents/loan_agreement.pdf",
      "uploaded_at": "2024-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

### Upload Document
**POST** `/documents`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
name: "Passport Photograph"
category: "personal"
file: [File]
description: "Updated passport photograph"
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document_id": 1,
    "name": "Passport Photograph",
    "url": "https://storage.com/documents/passport.jpg"
  }
}
\`\`\`

### Delete Document
**DELETE** `/documents/{documentId}`

**Headers:** `Authorization: Bearer {token}`

---

## Blockchain

### Get Blockchain Properties
**GET** `/blockchain/properties`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "property_name": "3 Bedroom Duplex - Lekki",
      "blockchain_hash": "0x1234567890abcdef",
      "registration_date": "2024-01-15",
      "owner": "John Doe",
      "status": "verified",
      "transaction_url": "https://etherscan.io/tx/0x1234567890abcdef"
    }
  ]
}
\`\`\`

### Register Property on Blockchain
**POST** `/blockchain/register`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "property_id": 1,
  "owner_name": "John Doe",
  "property_details": {
    "address": "Plot 123, Lekki Phase 1",
    "size": "250 sqm",
    "type": "house"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Property registration initiated on blockchain",
  "data": {
    "registration_id": 1,
    "status": "pending",
    "estimated_confirmation_time": "5 minutes"
  }
}
\`\`\`

---

## Admin Endpoints

### Dashboard Statistics
**GET** `/admin/dashboard/stats`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "total_members": 1250,
    "total_non_members": 350,
    "active_loans": 450,
    "total_contributions": 125000000,
    "total_investments": 85000000,
    "pending_approvals": {
      "loans": 15,
      "withdrawals": 8,
      "membership_upgrades": 5
    },
    "revenue": {
      "this_month": 15000000,
      "last_month": 12000000,
      "growth_percentage": 25
    }
  }
}
\`\`\`

### Get All Users
**GET** `/admin/users`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `membership_type` (optional): Filter by membership type
- `status` (optional): Filter by status
- `search` (optional): Search by name, email, or member ID
- `page` (optional): Page number

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
      "phone": "08012345678",
      "membership_type": "member",
      "status": "active",
      "total_contributions": 500000,
      "active_loans": 1,
      "registered_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 1600,
    "per_page": 50
  }
}
\`\`\`

### Create User
**POST** `/admin/users`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "08098765432",
  "membership_type": "member",
  "department": "Admin",
  "rank": "Officer",
  "ippis_number": "IPPIS654321"
}
\`\`\`

### Update User
**PUT** `/admin/users/{userId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "status": "suspended",
  "reason": "Payment default"
}
\`\`\`

### Approve Membership Upgrade
**POST** `/admin/users/{userId}/approve-upgrade`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "approved": true,
  "new_member_id": "FRSC-M-002",
  "notes": "All documents verified"
}
\`\`\`

### Get All Contributions
**GET** `/admin/contributions`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `user_id` (optional): Filter by user
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "John Doe",
        "member_id": "FRSC-M-001"
      },
      "amount": 25000,
      "reference": "CONT-2024-001",
      "payment_method": "Bank Transfer",
      "status": "completed",
      "payment_date": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 5000,
    "per_page": 50
  }
}
\`\`\`

### Verify Contribution
**POST** `/admin/contributions/{contributionId}/verify`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "verified": true,
  "notes": "Payment confirmed"
}
\`\`\`

### Get All Loans
**GET** `/admin/loans`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status
- `loan_type` (optional): Filter by loan type
- `user_id` (optional): Filter by user
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "LOAN-2024-001",
      "user": {
        "id": 1,
        "name": "John Doe",
        "member_id": "FRSC-M-001"
      },
      "loan_plan": "Personal Loan",
      "amount": 200000,
      "interest_rate": 5,
      "tenure_months": 12,
      "status": "pending",
      "applied_at": "2024-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

### Approve/Reject Loan
**POST** `/admin/loans/{loanId}/review`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "action": "approve", // approve or reject
  "disbursement_date": "2024-01-20",
  "notes": "All requirements met",
  "conditions": ["Monthly salary deduction"]
}
\`\`\`

### Create Loan Plan
**POST** `/admin/loans/plans`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "name": "Emergency Loan",
  "description": "Quick loan for emergencies",
  "loan_type": "emergency",
  "max_amount": 100000,
  "min_amount": 10000,
  "interest_rate_member": 3,
  "interest_rate_non_member": 6,
  "max_tenure_months": 6,
  "processing_fee": 1000,
  "available_for_non_members": true,
  "eligibility": "Must have contributed for at least 3 months"
}
\`\`\`

### Get All Investments
**GET** `/admin/investments`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Filter by type
- `status` (optional): Filter by status
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "INV-2024-001",
      "user": {
        "id": 1,
        "name": "John Doe"
      },
      "investment_plan": "Fixed Deposit Investment",
      "type": "money",
      "amount": 500000,
      "roi_percentage": 12,
      "status": "active",
      "invested_at": "2024-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

### Create Investment Plan
**POST** `/admin/investments/plans`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
name: "Real Estate Investment"
description: "Investment in prime real estate"
type: "land" // money, land, house
minimum_amount: 1000000
maximum_amount: 10000000
roi_percentage: 20
duration_months: 24
moratorium_months: 6
total_slots: 50
closing_date: "2024-12-31"
property_details: {"location": "Lekki", "size": "500 sqm"}
images: [File, File]
documents: [File, File]
\`\`\`

### Approve Investment Withdrawal
**POST** `/admin/investments/{investmentId}/approve-withdrawal`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "approved": true,
  "penalty_amount": 0,
  "notes": "Withdrawal approved"
}
\`\`\`

### Get All Properties
**GET** `/admin/properties`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Filter by type
- `status` (optional): Filter by status
- `page` (optional): Page number

### Create Property
**POST** `/admin/properties`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
name: "4 Bedroom Duplex - Ikoyi"
description: "Luxury duplex in prime location"
type: "house"
price: 75000000
location: "Ikoyi, Lagos"
size: "350 sqm"
bedrooms: 4
bathrooms: 5
features: ["Swimming pool", "BQ", "Gym"]
payment_plan_available: true
down_payment_percentage: 30
installment_duration_months: 18
images: [File, File, File]
documents: [File]
\`\`\`

### Get All Statutory Charge Payments
**GET** `/admin/statutory-charges/payments`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `charge_type` (optional): Filter by charge type
- `status` (optional): Filter by status
- `department` (optional): Filter by department
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "SC-2024-001",
      "user": {
        "id": 1,
        "name": "John Doe"
      },
      "charge_type": "Title Document Processing (TDP)",
      "amount": 50000,
      "department": "Legal Department",
      "status": "completed",
      "payment_date": "2024-01-15",
      "processing_status": "completed"
    }
  ]
}
\`\`\`

### Allocate Revenue to Department
**POST** `/admin/statutory-charges/{paymentId}/allocate`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "department": "Legal Department",
  "allocation_percentage": 100,
  "notes": "Full allocation to legal department"
}
\`\`\`

### Manage Estates
**GET** `/admin/property-management/estates`

**Headers:** `Authorization: Bearer {token}`

**POST** `/admin/property-management/estates`

**Request Body:**
\`\`\`json
{
  "name": "FRSC Estate Phase 2",
  "location": "Abuja",
  "total_units": 100,
  "amenities": ["Security", "Playground"],
  "facilities": ["Water", "Electricity"]
}
\`\`\`

### Manage Allottees
**GET** `/admin/property-management/allottees`

**Headers:** `Authorization: Bearer {token}`

**POST** `/admin/property-management/allottees`

**Request Body:**
\`\`\`json
{
  "user_id": 1,
  "estate_id": 1,
  "unit_number": "B-20",
  "unit_type": "3 Bedroom",
  "allotment_date": "2024-02-01",
  "monthly_maintenance": 15000
}
\`\`\`

### Manage Maintenance Requests
**GET** `/admin/property-management/maintenance-requests`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority
- `estate_id` (optional): Filter by estate

**PATCH** `/admin/property-management/maintenance-requests/{requestId}`

**Request Body:**
\`\`\`json
{
  "status": "in_progress",
  "assigned_to": "John Technician",
  "estimated_completion": "2024-01-18",
  "notes": "Parts ordered, work will commence tomorrow"
}
\`\`\`

### Wallet Management
**GET** `/admin/wallets`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `search` (optional): Search by user name or member ID
- `min_balance` (optional): Filter by minimum balance
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "user_name": "John Doe",
      "member_id": "FRSC-M-001",
      "balance": 150000,
      "total_credits": 500000,
      "total_debits": 350000,
      "last_transaction": "2024-01-15T10:30:00Z"
    }
  ]
}
\`\`\`

### Approve Withdrawal
**POST** `/admin/wallets/withdrawals/{withdrawalId}/approve`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "approved": true,
  "notes": "Withdrawal approved and processed"
}
\`\`\`

### Mail Service Admin
**GET** `/admin/mail/statistics`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "total_messages": 5000,
    "messages_today": 150,
    "messages_this_week": 800,
    "messages_this_month": 3200,
    "average_response_time": "2 hours"
  }
}
\`\`\`

### System Settings
**GET** `/admin/settings`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "system_name": "FRSC Housing Management System",
    "maintenance_mode": false,
    "default_contribution_amount": 25000,
    "max_loan_amount": 5000000,
    "interest_rate_member": 5,
    "interest_rate_non_member": 8,
    "email_notifications": true,
    "sms_notifications": true
  }
}
\`\`\`

**PUT** `/admin/settings`

**Request Body:**
\`\`\`json
{
  "maintenance_mode": true,
  "default_contribution_amount": 30000
}
\`\`\`


### Get All Members with KYC Filtering
**GET** `/admin/members`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `kyc_status` (optional): Filter by KYC status (pending, approved, rejected)
- `status` (optional): Filter by member status (active, inactive)
- `membership_type` (optional): Filter by membership type
- `search` (optional): Search by name, email, or member ID
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "member_id": "FRSC/HMS/2024/001",
      "name": "John Adebayo",
      "email": "john.adebayo@frsc.gov.ng",
      "phone": "+234 801 234 5678",
      "status": "active",
      "kyc_status": "approved",
      "total_contribution": 450000,
      "join_date": "2024-01-15",
      "last_contribution": "2024-10-01"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 1600,
    "per_page": 50,
    "kyc_stats": {
      "pending": 45,
      "approved": 1500,
      "rejected": 55
    }
  }
}
\`\`\`

### Approve/Reject KYC
**POST** `/admin/members/{memberId}/kyc-action`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "action": "approve", // approve or reject
  "notes": "All documents verified successfully"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "KYC approved successfully",
  "data": {
    "member_id": 1,
    "kyc_status": "approved",
    "approved_at": "2024-10-15T10:30:00Z",
    "approved_by": "Admin User"
  }
}
\`\`\`

### Send Email to Member
**POST** `/admin/members/{memberId}/send-email`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "subject": "Important Update",
  "message": "Dear member, we have an important update...",
  "cc": ["admin@frsc.gov.ng"]
}
\`\`\`

### Get Member Details
**GET** `/admin/members/{memberId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "member_id": "FRSC/HMS/2024/001",
    "personal_info": {
      "name": "John Adebayo",
      "email": "john.adebayo@frsc.gov.ng",
      "phone": "+234 801 234 5678",
      "date_of_birth": "1985-05-15",
      "address": "123 Main Street, Lagos"
    },
    "employment": {
      "ippis_number": "IPPIS123456",
      "rank": "Inspector",
      "department": "Traffic Management",
      "years_of_service": 10
    },
    "kyc_info": {
      "status": "approved",
      "documents": [
        {
          "type": "National ID",
          "url": "https://storage.com/docs/id.pdf",
          "verified": true
        }
      ]
    },
    "financial_summary": {
      "total_contributions": 450000,
      "active_loans": 1,
      "investments": 2,
      "wallet_balance": 25000
    }
  }
}
\`\`\`

---

## Roles & Permissions Management

### Get All Roles
**GET** `/admin/roles`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Super Admin",
      "description": "Full system access",
      "users_count": 5,
      "permissions": {
        "users": ["create", "read", "update", "delete"],
        "contributions": ["read", "verify", "export"],
        "loans": ["read", "approve", "reject"],
        "investments": ["read", "create", "approve"],
        "properties": ["read", "create", "update", "delete"],
        "reports": ["read", "export"],
        "settings": ["read", "update"]
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

### Create Role
**POST** `/admin/roles`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "name": "Finance Manager",
  "description": "Manages financial operations",
  "permissions": {
    "contributions": ["read", "verify", "export"],
    "loans": ["read", "approve"],
    "wallets": ["read", "approve_withdrawals"]
  }
}
\`\`\`

### Update Role
**PUT** `/admin/roles/{roleId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "name": "Finance Manager",
  "description": "Updated description",
  "permissions": {
    "contributions": ["read", "verify", "export", "delete"],
    "loans": ["read", "approve", "reject"]
  }
}
\`\`\`

### Delete Role
**DELETE** `/admin/roles/{roleId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Role deleted successfully"
}
\`\`\`

### Assign Role to User
**POST** `/admin/users/{userId}/assign-role`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "role_id": 2
}
\`\`\`

---

## Statutory Charges Management

### Get All Charge Types
**GET** `/admin/statutory-charges/types`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Title Document Processing (TDP)",
      "code": "TDP",
      "amount": 50000,
      "department": "Legal",
      "status": "active",
      "total_payments": 150,
      "total_revenue": 7500000
    }
  ]
}
\`\`\`

### Create Charge Type
**POST** `/admin/statutory-charges/types`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "name": "Survey Fee",
  "code": "SURVEY",
  "description": "Property survey fee",
  "amount": 40000,
  "department": "Engineering",
  "required_documents": ["Property documents"],
  "processing_days": 7
}
\`\`\`

### Update Charge Type
**PUT** `/admin/statutory-charges/types/{typeId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "amount": 45000,
  "status": "active"
}
\`\`\`

### Get Payment Records
**GET** `/admin/statutory-charges/payments`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `charge_type` (optional): Filter by charge type
- `status` (optional): Filter by status (pending, completed, failed)
- `department` (optional): Filter by department
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "SC-2024-001",
      "member": {
        "id": 1,
        "name": "John Adebayo",
        "member_id": "FRSC/HMS/2024/001"
      },
      "charge_type": "Title Document Processing",
      "amount": 50000,
      "payment_method": "Bank Transfer",
      "status": "completed",
      "department": "Legal",
      "payment_date": "2024-10-15",
      "allocated": true
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 500,
    "per_page": 50,
    "total_revenue": 25000000
  }
}
\`\`\`

### Get Department Allocations
**GET** `/admin/statutory-charges/departments`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "department": "Legal",
      "total_allocated": 7500000,
      "pending_allocation": 500000,
      "charge_types": ["TDP", "Building Plan Approval"],
      "last_allocation": "2024-10-15"
    },
    {
      "department": "Engineering",
      "total_allocated": 5000000,
      "pending_allocation": 300000,
      "charge_types": ["Survey Fee", "Alteration Fee"],
      "last_allocation": "2024-10-14"
    }
  ]
}
\`\`\`

### Allocate Payment to Department
**POST** `/admin/statutory-charges/payments/{paymentId}/allocate`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "department": "Legal",
  "allocation_percentage": 100,
  "notes": "Full allocation for TDP processing"
}
\`\`\`

---

## Property Management - Enhanced

### Get Estate Details with Full Information
**GET** `/admin/property-management/estates/{estateId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "FRSC Estate Phase 1",
    "location": "Lekki, Lagos",
    "total_units": 50,
    "occupied_units": 35,
    "vacant_units": 15,
    "properties": [
      {
        "unit_number": "A-15",
        "type": "3 Bedroom",
        "status": "occupied",
        "occupant": "John Adebayo",
        "move_in_date": "2024-02-01"
      }
    ],
    "amenities": ["24/7 Security", "Playground", "Gym"],
    "facilities": ["Water supply", "Electricity"],
    "maintenance_requests": {
      "pending": 5,
      "in_progress": 3,
      "completed": 45
    },
    "financial": {
      "monthly_maintenance_total": 525000,
      "collection_rate": 95
    }
  }
}
\`\`\`

### GetAllottee Details
**GET** `/admin/property-management/allottees/{allotteeId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "member": {
      "id": 1,
      "name": "John Adebayo",
      "member_id": "FRSC/HMS/2024/001",
      "phone": "+234 801 234 5678"
    },
    "property": {
      "estate": "FRSC Estate Phase 1",
      "unit_number": "A-15",
      "unit_type": "3 Bedroom",
      "size": "120 sqm"
    },
    "allotment_details": {
      "allotment_date": "2024-01-15",
      "move_in_date": "2024-02-01",
      "occupancy_status": "occupied"
    },
    "financial": {
      "monthly_maintenance": 15000,
      "last_payment": "2024-10-01",
      "payment_status": "current",
      "arrears": 0
    },
    "documents": [
      {
        "type": "Allotment Letter",
        "url": "https://storage.com/docs/allotment.pdf",
        "date": "2024-01-15"
      }
    ],
    "maintenance_history": [
      {
        "reference": "MR-2024-001",
        "category": "Plumbing",
        "status": "completed",
        "date": "2024-09-15"
      }
    ]
  }
}
\`\`\`

### Get Maintenance Request Details
**GET** `/admin/property-management/maintenance-requests/{requestId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "reference": "MR-2024-001",
    "member": {
      "name": "John Adebayo",
      "phone": "+234 801 234 5678"
    },
    "property": {
      "estate": "FRSC Estate Phase 1",
      "unit_number": "A-15"
    },
    "request_details": {
      "category": "Plumbing",
      "priority": "High",
      "title": "Leaking pipe in kitchen",
      "description": "The kitchen sink pipe is leaking...",
      "submitted_at": "2024-10-10T09:00:00Z"
    },
    "status": "in_progress",
    "assigned_to": {
      "name": "Mike Johnson",
      "role": "Plumber",
      "phone": "+234 802 345 6789"
    },
    "timeline": [
      {
        "status": "submitted",
        "date": "2024-10-10T09:00:00Z",
        "note": "Request submitted"
      },
      {
        "status": "assigned",
        "date": "2024-10-10T11:00:00Z",
        "note": "Assigned to Mike Johnson"
      },
      {
        "status": "in_progress",
        "date": "2024-10-11T08:00:00Z",
        "note": "Work commenced"
      }
    ],
    "images": [
      "https://storage.com/maintenance/img1.jpg"
    ],
    "estimated_completion": "2024-10-15",
    "cost_estimate": 25000
  }
}
\`\`\`

### Update Maintenance Request
**PATCH** `/admin/property-management/maintenance-requests/{requestId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "status": "completed",
  "assigned_to": "Mike Johnson",
  "completion_date": "2024-10-14",
  "actual_cost": 22000,
  "notes": "Pipe replaced successfully",
  "completion_images": ["https://storage.com/maintenance/completed1.jpg"]
}
\`\`\`

---

## Activity Logs

### Get Activity Logs
**GET** `/admin/activity-logs`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `user_id` (optional): Filter by user
- `action_type` (optional): Filter by action type (login, contribution, loan_application, etc.)
- `start_date` (optional): Start date
- `end_date` (optional): End date
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "John Adebayo",
        "member_id": "FRSC/HMS/2024/001"
      },
      "action": "contribution_made",
      "description": "Made monthly contribution of ₦50,000",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "timestamp": "2024-10-15T10:30:00Z",
      "metadata": {
        "amount": 50000,
        "reference": "CONT-2024-001"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 10000,
    "per_page": 50
  }
}
\`\`\`

---

## Documents Management

### Get All Documents
**GET** `/admin/documents`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `type` (optional): Filter by document type
- `member_id` (optional): Filter by member
- `status` (optional): Filter by status
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Loan Agreement - John Adebayo",
      "type": "Loan Agreement",
      "member": {
        "id": 1,
        "name": "John Adebayo",
        "member_id": "FRSC/HMS/2024/001"
      },
      "file_url": "https://storage.com/docs/loan-agreement.pdf",
      "file_size": "2.5 MB",
      "uploaded_at": "2024-10-15T10:30:00Z",
      "uploaded_by": "Admin User",
      "status": "active"
    }
  ]
}
\`\`\`

### Upload Document
**POST** `/admin/documents`

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request Body:**
\`\`\`
name: "Property Agreement"
type: "Property Agreement"
member_id: 1
file: [File]
description: "Property purchase agreement"
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": 1,
    "name": "Property Agreement",
    "file_url": "https://storage.com/docs/property-agreement.pdf",
    "uploaded_at": "2024-10-15T10:30:00Z"
  }
}
\`\`\`

### Download Document
**GET** `/admin/documents/{documentId}/download`

**Headers:** `Authorization: Bearer {token}`

**Response:** File download

### Delete Document
**DELETE** `/admin/documents/{documentId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Document deleted successfully"
}
\`\`\`

---

## Contributions Management - Enhanced

### Get Contribution Details
**GET** `/admin/contributions/{contributionId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "reference": "CONT-2024-001",
    "member": {
      "id": 1,
      "name": "John Adebayo",
      "member_id": "FRSC/HMS/2024/001",
      "email": "john.adebayo@frsc.gov.ng"
    },
    "amount": 50000,
    "month": "October 2024",
    "payment_method": "Bank Transfer",
    "payment_date": "2024-10-01T10:30:00Z",
    "status": "completed",
    "verified_by": "Admin User",
    "verified_at": "2024-10-01T11:00:00Z",
    "receipt_url": "https://storage.com/receipts/cont-001.pdf"
  }
}
\`\`\`

### Approve Contribution
**POST** `/admin/contributions/{contributionId}/approve`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "notes": "Payment verified successfully"
}
\`\`\`

### Reject Contribution
**POST** `/admin/contributions/{contributionId}/reject`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "reason": "Invalid payment reference",
  "notes": "Please resubmit with correct reference"
}
\`\`\`

---

## EOI Forms Management

### Get All EOI Forms
**GET** `/admin/eoi-forms`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (pending_review, approved, under_review, rejected)
- `property_type` (optional): Filter by property type
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "member": {
        "name": "John Doe",
        "pin": "12345",
        "rank": "Inspector"
      },
      "property": {
        "type": "Luxury 3-Bedroom Apartment",
        "location": "Lekki, Lagos"
      },
      "funding": "Mix Funding",
      "submitted_at": "2024-03-15",
      "status": "pending_review"
    }
  ]
}
\`\`\`

### View EOI Form Details
**GET** `/admin/eoi-forms/{eoiId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "member": {
      "name": "John Doe",
      "pin": "12345",
      "email": "john@example.com",
      "phone": "+234 801 234 5678"
    },
    "property": {
      "type": "Luxury 3-Bedroom Apartment",
      "location": "Lekki, Lagos",
      "price": 25000000
    },
    "funding_details": {
      "type": "Mix Funding",
      "down_payment": 7500000,
      "loan_amount": 17500000
    },
    "documents": [
      {
        "type": "ID Card",
        "url": "https://storage.com/eoi/id.pdf"
      }
    ],
    "status": "pending_review",
    "submitted_at": "2024-03-15T10:30:00Z"
  }
}
\`\`\`

### Download EOI Form
**GET** `/admin/eoi-forms/{eoiId}/download`

**Headers:** `Authorization: Bearer {token}`

**Response:** PDF file download

---

## Mortgages Management

### Get All Mortgages
**GET** `/admin/mortgages`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status (active, pending, completed)
- `member_id` (optional): Filter by member
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "MORT-2024-001",
      "member": {
        "id": 1,
        "name": "John Adebayo",
        "member_id": "FRSC/HMS/2024/001"
      },
      "property": "3 Bedroom Duplex - Abuja",
      "amount": 15000000,
      "monthly_payment": 250000,
      "tenure": "20 years",
      "status": "active",
      "start_date": "2024-01-01"
    }
  ]
}
\`\`\`

### View Mortgage Details
**GET** `/admin/mortgages/{mortgageId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "reference": "MORT-2024-001",
    "member": {
      "name": "John Adebayo",
      "member_id": "FRSC/HMS/2024/001"
    },
    "property": {
      "name": "3 Bedroom Duplex",
      "location": "Abuja",
      "value": 15000000
    },
    "mortgage_details": {
      "amount": 15000000,
      "interest_rate": 12,
      "monthly_payment": 250000,
      "tenure_years": 20,
      "start_date": "2024-01-01",
      "end_date": "2044-01-01"
    },
    "payment_history": [
      {
        "month": "October 2024",
        "amount": 250000,
        "status": "paid",
        "date": "2024-10-01"
      }
    ],
    "status": "active",
    "balance": 14500000
  }
}
\`\`\`

### Download Mortgage Agreement
**GET** `/admin/mortgages/{mortgageId}/download-agreement`

**Headers:** `Authorization: Bearer {token}`

**Response:** PDF file download

---

## Loan Products Management

### Get All Loan Products
**GET** `/admin/loan-products`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Standard Housing Loan",
      "description": "Basic housing loan for property purchase",
      "amount_range": "₦1,000,000 - ₦10,000,000",
      "interest_rate": "12% per annum",
      "tenure": "1-20 years",
      "applicants": 45,
      "status": "active"
    }
  ]
}
\`\`\`

### View Loan Product Details
**GET** `/admin/loan-products/{productId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Standard Housing Loan",
    "description": "Basic housing loan for property purchase",
    "amount_range": {
      "min": 1000000,
      "max": 10000000
    },
    "interest_rate": {
      "member": 12,
      "non_member": 15
    },
    "tenure": {
      "min_years": 1,
      "max_years": 20
    },
    "requirements": [
      "Valid ID",
      "Proof of income",
      "Property documents"
    ],
    "applicants": 45,
    "total_disbursed": 450000000,
    "status": "active"
  }
}
\`\`\`

### Edit Loan Product
**PUT** `/admin/loan-products/{productId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "name": "Standard Housing Loan",
  "interest_rate_member": 11,
  "interest_rate_non_member": 14,
  "max_amount": 12000000,
  "status": "active"
}
\`\`\`

### Delete Loan Product
**DELETE** `/admin/loan-products/{productId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Loan product deleted successfully"
}
\`\`\`

---

## Investment Plans Management

### Get Investment Plan Details
**GET** `/admin/investment-plans/{planId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Housing Development Project Phase 3",
    "type": "Money",
    "status": "Active",
    "target_amount": 50000000,
    "current_amount": 32500000,
    "roi": "15% per annum",
    "investors": 87,
    "progress": 65,
    "closes": "2024-03-31",
    "moratorium": "6 months",
    "description": "Investment in residential housing development",
    "documents": [
      {
        "type": "Investment Prospectus",
        "url": "https://storage.com/investments/prospectus.pdf"
      }
    ]
  }
}
\`\`\`

### Manage Investment Plan
**PUT** `/admin/investment-plans/{planId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "status": "Closing Soon",
  "current_amount": 35000000,
  "closes": "2024-02-15"
}
\`\`\`

---

## Blockchain Property Records

### Get Blockchain Records
**GET** `/admin/blockchain/properties`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "property_id": "FRSC-PROP-001",
      "property_name": "Lekki Phase 2 Apartment",
      "owners": "3 Owners",
      "blockchain_hash": "0x742d35...f0bEb",
      "status": "Verified",
      "date": "2024-01-15",
      "transaction_url": "https://etherscan.io/tx/0x742d35...f0bEb"
    }
  ]
}
\`\`\`

### View Blockchain Record Details
**GET** `/admin/blockchain/properties/{recordId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "property_id": "FRSC-PROP-001",
    "property_name": "Lekki Phase 2 Apartment",
    "owners": [
      {
        "name": "John Adebayo",
        "share": "33.33%"
      },
      {
        "name": "Sarah Okonkwo",
        "share": "33.33%"
      },
      {
        "name": "Michael Bello",
        "share": "33.34%"
      }
    ],
    "blockchain_details": {
      "hash": "0x742d35...f0bEb",
      "network": "Ethereum",
      "block_number": 12345678,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "property_details": {
      "type": "Apartment",
      "location": "Lekki Phase 2, Lagos",
      "size": "120 sqm",
      "value": 25000000
    },
    "status": "Verified",
    "verification_date": "2024-01-15"
  }
}
\`\`\`

### Edit Blockchain Record
**PUT** `/admin/blockchain/properties/{recordId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "status": "Pending",
  "notes": "Ownership transfer in progress"
}
\`\`\`

---

## Wallets Management

### Get All Wallets
**GET** `/admin/wallets`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` (optional): Filter by status
- `min_balance` (optional): Minimum balance filter
- `search` (optional): Search by member name or ID
- `page` (optional): Page number

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "member": {
        "id": 1,
        "name": "John Doe",
        "member_id": "FRSC001"
      },
      "balance": 250000,
      "total_deposits": 500000,
      "total_withdrawals": 250000,
      "status": "active",
      "last_transaction": "2024-01-10"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 1600,
    "per_page": 50,
    "total_balance": 400000000
  }
}
\`\`\`

### View Wallet Details
**GET** `/admin/wallets/{walletId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "member": {
      "name": "John Doe",
      "member_id": "FRSC001"
    },
    "balance": 250000,
    "total_deposits": 500000,
    "total_withdrawals": 250000,
    "status": "active",
    "transactions": [
      {
        "reference": "TXN-2024-001",
        "type": "credit",
        "amount": 50000,
        "description": "Wallet funding",
        "date": "2024-01-10",
        "status": "completed"
      }
    ]
  }
}
\`\`\`

### Export Wallet Data
**GET** `/admin/wallets/export`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `format` (optional): Export format (csv, excel, pdf)

**Response:** File download

---

## Subscription Packages Management

### Get All Subscription Packages
**GET** `/admin/subscriptions/packages`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Weekly Basic",
      "price": 500,
      "duration": "7 days",
      "subscribers": 145,
      "revenue": 72500,
      "status": "active"
    },
    {
      "id": 2,
      "name": "Monthly Standard",
      "price": 1500,
      "duration": "30 days",
      "subscribers": 856,
      "revenue": 1284000,
      "status": "active"
    }
  ]
}
\`\`\`

### View Subscription Package Details
**GET** `/admin/subscriptions/packages/{packageId}`

**Headers:** `Authorization: Bearer {token}`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Weekly Basic",
    "price": 500,
    "duration": "7 days",
    "features": [
      "Basic access",
      "Email support",
      "Mobile app access"
    ],
    "subscribers": 145,
    "revenue": 72500,
    "status": "active",
    "created_at": "2024-01-01",
    "subscriber_growth": {
      "this_month": 25,
      "last_month": 20,
      "growth_rate": 25
    }
  }
}
\`\`\`

### Edit Subscription Package
**PUT** `/admin/subscriptions/packages/{packageId}`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
\`\`\`json
{
  "name": "Weekly Basic",
  "price": 600,
  "features": ["Basic access", "Email support", "Mobile app access", "Priority support"],
  "status": "active"
}
\`\`\`

---

## Database Schema

### Users Table - UPDATED
\`\`\`sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    membership_type ENUM('member', 'non-member') DEFAULT 'non-member',
    previous_member_id VARCHAR(50) NULL, -- For tracking non-member to member conversion
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    
    -- Employment Details (for members)
    ippis_number VARCHAR(50) NULL,
    staff_id VARCHAR(50) NULL,
    rank VARCHAR(100),
    date_of_first_employment DATE NULL,
    years_of_service VARCHAR(100) NULL, -- Calculated field
    command_department VARCHAR(100),
    unit VARCHAR(100),
    
    -- ID Verification (for non-members)
    id_type VARCHAR(50),
    id_number VARCHAR(50),
    
    -- Personal Details
    date_of_birth DATE,
    address TEXT,
    state VARCHAR(100),
    lga VARCHAR(100),
    profile_picture VARCHAR(255),
    
    -- Subscription Status
    has_subscribed BOOLEAN DEFAULT FALSE,
    current_subscription_id BIGINT UNSIGNED NULL,
    
    -- Member Badge
    member_badge ENUM('active', 'inactive') NULL,
    upgrade_date TIMESTAMP NULL,
    
    email_verified_at TIMESTAMP NULL,
    otp_code VARCHAR(6) NULL,
    otp_expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Next of Kin Table
\`\`\`sql
CREATE TABLE next_of_kin (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

### Contributions Table
\`\`\`sql
CREATE TABLE contributions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    payment_method VARCHAR(50),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    description TEXT,
    verified_by BIGINT UNSIGNED NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);
\`\`\`

### Loan Plans Table
\`\`\`sql
CREATE TABLE loan_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    loan_type VARCHAR(100),
    max_amount DECIMAL(15, 2) NOT NULL,
    min_amount DECIMAL(15, 2) NOT NULL,
    interest_rate_member DECIMAL(5, 2) NOT NULL,
    interest_rate_non_member DECIMAL(5, 2) NOT NULL,
    max_tenure_months INT NOT NULL,
    processing_fee DECIMAL(15, 2) DEFAULT 0,
    available_for_non_members BOOLEAN DEFAULT true,
    eligibility TEXT,
    required_documents JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Loans Table
\`\`\`sql
CREATE TABLE loans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    loan_plan_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenure_months INT NOT NULL,
    monthly_repayment DECIMAL(15, 2) NOT NULL,
    total_repayment DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2) NOT NULL,
    purpose TEXT,
    guarantor_1 JSON,
    guarantor_2 JSON,
    supporting_documents JSON,
    status ENUM('pending', 'approved', 'active', 'completed', 'rejected', 'defaulted') DEFAULT 'pending',
    disbursement_date DATE NULL,
    next_payment_date DATE NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (loan_plan_id) REFERENCES loan_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
\`\`\`

### Loan Repayments Table
\`\`\`sql
CREATE TABLE loan_repayments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    loan_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);
\`\`\`

### Investment Plans Table
\`\`\`sql
CREATE TABLE investment_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('money', 'land', 'house') NOT NULL,
    minimum_amount DECIMAL(15, 2) NOT NULL,
    maximum_amount DECIMAL(15, 2) NOT NULL,
    roi_percentage DECIMAL(5, 2) NOT NULL,
    duration_months INT NOT NULL,
    moratorium_months INT DEFAULT 0,
    property_details JSON NULL,
    images JSON NULL,
    documents JSON NULL,
    total_slots INT NULL,
    available_slots INT NULL,
    closing_date DATE NULL,
    status ENUM('active', 'closed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Investments Table
\`\`\`sql
CREATE TABLE investments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    investment_plan_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    roi_percentage DECIMAL(5, 2) NOT NULL,
    expected_return DECIMAL(15, 2) NOT NULL,
    current_value DECIMAL(15, 2) NOT NULL,
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    moratorium_end_date DATE NULL,
    certificate_url VARCHAR(255),
    status ENUM('active', 'matured', 'withdrawn') DEFAULT 'active',
    payment_method VARCHAR(50),
    used_contribution_balance BOOLEAN DEFAULT false,
    contribution_balance_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investment_plan_id) REFERENCES investment_plans(id) ON DELETE CASCADE
);
\`\`\`

### Properties Table
\`\`\`sql
CREATE TABLE properties (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('land', 'house') NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    coordinates VARCHAR(100),
    size VARCHAR(100),
    bedrooms INT NULL,
    bathrooms INT NULL,
    features JSON,
    amenities JSON,
    images JSON,
    documents JSON,
    payment_plan_available BOOLEAN DEFAULT false,
    down_payment_percentage DECIMAL(5, 2) NULL,
    installment_duration_months INT NULL,
    status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
    agent_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Property Subscriptions Table
\`\`\`sql
CREATE TABLE property_subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    property_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    payment_type ENUM('outright', 'installment') NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2) NOT NULL,
    monthly_installment DECIMAL(15, 2) NULL,
    next_payment_date DATE NULL,
    status ENUM('active', 'completed', 'defaulted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);
\`\`\`

### Wallets Table
\`\`\`sql
CREATE TABLE wallets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    balance DECIMAL(15, 2) DEFAULT 0,
    total_credits DECIMAL(15, 2) DEFAULT 0,
    total_debits DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

### Wallet Transactions Table
\`\`\`sql
CREATE TABLE wallet_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    wallet_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);
\`\`\`

### Withdrawal Requests Table
\`\`\`sql
CREATE TABLE withdrawal_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    account_name VARCHAR(255),
    reason TEXT,
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
\`\`\`

### Messages Table
\`\`\`sql
CREATE TABLE messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    from_user_id BIGINT UNSIGNED NOT NULL,
    to_users JSON NOT NULL,
    cc_users JSON,
    bcc_users JSON,
    subject VARCHAR(500),
    body TEXT,
    attachments JSON,
    category ENUM('primary', 'social', 'promotions') DEFAULT 'primary',
    is_draft BOOLEAN DEFAULT false,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

### Message Recipients Table
\`\`\`sql
CREATE TABLE message_recipients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

### Statutory Charge Types Table
\`\`\`sql
CREATE TABLE statutory_charge_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    amount DECIMAL(15, 2) NOT NULL,
    department VARCHAR(255),
    required_documents JSON,
    processing_days INT DEFAULT 14,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Statutory Charge Payments Table
\`\`\`sql
CREATE TABLE statutory_charge_payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    charge_type_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    property_reference VARCHAR(100),
    supporting_documents JSON,
    notes TEXT,
    payment_method VARCHAR(50),
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    processing_status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    department VARCHAR(255),
    allocated BOOLEAN DEFAULT false,
    payment_date TIMESTAMP NULL,
    estimated_completion DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (charge_type_id) REFERENCES statutory_charge_types(id) ON DELETE CASCADE
);
\`\`\`

### Estates Table
\`\`\`sql
CREATE TABLE estates (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    address TEXT,
    total_units INT NOT NULL,
    occupied_units INT DEFAULT 0,
    vacant_units INT NOT NULL,
    amenities JSON,
    facilities JSON,
    images JSON,
    manager_info JSON,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Allotments Table
\`\`\`sql
CREATE TABLE allotments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    estate_id BIGINT UNSIGNED NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    unit_type VARCHAR(100),
    allotment_date DATE NOT NULL,
    occupancy_status ENUM('vacant', 'occupied') DEFAULT 'vacant',
    move_in_date DATE NULL,
    monthly_maintenance DECIMAL(15, 2) DEFAULT 0,
    last_maintenance_payment DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE
);
\`\`\`

### Maintenance Requests Table
\`\`\`sql
CREATE TABLE maintenance_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    estate_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    unit_number VARCHAR(50),
    category ENUM('plumbing', 'electrical', 'structural', 'general') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    images JSON,
    preferred_date DATE NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    assigned_to VARCHAR(255) NULL,
    estimated_completion DATE NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (estate_id) REFERENCES estates(id) ON DELETE CASCADE
);
\`\`\`

### Mortgages Table
\`\`\`sql
CREATE TABLE mortgages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    property_id BIGINT UNSIGNED NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    loan_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    tenure_years INT NOT NULL,
    down_payment DECIMAL(15, 2) NOT NULL,
    monthly_repayment DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    balance DECIMAL(15, 2) NOT NULL,
    employment_details JSON,
    supporting_documents JSON,
    status ENUM('pending', 'approved', 'active', 'completed', 'rejected') DEFAULT 'pending',
    next_payment_date DATE NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);
\`\`\`

### Documents Table
\`\`\`sql
CREATE TABLE documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('personal', 'property', 'loan', 'investment', 'other') NOT NULL,
    type VARCHAR(100),
    size BIGINT,
    reference VARCHAR(100) NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

### Blockchain Records Table
\`\`\`sql
CREATE TABLE blockchain_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    blockchain_hash VARCHAR(255) UNIQUE NOT NULL,
    transaction_url VARCHAR(500),
    property_details JSON,
    status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
    registration_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

### Activity Logs Table
\`\`\`sql
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
\`\`\`

### System Settings Table
\`\`\`sql
CREATE TABLE system_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Subscriptions Table - NEW
\`\`\`sql
CREATE TABLE subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    package_id BIGINT UNSIGNED NOT NULL,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    payment_method VARCHAR(50),
    status ENUM('pending', 'active', 'expired', 'cancelled') DEFAULT 'pending',
    start_date DATE NULL,
    end_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`

### Subscription Packages Table - NEW
\`\`\`sql
CREATE TABLE subscription_packages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration_days INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'NGN',
    features JSON,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

---

## Implementation Notes

### Authentication
- Use Laravel Sanctum or Passport for API authentication
- Implement JWT tokens with refresh token mechanism
- Add rate limiting to prevent brute force attacks

### File Uploads
- Use Laravel's storage system with S3 or local storage
- Validate file types and sizes
- Generate unique filenames to prevent conflicts
- Implement virus scanning for uploaded files

### Payment Integration
- Integrate Paystack and Remita payment gateways
- Implement webhook handlers for payment verification
- Store payment logs for audit purposes
- Handle payment failures gracefully

### Email Notifications
- Use Laravel's queue system for sending emails
- Implement email templates for different notifications
- Add email preferences for users

### Security
- Implement CORS properly
- Use HTTPS for all API calls
- Sanitize all user inputs
- Implement SQL injection prevention
- Add CSRF protection for web routes
- Implement proper authorization checks

### Performance
- Use database indexing on frequently queried columns
- Implement caching for frequently accessed data
- Use eager loading to prevent N+1 queries
- Implement pagination for large datasets

### Testing
- Write unit tests for all business logic
- Implement integration tests for API endpoints
- Add feature tests for critical user flows

### Documentation
- Use Laravel API Documentation tools
- Keep API documentation up to date
- Provide example requests and responses

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- General API endpoints: 60 requests per minute
- File upload endpoints: 10 requests per minute
- Admin endpoints: 100 requests per minute

---

## Webhooks

### Payment Webhook
**POST** `/webhooks/payment`

**Request Body:**
\`\`\`json
{
  "event": "charge.success",
  "data": {
    "reference": "CONT-2024-001",
    "amount": 25000,
    "status": "success"
  }
}
\`\`\`

### Blockchain Webhook
**POST** `/webhooks/blockchain`

**Request Body:**
\`\`\`json
{
  "event": "transaction.confirmed",
  "data": {
    "hash": "0x1234567890abcdef",
    "status": "confirmed"
  }
}
\`\`\`

---

This documentation provides a comprehensive guide for developing the Laravel backend API for the FRSC Housing Management System. All endpoints follow RESTful conventions and include proper authentication, validation, and error handling.
