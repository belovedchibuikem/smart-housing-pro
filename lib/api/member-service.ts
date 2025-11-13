"use client"

import { apiFetch } from "./client"

export interface Member {
  id: string
  member_number: string
  staff_id?: string
  ippis_number?: string
  date_of_birth?: string
  gender?: string
  marital_status?: string
  nationality?: string
  state_of_origin?: string
  lga?: string
  residential_address?: string
  city?: string
  state?: string
  rank?: string
  department?: string
  command_state?: string
  employment_date?: string
  years_of_service?: number
  membership_type?: string
  kyc_status?: string
  kyc_submitted_at?: string
  kyc_verified_at?: string
  kyc_rejection_reason?: string
  kyc_documents?: Array<{
    type: string
    path: string
    uploaded_at?: string
  }>
  status?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  user?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    avatar_url?: string
    role: string
  }
  wallet?: {
    id: string
    balance: number
    currency: string
  }
  loans?: Loan[]
  investments?: Investment[]
  contributions?: Contribution[]
  created_at: string
  updated_at: string
}

export interface Loan {
  id: string
  member_id: string
  amount: number
  interest_rate: number
  duration_months: number
  type: string
  purpose: string
  status: string
  application_date: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  rejected_at?: string
  rejected_by?: string
  total_amount: number
  monthly_payment: number
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  member_id: string
  amount: number
  interest_rate: number
  duration_months: number
  type: string
  status: string
  application_date: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  rejected_at?: string
  rejected_by?: string
  created_at: string
  updated_at: string
}

export interface Contribution {
  id: string
  member_id: string
  amount: number
  type: string
  frequency: string
  status: string
  contribution_date: string
  approved_at?: string
  approved_by?: string
  rejection_reason?: string
  rejected_at?: string
  rejected_by?: string
  total_paid: number
  remaining_amount: number
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  type: string
  title: string
  description?: string
  file_size: number
  file_size_human: string
  mime_type: string
  status: string
  approved_at?: string
  rejected_at?: string
  rejection_reason?: string
  member: {
    id: string
    member_number: string
    user: {
      id: string
      first_name: string
      last_name: string
      email: string
    }
  }
  created_at: string
  updated_at: string
}

export interface MemberStats {
  total_contributions: number
  monthly_contribution: number
  last_payment_date?: string
  active_loans: number
  total_borrowed: number
  outstanding_balance: number
  total_investments: number
  investment_returns: number
}

export class MemberService {
  // Get member details with all related data
  static async getMember(id: string): Promise<{ member: Member }> {
    return apiFetch<{ member: Member }>(`/admin/members/${id}`)
  }

