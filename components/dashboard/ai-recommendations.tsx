"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"

interface Recommendation {
  type: string
  title: string
  detail: string
  priority: "low" | "medium" | "high" | string
}

export function AIRecommendations() {
  const [items, setItems] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || ""
        const res = await fetch(`${base}/ai/recommendations`, { headers: { Accept: "application/json" }, cache: "no-store" })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.message || "Failed to load recommendations")
        setItems(data.recommendations || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load recommendations")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <Card className="p-4">Loading recommendations...</Card>
  if (error) return <Card className="p-4 text-red-600">{error}</Card>
  if (!items.length) return <Card className="p-4 text-muted-foreground">No recommendations at this time.</Card>

  return (
    <div className="grid gap-3">
      {items.map((rec, i) => (
        <Card key={i} className="p-4">
          <div className="text-sm uppercase text-muted-foreground">{rec.type}</div>
          <div className="font-semibold">{rec.title}</div>
          <div className="text-sm text-muted-foreground">{rec.detail}</div>
        </Card>
      ))}
    </div>
  )
}


