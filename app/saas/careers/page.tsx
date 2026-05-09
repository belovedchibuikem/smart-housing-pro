"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SaaSHeader } from "@/components/saas/saas-header"
import { ArrowLeft, Briefcase, HeartHandshake, MapPin, Sparkles } from "lucide-react"

const OPEN_ROLES = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Product & Engineering",
    location: "Remote (Nigeria & adjacent time zones)",
    description:
      "Design and build reliable APIs, multi-tenant features, and polished admin experiences for cooperatives at scale.",
  },
  {
    title: "Product Designer",
    team: "Product & Engineering",
    location: "Remote",
    description:
      "Own flows for onboarding, finance, and member tools—complex domains with a clear, accessible UI.",
  },
  {
    title: "Customer Success Manager",
    team: "Go-to-market",
    location: "Hybrid / Lagos",
    description:
      "Guide new customers through launch, training, and adoption; partner with cooperatives to hit outcomes.",
  },
]

export default function SaaSCareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />

      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/saas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
              <Briefcase className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Careers at CoopHub</h1>
            <p className="text-muted-foreground text-lg text-balance">
              Help us build trustworthy software for housing cooperatives and the members who depend on them.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <Sparkles className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">Mission-driven</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We focus on transparency, fair access to housing tools, and measurable impact for cooperatives.
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <HeartHandshake className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">How we work</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Small teams, async-friendly collaboration, and high ownership—we trust people to manage their time.
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-base">Location</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Remote-first with optional hubs. Roles note specific expectations where it matters.
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-2">Open roles</h2>
        <p className="text-muted-foreground mb-8 text-sm md:text-base">
          Don’t see a fit? We still want to hear from you—send a note and tell us what you’d like to build.
        </p>

        <div className="space-y-4 mb-14">
          {OPEN_ROLES.map((role) => (
            <Card key={role.title}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{role.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {role.team} · {role.location}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 w-fit" asChild>
                    <a href={`mailto:careers@coophub.com?subject=Application%3A%20${encodeURIComponent(role.title)}`}>
                      Apply by email
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-xl bg-primary text-primary-foreground p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">General applications</h2>
          <p className="text-sm opacity-90 max-w-xl mx-auto">
            Share your CV, portfolio, or GitHub profile and a short note on why CoopHub interests you.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="mailto:careers@coophub.com?subject=General%20application%20%E2%80%93%20CoopHub">careers@coophub.com</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
