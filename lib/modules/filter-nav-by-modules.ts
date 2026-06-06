import {
  ADMIN_NAV_MODULE_MAP,
  MEMBER_NAV_MODULE_MAP,
  resolveAdminHrefModule,
  resolveMemberHrefModule,
  hasModuleAccess,
  ALWAYS_VISIBLE_ADMIN_HREFS,
  ALWAYS_VISIBLE_MEMBER_HREFS,
} from "./module-config"

export interface ModuleNavItem {
  href?: string
  label: string
  subItems?: ModuleNavItem[]
  module?: string
}

function itemModule(item: ModuleNavItem, map: Record<string, string>, resolveHref: (href: string) => string | null): string | null {
  if (item.module) return item.module
  if (item.href) return resolveHref(item.href)
  return map[item.label] ?? null
}

function filterNavTree<T extends ModuleNavItem>(
  items: T[],
  enabledModules: string[],
  navMap: Record<string, string>,
  resolveHref: (href: string) => string | null,
  alwaysVisibleHrefs?: Set<string>,
): T[] {
  return items
    .map((item) => {
      if (item.href) {
        const normalized = item.href.split("?")[0].replace(/\/$/, "")
        if (alwaysVisibleHrefs?.has(normalized)) {
          return item
        }
      }

      const slug = itemModule(item, navMap, resolveHref)
      if (!hasModuleAccess(enabledModules, slug)) {
        return null
      }

      if (item.subItems?.length) {
        const filteredSub = filterNavTree(item.subItems as T[], enabledModules, navMap, resolveHref)
        if (filteredSub.length === 0 && !item.href) {
          return null
        }
        return { ...item, subItems: filteredSub }
      }

      return item
    })
    .filter((item): item is T => item !== null)
}

export function filterNavItemsByModules<T extends ModuleNavItem>(
  items: T[],
  enabledModules: string[],
  options: {
    navMap: Record<string, string>
    resolveHref: (href: string) => string | null
    alwaysVisibleHrefs?: Set<string>
  },
): T[] {
  const { navMap, resolveHref, alwaysVisibleHrefs } = options
  return filterNavTree(items, enabledModules, navMap, resolveHref, alwaysVisibleHrefs)
}

export function filterAdminNavByModules<T extends ModuleNavItem>(items: T[], enabledModules: string[]): T[] {
  return filterNavItemsByModules(items, enabledModules, {
    navMap: ADMIN_NAV_MODULE_MAP,
    resolveHref: resolveAdminHrefModule,
    alwaysVisibleHrefs: ALWAYS_VISIBLE_ADMIN_HREFS,
  })
}

export function filterMemberNavByModules<T extends ModuleNavItem>(items: T[], enabledModules: string[]): T[] {
  return filterNavItemsByModules(items, enabledModules, {
    navMap: MEMBER_NAV_MODULE_MAP,
    resolveHref: resolveMemberHrefModule,
    alwaysVisibleHrefs: ALWAYS_VISIBLE_MEMBER_HREFS,
  })
}
