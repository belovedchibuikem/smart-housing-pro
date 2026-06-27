const TRILLION = 1_000_000_000_000
const BILLION = 1_000_000_000
const MILLION = 1_000_000
const THOUSAND = 1_000

function trimTrailingZeros(formatted: string): string {
  if (!formatted.includes(".")) return formatted
  return formatted.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1")
}

/**
 * Compact naira: auto K / M / B / T based on magnitude.
 */
export function formatCompactNaira(
  value: number | undefined | null,
  fractionDigits = 1,
): string {
  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return "₦0"

  const abs = Math.abs(n)
  const prefix = n < 0 ? "-" : ""

  if (abs >= TRILLION) {
    return `${prefix}₦${trimTrailingZeros((abs / TRILLION).toFixed(fractionDigits))}T`
  }
  if (abs >= BILLION) {
    return `${prefix}₦${trimTrailingZeros((abs / BILLION).toFixed(fractionDigits))}B`
  }
  if (abs >= MILLION) {
    return `${prefix}₦${trimTrailingZeros((abs / MILLION).toFixed(fractionDigits))}M`
  }
  if (abs >= THOUSAND) {
    return `${prefix}₦${trimTrailingZeros((abs / THOUSAND).toFixed(0))}K`
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n)
}

/** Full naira with grouping; optional compact mode for large values. */
export function formatNairaAmount(
  value: number | undefined | null,
  options?: { compact?: boolean; maximumFractionDigits?: number },
): string {
  const compact = options?.compact ?? false
  if (compact) {
    return formatCompactNaira(value, 1)
  }

  const n = Number(value ?? 0)
  if (!Number.isFinite(n)) return "₦0"

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: options?.maximumFractionDigits ?? 0,
  }).format(n)
}

/** e.g. ₦5.2B · House ₦4.5B · Land ₦719.3M */
export function formatHouseLandCompact(
  houseAmount: number | undefined | null,
  landAmount: number | undefined | null,
  options?: { showCombined?: boolean },
): string {
  const house = Number(houseAmount ?? 0) || 0
  const land = Number(landAmount ?? 0) || 0
  const combined = house + land
  const houseLabel = `House ${formatCompactNaira(house)}`
  const landLabel = `Land ${formatCompactNaira(land)}`

  if (options?.showCombined === false) {
    return `${houseLabel} · ${landLabel}`
  }

  return `${formatCompactNaira(combined)} · ${houseLabel} · ${landLabel}`
}
