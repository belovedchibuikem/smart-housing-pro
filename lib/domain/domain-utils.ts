import type { DomainDNSRecord } from "@/lib/types/custom-domain"

export function generateVerificationToken(): string {
  return `frsc-verify-${Math.random().toString(36).substring(2, 15)}`
}

export function generateDNSRecords(
  domain: string,
  verificationToken: string,
): Omit<DomainDNSRecord, "id" | "custom_domain_id" | "is_verified" | "created_at" | "verified_at">[] {
  return [
    {
      record_type: "A",
      record_name: "@",
      record_value: "76.76.21.21", // Your server IP
    },
    {
      record_type: "CNAME",
      record_name: "www",
      record_value: "cname.frschousing.com",
    },
    {
      record_type: "TXT",
      record_name: "_frsc-verification",
      record_value: verificationToken,
    },
  ]
}

export async function verifyDomain(domain: string, verificationToken: string): Promise<boolean> {
  try {
    // In production, this would make actual DNS queries
    // For now, we'll simulate verification
    const response = await fetch(`https://dns.google/resolve?name=_frsc-verification.${domain}&type=TXT`)
    const data = await response.json()

    if (data.Answer) {
      const txtRecords = data.Answer.filter((record: any) => record.type === 16)
      return txtRecords.some((record: any) => record.data.includes(verificationToken))
    }

    return false
  } catch (error) {
    console.error("Domain verification error:", error)
    return false
  }
}

export function validateDomain(domain: string): { valid: boolean; error?: string } {
  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, "")

  // Remove trailing slash
  domain = domain.replace(/\/$/, "")

  // Check for valid domain format
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i

  if (!domainRegex.test(domain)) {
    return { valid: false, error: "Invalid domain format" }
  }

  // Check for reserved domains
  const reservedDomains = ["localhost", "frschousing.com", "www.frschousing.com"]
  if (reservedDomains.includes(domain.toLowerCase())) {
    return { valid: false, error: "This domain is reserved" }
  }

  return { valid: true }
}

export function getSubdomain(hostname: string): string | null {
  const parts = hostname.split(".")

  // If it's a custom domain or main domain, return null
  if (parts.length < 3) return null

  // Return the first part as subdomain
  return parts[0]
}

export function isCustomDomain(hostname: string): boolean {
  // Check if the hostname is not a subdomain of the main platform
  return !hostname.endsWith(".frschousing.com") && hostname !== "frschousing.com"
}
