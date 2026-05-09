"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SaaSHeader } from "@/components/saas/saas-header"
import { ArrowLeft, Calendar, Presentation } from "lucide-react"

export default function SaaSDemoPage() {
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
              <Presentation className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Request a demo</h1>
            <p className="text-muted-foreground text-lg text-balance">
              See how CoopHub can streamline member management, contributions, loans, and property operations for your
              cooperative.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">Guided walkthrough</CardTitle>
              <CardDescription>
                A CoopHub specialist will tailor the session to your organization’s size and priorities.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Typical topics: onboarding workflows, roles &amp; permissions, reporting, and migration from spreadsheets or
              legacy tools.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Presentation className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-lg">What you’ll need</CardTitle>
              <CardDescription>Share your cooperative name, approximate member count, and goals.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We’ll follow up by email to propose times. No payment required for an introductory demo.
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl border bg-card p-8 text-center space-y-6">
          <p className="text-muted-foreground text-sm">
            To book a demo, email us with your organization details and preferred times. We’ll confirm within one
            business day.
          </p>
          <Button size="lg" asChild>
            <a href="mailto:sales@coophub.com?subject=CoopHub%20demo%20request">
              Email sales@coophub.com
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            Prefer to explore first?{" "}
            <Link href="/onboard" className="text-primary hover:underline">
              Start a free trial
            </Link>{" "}
            or review{" "}
            <Link href="/saas#plans" className="text-primary hover:underline">
              plans
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
