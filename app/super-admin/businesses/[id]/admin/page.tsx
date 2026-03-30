"use client"

import { use } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function BusinessAdminPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const adminUrl = `/admin?business_id=${encodeURIComponent(id)}`

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/super-admin/businesses/${id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to business
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Tenant admin</CardTitle>
          <CardDescription>
            Open this business admin dashboard. You may need to sign in with a super-admin or tenant admin account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground break-all">
            Target URL: <code className="text-xs bg-muted px-1 py-0.5 rounded">{adminUrl}</code>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={adminUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in new tab
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={adminUrl}>Open in this tab</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
