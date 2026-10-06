import legacyGrants from "@/lib/admin/permission-legacy-grants.json"

const LEGACY_GRANTS = legacyGrants as Record<string, string[]>

/**
 * A new menu permission is also satisfied by the older permission that used to
 * open that same screen. Existing admin roles keep working before the new
 * slugs are copied onto them.
 */
export function expandTenantPermissions(required: string[]): string[] {
  const expanded = new Set<string>()
  for (const perm of required) {
    const name = perm.trim()
    if (name) expanded.add(name)
  }

  let pending = [...expanded]
  for (let depth = 0; depth < 6 && pending.length > 0; depth++) {
    const next: string[] = []
    for (const perm of pending) {
      for (const legacy of LEGACY_GRANTS[perm] ?? []) {
        if (!expanded.has(legacy)) {
          expanded.add(legacy)
          next.push(legacy)
        }
      }
    }
    pending = next
  }

  return [...expanded]
}
