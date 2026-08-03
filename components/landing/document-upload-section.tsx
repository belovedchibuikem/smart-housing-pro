"use client"

import { CheckCircle2, Landmark, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEFAULT_ANDROID_PLAY_STORE_URL } from "@/lib/pwa/mobile-app-store"
import { resolveTenantCopy } from "@/lib/landing/tenant-copy"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"

const DEFAULT_UPLOAD_ITEMS = [
  "Deed of Assignment (house or land)",
  "Survey plans & title documents",
  "Slot ownership / supporting property docs",
  "KYC: ID, passport, utility bill, bank statement",
  "Signed offer, allocation, or acceptance letters",
]

const DEFAULT_STEPS = [
  "Install from Google Play or scan the QR above",
  "Sign in with your {cooperative_name} member account",
  "Open Properties → your slot → Upload deed / document",
]

export function DocumentUploadSection({
  config,
}: {
  config?: Record<string, unknown>
}) {
  const { settings } = useWhiteLabel()
  const coop = settings?.company_name || "our cooperative"

  const eyebrow = resolveTenantCopy(
    (config?.eyebrow as string) || "Deed-ready for {cooperative_name}",
    coop,
  )
  const title = resolveTenantCopy(
    (config?.title as string) || "Already allotted a house or land with {cooperative_name}?",
    coop,
  )
  const subtitle = resolveTenantCopy(
    (config?.subtitle as string) ||
      "Stop keeping title papers in drawers and WhatsApp folders. Open the app, go to your property or land account, and upload your existing documents today.",
    coop,
  )
  const cta = resolveTenantCopy((config?.cta_text as string) || "Install the app", coop)
  const stepsTitle = resolveTenantCopy((config?.steps_title as string) || "3 steps", coop)
  const playUrl =
    (typeof config?.play_store_url === "string" && config.play_store_url.trim()) ||
    DEFAULT_ANDROID_PLAY_STORE_URL

  const uploadItems = (
    Array.isArray(config?.upload_items) && config.upload_items.length
      ? (config.upload_items as string[])
      : DEFAULT_UPLOAD_ITEMS
  ).map((item) => resolveTenantCopy(item, coop))

  const steps = (
    Array.isArray(config?.steps) && config.steps.length ? (config.steps as string[]) : DEFAULT_STEPS
  ).map((step) => resolveTenantCopy(step, coop))

  return (
    <section
      id="upload-docs"
      className="py-16 md:py-20 bg-muted/50"
      aria-labelledby="upload-docs-heading"
    >
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-3">
              <Landmark className="h-4 w-4" />
              {eyebrow}
            </div>
            <h2
              id="upload-docs-heading"
              className="text-2xl md:text-3xl font-semibold tracking-tight text-secondary"
            >
              {title}
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{subtitle}</p>
            <ul className="mt-6 space-y-3">
              {uploadItems.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full md:w-[280px] shrink-0 rounded-xl bg-secondary text-secondary-foreground p-6">
            <p className="text-primary font-semibold text-lg">{stepsTitle}</p>
            <ol className="mt-4 space-y-4 text-sm text-secondary-foreground/85">
              {steps.map((step, i) => (
                <li key={step}>
                  <span className="text-primary font-medium">{i + 1}.</span> {step}
                </li>
              ))}
            </ol>
            <Button asChild className="w-full mt-6 font-semibold">
              <a href={playUrl} target="_blank" rel="noopener noreferrer">
                {cta}
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <p className="mt-3 text-xs text-secondary-foreground/60 text-center">
              For {coop} members
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
