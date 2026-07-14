"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react"
import { VerificationBadge } from "@/components/marketplace/verification-badge"
import {
  formatMarketplacePrice,
  marketplaceListingPath,
  verifyMarketplaceCode,
} from "@/lib/api/marketplace"

export default function VerifyListingPage() {
  const params = useParams<{ code: string }>()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<Awaited<ReturnType<typeof verifyMarketplaceCode>> | null>(null)

  useEffect(() => {
    if (!params.code) return
    setLoading(true)
    verifyMarketplaceCode(params.code)
      .then(setResult)
      .finally(() => setLoading(false))
  }, [params.code])

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">
            Listing authenticity
          </Badge>
          <h1 className="text-3xl font-bold">QR verification</h1>
          <p className="text-muted-foreground mt-2">Confirm this house or land against Smart Housing records.</p>
        </div>

        <Card>
          <CardContent className="p-8">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                Checking verification code…
              </div>
            ) : !result?.ok || !result.valid ? (
              <div className="text-center space-y-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <ShieldX className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold">Not verified</h2>
                <p className="text-muted-foreground">
                  {result?.message || "This code is invalid. Do not proceed with any payment outside Smart Housing."}
                </p>
                <Button asChild>
                  <Link href="/saas/marketplace">Browse verified listings</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Authentic listing</h2>
                  <p className="text-muted-foreground">{result.message}</p>
                  <VerificationBadge status="verified" />
                </div>
                {result.data?.listing && (
                  <div className="rounded-xl border p-4 space-y-2">
                    <div className="font-semibold text-lg">{result.data.listing.name}</div>
                    <div className="text-primary font-bold">
                      {formatMarketplacePrice(result.data.listing.price)}
                    </div>
                    <div className="text-sm text-muted-foreground">{result.data.listing.location}</div>
                    <div className="text-sm">
                      Vendor: <span className="font-medium">{result.data.vendor.name}</span>
                    </div>
                    {result.data.listing.slots_available != null && (
                      <div className="text-sm">Slots remaining: {result.data.listing.slots_available}</div>
                    )}
                    <Button asChild className="w-full mt-2">
                      <Link href={marketplaceListingPath(result.data.listing)}>View listing</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
