export type GeoCoordinates = { lat: number; lng: number } | null

export function parseGeoCoordinates(raw: unknown): GeoCoordinates {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const lat = Number(o.lat ?? o.latitude)
  const lng = Number(o.lng ?? o.longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

export function formatCoordinates(coords: GeoCoordinates): string {
  if (!coords) return "Not set"
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
}
