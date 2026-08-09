"use client"

import { Suspense } from "react"
import OfficeCasesPage from "../cases/cases-client"

export default function ContributionsOfficePage() {
  return (
    <Suspense fallback={<div className="p-8 text-muted-foreground">Loading Contributions Office…</div>}>
      <OfficeCasesPage
        title="Contributions Office"
        description="Stoppage of deduction, schedules, arrears queries, and contribution-related member correspondence. Finance posting remains under Contributions."
        orgUnitCode="CONTRIB"
        defaultCaseType="stoppage_of_deduction"
      />
    </Suspense>
  )
}
