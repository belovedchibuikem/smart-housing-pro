import { Suspense } from "react"
import { ExpressionOfInterestForm } from "@/components/properties/expression-of-interest-form"

type PageParams = Promise<{ id: string }> | { id: string }

async function resolveParams(params: PageParams): Promise<{ id: string }> {
  if (typeof (params as Promise<{ id: string }>).then === "function") {
    return (params as Promise<{ id: string }>).then((value) => value)
  }
  return params as { id: string }
}

export default async function PropertySubscribePage({ params }: { params: PageParams }) {
  const { id } = await resolveParams(params)

  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <ExpressionOfInterestForm propertyId={id} />
      </Suspense>
    </div>
  )
}
