"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
	Building2,
	CheckCircle2,
	Home,
	Info,
	Loader2,
	Search,
	TrendingUp,
	Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLoanProducts } from "@/lib/hooks/use-loan-products"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	housing: Home,
	emergency: Zap,
	default: TrendingUp,
}

const currency = new Intl.NumberFormat("en-NG", {
	style: "currency",
	currency: "NGN",
	maximumFractionDigits: 0,
})

export default function LoansPage() {
  const [searchQuery, setSearchQuery] = useState("")
	const { products, isLoading, error } = useLoanProducts()

	const filteredProducts = useMemo(() => {
		if (!products.length) return []
		return products.filter((product) => {
			const query = searchQuery.toLowerCase()
			return (
				product.name.toLowerCase().includes(query) ||
				product.description?.toLowerCase().includes(query) ||
				product.eligibility_criteria?.some((criteria) => criteria.toLowerCase().includes(query))
			)
		})
	}, [products, searchQuery])

  return (
    <div className="min-h-screen bg-background">
			<header className="sticky top-0 z-50 border-b bg-card/60 backdrop-blur-md">
				<div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
							<h1 className="text-xl font-semibold">FRSC HMS</h1>
              <p className="text-xs text-muted-foreground">Housing Management System</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

			<main className="container mx-auto px-4 py-12">
				<div className="mx-auto mb-12 max-w-3xl text-center">
					<Badge variant="secondary" className="mb-4">
						<TrendingUp className="mr-2 h-3 w-3" />
						Loan Products
          </Badge>
					<h2 className="mb-4 text-4xl font-bold md:text-5xl">Flexible Loan Offers</h2>
          <p className="text-lg text-muted-foreground">
						Explore curated loan products designed for FRSC personnel and the wider cooperative community.
          </p>
        </div>

				<div className="mx-auto mb-10 max-w-4xl">
          <div className="relative">
						<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
							value={searchQuery}
							onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search loan products..."
							className="h-12 pl-10"
            />
          </div>
        </div>

				<Card className="mb-12 border-primary/20 bg-primary/5 p-4">
					<div className="flex gap-3">
						<Info className="mt-0.5 h-5 w-5 text-primary" />
						<div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Member Benefits</p>
							<p>
								Members unlock subsidised interest rates and bespoke loan packages tailored to housing,
								education, and emergency needs.{" "}
								<Link href="/register" className="text-primary underline-offset-4 hover:underline">
									Become a member today.
                </Link>
              </p>
            </div>
          </div>
				</Card>

				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
				) : null}

				{error ? (
					<Card className="border-red-200 bg-red-50 p-6 text-sm text-red-600">
						Unable to load loan products. Please log in to view tenant-specific products.
					</Card>
				) : null}

				{!isLoading && !error ? (
					<>
						{filteredProducts.length === 0 ? (
							<div className="py-12 text-center text-sm text-muted-foreground">
								No loan products match your search at the moment.
							</div>
						) : (
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{filteredProducts.map((product) => {
									const Icon = iconMap[product.name.toLowerCase().includes("housing") ? "housing" : "default"]
            return (
										<Card key={product.id} className="group flex h-full flex-col overflow-hidden">
											<div className="flex-1 space-y-4 p-6">
                  <div className="flex items-start justify-between">
													<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
													<Badge variant="outline">{product.interest_rate ?? 0}% p.a.</Badge>
                  </div>
                  <div>
													<h3 className="text-xl font-semibold">{product.name}</h3>
													<p className="mt-1 text-sm text-muted-foreground line-clamp-3">
														{product.description ?? "Flexible cooperative-backed loan product."}
													</p>
                  </div>
												<div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
													<div className="flex justify-between">
														<span className="text-muted-foreground">Min Amount</span>
														<span className="font-medium">
															{product.min_amount ? currency.format(product.min_amount) : "—"}
														</span>
                    </div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Max Amount</span>
														<span className="font-medium">
															{product.max_amount ? currency.format(product.max_amount) : "Flexible"}
														</span>
                    </div>
													<div className="flex justify-between">
														<span className="text-muted-foreground">Tenure</span>
														<span className="font-medium">
															{product.min_tenure_months && product.max_tenure_months
																? `${product.min_tenure_months}-${product.max_tenure_months} months`
																: "Flexible"}
														</span>
                    </div>
                  </div>
												{product.eligibility_criteria?.length ? (
													<div className="space-y-2 text-sm text-muted-foreground">
														<p className="font-medium text-foreground">Eligibility</p>
														<ul className="space-y-1">
															{product.eligibility_criteria.slice(0, 3).map((criteria, index) => (
																<li key={`${product.id}-criteria-${index}`} className="flex items-center gap-2">
																	<CheckCircle2 className="h-3.5 w-3.5 text-primary" />
																	<span>{criteria}</span>
																</li>
															))}
														</ul>
                      </div>
												) : null}
                  </div>
											<div className="p-6 pt-0">
												<Link href="/dashboard/loans">
													<Button className="w-full">View in Dashboard</Button>
                  </Link>
                </div>
              </Card>
            )
          })}
          </div>
        )}
					</>
				) : null}
			</main>
    </div>
  )
}
