"use client"

import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCoordinates, type GeoCoordinates } from "@/lib/geo/coordinates"
import { MapPin } from "lucide-react"

const MapInner = dynamic(() => import("./property-location-picker-inner"), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full rounded-lg" />,
})

type Props = {
  value: GeoCoordinates
  onChange: (coords: GeoCoordinates) => void
  className?: string
}

export function PropertyLocationPicker({ value, onChange, className }: Props) {
  const setLat = (raw: string) => {
    const lat = parseFloat(raw)
    if (!Number.isFinite(lat)) return
    onChange({ lat, lng: value?.lng ?? 3.3792 })
  }

  const setLng = (raw: string) => {
    const lng = parseFloat(raw)
    if (!Number.isFinite(lng)) return
    onChange({ lat: value?.lat ?? 6.5244, lng })
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Map pin (lat / lng)</Label>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Click the map to place a pin, or drag the marker. Used for marketplace map search and verification.
      </p>
      <div className="rounded-lg overflow-hidden border h-[280px] mb-3">
        <MapInner value={value} onChange={onChange} />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="space-y-1">
          <Label htmlFor="coord-lat" className="text-xs">
            Latitude
          </Label>
          <Input
            id="coord-lat"
            type="number"
            step="any"
            placeholder="6.5244"
            value={value?.lat ?? ""}
            onChange={(e) => setLat(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="coord-lng" className="text-xs">
            Longitude
          </Label>
          <Input
            id="coord-lng"
            type="number"
            step="any"
            placeholder="3.3792"
            value={value?.lng ?? ""}
            onChange={(e) => setLng(e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{formatCoordinates(value)}</p>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Clear pin
          </Button>
        )}
      </div>
    </div>
  )
}
