"use client"

import { StatutoryChargeDefinitionForm } from "@/components/admin/statutory-charge-definition-form"

export default function NewStatutoryChargeDefinitionPage() {
  return (
    <main className="flex-1 p-6 lg:p-8">
      <StatutoryChargeDefinitionForm mode="create" />
    </main>
  )
}
