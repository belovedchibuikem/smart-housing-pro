"use client"

import Link from "next/link"
import { Building2 } from "lucide-react"
import { resolveStorageUrl } from "@/lib/api/config"
import { cn } from "@/lib/utils"
import type { SaasBranding } from "@/hooks/use-saas-branding"

type SaasBrandMarkProps = {
  branding: SaasBranding
  href?: string
  className?: string
  /** navbar = wide logo; footer = slightly larger logo */
  variant?: "navbar" | "footer"
  onNavigate?: () => void
}

export function SaasBrandMark({
  branding,
  href = "/saas",
  className,
  variant = "navbar",
  onNavigate,
}: SaasBrandMarkProps) {
  const logoSrc = branding.logo_url ? resolveStorageUrl(branding.logo_url) : null
  const iconSrc = branding.icon_url ? resolveStorageUrl(branding.icon_url) : null
  const showWideLogo = Boolean(logoSrc)
  const imageSrc = showWideLogo ? logoSrc : iconSrc

  const logoClass =
    variant === "footer"
      ? "h-10 max-w-[200px] w-auto object-contain object-left"
      : "h-9 max-w-[180px] w-auto object-contain object-left"

  const iconClass = variant === "footer" ? "h-10 w-10 rounded-lg object-cover" : "h-9 w-9 rounded-lg object-cover"

  const inner = (
    <>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={`${branding.site_name} logo`}
          className={showWideLogo ? logoClass : iconClass}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0",
            variant === "footer" ? "h-10 w-10" : "h-9 w-9",
          )}
        >
          <Building2 className={variant === "footer" ? "h-5 w-5" : "h-5 w-5"} />
        </div>
      )}
      <span className={cn("font-bold tracking-tight", variant === "footer" ? "text-lg" : "text-xl")}>
        {branding.site_name}
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className={cn("flex items-center gap-2.5 min-w-0", className)}
        onClick={onNavigate}
      >
        {inner}
      </Link>
    )
  }

  return <div className={cn("flex items-center gap-2.5 min-w-0", className)}>{inner}</div>
}
