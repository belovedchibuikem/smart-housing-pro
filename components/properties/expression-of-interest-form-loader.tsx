"use client"

import dynamic from "next/dynamic"

const ExpressionOfInterestForm = dynamic(
  () =>
    import("@/components/properties/expression-of-interest-form").then(
      (mod) => mod.ExpressionOfInterestForm,
    ),
  {
    ssr: false,
    loading: () => <div className="py-8 text-sm text-muted-foreground">Loading form…</div>,
  },
)

export function ExpressionOfInterestFormLoader(props: { propertyId?: string; landId?: string }) {
  return <ExpressionOfInterestForm {...props} />
}
