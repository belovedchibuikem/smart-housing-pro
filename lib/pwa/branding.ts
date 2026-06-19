import { type NextRequest } from "next/server"
import { getApiBaseUrl, resolveStorageUrl } from "@/lib/api/config"
import { buildTenantForwardHeaders } from "@/lib/api/tenant-forward-headers"

export type PwaBranding = {
  name: string
  shortName: string
  description: string
  themeColor: string
  backgroundColor: string
  iconUrl: string
  startUrl: string
}

type WhiteLabelPayload = {
  company_name?: string
  company_tagline?: string
  company_description?: string
  logo_url?: string
  favicon_url?: string
  primary_color?: string
  background_color?: string
  is_active?: boolean
}

type SaasBrandingPayload = {
  site_name?: string
  logo_url?: string | null
  icon_url?: string | null
}

const DEFAULT_BRANDING: PwaBranding = {
  name: "Smart Housing",
  shortName: "Smart Housing",
  description: "Cooperative housing management for members and administrators",
  themeColor: "#276254",
  backgroundColor: "#ffffff",
  iconUrl: "/branding/smarthousing-icon.svg",
  startUrl: "/",
}

function trimShortName(name: string, max = 12): string {
  const cleaned = name.trim()
  if (cleaned.length <= max) return cleaned
  return cleaned.slice(0, max).trim()
}

function toAbsoluteUrl(origin: string, href: string): string {
  return href.startsWith("/") ? `${origin}${href}` : href
}

function pickIconUrl(
  origin: string,
  whiteLabel?: WhiteLabelPayload | null,
  saas?: SaasBrandingPayload | null,
): string {
  const logo = resolveStorageUrl(whiteLabel?.logo_url)
  if (logo) return toAbsoluteUrl(origin, logo)

  const favicon = resolveStorageUrl(whiteLabel?.favicon_url)
  if (favicon) return toAbsoluteUrl(origin, favicon)

  const saasIcon = resolveStorageUrl(saas?.icon_url ?? undefined)
  if (saasIcon) return toAbsoluteUrl(origin, saasIcon)

  const saasLogo = resolveStorageUrl(saas?.logo_url ?? undefined)
  if (saasLogo) return toAbsoluteUrl(origin, saasLogo)

  return toAbsoluteUrl(origin, DEFAULT_BRANDING.iconUrl)
}

async function fetchWhiteLabel(request: NextRequest): Promise<WhiteLabelPayload | null> {
  const apiBase = getApiBaseUrl()
  if (!apiBase) return null

  try {
    const response = await fetch(`${apiBase.replace(/\/$/, "")}/admin/white-label`, {
      method: "GET",
      headers: buildTenantForwardHeaders(request),
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.settings ?? null
  } catch {
    return null
  }
}

async function fetchSaasBranding(request: NextRequest): Promise<SaasBrandingPayload | null> {
  const apiBase = getApiBaseUrl()
  if (!apiBase) return null

  try {
    const response = await fetch(`${apiBase.replace(/\/$/, "")}/public/saas/branding`, {
      method: "GET",
      headers: buildTenantForwardHeaders(request),
      cache: "no-store",
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.branding ?? data.header ?? null
  } catch {
    return null
  }
}

export async function fetchPwaBranding(request: NextRequest): Promise<PwaBranding> {
  const origin = request.nextUrl.origin
  const [whiteLabel, saasBranding] = await Promise.all([
    fetchWhiteLabel(request),
    fetchSaasBranding(request),
  ])

  const name = whiteLabel?.company_name?.trim() || saasBranding?.site_name?.trim() || DEFAULT_BRANDING.name

  const description =
    whiteLabel?.company_description?.trim() ||
    whiteLabel?.company_tagline?.trim() ||
    DEFAULT_BRANDING.description

  const themeColor = whiteLabel?.primary_color || DEFAULT_BRANDING.themeColor
  const backgroundColor = whiteLabel?.background_color || DEFAULT_BRANDING.backgroundColor
  const iconUrl = pickIconUrl(origin, whiteLabel, saasBranding)

  return {
    name,
    shortName: trimShortName(name),
    description,
    themeColor,
    backgroundColor,
    iconUrl,
    startUrl: "/",
  }
}

export function buildWebManifest(branding: PwaBranding, origin: string) {
  const iconBase = `${origin}/pwa/icon`

  return {
    id: origin,
    name: branding.name,
    short_name: branding.shortName,
    description: branding.description,
    start_url: branding.startUrl,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    orientation: "any",
    theme_color: branding.themeColor,
    background_color: branding.backgroundColor,
    categories: ["business", "finance", "productivity"],
    prefer_related_applications: false,
    icons: [
      {
        src: `${iconBase}/192`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${iconBase}/512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${iconBase}/512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/dashboard",
        icons: [{ src: `${iconBase}/192`, sizes: "192x192" }],
      },
      {
        name: "Browse properties",
        short_name: "Properties",
        url: "/dashboard/browse-properties",
        icons: [{ src: `${iconBase}/192`, sizes: "192x192" }],
      },
      {
        name: "Wallet",
        short_name: "Wallet",
        url: "/dashboard/wallet",
        icons: [{ src: `${iconBase}/192`, sizes: "192x192" }],
      },
    ],
  }
}

export { DEFAULT_BRANDING }
