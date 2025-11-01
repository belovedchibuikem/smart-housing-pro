import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';

export interface Member {
  id: string;
  user_id: string;
  member_number: string;
  staff_id?: string;
  ippis_number?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  nationality?: string;
  state_of_origin?: string;
  lga?: string;
  residential_address?: string;
  city?: string;
  state?: string;
  rank?: string;
  department?: string;
  command_state?: string;
  employment_date?: string;
  years_of_service?: number;
  membership_type?: string;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  kyc_submitted_at?: string;
  kyc_verified_at?: string;
  kyc_rejection_reason?: string;
  kyc_documents?: any[];
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

export interface MemberStats {
  total_members: number;
  active_members: number;
  inactive_members: number;
  suspended_members: number;
  kyc_verified: number;
  kyc_pending: number;
  kyc_rejected: number;
}

export interface MembersResponse {
  success: boolean;
  members: Member[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MemberStatsResponse {
  success: boolean;
  stats: MemberStats;
}

export function useMembers(params?: {
  search?: string;
  status?: string;
  kyc_status?: string;
  page?: number;
  per_page?: number;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params?.kyc_status && params.kyc_status !== 'all') queryParams.append('kyc_status', params.kyc_status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.per_page) queryParams.append('per_page', params.per_page.toString());

      const response = await apiFetch<MembersResponse>(`/admin/members?${queryParams.toString()}`);
      
      if (response.success) {
        setMembers(response.members);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch members');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [params?.search, params?.status, params?.kyc_status, params?.page, params?.per_page]);

  return {
    members,
    loading,
    error,
    pagination,
    refetch: fetchMembers,
  };
}

export function useMemberStats() {
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch<MemberStatsResponse>('/admin/members/stats');
      
      if (response.success) {
        setStats(response.stats);
      } else {
        setError('Failed to fetch member statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

export function useMember(id: string) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch<{ success: boolean; member: Member }>(`/admin/members/${id}`);
      
      if (response.success) {
        setMember(response.member);
      } else {
        setError('Failed to fetch member details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMember();
    }
  }, [id]);

  return {
    member,
    loading,
    error,
    refetch: fetchMember,
  };
}
