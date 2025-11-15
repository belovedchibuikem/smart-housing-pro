"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Target, Users, Award, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"

interface Value {
  id: string
  title: string
  description: string
  icon: string | null
}

interface Milestone {
  id: string
  year: string
  event: string
  icon: string | null
}

interface TeamMember {
  id: string
  name: string
  role: string
  bio: string | null
  avatar_url: string | null
}

export default function AboutPage() {
  const [values, setValues] = useState<Value[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiFetch<{ success: boolean; values: Value[] }>("/public/saas/values").catch(() => ({
        success: false,
        values: [],
      })),
      apiFetch<{ success: boolean; milestones: Milestone[] }>("/public/saas/milestones").catch(() => ({
        success: false,
        milestones: [],
      })),
      apiFetch<{ success: boolean; team_members: TeamMember[] }>("/public/saas/team").catch(() => ({
        success: false,
        team_members: [],
      })),
    ]).then(([valuesRes, milestonesRes, teamRes]) => {
      if (valuesRes.success) {
        setValues(valuesRes.values)
      }
      if (milestonesRes.success) {
        setMilestones(milestonesRes.milestones)
      }
      if (teamRes.success) {
        setTeam(teamRes.team_members)
      }
      setIsLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              Building the Future of Housing Cooperatives
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance">
              We're on a mission to make housing cooperative management simple, transparent, and accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              CoopHub was born from a simple observation: housing cooperatives across Nigeria were struggling with
              outdated, manual processes that made it difficult to serve their members effectively.
            </p>
            <p>
              Our founder, Dr. Oluwaseun Adeyemi, spent over a decade managing a large housing cooperative and
              experienced firsthand the challenges of tracking contributions, managing loan applications, and
              maintaining transparent communication with thousands of members.
            </p>
            <p>
              In 2020, we set out to build a platform that would solve these problems once and for all. Today, CoopHub
              serves over 45 cooperatives and 12,000 members, managing billions of naira in contributions and helping
              thousands of families achieve their dream of homeownership.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground text-lg">The principles that guide everything we do.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">
                No values available
              </div>
            ) : (
              values.map((value) => (
                <Card key={value.id} className="p-6 text-center">
                  {value.icon && (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl">
                      {value.icon}
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      {milestones.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
            <div className="space-y-8">
              {milestones.map((milestone, idx) => (
                <div key={milestone.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                      {milestone.icon ? (
                        <span className="text-lg">{milestone.icon}</span>
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                    {idx < milestones.length - 1 && <div className="w-0.5 h-full bg-border mt-2" />}
                  </div>
                  <div className="pb-8">
                    <div className="text-2xl font-bold text-primary mb-1">{milestone.year}</div>
                    <p className="text-muted-foreground">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {team.length > 0 && (
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground text-lg">
                Passionate professionals dedicated to your cooperative's success.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {team.map((member) => (
                <Card key={member.id} className="p-6 text-center">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="h-24 w-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl font-bold text-primary">{member.name.charAt(0)}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-primary mb-3">{member.role}</p>
                  {member.bio && <p className="text-sm text-muted-foreground">{member.bio}</p>}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Us on This Journey</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Be part of the cooperative revolution. Start your free trial today.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/onboard">Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
