import { Suspense } from "react"
import { ExpressionOfInterestForm } from "@/components/properties/expression-of-interest-form"

export default function PropertySubscribePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ExpressionOfInterestForm propertyId={params.id} />
      </Suspense>
    </div>
  )
}
