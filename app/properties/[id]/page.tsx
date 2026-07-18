"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PropertyDetailView } from "@/components/properties/property-detail-view"
import { fetchPublicProperty, type PublicPropertyListing } from "@/lib/api/public-properties"

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const kind = searchParams.get("kind") || "house"
  const [property, setProperty] = useState<PublicPropertyListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!params?.id) return
    setMissing(false)
    setLoading(true)
    fetchPublicProperty(params.id, kind)
      .then((result) => {
        if (!result) {
          setMissing(true)
          return
        }
        setProperty(result)
      })
      .finally(() => setLoading(false))
  }, [params?.id, kind])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading property details...</p>
      </div>
    )
  }

  if (missing || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Property not found</h1>
          <p className="text-muted-foreground mt-2">The listing may have been unpublished or moved.</p>
          <Button asChild className="mt-6">
            <Link href="/properties">Back to properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <PropertyDetailView property={property} />
}
