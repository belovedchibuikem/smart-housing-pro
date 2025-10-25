"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface Domain {
  id: string
  domain: string
  status: 'verified' | 'pending' | 'failed'
  is_primary: boolean
  created_at: string
  verification_record?: string
}

export default function BusinessDomainsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [newDomain, setNewDomain] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const { isLoading, data, error, loadData } = usePageLoading<{ domains: Domain[] }>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ domains: Domain[] }>(`/super-admin/businesses/${resolvedParams.id}/domains`)
      return response
    })
  }, [loadData, resolvedParams.id])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading) return <div className="p-6">Loading domains...</div>

  const domains = data?.domains || []

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return
    
    setIsAdding(true)
    try {
      await apiFetch(`/super-admin/businesses/${resolvedParams.id}/domains`, {
        method: 'POST',
        body: { domain: newDomain }
      })
      setNewDomain("")
      // Reload domains
      await loadData(async () => {
        const response = await apiFetch<{ domains: Domain[] }>(`/super-admin/businesses/${resolvedParams.id}/domains`)
        return response
      })
    } catch (error) {
      console.error('Failed to add domain:', error)
      alert(`Failed to add domain: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAdding(false)
    }
  }

  const handleVerify = async (domainId: string) => {
    try {
      await apiFetch(`/super-admin/businesses/${resolvedParams.id}/domains/${domainId}/verify`, {
        method: 'POST'
      })
      // Reload domains
      await loadData(async () => {
        const response = await apiFetch<{ domains: Domain[] }>(`/super-admin/businesses/${resolvedParams.id}/domains`)
        return response
      })
    } catch (error) {
      console.error('Failed to verify domain:', error)
      alert(`Failed to verify domain: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return
    
    try {
      await apiFetch(`/super-admin/businesses/${resolvedParams.id}/domains/${domainId}`, {
        method: 'DELETE'
      })
      // Reload domains
      await loadData(async () => {
        const response = await apiFetch<{ domains: Domain[] }>(`/super-admin/businesses/${resolvedParams.id}/domains`)
        return response
      })
    } catch (error) {
      console.error('Failed to delete domain:', error)
      alert(`Failed to delete domain: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/super-admin/businesses/${resolvedParams.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Custom Domains</h1>
          <p className="text-muted-foreground mt-1">Manage custom domains for this business</p>
        </div>
      </div>

      {/* Add New Domain */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add Custom Domain</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input placeholder="example.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
          </div>
          <Button onClick={handleAddDomain} disabled={isAdding || !newDomain.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            {isAdding ? "Adding..." : "Add Domain"}
          </Button>
        </div>
      </Card>

      {/* Existing Domains */}
      <div className="space-y-4">
        {domains.map((domain) => (
          <Card key={domain.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{domain.domain}</h3>
                  {domain.is_primary && <Badge>Primary</Badge>}
                  {domain.status === "verified" ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : domain.status === "pending" ? (
                    <Badge variant="secondary">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Added on {new Date(domain.created_at).toLocaleDateString()}
                </p>

                {domain.status === "pending" && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">DNS Configuration Required</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-20">Type:</span>
                        <span className="font-mono">CNAME</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-20">Name:</span>
                        <span className="font-mono">@</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground w-20">Value:</span>
                        <span className="font-mono">cname.yourplatform.com</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {domain.status === "pending" && (
                  <Button variant="outline" size="sm" onClick={() => handleVerify(domain.id)}>
                    Verify
                  </Button>
                )}
                {!domain.is_primary && (
                  <Button variant="outline" size="sm" onClick={() => handleDelete(domain.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
