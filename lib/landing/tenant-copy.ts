/**
 * Resolve tenant-scoped marketing placeholders in landing CMS copy.
 * Use {cooperative_name} / {tenant_name} in section config; never hardcode a coop brand.
 */
export function resolveTenantCopy(
  text: string | null | undefined,
  cooperativeName: string,
  fallback = "our cooperative",
): string {
  if (!text) return ""
  const name = (cooperativeName || "").trim() || fallback
  return text
    .replaceAll("{cooperative_name}", name)
    .replaceAll("{tenant_name}", name)
    .replaceAll("{company_name}", name)
}

export function resolveTenantCopyDeep<T>(value: T, cooperativeName: string): T {
  if (typeof value === "string") {
    return resolveTenantCopy(value, cooperativeName) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveTenantCopyDeep(item, cooperativeName)) as T
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveTenantCopyDeep(v, cooperativeName)
    }
    return out as T
  }
  return value
}
