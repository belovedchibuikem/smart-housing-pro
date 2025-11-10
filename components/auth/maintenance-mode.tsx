"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface MaintenanceModeProps {
  siteName?: string
}

export function MaintenanceMode({ siteName = "FRSC HMS" }: MaintenanceModeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <CardTitle>System Under Maintenance</CardTitle>
          </div>
          <CardDescription>
            {siteName} is currently undergoing scheduled maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're working hard to improve your experience. Please check back soon.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            If you have urgent questions, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

