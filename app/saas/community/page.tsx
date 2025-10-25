import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, MessageCircle, ThumbsUp, Eye, ArrowLeft } from "lucide-react"

export default function CommunityPage() {
  const discussions = [
    {
      id: 1,
      question: "How can we improve member engagement in our housing cooperative?",
      author: {
        name: "Adebayo Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Cooperative Manager",
      },
      responses: 12,
      likes: 24,
      views: 156,
      tags: ["engagement", "members", "best-practices"],
      topAnswer: {
        author: "Sarah Okonkwo",
        content:
          "Regular communication is key! We implemented monthly newsletters, quarterly town halls, and a mobile app for instant updates. Member satisfaction increased by 65% in 6 months.",
        likes: 18,
      },
      otherAnswers: [
        {
          author: "Chukwuma Eze",
          content:
            "Consider gamification! We introduced a points system for participation in meetings and events. Members can redeem points for discounts on contributions.",
          likes: 12,
        },
        {
          author: "Fatima Bello",
          content:
            "Create special interest groups within your cooperative. We have groups for young families, retirees, and first-time homeowners. Each group has unique needs and engagement strategies.",
          likes: 9,
        },
      ],
    },
    {
      id: 2,
      question: "What's the best way to handle late contribution payments?",
      author: {
        name: "Ibrahim Musa",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Finance Officer",
      },
      responses: 8,
      likes: 19,
      views: 203,
      tags: ["finance", "contributions", "payments"],
      topAnswer: {
        author: "Grace Nwosu",
        content:
          "Implement a grace period of 5 days with automated reminders. After that, apply a small late fee (2-3%). Most importantly, have a conversation with members facing difficulties - often there are underlying issues that need addressing.",
        likes: 15,
      },
      otherAnswers: [
        {
          author: "Oluwaseun Adeyemi",
          content:
            "We use a three-tier system: friendly reminder at 3 days, formal notice at 7 days, and late fee at 14 days. This gives members time while maintaining accountability.",
          likes: 10,
        },
      ],
    },
    {
      id: 3,
      question: "How do you manage property allocation fairly?",
      author: {
        name: "Blessing Okoro",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Property Manager",
      },
      responses: 15,
      likes: 31,
      views: 287,
      tags: ["property", "allocation", "fairness"],
      topAnswer: {
        author: "Tunde Bakare",
        content:
          "We use a transparent point-based system: years of membership (40%), contribution consistency (30%), family size (20%), and special circumstances (10%). All members can see the criteria and their scores.",
        likes: 22,
      },
      otherAnswers: [
        {
          author: "Amina Yusuf",
          content:
            "Lottery system works well for us! Members who meet minimum requirements (2 years membership, 80% contribution rate) are entered into a draw. It's completely fair and transparent.",
          likes: 14,
        },
        {
          author: "Emeka Obi",
          content:
            "We combine seniority with need assessment. Long-standing members get priority, but we also consider urgent housing needs like growing families or health issues.",
          likes: 11,
        },
      ],
    },
    {
      id: 4,
      question: "What technology solutions have improved your cooperative operations?",
      author: {
        name: "Ngozi Adekunle",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "IT Coordinator",
      },
      responses: 10,
      likes: 28,
      views: 194,
      tags: ["technology", "automation", "efficiency"],
      topAnswer: {
        author: "Yemi Oladipo",
        content:
          "CoopHub has been a game-changer! Automated payment reminders, digital document management, and real-time reporting saved us 20+ hours per week. Members love the mobile app for checking their status anytime.",
        likes: 20,
      },
      otherAnswers: [
        {
          author: "Kemi Ajayi",
          content:
            "We integrated WhatsApp Business API for instant communication. Members get payment confirmations, meeting reminders, and important updates directly on their phones.",
          likes: 13,
        },
      ],
    },
    {
      id: 5,
      question: "How can we make our loan approval process faster?",
      author: {
        name: "Daniel Okafor",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Loan Officer",
      },
      responses: 9,
      likes: 22,
      views: 178,
      tags: ["loans", "approval", "efficiency"],
      topAnswer: {
        author: "Funmi Adebisi",
        content:
          "Digitize everything! We moved from paper applications to online forms with automatic eligibility checks. Approval time dropped from 2 weeks to 3 days. Also, create clear criteria so members know upfront if they qualify.",
        likes: 17,
      },
      otherAnswers: [
        {
          author: "Bola Taiwo",
          content:
            "Set up a loan committee that meets weekly instead of monthly. We also pre-approve members based on their contribution history, so they can access funds immediately when needed.",
          likes: 11,
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/saas" className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <span>CoopHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/saas#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="/saas#plans" className="text-sm font-medium hover:text-primary transition-colors">
              Plans
            </Link>
            <Link href="/saas/community" className="text-sm font-medium text-primary">
              Community
            </Link>
            <Link href="/saas/about" className="text-sm font-medium hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/super-admin" className="text-sm font-medium hover:text-primary transition-colors">
              Login
            </Link>
          </nav>
          <Button asChild>
            <Link href="/onboard">Start Free Trial</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/saas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Discussions</h1>
            <p className="text-lg text-muted-foreground">
              Learn from experienced cooperative managers and share your insights on smart housing solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Discussions */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-6">
          {discussions.map((discussion) => (
            <Card key={discussion.id} className="p-6 hover:shadow-lg transition-shadow">
              {/* Question */}
              <div className="mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={discussion.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{discussion.author.name}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{discussion.author.role}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-balance">{discussion.question}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground ml-13">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{discussion.responses} responses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{discussion.likes} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{discussion.views} views</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 ml-13">
                  {discussion.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Top Answer */}
              <div className="border-l-2 border-primary pl-4 ml-6 mb-3 bg-muted/30 p-4 rounded-r-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary">Top Answer</Badge>
                  <span className="text-sm font-semibold">{discussion.topAnswer.author}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{discussion.topAnswer.content}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <ThumbsUp className="h-3 w-3" />
                  <span>{discussion.topAnswer.likes} people found this helpful</span>
                </div>
              </div>

              {/* Other Answers Preview */}
              {discussion.otherAnswers.map((answer, idx) => (
                <div key={idx} className="border-l-2 border-muted pl-4 ml-6 mb-2 p-3 rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold">{answer.author}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{answer.content}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ThumbsUp className="h-3 w-3" />
                    <span>{answer.likes} likes</span>
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a Question?</h2>
          <p className="text-lg mb-6 opacity-90">Join our community and get answers from experienced professionals.</p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/onboard">Join CoopHub Today</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
