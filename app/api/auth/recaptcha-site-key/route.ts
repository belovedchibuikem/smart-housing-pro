import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  const envKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || ""
  const envForceOn =
    process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === "true" ||
    (process.env.NODE_ENV === "production" && Boolean(envKey))

  try {
    const tenantSlug = request.headers.get("X-Tenant-Slug") || request.cookies.get("tenant_slug")?.value

    const headers: Record<string, string> = {
      Accept: "application/json",
    }

    if (tenantSlug) {
      headers["X-Tenant-Slug"] = tenantSlug
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/recaptcha-site-key`, {
      method: "GET",
      headers,
    })

    if (!response.ok) {
      throw new Error("Failed to fetch reCAPTCHA site key")
    }

    const data = await response.json()
    const siteKey = (data.site_key as string) || envKey
    const enabled =
      typeof data.enabled === "boolean"
        ? data.enabled || (envForceOn && Boolean(siteKey))
        : envForceOn && Boolean(siteKey)

    return NextResponse.json({
      ...data,
      enabled: Boolean(enabled && siteKey),
      site_key: siteKey,
    })
  } catch (error) {
    console.error("Error fetching reCAPTCHA site key:", error)
    const fallbackEnabled = envForceOn && Boolean(envKey)
    return NextResponse.json(
      {
        enabled: fallbackEnabled,
        site_key: envKey,
        reason_disabled: fallbackEnabled ? null : "api_unavailable_and_no_env_site_key",
      },
      { status: 200 },
    )
  }
}




