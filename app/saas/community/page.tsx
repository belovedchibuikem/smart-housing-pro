"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, MessageCircle, ThumbsUp, Eye, ArrowLeft } from "lucide-react"
import { SaaSHeader } from "@/components/saas/saas-header"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"

interface Discussion {
  id: string
  question: string
  author: {
    name: string
    role: string | null
    avatar: string | null
  }
  responses: number
  likes: number
  views: number
  tags: string[]
  top_answer: {
    author: string
    content: string
    likes: number
  } | null
  other_answers: Array<{
    author: string
    content: string
    likes: number
  }>
}

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ success: boolean; discussions: Discussion[] }>("/public/saas/discussions")
      .then((response) => {
        if (response.success) {
          // Transform API response to match component structure
          const transformed = response.discussions.map((d: any) => ({
            id: d.id,
            question: d.question,
            author: {
              name: d.author?.name || d.author_name,
              role: d.author?.role || d.author_role,
              avatar: d.author?.avatar || d.author_avatar_url,
            },
            responses: d.responses || d.responses_count,
            likes: d.likes || d.likes_count,
            views: d.views || d.views_count,
            tags: d.tags || [],
            top_answer: d.top_answer,
            other_answers: d.other_answers || [],
          }))
          setDiscussions(transformed)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <SaaSHeader />

      {/* Hero Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/saas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Community Discussions
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance">
              Join the conversation and learn from other housing cooperative administrators.
            </p>
          </div>
        </div>
      </section>

      {/* Discussions */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">Loading discussions...</div>
          ) : discussions.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No discussions yet</h3>
              <p className="text-muted-foreground">Check back soon for community discussions.</p>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card key={discussion.id} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src={discussion.author.avatar || undefined} />
                    <AvatarFallback>{discussion.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{discussion.author.name}</h3>
                      {discussion.author.role && (
                        <span className="text-sm text-muted-foreground">• {discussion.author.role}</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-3">{discussion.question}</h2>
                    {discussion.tags && discussion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {discussion.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {discussion.responses} responses
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {discussion.likes} likes
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {discussion.views} views
                      </div>
                    </div>
                  </div>
                </div>

                {discussion.top_answer && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-500">Top Answer</Badge>
                          <span className="text-sm font-medium">{discussion.top_answer.author}</span>
                        </div>
                        <p className="text-muted-foreground">{discussion.top_answer.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          {discussion.top_answer.likes} likes
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {discussion.other_answers && discussion.other_answers.length > 0 && (
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">
                      {discussion.other_answers.length} Other Answer{discussion.other_answers.length > 1 ? "s" : ""}
                    </h4>
                    {discussion.other_answers.slice(0, 2).map((answer, idx) => (
                      <div key={idx} className="pl-4 border-l-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">{answer.author}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{answer.content}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" />
                          {answer.likes} likes
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
