import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Reply, Forward, Trash2, Archive, Star } from "lucide-react"
import Link from "next/link"

export default function AdminMessageDetailPage({ params }: { params: { id: string } }) {
  // Mock data - replace with actual data fetching
  const message = {
    id: params.id,
    from: "John Doe",
    fromEmail: "john.doe@example.com",
    to: "FRSC Housing Admin",
    subject: "Property Payment Inquiry",
    date: "January 12, 2024",
    time: "10:30 AM",
    category: "Property",
    isStarred: false,
    content: `Dear FRSC Housing Team,

I hope this message finds you well. I am writing to inquire about the payment schedule for the property I recently expressed interest in (Property ID: APO-2024-001).

I would like to know:
1. What are the available payment options?
2. Can I use a combination of cash and cooperative deduction?
3. What is the timeline for completing the payment?
4. Are there any additional fees I should be aware of?

I am very interested in proceeding with this property and would appreciate your guidance on the next steps.

Thank you for your assistance.

Best regards,
John Doe
Member ID: FRSC-2024-1234`,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/mail-service/inbox">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{message.subject}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Star className={message.isStarred ? "fill-yellow-400 text-yellow-400" : ""} />
          </Button>
          <Button variant="outline" size="icon">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{message.from}</CardTitle>
                <Badge variant="outline">{message.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{message.fromEmail}</p>
              <p className="text-sm text-muted-foreground">To: {message.to}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{message.date}</p>
              <p className="text-sm text-muted-foreground">{message.time}</p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.content}</pre>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild>
          <Link href={`/admin/mail-service/compose?reply=${message.id}`}>
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/admin/mail-service/compose?forward=${message.id}`}>
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Link>
        </Button>
      </div>
    </div>
  )
}
