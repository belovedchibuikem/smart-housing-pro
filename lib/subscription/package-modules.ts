export type PackageModuleItem = {
  id?: string
  slug: string
  name: string
}

export function sortedPackageModules(modules?: PackageModuleItem[]): PackageModuleItem[] {
  if (!modules?.length) return []
  return [...modules].sort((a, b) => a.name.localeCompare(b.name))
}

export function packageModuleNames(modules?: PackageModuleItem[]): string[] {
  return sortedPackageModules(modules).map((module) => module.name)
}

/**
 * Marketing bullets first, then module names not already listed.
 */
export function mergePackageFeatures(
  marketingFeatures: string[],
  modules?: PackageModuleItem[],
): string[] {
  const moduleNames = packageModuleNames(modules)
  if (marketingFeatures.length === 0) {
    return moduleNames
  }
  if (moduleNames.length === 0) {
    return marketingFeatures
  }

  const marketingLower = new Set(marketingFeatures.map((feature) => feature.toLowerCase()))
  const extraModules = moduleNames.filter((name) => !marketingLower.has(name.toLowerCase()))

  return [...marketingFeatures, ...extraModules]
}

export function marketingFeaturesFromPackage(pkg: {
  display_features?: string[]
  limits?: { display_features?: string[] }
  features?: unknown
}): string[] {
  if (Array.isArray(pkg.display_features) && pkg.display_features.length) {
    return pkg.display_features
  }
  const fromLimits = pkg.limits?.display_features
  if (Array.isArray(fromLimits) && fromLimits.length) {
    return fromLimits
  }
  if (Array.isArray(pkg.features) && pkg.features.length) {
    return pkg.features.filter((feature): feature is string => typeof feature === "string")
  }
  return []
}
