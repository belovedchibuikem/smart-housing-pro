"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SaaSHeader } from "@/components/saas/saas-header"
import { ArrowLeft, HelpCircle, LifeBuoy, Mail, MessageSquare } from "lucide-react"

export default function SaaSContactPage() {
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
              <MessageSquare className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Contact us</h1>
            <p className="text-muted-foreground text-lg text-balance">
              We’re here to help with sales, onboarding, product questions, and technical support for CoopHub.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-14">
          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Sales &amp; general inquiries</CardTitle>
              <CardDescription>New subscriptions, demos, partnerships, and media.</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:sales@coophub.com" className="text-primary font-medium hover:underline">
                sales@coophub.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">We typically reply within one business day.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                <LifeBuoy className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Customer support</CardTitle>
              <CardDescription>Help signing in, billing, and using the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="mailto:support@coophub.com" className="text-primary font-medium hover:underline">
                support@coophub.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Prefer in-app help? Use the support link from your organization’s CoopHub workspace when logged in.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto space-y-8 text-muted-foreground leading-relaxed">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Before you write</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <p>
                If you’re a <strong className="text-foreground">member</strong> of a housing cooperative, billing or
                account questions are usually handled by your cooperative’s administrators. Please contact them first;
                they can escalate to CoopHub when needed.
              </p>
              <p>
                For <strong className="text-foreground">privacy</strong> requests related to your personal data, see our{" "}
                <Link href="/saas/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                and include “Privacy request” in the subject line.
              </p>
            </CardContent>
          </Card>

          <div className="rounded-xl border bg-card p-8 text-center space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Ready to get started?</h2>
            <p className="text-sm">
              Start a free trial or talk to us about the right plan for your cooperative.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild>
                <Link href="/onboard">Start free trial</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/saas#plans">View plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
