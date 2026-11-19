"use client"

import dynamic from "next/dynamic"

const DownloadView = dynamic(() => import("./download-view"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-muted-foreground">Loading…</div>
  ),
})

export function DownloadPageClient() {
  return <DownloadView />
}
