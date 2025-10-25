"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Globe, Plus, CheckCircle2, XCircle, Clock, AlertCircle, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DomainRequest {
  id: string
  domain_name: string
  subdomain?: string
  full_domain: string
  status: "pending" | "verifying" | "verified" | "active" | "failed" | "rejected"
  status_message?: string
  verification_token: string
  dns_records: Array<{ type: string; name: string; value: string }>
  verified_at?: string
  requested_at: string
  ssl_status?: string
}

export default function CustomDomainsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [domains, setDomains] = useState<DomainRequest[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newDomain, setNewDomain] = useState({ domain_name: "", subdomain: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/admin/custom-domains")
      const data = await response.json()
      setDomains(data.domains || [])
    } catch (error) {
      console.error("[v0] Error fetching domains:", error)
      toast({
        title: "Error",
        description: "Failed to load custom domains",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddDomain = async () => {
    if (!newDomain.domain_name) {
      toast({
        title: "Error",
        description: "Please enter a domain name",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/admin/custom-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDomain),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Custom domain request created successfully",
        })
        setShowAddDialog(false)
        setNewDomain({ domain_name: "", subdomain: "" })
        fetchDomains()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("[v0] Error adding domain:", error)
      toast({
        title: "Error",
        description: "Failed to create custom domain request",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: "secondary", icon: Clock },
      verifying: { variant: "default", icon: RefreshCw },
      verified: { variant: "default", icon: CheckCircle2 },
      active: { variant: "default", icon: CheckCircle2 },
      failed: { variant: "destructive", icon: XCircle },
      rejected: { variant: "destructive", icon: XCircle },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading custom domains...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Domains</h1>
          <p className="text-muted-foreground mt-2">Manage custom domain names for your platform</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Request a custom domain for your platform. You'll need to configure DNS records after submission.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="domain-name">Domain Name</Label>
                <Input
                  id="domain-name"
                  placeholder="example.com"
                  value={newDomain.domain_name}
                  onChange={(e) => setNewDomain({ ...newDomain, domain_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain (Optional)</Label>
                <Input
                  id="subdomain"
                  placeholder="app"
                  value={newDomain.subdomain}
                  onChange={(e) => setNewDomain({ ...newDomain, subdomain: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the root domain, or enter a subdomain like "app" for app.example.com
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDomain} disabled={submitting}>
                {submitting ? "Creating..." : "Create Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Custom domains require DNS configuration. After adding a domain, you'll receive DNS records to configure with
          your domain registrar.
        </AlertDescription>
      </Alert>

      {domains.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Custom Domains</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't added any custom domains yet. Click "Add Domain" to get started.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Domain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {domain.full_domain}
                    </CardTitle>
                    <CardDescription>Requested on {new Date(domain.requested_at).toLocaleDateString()}</CardDescription>
                  </div>
                  {getStatusBadge(domain.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {domain.status_message && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{domain.status_message}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <h4 className="font-semibold mb-3">DNS Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add these DNS records to your domain registrar to verify ownership and activate your custom domain.
                  </p>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead className="w-[100px]">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {domain.dns_records.map((record, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{record.type}</TableCell>
                            <TableCell className="font-mono text-sm">{record.name}</TableCell>
                            <TableCell className="font-mono text-sm max-w-md truncate">{record.value}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(record.value)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Verification Token</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono truncate">
                        {domain.verification_token}
                      </code>
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(domain.verification_token)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {domain.ssl_status && (
                    <div>
                      <Label className="text-sm text-muted-foreground">SSL Status</Label>
                      <div className="mt-1">
                        <Badge variant={domain.ssl_status === "active" ? "default" : "secondary"}>
                          {domain.ssl_status.charAt(0).toUpperCase() + domain.ssl_status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {domain.verified_at && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Domain verified on {new Date(domain.verified_at).toLocaleString()}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Check Verification
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
