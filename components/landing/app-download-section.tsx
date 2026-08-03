"use client"

import Image from "next/image"
import { FileUp, QrCode, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEFAULT_ANDROID_PLAY_STORE_URL } from "@/lib/pwa/mobile-app-store"
import { resolveTenantCopy } from "@/lib/landing/tenant-copy"
import { useWhiteLabel } from "@/lib/hooks/use-white-label"

export function AppDownloadSection({
  config,
}: {
  config?: Record<string, unknown>
}) {
  const { settings } = useWhiteLabel()
  const coop = settings?.company_name || "our cooperative"

  const eyebrow = resolveTenantCopy(
    (config?.eyebrow as string) || "{cooperative_name}",
    coop,
  )
  const title = resolveTenantCopy(
    (config?.title as string) ||
      "Your cooperative. Your property. Your documents — in your pocket.",
    coop,
  )
  const subtitle = resolveTenantCopy(
    (config?.subtitle as string) ||
      "Download the free member app for {cooperative_name}. Track contributions, loans, and allotments — then upload your house or land documents securely.",
    coop,
  )
  const cta = resolveTenantCopy((config?.cta_text as string) || "Get it on Google Play", coop)
  const secondaryCta = resolveTenantCopy(
    (config?.secondary_cta_text as string) || "Upload your documents",
    coop,
  )
  const secondaryAnchor = (config?.secondary_cta_anchor as string) || "#upload-docs"
  const showQr = config?.show_qr !== false
  const playUrl =
    (typeof config?.play_store_url === "string" && config.play_store_url.trim()) ||
    DEFAULT_ANDROID_PLAY_STORE_URL

  return (
    <section
      id="download-app"
      className="relative overflow-hidden py-16 md:py-20 text-primary-foreground"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 15% 0%, color-mix(in srgb, var(--primary) 35%, transparent), transparent 55%), linear-gradient(165deg, var(--secondary) 0%, color-mix(in srgb, var(--secondary) 85%, black) 100%)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center max-w-6xl mx-auto">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">{eyebrow}</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight tracking-tight max-w-xl">
              {title}
            </h2>
            <p className="mt-4 text-base text-primary-foreground/80 max-w-md leading-relaxed">{subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-semibold h-12 px-6">
                <a href={playUrl} target="_blank" rel="noopener noreferrer">
                  <Smartphone className="h-5 w-5 mr-2" />
                  {cta}
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-primary-foreground/5 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground h-12 px-6"
              >
                <a href={secondaryAnchor}>
                  <FileUp className="h-5 w-5 mr-2" />
                  {secondaryCta}
                </a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/55">
              Free on Google Play · Built for {coop} members
            </p>
          </div>

          {showQr ? (
            <div className="flex flex-col items-center lg:items-end">
              <div className="rounded-2xl bg-background p-5 shadow-xl ring-1 ring-primary-foreground/15">
                <Image
                  src="/branding/smart-housing-app-qr-plain.png"
                  alt={`QR code to download the member app for ${coop}`}
                  width={240}
                  height={240}
                  className="w-[200px] h-[200px] sm:w-[220px] sm:h-[220px]"
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-primary-foreground/85 text-sm">
                <QrCode className="h-4 w-4 text-primary" />
                <span>Scan to install · {coop}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
