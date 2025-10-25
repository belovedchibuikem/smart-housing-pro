"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { SimpleBarChart } from "@/components/charts/simple-bar"

export default function SuperAdminReportsPage() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000/api"
        const res = await fetch(`${base}/reports/dashboard`, { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) throw new Error(json?.message || "Failed to load")
        setData(json)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  const series = (data?.series || []) as Array<{ label: string; value: number }>
  return (
    <div className="p-6">
      <SimpleBarChart data={series} title="Platform Reports" />
    </div>
  )
}


