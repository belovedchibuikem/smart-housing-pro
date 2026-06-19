import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TenantProvider } from "@/lib/tenant/tenant-context"
import { WhiteLabelProvider } from "@/lib/context/white-label-context"
import { TenantSettingsProvider } from "@/lib/context/tenant-settings-context"
import { PwaProvider } from "@/components/pwa/pwa-provider"
import { Toaster } from "sonner"
import { I18nProvider } from "@/lib/i18n/i18n-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Smart Housing",
    template: "%s | Smart Housing",
  },
  description: "Cooperative housing management for members and administrators",
  applicationName: "Smart Housing",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Smart Housing",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/branding/smarthousing-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/branding/smarthousing-icon.svg" }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#276254" },
    { media: "(prefers-color-scheme: dark)", color: "#276254" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <TenantProvider>
          <TenantSettingsProvider>
            <WhiteLabelProvider>
              <PwaProvider>
                <I18nProvider>
                  {children}
                  <Toaster position="top-right" />
                </I18nProvider>
              </PwaProvider>
            </WhiteLabelProvider>
          </TenantSettingsProvider>
        </TenantProvider>
      </body>
    </html>
  )
}
