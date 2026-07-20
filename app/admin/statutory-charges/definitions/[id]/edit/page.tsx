"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { getStatutoryChargeDefinition } from "@/lib/api/client"
import { StatutoryChargeDefinitionForm } from "@/components/admin/statutory-charge-definition-form"
import { useToast } from "@/hooks/use-toast"

export default function EditStatutoryChargeDefinitionPage() {
  const params = useParams()
  const id = String(params.id || "")
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [initial, setInitial] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    getStatutoryChargeDefinition(id)
      .then((res) => {
        if (res.success) setInitial(res.data)
        else throw new Error("Not found")
      })
      .catch((error: any) => {
        toast({
          title: "Error",
          description: error?.message || "Failed to load definition",
          variant: "destructive",
        })
      })
      .finally(() => setLoading(false))
  }, [id, toast])

  if (loading) {
    return (
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  if (!initial) {
    return (
      <main className="flex-1 p-6 lg:p-8">
        <p className="text-muted-foreground">Definition not found</p>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6 lg:p-8">
      <StatutoryChargeDefinitionForm mode="edit" definitionId={id} initial={initial} />
    </main>
  )
}
