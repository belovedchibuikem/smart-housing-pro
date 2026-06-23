"use client"

import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MemberDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive" aria-hidden />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Could not load member</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          {error.message || "Something went wrong while loading this member profile."}
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/members">Back to members</Link>
        </Button>
      </div>
    </div>
  )
}
