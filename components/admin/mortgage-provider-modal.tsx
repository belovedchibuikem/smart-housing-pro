"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface MortgageProvider {
  id?: string
  name: string
  description?: string
  contact_email?: string
  contact_phone?: string
  website?: string
  address?: string
  interest_rate_min?: number
  interest_rate_max?: number
  min_loan_amount?: number
  max_loan_amount?: number
  min_tenure_years?: number
  max_tenure_years?: number
  is_active?: boolean
}

interface CreateMortgageProviderModalProps {
  open: boolean
  onClose: () => void
  provider?: MortgageProvider | null
}

export function CreateMortgageProviderModal({ open, onClose, provider }: CreateMortgageProviderModalProps) {
  const [formData, setFormData] = useState<Partial<MortgageProvider>>({
    name: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    address: "",
    interest_rate_min: undefined,
    interest_rate_max: undefined,
    min_loan_amount: undefined,
    max_loan_amount: undefined,
    min_tenure_years: undefined,
    max_tenure_years: undefined,
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (provider) {
      setFormData(provider)
    } else {
      setFormData({
        name: "",
        description: "",
        contact_email: "",
        contact_phone: "",
        website: "",
        address: "",
        interest_rate_min: undefined,
        interest_rate_max: undefined,
        min_loan_amount: undefined,
        max_loan_amount: undefined,
        min_tenure_years: undefined,
        max_tenure_years: undefined,
        is_active: true,
      })
    }
  }, [provider, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = { ...formData }
      
      if (provider?.id) {
        await apiFetch(`/admin/mortgage-providers/${provider.id}`, {
          method: "PUT",
          body: payload,
        })
        toast({
          title: "Success",
          description: "Mortgage provider updated successfully",
        })
      } else {
        await apiFetch("/admin/mortgage-providers", {
          method: "POST",
          body: payload,
        })
        toast({
          title: "Success",
          description: "Mortgage provider created successfully",
        })
      }
      
      onClose()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save mortgage provider",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{provider ? "Edit Mortgage Provider" : "Create Mortgage Provider"}</DialogTitle>
          <DialogDescription>
            {provider ? "Update the mortgage provider details" : "Add a new mortgage provider to the system"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email || ""}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone || ""}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ""}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest_rate_min">Min Interest Rate (%)</Label>
              <Input
                id="interest_rate_min"
                type="number"
                step="0.01"
                value={formData.interest_rate_min || ""}
                onChange={(e) => setFormData({ ...formData, interest_rate_min: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interest_rate_max">Max Interest Rate (%)</Label>
              <Input
                id="interest_rate_max"
                type="number"
                step="0.01"
                value={formData.interest_rate_max || ""}
                onChange={(e) => setFormData({ ...formData, interest_rate_max: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_loan_amount">Min Loan Amount (₦)</Label>
              <Input
                id="min_loan_amount"
                type="number"
                value={formData.min_loan_amount || ""}
                onChange={(e) => setFormData({ ...formData, min_loan_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_loan_amount">Max Loan Amount (₦)</Label>
              <Input
                id="max_loan_amount"
                type="number"
                value={formData.max_loan_amount || ""}
                onChange={(e) => setFormData({ ...formData, max_loan_amount: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_tenure_years">Min Tenure (Years)</Label>
              <Input
                id="min_tenure_years"
                type="number"
                value={formData.min_tenure_years || ""}
                onChange={(e) => setFormData({ ...formData, min_tenure_years: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_tenure_years">Max Tenure (Years)</Label>
            <Input
              id="max_tenure_years"
              type="number"
              value={formData.max_tenure_years || ""}
              onChange={(e) => setFormData({ ...formData, max_tenure_years: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active ?? true}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : provider ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

