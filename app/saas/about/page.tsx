import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SaaSHeader } from "@/components/saas/saas-header"
import { Target, Users, Award, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Empowering housing cooperatives with technology to serve their members better.",
    },
    {
      icon: Users,
      title: "Member-Focused",
      description: "Every feature we build is designed with cooperative members and administrators in mind.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in security, reliability, and customer support.",
    },
  ]

  const milestones = [
    { year: "2020", event: "CoopHub founded with a vision to digitize housing cooperatives" },
    { year: "2021", event: "Launched our first platform serving 5 cooperatives" },
    { year: "2022", event: "Reached 20 cooperatives and 5,000 members" },
    { year: "2023", event: "Expanded to 45+ cooperatives managing ₦2.5B in funds" },
    { year: "2024", event: "Introduced AI-powered analytics and white-label solutions" },
    { year: "2025", event: "Serving 12,000+ members across Nigeria" },
  ]

  const team = [
    {
      name: "Dr. Oluwaseun Adeyemi",
      role: "Founder & CEO",
      bio: "Former cooperative administrator with 15 years of experience in housing management.",
    },
    {
      name: "Chioma Okafor",
      role: "Chief Technology Officer",
      bio: "Software architect specializing in fintech and multi-tenant SaaS platforms.",
    },
    {
      name: "Ibrahim Musa",
      role: "Head of Customer Success",
      bio: "Dedicated to ensuring every cooperative achieves their goals with CoopHub.",
    },
  ]

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
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title} className="p-6 text-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
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

      {/* Team Section */}
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
              <Card key={member.name} className="p-6 text-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-sm text-primary mb-3">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
