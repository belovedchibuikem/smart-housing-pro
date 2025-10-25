"use client"

import React from "react"
import { Card } from "@/components/ui/card"

type Item = { label: string; value: number }

export function SimpleBarChart({ data, title }: { data: Item[]; title?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <Card className="p-4">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="grid grid-cols-4 items-center gap-2">
            <div className="col-span-1 text-sm text-muted-foreground truncate" title={d.label}>
              {d.label}
            </div>
            <div className="col-span-3">
              <div className="h-3 bg-muted rounded">
                <div
                  className="h-3 bg-primary rounded"
                  style={{ width: `${(d.value / max) * 100}%` }}
                  aria-label={`${d.label}: ${d.value}`}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{d.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}


