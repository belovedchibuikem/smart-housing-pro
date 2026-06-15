"use client"

import Image from "next/image"
import { Building2 } from "lucide-react"
import { resolveStorageUrl } from "@/lib/api/config"
import type { WhiteLabelSettings } from "@/lib/context/white-label-context"

interface TenantBrandLogoProps {
  settings?: Pick<WhiteLabelSettings, "logo_url" | "company_name" | "company_tagline"> | null
  iconClassName?: string
  titleClassName?: string
  taglineClassName?: string
  showTagline?: boolean
}

export function TenantBrandLogo({
  settings,
  iconClassName = "h-8 w-8",
  titleClassName = "font-bold text-xl",
  taglineClassName = "text-xs text-muted-foreground",
  showTagline = true,
}: TenantBrandLogoProps) {
  const logoSrc = settings?.logo_url ? resolveStorageUrl(settings.logo_url) : ""

  return (
    <div className="flex items-center gap-2 min-w-0">
      {logoSrc ? (
        <Image
          src={logoSrc}
          alt={settings?.company_name || "Logo"}
          width={32}
          height={32}
          className={`${iconClassName} object-contain shrink-0`}
        />
      ) : (
        <Building2 className={`${iconClassName} text-primary shrink-0`} />
      )}
      <div className="min-w-0">
        <h1 className={`${titleClassName} truncate`}>{settings?.company_name || "FRSC HMS"}</h1>
        {showTagline && (
          <p className={`${taglineClassName} truncate`}>
            {settings?.company_tagline || "Housing Management System"}
          </p>
        )}
      </div>
    </div>
  )
}
