import { DynamicLandingPage } from "@/components/landing/dynamic-landing-page"
import { headers } from "next/headers"

export default function LandingPage() {
  const headersList = headers()
  const tenantSlug = headersList.get("x-tenant-slug")
  const customDomain = headersList.get("x-custom-domain")

  // If we have a tenant slug or custom domain, show the dynamic landing page
  if (tenantSlug || customDomain) {
    return <DynamicLandingPage />
  }

  // If no tenant slug or custom domain, this should be handled by middleware redirect to /saas
  // This fallback should not be reached due to middleware redirect
  return <DynamicLandingPage />
}
