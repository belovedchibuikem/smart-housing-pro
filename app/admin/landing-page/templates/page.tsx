"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LandingPageTemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  const templates = [
    {
      id: "default",
      name: "Default",
      description: "Original FRSC Housing Management landing page design",
      thumbnail: "/professional-housing-cooperative-website-with-hero.jpg",
      sections: [
        "hero",
        "properties",
        "investments",
        "loans",
        "features",
        "stats",
        "how-it-works",
        "testimonials",
        "cta",
      ],
      theme: {
        primary_color: "#FDB11E",
        secondary_color: "#276254",
        accent_color: "#10b981",
        font_family: "Inter",
      },
    },
    {
      id: "modern",
      name: "Modern",
      description: "Clean and modern design with bold typography and vibrant colors",
      thumbnail: "/modern-website-template.png",
      sections: ["hero", "features", "properties", "investments", "stats", "cta"],
      theme: {
        primary_color: "#FDB11E",
        secondary_color: "#276254",
        accent_color: "#f59e0b",
        font_family: "Poppins",
      },
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional professional layout with elegant styling",
      thumbnail: "/classic-website-template.png",
      sections: ["hero", "features", "properties", "loans", "testimonials", "cta"],
      theme: {
        primary_color: "#FDB11E",
        secondary_color: "#276254",
        accent_color: "#dc2626",
        font_family: "Georgia",
      },
    },
  ]

  const applyTemplate = async () => {
    if (!selectedTemplate) return

    setApplying(true)
    try {
      const template = templates.find((t) => t.id === selectedTemplate)
      if (!template) return

      // Create sections based on template
      const sections = template.sections.map((type, index) => ({
        id: `${type}-${Date.now()}-${index}`,
        type,
        name: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, " "),
        visible: true,
        position: index,
        config: {},
      }))

      const response = await fetch("/api/admin/landing-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections,
          theme: template.theme,
          seo: {
            title: "FRSC Housing Management System",
            description: "Your trusted partner in housing solutions",
            keywords: "housing, cooperative, FRSC, properties, investments, loans",
          },
          is_published: false,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Template applied successfully. You can now customize it in the page builder.",
        })
        router.push("/admin/landing-page")
      }
    } catch (error) {
      console.error("[v0] Error applying template:", error)
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Choose a Template</h1>
        <p className="text-muted-foreground mt-1">Select a template to start building your landing page</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === template.id ? "ring-2 ring-primary" : "hover:shadow-lg"
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="relative">
              <img
                src={template.thumbnail || "/placeholder.svg"}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">{template.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {template.sections.map((section) => (
                  <span key={section} className="text-xs bg-muted px-2 py-1 rounded">
                    {section}
                  </span>
                ))}
              </div>
              <Button className="w-full mt-4" variant={selectedTemplate === template.id ? "default" : "outline"}>
                {selectedTemplate === template.id ? "Selected" : "Select"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-6 flex justify-end">
          <Button size="lg" onClick={applyTemplate} disabled={applying}>
            {applying ? "Applying..." : "Continue with Selected Template"}
          </Button>
        </div>
      )}
    </div>
  )
}
