"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", amount: 50000 },
  { month: "Feb", amount: 50000 },
  { month: "Mar", amount: 75000 },
  { month: "Apr", amount: 50000 },
  { month: "May", amount: 100000 },
  { month: "Jun", amount: 50000 },
  { month: "Jul", amount: 50000 },
  { month: "Aug", amount: 50000 },
  { month: "Sep", amount: 75000 },
  { month: "Oct", amount: 50000 },
  { month: "Nov", amount: 50000 },
  { month: "Dec", amount: 50000 },
]

export function ContributionChart() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Contribution History</h2>
        <p className="text-sm text-muted-foreground">Your monthly contributions over the past year</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number) => `₦${value.toLocaleString()}`}
          />
          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
