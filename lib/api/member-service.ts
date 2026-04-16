"use client"

import { apiFetch, apiFetchBlob } from "./client"

export interface Member {
  id: string
  member_number: string
  contribution_plan_id?: string | null
  monthly_contribution_amount?: number | null
  staff_id?: string
  ippis_number?: string
  frsc_pin?: string
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
  /** Principal still owed (when API provides it) */
  remaining_principal?: number
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

  static async updateMember(
    id: string,
    body: Record<string, string | number | null | undefined>
  ): Promise<{ success: boolean; message: string; member: Member }> {
    return apiFetch<{ success: boolean; message: string; member: Member }>(`/admin/members/${id}`, {
      method: "PUT",
      body,
    })
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
      const q = new URLSearchParams({
        member_id: memberId,
        per_page: "1000",
      })
      const [loansResponse, contributionsResponse] = await Promise.allSettled([
        apiFetch<{ loans: Loan[] | { data: Loan[] } }>(`/financial/loans?${q.toString()}`),
        apiFetch<{ contributions: Contribution[] | { data: Contribution[] } }>(
          `/financial/contributions?${q.toString()}`,
        ),
      ])

      const unwrapList = <T>(payload: T[] | { data: T[] } | undefined): T[] => {
        if (!payload) return []
        if (Array.isArray(payload)) return payload
        const inner = (payload as { data?: T[] }).data
        return Array.isArray(inner) ? inner : []
      }

      const loansRaw =
        loansResponse.status === "fulfilled" ? loansResponse.value.loans : undefined
      const contributionsRaw =
        contributionsResponse.status === "fulfilled" ? contributionsResponse.value.contributions : undefined

      const loans = unwrapList<Loan>(loansRaw)
      const contributions = unwrapList<Contribution>(contributionsRaw)

      const toNumber = (value: unknown) => {
        if (typeof value === "number") return value
        if (typeof value === "string") {
          const parsed = Number(value)
          return Number.isFinite(parsed) ? parsed : 0
        }
        return 0
      }

      const isApprovedContribution = (c: Contribution) => c.status === "approved"

      const totalPaidSum = contributions
        .filter(isApprovedContribution)
        .reduce((sum, c) => sum + toNumber(c.total_paid), 0)

      const totalAmountApproved = contributions
        .filter(isApprovedContribution)
        .reduce((sum, c) => sum + toNumber(c.amount), 0)

      const totalContributions = totalPaidSum > 0 ? totalPaidSum : totalAmountApproved

      const monthlyContribution = contributions
        .filter((c) => isApprovedContribution(c) && c.frequency === "monthly")
        .reduce((sum, c) => sum + toNumber(c.amount), 0)

      const lastPayment = contributions
        .filter(isApprovedContribution)
        .sort(
          (a, b) =>
            new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime(),
        )[0]

      const loanIsActive = (l: Loan) =>
        l.status === "approved" || l.status === "active" || l.status === "disbursed"

      const activeLoans = loans.filter(loanIsActive).length
      const totalBorrowed = loans
        .filter(loanIsActive)
        .reduce((sum, l) => sum + toNumber(l.total_amount ?? l.amount), 0)

      const outstandingBalance = loans.filter(loanIsActive).reduce((sum, l) => {
        const remaining = toNumber(l.remaining_principal)
        if (remaining > 0) {
          return sum + remaining
        }
        const total = toNumber(l.total_amount ?? l.amount)
        const monthly = toNumber(l.monthly_payment)
        const duration = toNumber(l.duration_months)
        const scheduled = monthly * duration
        return sum + Math.max(0, total - scheduled)
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

  // Reverse mistaken KYC approval (restores pending or submitted)
  static async reverseKyc(memberId: string): Promise<{ success: boolean; message: string; kyc_status?: string }> {
    return apiFetch<{ success: boolean; message: string; kyc_status?: string }>(
      `/admin/members/${memberId}/kyc/reverse`,
      { method: "POST" }
    )
  }

  // Reject KYC
  static async rejectKyc(memberId: string, reason: string): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>(`/admin/members/${memberId}/kyc/reject`, {
      method: "POST",
      body: { reason }
    })
  }

  /** Fetch KYC file bytes (admin auth); use blob URL to view — public /storage URLs may return 403 on some hosts. */
  static async fetchKycDocumentBlob(memberId: string, index: number): Promise<Blob> {
    return apiFetchBlob(`/admin/members/${memberId}/kyc-documents/${index}`)
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






























