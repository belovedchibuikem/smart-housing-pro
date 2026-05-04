import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Bed, Bath, Square } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import type { AvailableProperty } from "@/lib/api/client"
import { resolveStorageUrl } from "@/lib/api/config"

type PropertyListingsProps = {
	properties: AvailableProperty[]
	loading?: boolean
}

function formatCurrency(amount: number) {
	return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(amount)
}

function kindLabel(property: AvailableProperty) {
	if (property.listing_kind === "land_parcel" || property.listing_kind === "land_legacy") {
		return "🌍 Land"
	}
	return "🏡 House / Building"
}

function detailHref(property: AvailableProperty) {
	if (property.listing_kind === "land_parcel") {
		return `/dashboard/lands/${property.id}`
	}
	return `/dashboard/properties/${property.id}`
}

export function PropertyListings({ properties, loading }: PropertyListingsProps) {
	const hasData = properties.length > 0

	const content = useMemo(() => {
		if (loading) {
			return (
				<div className="grid gap-6 md:grid-cols-2">
					{Array.from({ length: 4 }).map((_, index) => (
						<Card key={index} className="overflow-hidden">
							<Skeleton className="h-48 w-full" />
							<div className="space-y-4 p-6">
								<Skeleton className="h-6 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
								<div className="flex gap-3">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-16" />
								</div>
								<Skeleton className="h-10 w-full" />
							</div>
						</Card>
					))}
				</div>
			)
		}

		if (!hasData) {
			return (
				<Card>
					<CardContent className="py-12 text-center text-muted-foreground">
						No properties are currently available. Please check back soon.
					</CardContent>
				</Card>
			)
		}

		return (
			<div className="grid gap-6 md:grid-cols-2">
				{properties.map((property) => {
					const raw =
						property.images?.find((image) => image.is_primary)?.url || property.images?.[0]?.url
					const primaryImage = (raw && resolveStorageUrl(raw)) || "/placeholder.svg"

  return (
        <Card key={property.id} className="overflow-hidden">
          <div className="relative">
								<Image
									src={primaryImage || "/placeholder.svg"}
									alt={property.title}
									width={640}
									height={360}
									className="h-48 w-full object-cover"
								/>
								<div className="absolute left-3 top-3 flex flex-col items-start gap-1">
									<Badge variant="outline" className="bg-background/90 text-foreground">
										{kindLabel(property)}
									</Badge>
									{property.land_code ? (
										<Badge variant="secondary" className="text-xs font-mono">
											{property.land_code}
										</Badge>
									) : null}
								</div>
								<div className="absolute right-3 top-3 flex flex-col items-end gap-1">
									<Badge className="capitalize">{property.status.replace("_", " ")}</Badge>
									{property.total_slots != null && property.slots_available != null && (
										<Badge variant="secondary" className="text-xs font-normal">
											{property.slots_available} slot{property.slots_available === 1 ? "" : "s"} left
										</Badge>
									)}
								</div>
          </div>
							<div className="space-y-4 p-6">
            <div>
              <h3 className="text-xl font-bold mb-1">{property.title}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {property.location}
              </div>
            </div>

								<div className="flex flex-wrap items-center gap-4 text-sm">
									{property.land_size_label ? (
										<div className="flex items-center gap-1 text-muted-foreground">
											<Square className="h-4 w-4" />
											<span>{property.land_size_label}</span>
										</div>
									) : null}
									{property.bedrooms ? (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>{property.bedrooms} Beds</span>
              </div>
									) : null}
									{property.bathrooms ? (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span>{property.bathrooms} Baths</span>
              </div>
									) : null}
									{property.size ? (
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4 text-muted-foreground" />
											<span>{property.size} m²</span>
              </div>
									) : null}
            </div>

								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">Property Amount</p>
									<p className="text-2xl font-semibold text-primary">{formatCurrency(property.price)}</p>
            </div>

            <Link href={detailHref(property)}>
									<Button className="w-full">View Details &amp; Show Interest</Button>
            </Link>
          </div>
        </Card>
					)
				})}
    </div>
  )
	}, [hasData, loading, properties])

	return content
}
