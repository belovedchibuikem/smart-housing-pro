const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/**
 * Calendar date, optional time, and optional timezone.
 * Matches API values such as 2026-09-29, 2026-09-29 14:30:00, and 2026-09-29T00:00:00.000000Z.
 */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/

/**
 * Human date for screens and exports.
 * Date-only values (including midnight UTC timestamps) keep the calendar day, so 2026-09-29T00:00:00.000000Z is 29 Sep 2026.
 * Values that already have a clock time are shown in local time as "29 Sep 2026, 14:30".
 */
export function formatDisplayDate(
  value?: string | number | null,
  options?: { withTime?: boolean; fallback?: string },
): string {
  const fallback = options?.fallback ?? "—"
  if (value == null) return fallback

  const raw = String(value).trim()
  if (!raw || raw === "—" || raw === "-") return fallback

  const match = raw.match(ISO_DATE)
  if (!match) return raw

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return raw

  const hours = match[4]
  const minutes = match[5] ?? "00"
  const seconds = match[6] ?? "00"
  const isMidnight = hours == null || (hours === "00" && minutes === "00" && seconds === "00")
  if (isMidnight) {
    return `${day} ${MONTHS[month - 1]} ${year}`
  }

  const normalized = raw.includes(" ") && !raw.includes("T") ? raw.replace(" ", "T") : raw
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return `${day} ${MONTHS[month - 1]} ${year}`
  }

  const localHours = String(parsed.getHours()).padStart(2, "0")
  const localMinutes = String(parsed.getMinutes()).padStart(2, "0")
  return `${parsed.getDate()} ${MONTHS[parsed.getMonth()]} ${parsed.getFullYear()}, ${localHours}:${localMinutes}`
}
