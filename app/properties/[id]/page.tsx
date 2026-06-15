"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import { PropertyDetailView } from "@/components/properties/property-detail-view"
import { fetchPublicProperty, type PublicPropertyListing } from "@/lib/api/public-properties"

export default function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { kind?: string }
}) {
  const [property, setProperty] = useState<PublicPropertyListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    const kind = searchParams.kind || "house"
    fetchPublicProperty(params.id, kind)
      .then((result) => {
        if (!result) {
          setMissing(true)
          return
        }
        setProperty(result)
      })
      .finally(() => setLoading(false))
  }, [params.id, searchParams.kind])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading property details...</p>
      </div>
    )
  }

  if (missing || !property) {
    notFound()
  }

  return <PropertyDetailView property={property} />
}
