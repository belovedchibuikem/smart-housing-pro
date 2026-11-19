import type React from "react"
import type { Metadata, Viewport } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { Inter } from "next/font/google"
import "./globals.css"
import { TenantProvider } from "@/lib/tenant/tenant-context"
import { WhiteLabelProvider } from "@/lib/context/white-label-context"
import { TenantSettingsProvider } from "@/lib/context/tenant-settings-context"
import { PwaProvider } from "@/components/pwa/pwa-provider"
import { SaasTheme } from "@/components/saas/saas-theme"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { I18nProvider } from "@/lib/i18n/i18n-provider"
import { isPlatformApexHost } from "@/lib/auth/platform-host"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

function requestHost(headerStore: { get(name: string): string | null }): string {
  const raw = headerStore.get("x-forwarded-host") || headerStore.get("host") || ""
  return raw.split(",")[0]?.trim() || ""
}

export async function generateMetadata(): Promise<Metadata> {
  const host = requestHost(await headers())
  const offerPwa = !isPlatformApexHost(host)

  return {
    title: {
      default: "Smart Housing",
      template: "%s | Smart Housing",
    },
    description: "Cooperative housing management for members and administrators",
    applicationName: "Smart Housing",
    ...(offerPwa
      ? {
          manifest: "/manifest.webmanifest",
          appleWebApp: {
            capable: true,
            statusBarStyle: "default" as const,
            title: "Smart Housing",
          },
        }
      : {}),
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/pwa/icon/32", sizes: "32x32", type: "image/png" },
        { url: "/pwa/icon/192", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/pwa/icon/180", sizes: "180x180", type: "image/png" }],
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#276254" },
    { media: "(prefers-color-scheme: dark)", color: "#276254" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const offerPwa = !isPlatformApexHost(requestHost(await headers()))

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {offerPwa ? (
          <Script id="pwa-install-prompt-capture" strategy="beforeInteractive">
            {`window.__deferredPwaInstallPrompt=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__deferredPwaInstallPrompt=e;window.dispatchEvent(new Event("pwa-installprompt-ready"));});window.addEventListener("appinstalled",function(){window.__deferredPwaInstallPrompt=null;window.dispatchEvent(new Event("pwa-installprompt-ready"));});`}
          </Script>
        ) : null}
        <TenantProvider>
          <TenantSettingsProvider>
            <WhiteLabelProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <SaasTheme />
                <PwaProvider>
                  <I18nProvider>
                    {children}
                    <Toaster position="top-right" />
                  </I18nProvider>
                </PwaProvider>
              </ThemeProvider>
            </WhiteLabelProvider>
          </TenantSettingsProvider>
        </TenantProvider>
      </body>
    </html>
  )
}
