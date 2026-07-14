"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { marketplaceQrUrl, type MarketplaceListing } from "@/lib/api/marketplace"

export function QrVerifyPanel({ listing }: { listing: MarketplaceListing }) {
  if (!listing.verification_code || listing.verification_status !== "verified") {
    return null
  }

  const qrSrc = marketplaceQrUrl(listing)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Verify authenticity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Scan this QR code on site or share it so buyers can confirm this listing is verified on Smart Housing.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt="Verification QR" className="h-48 w-48 mx-auto border rounded-lg bg-white p-2" />
        <p className="text-xs text-center font-mono tracking-wide">{listing.verification_code}</p>
      </CardContent>
    </Card>
  )
}
