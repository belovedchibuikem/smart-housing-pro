"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SaaSHeader } from "@/components/saas/saas-header"
import { ArrowLeft, Shield } from "lucide-react"

export default function SaaSPrivacyPage() {
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
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg text-balance">
              How CoopHub collects, uses, and protects personal information when you use our SaaS platform and
              websites.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Last updated: May 9, 2026</p>
          </div>
        </div>
      </section>

      <article className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert max-w-none">
          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">1. Introduction</h2>
              <p>
                CoopHub (“we,” “us,” or “our”) provides cloud software for housing cooperatives and related
                organizations (“Services”). This Privacy Policy describes how we handle personal information when you
                visit our marketing websites, sign up for an account, contact us, or otherwise interact with CoopHub as
                a visitor, customer, or authorized user of a customer organization.
              </p>
              <p>
                If you use CoopHub on behalf of an organization (for example, as a cooperative administrator), your
                organization’s own privacy notices may also apply to member and staff data entered into the platform.
                Where your organization determines the purposes and means of processing that data, your organization
                may act as the data controller, and CoopHub may process such data on documented instructions as a
                processor—subject to your agreement with us.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">2. Information we collect</h2>
              <p className="font-medium text-foreground">Account and profile data</p>
              <p>
                When you create an account, request a demo, subscribe, or onboard, we may collect your name, email
                address, phone number, organization name, role, billing details, and credentials (such as a
                password—stored using industry-standard hashing where applicable).
              </p>
              <p className="font-medium text-foreground">Information you provide in the product</p>
              <p>
                Content and records you or your organization submit through the Services—such as member records,
                contributions, loan applications, documents, and messages—are processed to operate the platform and
                provide support in line with your subscription and applicable terms.
              </p>
              <p className="font-medium text-foreground">Usage and technical data</p>
              <p>
                We collect device, log, and diagnostic information (for example, IP address, browser type, rough
                location derived from IP, timestamps, pages or screens viewed, and error reports) to secure the Services,
                improve performance, and understand how the product is used in aggregate.
              </p>
              <p className="font-medium text-foreground">Cookies and similar technologies</p>
              <p>
                Our websites may use cookies, local storage, and similar technologies for essential functionality,
                preferences, analytics, and (where you consent) marketing. You can control many cookies through your
                browser settings.
              </p>
              <p className="font-medium text-foreground">Communications</p>
              <p>
                If you contact support, subscribe to updates, or correspond with us, we retain those communications and
                related metadata to respond and improve service quality.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">3. How we use information</h2>
              <p>We use personal information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, secure, and improve the Services;</li>
                <li>Authenticate users, enforce access controls, and detect fraud or abuse;</li>
                <li>Process transactions, invoices, and subscription changes;</li>
                <li>Provide customer support and service communications;</li>
                <li>Comply with legal obligations and respond to lawful requests;</li>
                <li>Analyze usage in aggregated or de-identified form to guide product development;</li>
                <li>
                  Send product-related notices and, where permitted, marketing—you may opt out of promotional emails
                  using the unsubscribe link where available.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">4. How we share information</h2>
              <p>
                We do not sell your personal information. We share data only as described below or with your
                direction or consent.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="text-foreground font-medium">Service providers.</span> Trusted vendors that help us
                  host infrastructure, process payments, deliver email, monitor reliability, and similar functions—bound
                  by confidentiality and data-processing terms.
                </li>
                <li>
                  <span className="text-foreground font-medium">Your organization.</span> Administrators and
                  authorized users within your cooperative or business may access information you submit according to
                  their permissions and policies.
                </li>
                <li>
                  <span className="text-foreground font-medium">Legal and safety.</span> Disclosures we believe are
                  required by law, court order, or government request, or necessary to protect rights, safety, and
                  security.
                </li>
                <li>
                  <span className="text-foreground font-medium">Business transfers.</span> In connection with a merger,
                  acquisition, or sale of assets, subject to appropriate safeguards and notice where required.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">5. Retention</h2>
              <p>
                We retain personal information for as long as needed to provide the Services, fulfill the purposes
                described in this policy, meet legal, tax, and accounting obligations, and resolve disputes. Retention
                periods may depend on the type of data and your relationship with us. You may request deletion of your
                account subject to applicable law and legitimate business needs (such as billing records we must retain).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">6. Security</h2>
              <p>
                We implement administrative, technical, and organizational measures designed to protect personal
                information, including encryption in transit where appropriate, access controls, and monitoring. No method
                of transmission or storage is completely secure; we encourage strong passwords and safeguarding
                credentials.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">7. International transfers</h2>
              <p>
                We may process and store information in countries other than your own. Where we transfer personal data
                across borders, we use appropriate safeguards as required by applicable law (such as contractual clauses
                or equivalent mechanisms).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">8. Your choices and rights</h2>
              <p>
                Depending on where you live, you may have rights to access, correct, delete, or export personal
                information, to object to or restrict certain processing, to withdraw consent where processing is
                consent-based, and to lodge a complaint with a supervisory authority. To exercise these rights, contact us
                using the details below. We may need to verify your identity before fulfilling requests.
              </p>
              <p>
                If your data is controlled by your organization in the platform, we may need to refer certain requests
                to your organization’s administrators.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">9. Children</h2>
              <p>
                The Services are not directed to children under 16 (or the minimum age required in your jurisdiction).
                We do not knowingly collect personal information from children. If you believe we have collected such
                information, please contact us so we can delete it.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">10. Changes to this policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will post the revised version on this page and
                update the “Last updated” date. For material changes, we may provide additional notice as appropriate.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">11. Contact us</h2>
              <p>
                For privacy questions, requests, or concerns, please contact CoopHub through the contact options listed on{" "}
                <Link href="/saas/contact" className="text-primary hover:underline">
                  our contact page
                </Link>
                , or use the primary support channel provided in your subscription agreement.
              </p>
              <p className="text-sm">
                This policy is provided for informational purposes and does not constitute legal advice. You may wish to
                have it reviewed by counsel for your jurisdiction and use case.
              </p>
            </section>
          </div>
        </div>
      </article>
    </div>
  )
}
