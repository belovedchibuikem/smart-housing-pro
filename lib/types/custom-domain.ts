export interface CustomDomain {
  id: string
  business_id: string
  domain: string
  is_verified: boolean
  verification_token: string
  verification_method: "dns" | "txt" | "cname"
  ssl_status: "pending" | "active" | "failed"
  ssl_certificate_id: string | null
  is_primary: boolean
  created_at: string
  verified_at: string | null
  updated_at: string
}

export interface DomainDNSRecord {
  id: string
  custom_domain_id: string
  record_type: "A" | "CNAME" | "TXT"
  record_name: string
  record_value: string
  is_verified: boolean
  created_at: string
  verified_at: string | null
}

export interface DomainVerificationStatus {
  domain: string
  is_verified: boolean
  dns_records: DomainDNSRecord[]
  ssl_status: string
  error?: string
}
