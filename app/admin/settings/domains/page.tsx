"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Check, AlertCircle, ExternalLink, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CustomDomainsPage() {
  const [showAddDomain, setShowAddDomain] = useState(false)
  const [newDomain, setNewDomain] = useState("")

  const domains = [
    {
      id: "1",
      domain: "myhousing.com",
      is_verified: true,
      is_primary: true,
      ssl_status: "active",
      verified_at: "2024-01-15",
    },
    {
      id: "2",
      domain: "housing.mycompany.com",
      is_verified: false,
      is_primary: false,
      ssl_status: "pending",
      verified_at: null,
    },
  ]

  const dnsRecords = [
    { type: "A", name: "@", value: "76.76.21.21" },
    { type: "CNAME", name: "www", value: "cname.frschousing.com" },
    { type: "TXT", name: "_frsc-verification", value: "frsc-verify-abc123xyz" },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Domains</h1>
          <p className="text-muted-foreground mt-1">Manage custom domains for your landing page</p>
        </div>
        <Button onClick={() => setShowAddDomain(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {/* Default Subdomain */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">yourcompany.frschousing.com</h3>
              <Badge variant="secondary">Default</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Your default subdomain is always active</p>
          </div>
          <Button variant="outline" asChild>
            <a href="https://yourcompany.frschousing.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit
            </a>
          </Button>
        </div>
      </Card>

      {/* Custom Domains List */}
      <div className="space-y-4">
        {domains.map((domain) => (
          <Card key={domain.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{domain.domain}</h3>
                  {domain.is_primary && <Badge>Primary</Badge>}
                  {domain.is_verified ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending Verification
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  SSL: <span className="capitalize">{domain.ssl_status}</span>
                  {domain.verified_at && ` • Verified on ${domain.verified_at}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {domain.is_verified && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`https://${domain.domain}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  Remove
                </Button>
              </div>
            </div>

            {!domain.is_verified && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Configure your DNS records to verify this domain:</p>
                  <div className="space-y-2 mt-3">
                    {dnsRecords.map((record, index) => (
                      <div key={index} className="bg-muted p-3 rounded-md font-mono text-sm">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <span className="text-muted-foreground">Type:</span> {record.type}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Name:</span> {record.name}
                          </div>
                          <div className="col-span-2 flex items-center justify-between">
                            <div className="truncate">
                              <span className="text-muted-foreground">Value:</span> {record.value}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(record.value)}
                              className="ml-2"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4" size="sm">
                    Verify DNS Configuration
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </Card>
        ))}
      </div>

      {/* Add Domain Modal */}
      {showAddDomain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Custom Domain</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Domain Name</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-sm text-muted-foreground mt-1">Enter your domain without http:// or https://</p>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  After adding your domain, you'll need to configure DNS records to verify ownership.
                </AlertDescription>
              </Alert>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <Button className="flex-1" onClick={() => setShowAddDomain(false)}>
                Add Domain
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAddDomain(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
