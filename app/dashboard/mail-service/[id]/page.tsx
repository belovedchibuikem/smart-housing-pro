"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Reply, Forward, Trash2, Download } from "lucide-react"
import Link from "next/link"

export default function MessageDetailPage() {
  const message = {
    id: 1,
    from: "Housing Admin",
    to: "You",
    subject: "New Investment Opportunity Available",
    date: "January 15, 2024 at 10:30 AM",
    category: "Investment",
    content: `Dear Member,

We are pleased to announce a new investment opportunity for Q1 2024. This investment plan offers attractive returns and is designed to help our members grow their wealth while supporting the cooperative's housing projects.

Investment Details:
- Investment Plan: Housing Development Project Phase 3
- Minimum Investment: ₦100,000
- Maximum Investment: ₦5,000,000
- Expected ROI: 15% per annum
- Investment Window: January 15 - March 31, 2024
- Moratorium Period: 6 months
- ROI Payment Mode: Quarterly

Key Features:
1. Multiple investment installments allowed
2. Investment certificate issued upon completion
3. Secure and transparent investment tracking
4. Regular updates on project progress

You can invest using your contribution balance or make direct payments through any of our supported payment gateways (Paystack, Remita, Bank Transfer, USSD, or Wallet).

To participate in this investment opportunity, please visit the Properties & Investments section of your dashboard.

For any questions or clarifications, please feel free to reply to this message.

Best regards,
FRSC Housing Cooperative
Housing Admin Department`,
    attachments: [
      { name: "Investment_Plan_Details.pdf", size: "245 KB" },
      { name: "Project_Overview.pdf", size: "1.2 MB" },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/mail-service/inbox">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{message.subject}</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-lg">{message.from}</p>
                <Badge variant="outline">{message.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">To: {message.to}</p>
              <p className="text-sm text-muted-foreground">{message.date}</p>
            </div>
          </div>

          <Separator />

          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          </div>

          {message.attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-3">Attachments ({message.attachments.length})</p>
                <div className="space-y-2">
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-accent/50">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                          <Download className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-muted-foreground">{attachment.size}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-3">
            <Link href="/dashboard/mail-service/compose">
              <Button>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </Link>
            <Button variant="outline">
              <Forward className="h-4 w-4 mr-2" />
              Forward
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
