"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Mail, Send, FileText, Inbox, Search, Plus } from "lucide-react"
import Link from "next/link"

export default function MailServicePage() {
  const stats = [
    { label: "Inbox", value: 12, icon: Inbox, href: "/dashboard/mail-service/inbox" },
    { label: "Sent", value: 45, icon: Send, href: "/dashboard/mail-service/outbox" },
    { label: "Drafts", value: 3, icon: FileText, href: "/dashboard/mail-service/drafts" },
  ]

  const recentMessages = [
    {
      id: 1,
      from: "Housing Admin",
      subject: "New Investment Opportunity Available",
      preview: "We are pleased to announce a new investment plan...",
      date: "2024-01-15",
      unread: true,
    },
    {
      id: 2,
      from: "Accounts Department",
      subject: "Monthly Contribution Receipt",
      preview: "Your contribution for January has been received...",
      date: "2024-01-14",
      unread: true,
    },
    {
      id: 3,
      from: "Loan Department",
      subject: "Loan Application Status Update",
      preview: "Your loan application has been approved...",
      date: "2024-01-13",
      unread: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mail Service</h1>
          <p className="text-muted-foreground mt-2">Manage your FRSC housing correspondence</p>
        </div>
        <Link href="/dashboard/mail-service/compose">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Compose Mail
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Messages</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-9" />
          </div>
        </div>

        <div className="space-y-3">
          {recentMessages.map((message) => (
            <Link key={message.id} href={`/dashboard/mail-service/${message.id}`} className="block">
              <div
                className={`p-4 rounded-lg border hover:bg-accent transition-colors ${
                  message.unread ? "bg-accent/50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{message.from}</p>
                        {message.unread && (
                          <Badge variant="default" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm mb-1">{message.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{message.preview}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{message.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link href="/dashboard/mail-service/inbox">
            <Button variant="outline">View All Messages</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
