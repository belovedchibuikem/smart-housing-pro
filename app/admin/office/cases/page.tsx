"use client"

import { Suspense } from "react"
import OfficeCasesPage from "./cases-client"

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading case desk…</div>}>
      <OfficeCasesPage />
    </Suspense>
  )
}
