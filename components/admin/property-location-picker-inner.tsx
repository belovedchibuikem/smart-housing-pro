"use client"

import { useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { GeoCoordinates } from "@/lib/geo/coordinates"

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792]

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

export default function PropertyLocationPickerInner({
  value,
  onChange,
}: {
  value: GeoCoordinates
  onChange: (coords: GeoCoordinates) => void
}) {
  const center = useMemo<[number, number]>(
    () => (value ? [value.lat, value.lng] : LAGOS_CENTER),
    [value]
  )
  const zoom = value ? 15 : 6

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} zoom={zoom} />
      <MapClickHandler onPick={(lat, lng) => onChange({ lat, lng })} />
      {value && (
        <Marker
          position={[value.lat, value.lng]}
          icon={icon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const pos = e.target.getLatLng()
              onChange({ lat: pos.lat, lng: pos.lng })
            },
          }}
        />
      )}
    </MapContainer>
  )
}
