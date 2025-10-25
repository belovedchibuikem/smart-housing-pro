import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TenantProvider } from "@/lib/tenant/tenant-context"
import { WhiteLabelProvider } from "@/lib/context/white-label-context"
import { Toaster } from "sonner"

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
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <TenantProvider>
          <WhiteLabelProvider>
            {children}
            <Toaster position="top-right" />
          </WhiteLabelProvider>
        </TenantProvider>
      </body>
    </html>
  )
}
