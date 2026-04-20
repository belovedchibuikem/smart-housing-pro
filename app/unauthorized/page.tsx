"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <ShieldAlert className="h-14 w-14 text-destructive mb-4" aria-hidden />
      <h1 className="text-2xl font-semibold text-center mb-2">Access denied</h1>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        You do not have permission to view this page. If you believe this is a mistake, contact your cooperative
        administrator.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="default">
          <Link href="/admin">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  )
}