  // Get member documents
  static async getMemberDocuments(memberId: string, params?: {
    type?: string
    status?: string
    page?: number
    per_page?: number
  }): Promise<{
    documents: Document[]
    pagination: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }> {
    try {
      const query = new URLSearchParams()
      if (params?.type) query.set("type", params.type)
      if (params?.status) query.set("status", params.status)
      if (params?.page) query.set("page", String(params.page))
      if (params?.per_page) query.set("per_page", String(params.per_page))
      // Add member_id filter since documents are not member-specific in the API
      query.set("member_id", memberId)
      
      const path = `/documents${query.toString() ? `?${query.toString()}` : ""}`
      return apiFetch<{
        documents: Document[]
        pagination: {
          current_page: number
          last_page: number
          per_page: number
          total: number
        }
      }>(path)
    } catch (error) {
      console.warn('Error fetching documents, returning empty list:', error)
      return {
        documents: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0
        }
      }
    }
  }

  // Get member financial stats
  static async getMemberFinancialStats(memberId: string): Promise<MemberStats> {
    try {
      // Try to get financial data, but provide fallback if endpoints don't exist
      const [loansResponse, contributionsResponse] = await Promise.allSettled([
        apiFetch<{ loans: Loan[] }>(`/financial/loans?member_id=${memberId}`),
        apiFetch<{ contributions: Contribution[] }>(`/financial/contributions?member_id=${memberId}`)
      ])

      const loans = loansResponse.status === 'fulfilled' ? (loansResponse.value.loans || []) : []
      const contributions = contributionsResponse.status === 'fulfilled' ? (contributionsResponse.value.contributions || []) : []

      const toNumber = (value: unknown) => {
        if (typeof value === 'number') return value
        if (typeof value === 'string') {
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : 0
        }
        return 0
      }

      const totalContributions = contributions
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + toNumber(c.amount), 0)

      const monthlyContribution = contributions
        .filter(c => c.status === 'approved' && c.frequency === 'monthly')
        .reduce((sum, c) => sum + toNumber(c.amount), 0)

      const lastPayment = contributions
        .filter(c => c.status === 'approved')
        .sort((a, b) => new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime())[0]

      const activeLoans = loans.filter(l => l.status === 'approved').length
      const totalBorrowed = loans
        .filter(l => l.status === 'approved')
        .reduce((sum, l) => sum + toNumber(l.total_amount ?? l.amount), 0)

      const outstandingBalance = loans
        .filter(l => l.status === 'approved')
        .reduce((sum, l) => {
          const total = toNumber(l.total_amount ?? l.amount)
          const monthly = toNumber(l.monthly_payment)
          const duration = toNumber(l.duration_months)
          const scheduled = monthly * duration
          const remaining = Math.max(0, total - scheduled)
          return sum + remaining
        }, 0)

      return {
        total_contributions: totalContributions,
        monthly_contribution: monthlyContribution,
        last_payment_date: lastPayment?.contribution_date,
        active_loans: activeLoans,
        total_borrowed: totalBorrowed,
        outstanding_balance: Math.max(0, outstandingBalance),
        total_investments: 0, // Would need investment data
        investment_returns: 0 // Would need investment data
      }
    } catch (error) {
      console.warn('Error fetching financial stats, returning default values:', error)
      // Return default values if financial endpoints are not available
      return {
        total_contributions: 0,
        monthly_contribution: 0,
        last_payment_date: undefined,
        active_loans: 0,
        total_borrowed: 0,
        outstanding_balance: 0,
        total_investments: 0,
        investment_returns: 0
      }
    }
  }

  // Approve KYC
  static async approveKyc(memberId: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(`/admin/members/${memberId}/kyc/approve`, {
      method: "POST"
    })
  }

  // Reject KYC
  static async rejectKyc(memberId: string, reason: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(`/admin/members/${memberId}/kyc/reject`, {
      method: "POST",
      body: { reason }
    })
  }

  // Approve document
  static async approveDocument(documentId: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(`/documents/${documentId}/approve`, {
      method: "POST"
    })
  }

  // Reject document
  static async rejectDocument(documentId: string, reason: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(`/documents/${documentId}/reject`, {
      method: "POST",
      body: { reason }
    })
  }

  // Get document download URL
  static async getDocumentDownloadUrl(documentId: string): Promise<{ download_url: string; filename: string; mime_type: string }> {
    return apiFetch<{ download_url: string; filename: string; mime_type: string }>(`/documents/${documentId}/download`)
  }

  // Upload document (for admin to upload on behalf of member)
  static async uploadDocument(memberId: string, documentData: {
    type: string
    title: string
    description?: string
    file_path: string
    file_size: number
    mime_type: string
  }): Promise<{ success: boolean; message: string; document: Document }> {
    return apiFetch<{ success: boolean; message: string; document: Document }>(`/documents`, {
      method: "POST",
      body: {
        member_id: memberId,
        ...documentData
      }
    })
  }

  // Update member status
  static async updateMemberStatus(memberId: string, status: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const endpoint = status === 'suspend' ? 'suspend' : status === 'activate' ? 'activate' : 'deactivate'
    return apiFetch<{ success: boolean; message: string }>(`/admin/members/${memberId}/${endpoint}`, {
      method: "POST",
      body: reason ? { reason } : undefined
    })
  }
}




















