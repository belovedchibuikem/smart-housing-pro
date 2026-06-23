export interface SidebarNavItem {
  href?: string
  label: string
  subItems?: SidebarNavItem[]
  displayKey?: string
}

export function pathnameMatchesHref(
  pathname: string,
  href: string,
  searchParams?: URLSearchParams,
): boolean {
  const [path, queryString] = href.split("?")
  const pathMatches = pathname === path || pathname.startsWith(`${path}/`)
  if (!pathMatches) return false
  if (!queryString) return true

  const expected = new URLSearchParams(queryString)
  const current =
    searchParams ??
    (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams())

  for (const [key, value] of expected.entries()) {
    if (current.get(key) !== value) return false
  }

  return true
}

export function itemMatchesPathname(
  item: SidebarNavItem,
  pathname: string,
  searchParams?: URLSearchParams,
): boolean {
  if (item.href && pathnameMatchesHref(pathname, item.href, searchParams)) return true
  return item.subItems?.some((sub) => itemMatchesPathname(sub, pathname, searchParams)) ?? false
}

/** Flat menu keys (admin / super-admin): parent label only */
export function collectFlatActiveMenuKeys(items: SidebarNavItem[], pathname: string): string[] {
  const keys: string[] = []

  for (const item of items) {
    if (!item.subItems?.length) continue
    if (item.subItems.some((sub) => itemMatchesPathname(sub, pathname))) {
      keys.push(item.label)
    }
  }

  return keys
}

/** Nested menu keys (member dashboard): parent/child path */
export function collectNestedActiveMenuKeys(
  items: SidebarNavItem[],
  pathname: string,
  parentKey = "",
  searchParams?: URLSearchParams,
): string[] {
  const keys: string[] = []

  for (const item of items) {
    const menuKey = parentKey ? `${parentKey}/${item.label}` : item.label
    if (!item.subItems?.length) continue

    const childKeys = collectNestedActiveMenuKeys(item.subItems, pathname, menuKey, searchParams)
    if (itemMatchesPathname(item, pathname, searchParams)) {
      keys.push(menuKey, ...childKeys)
    } else if (childKeys.length > 0) {
      keys.push(menuKey, ...childKeys)
    }
  }

  return keys
}

export function scrollSidebarToActiveItem(container: HTMLElement | null) {
  if (!container) return

  requestAnimationFrame(() => {
    const activeEl = container.querySelector<HTMLElement>('[data-nav-active="true"]')
    if (!activeEl) return

    activeEl.scrollIntoView({ block: "nearest", behavior: "auto" })
  })
}
