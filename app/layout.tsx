import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TenantProvider } from "@/lib/tenant/tenant-context"
import { WhiteLabelProvider } from "@/lib/context/white-label-context"
import { TenantSettingsProvider } from "@/lib/context/tenant-settings-context"
import { Toaster } from "sonner"
import { I18nProvider } from "@/lib/i18n/i18n-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "FRSC Housing Management System",
  description: "Cooperative housing management for FRSC personnel",
  generator: "v0.app",
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
              <I18nProvider>
                {children}
                <Toaster position="top-right" />
              </I18nProvider>
            </WhiteLabelProvider>
          </TenantSettingsProvider>
        </TenantProvider>
      </body>
    </html>
  )
}
