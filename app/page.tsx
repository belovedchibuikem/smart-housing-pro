import { DynamicLandingPage } from "@/components/landing/dynamic-landing-page"
import { LandingPageRedirect } from "@/components/landing/landing-page-redirect"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const headersList = await headers()
  const tenantSlug = headersList.get("x-tenant-slug")
  const customDomain = headersList.get("x-custom-domain")

  // If we have a tenant slug or custom domain, show the tenant landing page with redirect check
  if (tenantSlug || customDomain) {
    return (
      <>
        <LandingPageRedirect />
        <DynamicLandingPage isTenantPage={true} />
      </>
    )
  }

  // If no tenant slug or custom domain, redirect to SaaS landing page
  // This should be caught by middleware, but adding as a safety check
  redirect("/saas")
}
