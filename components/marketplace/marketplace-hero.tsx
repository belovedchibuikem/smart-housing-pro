"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Home, LandPlot, ShieldCheck, Search } from "lucide-react"
import Link from "next/link"

type Props = {
  stats?: {
    verified_listings: number
    vendors: number
    houses: number
    lands: number
  } | null
  search: string
  onSearchChange: (value: string) => void
  onQuickFilter: (kind: string) => void
}

export function MarketplaceHero({ stats, search, onSearchChange, onQuickFilter }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-amber-700 text-white">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#FDB11E,_transparent_50%)]" />
      <div className="container relative mx-auto px-4 py-16 md:py-20">
        <Badge className="mb-4 bg-white/15 hover:bg-white/20 text-white border-white/20">
          Smart Housing Marketplace
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold max-w-3xl text-balance">
          Find verified houses & land without the scam risk
        </h1>
        <p className="mt-4 text-lg text-white/85 max-w-2xl">
          Browse listings from cooperatives and landlords across Nigeria. Every public listing is reviewed before it
          goes live — with QR authenticity checks you can trust.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, city, or vendor…"
              className="pl-10 h-12 bg-white text-foreground"
            />
          </div>
          <Button asChild size="lg" className="h-12 bg-[#FDB11E] text-teal-950 hover:bg-[#f0a50a]">
            <Link href="/onboard?vendor_type=landlord">List your property</Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/15 text-white hover:bg-white/25 border-0"
            onClick={() => onQuickFilter("house")}
          >
            <Home className="h-4 w-4 mr-1" /> Houses
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/15 text-white hover:bg-white/25 border-0"
            onClick={() => onQuickFilter("land")}
          >
            <LandPlot className="h-4 w-4 mr-1" /> Land
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/15 text-white hover:bg-white/25 border-0" asChild>
            <Link href="#trust">
              <ShieldCheck className="h-4 w-4 mr-1" /> How verification works
            </Link>
          </Button>
        </div>

        {stats && (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
            {[
              { label: "Verified listings", value: stats.verified_listings },
              { label: "Vendors", value: stats.vendors },
              { label: "Houses", value: stats.houses },
              { label: "Land parcels", value: stats.lands },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 backdrop-blur px-4 py-3">
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-white/75">{item.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
