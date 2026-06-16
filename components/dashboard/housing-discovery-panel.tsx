import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Home, LandPlot, ArrowRight } from "lucide-react"
import { resolveMemberHrefModule } from "@/lib/modules/module-config"

interface HousingDiscoveryPanelProps {
	enabledModules?: string[]
}

export function HousingDiscoveryPanel({ enabledModules }: HousingDiscoveryPanelProps) {
	const propertiesSlug = resolveMemberHrefModule("/dashboard/browse-properties")
	const propertiesEnabled =
		!enabledModules?.length || !propertiesSlug || enabledModules.includes(propertiesSlug)

	if (!propertiesEnabled) return null

	return (
		<Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
			<CardHeader className="pb-3">
				<div className="flex items-start gap-3">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Building2 className="h-5 w-5" />
					</div>
					<div>
						<CardTitle className="text-lg">Housing &amp; land</CardTitle>
						<CardDescription>Browse cooperative listings or view property you already own.</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3 sm:grid-cols-3">
					<Link href="/dashboard/browse-properties?listing=house" className="group block">
						<div className="flex h-full flex-col rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
							<Home className="mb-2 h-5 w-5 text-primary" />
							<p className="font-semibold">Browse houses</p>
							<p className="mt-1 flex-1 text-xs text-muted-foreground">Available buildings and units</p>
							<span className="mt-3 inline-flex items-center text-xs font-medium text-primary">
								View listings
								<ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
							</span>
						</div>
					</Link>
					<Link href="/dashboard/browse-properties?listing=land" className="group block">
						<div className="flex h-full flex-col rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/40">
							<LandPlot className="mb-2 h-5 w-5 text-primary" />
							<p className="font-semibold">Browse land</p>
							<p className="mt-1 flex-1 text-xs text-muted-foreground">Open land parcels for members</p>
							<span className="mt-3 inline-flex items-center text-xs font-medium text-primary">
								View parcels
								<ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
							</span>
						</div>
					</Link>
					<Link href="/dashboard/my-property" className="group block">
						<div className="flex h-full flex-col rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/20">
							<Building2 className="mb-2 h-5 w-5 text-emerald-700 dark:text-emerald-400" />
							<p className="font-semibold">My property</p>
							<p className="mt-1 flex-1 text-xs text-muted-foreground">Houses &amp; land you own or subscribe to</p>
							<span className="mt-3 inline-flex items-center text-xs font-medium text-emerald-700 dark:text-emerald-400">
								Open portfolio
								<ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
							</span>
						</div>
					</Link>
				</div>
				<div className="mt-4 flex justify-end">
					<Button asChild variant="ghost" size="sm" className="text-primary">
						<Link href="/dashboard/browse-properties?listing=all">
							See all listings
							<ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
