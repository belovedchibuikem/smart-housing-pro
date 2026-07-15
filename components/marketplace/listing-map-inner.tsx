"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import Link from "next/link"
import "leaflet/dist/leaflet.css"

// Fix default marker icons in bundlers
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

type Point = {
  id: string
  lat: number
  lng: number
  title: string
  price: number
  href: string
}

export default function ListingMapInner({
  points,
  center,
  height,
}: {
  points: Point[]
  center?: { lat: number; lng: number }
  height: number
}) {
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : points[0]
      ? [points[0].lat, points[0].lng]
      : [9.082, 8.675] // Nigeria centroid

  return (
    <MapContainer center={mapCenter} zoom={points.length ? 11 : 6} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={icon}>
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-medium">{p.title}</p>
              <Link href={p.href} className="text-primary underline">
                View listing
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
