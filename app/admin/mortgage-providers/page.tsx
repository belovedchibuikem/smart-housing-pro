"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"
import { CreateMortgageProviderModal } from "@/components/admin/mortgage-provider-modal"

interface MortgageProvider {
  id: string
  name: string
  description?: string
  contact_email?: string
  contact_phone?: string
  interest_rate_min?: number
  interest_rate_max?: number
  min_loan_amount?: number
  max_loan_amount?: number
  is_active: boolean
}

export default function MortgageProvidersPage() {
  const [providers, setProviders] = useState<MortgageProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<MortgageProvider | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProviders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: MortgageProvider[] }>(
        `/admin/mortgage-providers?search=${encodeURIComponent(searchQuery)}`
      )
      if (response.success) {
        setProviders(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch mortgage providers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this provider?")) return

    try {
      await apiFetch(`/admin/mortgage-providers/${id}`, { method: "DELETE" })
      toast({
        title: "Success",
        description: "Mortgage provider deleted successfully",
      })
      fetchProviders()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mortgage provider",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (provider: MortgageProvider) => {
    setEditingProvider(provider)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingProvider(null)
    fetchProviders()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mortgage Providers</h1>
          <p className="text-muted-foreground mt-1">Manage mortgage providers and their terms</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Mortgage Provider
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Providers</CardTitle>
              <CardDescription>View and manage all mortgage providers</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : providers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No mortgage providers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Loan Amount Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div className="font-medium">{provider.name}</div>
                      {provider.description && (
                        <div className="text-sm text-muted-foreground mt-1">{provider.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {provider.contact_email && (
                        <div className="text-sm">{provider.contact_email}</div>
                      )}
                      {provider.contact_phone && (
                        <div className="text-sm text-muted-foreground">{provider.contact_phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {provider.interest_rate_min !== null && provider.interest_rate_max !== null ? (
                        <span>
                          {provider.interest_rate_min}% - {provider.interest_rate_max}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {provider.min_loan_amount !== null && provider.max_loan_amount !== null ? (
                        <span>
                          ₦{provider.min_loan_amount.toLocaleString()} - ₦{provider.max_loan_amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.is_active ? "default" : "secondary"}>
                        {provider.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(provider)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(provider.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateMortgageProviderModal
        open={isModalOpen}
        onClose={handleModalClose}
        provider={editingProvider}
      />
    </div>
  )
}

