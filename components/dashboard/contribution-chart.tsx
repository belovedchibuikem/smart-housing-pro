"use client"

import { Card } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface MonthlyTrend {
  month: string
  contributions: number
  loans: number
  investments: number
}

interface ContributionChartProps {
  data?: MonthlyTrend[]
  loading?: boolean
}

export function ContributionChart({ data, loading }: ContributionChartProps) {
  // Transform API data to chart format
  const chartData = data?.map((item) => {
    // Extract short month name (e.g., "Jan 2024" -> "Jan")
    const monthShort = item.month.split(' ')[0] || item.month.substring(0, 3)
    return {
      month: monthShort,
      amount: item.contributions || 0,
    }
  }) || []

  // If no data, show empty state or placeholder
  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </Card>
    )
  }

  if (!data || chartData.length === 0) {
    return (
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Contribution History</h2>
          <p className="text-sm text-muted-foreground">Your monthly contributions over the past months</p>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          <p>No contribution data available</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Contribution History</h2>
        <p className="text-sm text-muted-foreground">Your monthly contributions over the past {chartData.length} months</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number) => `₦${Number(value).toLocaleString()}`}
          />
          <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
