export type FlatNavSearchItem = {
  href: string
  label: string
  group?: string
  keywords?: string
}

type NavLike = {
  href?: string
  label: string
  subItems?: NavLike[]
}

/**
 * Flatten nested sidebar nav into searchable leaf routes.
 */
export function flattenNavItems(items: NavLike[], parentLabel?: string): FlatNavSearchItem[] {
  const out: FlatNavSearchItem[] = []

  for (const item of items) {
    if (item.subItems?.length) {
      for (const sub of item.subItems) {
        if (!sub.href) continue
        out.push({
          href: sub.href,
          label: sub.label,
          group: item.label,
          keywords: [item.label, sub.label, sub.href, parentLabel].filter(Boolean).join(" "),
        })
      }
      continue
    }

    if (!item.href) continue
    out.push({
      href: item.href,
      label: item.label,
      group: parentLabel,
      keywords: [item.label, item.href, parentLabel].filter(Boolean).join(" "),
    })
  }

  // De-dupe by href (first wins)
  const seen = new Set<string>()
  return out.filter((row) => {
    if (seen.has(row.href)) return false
    seen.add(row.href)
    return true
  })
}

/**
 * Filter flattened nav by a live query (label, group, path).
 */
export function filterFlatNavItems(items: FlatNavSearchItem[], query: string): FlatNavSearchItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items

  const tokens = q.split(/\s+/).filter(Boolean)
  return items.filter((item) => {
    const hay = `${item.label} ${item.group || ""} ${item.href} ${item.keywords || ""}`.toLowerCase()
    return tokens.every((t) => hay.includes(t))
  })
}

/**
 * Filter a nested nav tree by query (keeps parents that have matching children).
 */
export function filterNavTreeByQuery<T extends NavLike>(items: T[], query: string): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return items

  const tokens = q.split(/\s+/).filter(Boolean)
  const matches = (label: string, href?: string) => {
    const hay = `${label} ${href || ""}`.toLowerCase()
    return tokens.every((t) => hay.includes(t))
  }

  const walk = (list: T[]): T[] => {
    const next: T[] = []
    for (const item of list) {
      if (item.subItems?.length) {
        const kids = walk(item.subItems as T[])
        if (kids.length > 0 || matches(item.label, item.href)) {
          next.push({ ...item, subItems: kids.length ? kids : item.subItems } as T)
        }
        continue
      }
      if (matches(item.label, item.href)) next.push(item)
    }
    return next
  }

  return walk(items)
}
