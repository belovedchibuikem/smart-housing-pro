"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  FileUp,
  Landmark,
  Smartphone,
  ShieldCheck,
  Wallet,
  Home,
  QrCode,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SaaSHeader } from "@/components/saas/saas-header"
import { DEFAULT_ANDROID_PLAY_STORE_URL } from "@/lib/pwa/mobile-app-store"

const BENEFITS = [
  {
    icon: Wallet,
    title: "One wallet. Every payment.",
    body: "Fund contributions, equity, loans, and property repayments from a single balance.",
  },
  {
    icon: Home,
    title: "Your house & land, always clear",
    body: "Track allotments, repayments, and statutory charges — no more guessing at the secretariat.",
  },
  {
    icon: FileUp,
    title: "Upload deeds & land documents",
    body: "Secure your title trail. Upload deeds of assignment, surveys, and ownership proofs to your property account.",
  },
  {
    icon: ShieldCheck,
    title: "Verified marketplace & QR checks",
    body: "Browse trusted listings and scan QR Property IDs before you visit or pay.",
  },
]

const UPLOAD_ITEMS = [
  "Deed of Assignment (house or land)",
  "Survey plans & title documents",
  "Slot ownership / supporting property docs",
  "KYC: ID, passport, utility bill, bank statement",
  "Signed offer, allocation, or acceptance letters",
]

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#0B1F1A]">
      <SaaSHeader />

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(39,98,84,0.22), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 20%, rgba(228,158,34,0.18), transparent 50%), linear-gradient(165deg, #0B1F1A 0%, #276254 55%, #1a4a3f 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="text-white"
            >
              <p className="font-[family-name:var(--font-display,inherit)] text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#E49E22] mb-4">
                Smart Housing
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight max-w-lg">
                Your cooperative. Your property. Your documents — in your pocket.
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/80 max-w-md leading-relaxed">
                Download free. Upload your existing house or land documents. Track savings, loans, and allotments with the clarity you deserve.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#E49E22] text-[#0B1F1A] hover:bg-[#f0b03a] font-semibold h-12 px-6"
                >
                  <a href={DEFAULT_ANDROID_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Get it on Google Play
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/40 bg-white/5 text-white hover:bg-white/15 hover:text-white h-12 px-6"
                >
                  <a href="#upload-docs">
                    <FileUp className="h-5 w-5 mr-2" />
                    Upload your documents
                  </a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-white/55">
                Android · Free · Built for cooperative members across Nigeria
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="flex flex-col items-center"
            >
              <div className="rounded-2xl bg-[#F9F9F7] p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/20">
                <Image
                  src="/branding/smart-housing-app-qr-plain.png"
                  alt="QR code to download Smart Housing from Google Play"
                  width={280}
                  height={280}
                  className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px]"
                  priority
                />
              </div>
              <div className="mt-4 flex items-center gap-2 text-white/85 text-sm">
                <QrCode className="h-4 w-4 text-[#E49E22]" />
                <span>Scan with your phone camera to install</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-20" aria-labelledby="why-download">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 id="why-download" className="text-2xl md:text-3xl font-semibold text-[#276254]">
            Why members download Smart Housing
          </h2>
          <p className="mt-3 text-muted-foreground">
            Everything your cooperative already runs — wallet, property, documents, and marketplace — finally in one app.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {BENEFITS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex gap-4"
            >
              <div className="shrink-0 h-11 w-11 rounded-full bg-[#276254]/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-[#276254]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#0B1F1A]">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section
        id="upload-docs"
        className="relative py-16 md:py-20"
        style={{
          background: "linear-gradient(180deg, #E8F0ED 0%, #F9F9F7 100%)",
        }}
        aria-labelledby="upload-heading"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 text-[#815600] text-sm font-medium mb-3">
                <Landmark className="h-4 w-4" />
                Deed-ready campaign
              </div>
              <h2 id="upload-heading" className="text-2xl md:text-3xl font-semibold text-[#276254]">
                Already own a house or land with your cooperative?
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Stop keeping title papers in drawers and WhatsApp folders. Open the app, go to your property or land
                account, and upload your existing documents today — so your ownership trail lives where your allotment
                lives.
              </p>
              <ul className="mt-6 space-y-3">
                {UPLOAD_ITEMS.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-[#0B1F1A]">
                    <CheckCircle2 className="h-4 w-4 text-[#276254] mt-0.5 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-[280px] shrink-0 rounded-xl bg-[#0B1F1A] text-white p-6">
              <p className="text-[#E49E22] font-semibold text-lg">3 steps</p>
              <ol className="mt-4 space-y-4 text-sm text-white/85">
                <li>
                  <span className="text-[#E49E22] font-medium">1.</span> Install from Google Play or scan the QR
                </li>
                <li>
                  <span className="text-[#E49E22] font-medium">2.</span> Sign in with your member account
                </li>
                <li>
                  <span className="text-[#E49E22] font-medium">3.</span> Open Properties → your slot → Upload deed /
                  document
                </li>
              </ol>
              <Button asChild className="w-full mt-6 bg-[#E49E22] text-[#0B1F1A] hover:bg-[#f0b03a] font-semibold">
                <a href={DEFAULT_ANDROID_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                  Install now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold text-[#276254]">Ready when you are</h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Join members who manage contributions, property, and documents without the paper chase.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Image
            src="/branding/smart-housing-app-qr.png"
            alt="Smart Housing app download QR code with brand frame"
            width={200}
            height={220}
            className="rounded-lg"
          />
          <div className="text-left space-y-3">
            <Button asChild size="lg" className="bg-[#276254] hover:bg-[#1e4d42] w-full sm:w-auto">
              <a href={DEFAULT_ANDROID_PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                Open Google Play
              </a>
            </Button>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              Or share{" "}
              <Link href="/saas/download" className="text-[#276254] underline underline-offset-2">
                smarthousing.com.ng/saas/download
              </Link>{" "}
              with your cooperative.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
