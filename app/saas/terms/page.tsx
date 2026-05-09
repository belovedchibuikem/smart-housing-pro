"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SaaSHeader } from "@/components/saas/saas-header"
import { ArrowLeft, FileText } from "lucide-react"

export default function SaaSTermsPage() {
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
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Terms of Service</h1>
            <p className="text-muted-foreground text-lg text-balance">
              Terms governing access to and use of the CoopHub platform and related websites.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Last updated: May 9, 2026</p>
          </div>
        </div>
      </section>

      <article className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert max-w-none">
          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">1. Agreement</h2>
              <p>
                These Terms of Service (“Terms”) form a binding agreement between you and CoopHub regarding your use of
                our websites, cloud software, and related services (collectively, the “Services”). By creating an account,
                clicking to accept, or using the Services, you agree to these Terms. If you are using the Services on
                behalf of an organization, you represent that you have authority to bind that organization, and “you”
                refers to both you and the organization.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">2. The Services</h2>
              <p>
                CoopHub provides software for managing housing cooperatives and similar entities, including tools for
                members, contributions, loans, properties, and administration. We may update or discontinue features with
                reasonable notice where practicable. We may offer trial or beta functionality subject to additional
                disclaimers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">3. Accounts &amp; access</h2>
              <p>
                You are responsible for safeguarding credentials and for all activity under your account. You must
                provide accurate registration information and notify us promptly of unauthorized use. We may suspend or
                terminate access for breach of these Terms, risk to the platform, or legal requirements.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">4. Customer data &amp; privacy</h2>
              <p>
                You retain rights to data you submit to the Services (“Customer Data”). You grant CoopHub a worldwide
                license to host, process, transmit, and display Customer Data only as needed to provide and improve the
                Services, prevent abuse, and comply with law. Our{" "}
                <Link href="/saas/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                explains how we handle personal information. You are responsible for having a lawful basis to submit
                Customer Data and for your organization’s notices to end users where applicable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">5. Acceptable use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate law or third-party rights;</li>
                <li>Upload malware, probe or scan systems without permission, or disrupt the Services;</li>
                <li>
                  Attempt to access non-public areas or other tenants’ data, or circumvent security or usage limits;
                </li>
                <li>Use the Services to send spam or deceptive communications;</li>
                <li>Reverse engineer our software except where prohibited by applicable law;</li>
                <li>Use the Services in ways that expose us to undue regulatory or financial risk without approval.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">6. Fees &amp; payment</h2>
              <p>
                Paid subscriptions are governed by the order, quote, or checkout terms presented at purchase. Fees are
                exclusive of taxes unless stated otherwise. Late payment may result in suspension. Unless required
                otherwise, subscription fees are non-refundable except as stated in your order or applicable law.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">7. Intellectual property</h2>
              <p>
                CoopHub and its licensors own the Services, including software, branding, and documentation. Except for
                the limited rights in these Terms, no rights are granted. Feedback you provide may be used by CoopHub
                without obligation to you.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">8. Confidentiality</h2>
              <p>
                Each party may receive non-public information from the other (“Confidential Information”). The recipient
                will use reasonable care to protect it and use it only for the purpose of the Services. Exclusions
                include publicly available information, independently developed information, and information rightfully
                received from a third party.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">9. Warranties &amp; disclaimer</h2>
              <p>
                The Services are provided “as is” and “as available.” To the fullest extent permitted by law, CoopHub
                disclaims all warranties, express or implied, including merchantability, fitness for a particular
                purpose, and non-infringement. We do not warrant uninterrupted or error-free operation. You are
                responsible for your use of the Services and for compliance with laws applicable to your organization and
                jurisdiction.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">10. Limitation of liability</h2>
              <p>
                To the fullest extent permitted by law, neither party will be liable for indirect, incidental, special,
                consequential, or punitive damages, or loss of profits, data, or goodwill. Except for your payment
                obligations, either party’s aggregate liability arising out of these Terms will not exceed the amount
                paid by you to CoopHub for the Services in the twelve (12) months before the claim (or, if none, fifty
                (50) USD). These limitations apply even if a remedy fails of its essential purpose.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">11. Indemnity</h2>
              <p>
                You will defend and indemnify CoopHub against third-party claims arising from Customer Data, your use of
                the Services in breach of these Terms, or your violation of law, except to the extent caused by CoopHub’s
                willful misconduct.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">12. Term &amp; termination</h2>
              <p>
                These Terms continue until terminated. You may stop using the Services at any time. We may terminate or
                suspend access for cause or for convenience with notice according to your subscription terms. On
                termination, your right to use the Services ceases. We may retain Customer Data as described in our
                Privacy Policy and any data-processing terms. Sections that by nature should survive will survive
                termination.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">13. Changes</h2>
              <p>
                We may modify these Terms by posting an updated version and updating the “Last updated” date. For
                materially adverse changes to paying customers, we will provide reasonable advance notice where required
                by law. Continued use after the effective date constitutes acceptance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">14. Governing law &amp; disputes</h2>
              <p>
                These Terms are governed by the laws specified in your order or, if none, the laws of the jurisdiction
                in which CoopHub is organized, without regard to conflict-of-law rules. Courts in that jurisdiction will
                have exclusive venue, subject to mandatory consumer protections where applicable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">15. Miscellaneous</h2>
              <p>
                These Terms constitute the entire agreement regarding the Services and supersede prior discussions.
                If a provision is unenforceable, the remainder stays in effect. Failure to enforce a provision is not a
                waiver. You may not assign these Terms without our consent; we may assign them in connection with a
                merger or acquisition.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground not-prose">16. Contact</h2>
              <p>
                For questions about these Terms, contact us via{" "}
                <Link href="/saas/contact" className="text-primary hover:underline">
                  our contact page
                </Link>
                .
              </p>
              <p className="text-sm">
                These Terms are a template for product and legal review; adapt governing law, liability caps, and
                jurisdiction to your entity and counsel’s advice.
              </p>
            </section>
          </div>
        </div>
      </article>
    </div>
  )
}
