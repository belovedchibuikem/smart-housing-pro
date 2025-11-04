"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Loader2, Search, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

interface LoanProduct {
  id: string
  name: string
  description?: string
  min_amount: number
  max_amount: number
  interest_rate: number
  min_tenure_months: number
  max_tenure_months: number
  interest_type: string
  eligibility_criteria?: string[]
  required_documents?: string[]
  is_active: boolean
  processing_fee_percentage?: number
  late_payment_fee?: number
  loans_count?: number
  total_loans?: number
  total_applicants?: number
}

export default function AdminLoanProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<LoanProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts()
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      params.append('per_page', '100')

      const response = await apiFetch<{ success: boolean; data: LoanProduct[] }>(
        `/admin/loan-products?${params.toString()}`
      )

      if (response.success) {
        setProducts(response.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching loan products:', error)
      sonnerToast.error("Failed to load loan products", {
        description: error.message || "Please try again later",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return

    try {
      setProcessing(true)
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/loan-products/${selectedProduct.id}`,
        { method: 'DELETE' }
      )

      if (response.success) {
        sonnerToast.success("Loan Product Deleted", {
          description: response.message || "Product has been deleted successfully",
        })
        setShowDeleteDialog(false)
        setSelectedProduct(null)
        fetchProducts()
      }
    } catch (error: any) {
      console.error('Error deleting loan product:', error)
      sonnerToast.error("Failed to delete loan product", {
        description: error.message || "Please try again later",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleStatus = async (product: LoanProduct) => {
    try {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/admin/loan-products/${product.id}/toggle-status`,
        { method: 'POST' }
      )

      if (response.success) {
        sonnerToast.success("Status Updated", {
          description: response.message || "Product status has been updated",
        })
        fetchProducts()
      }
    } catch (error: any) {
      console.error('Error toggling product status:', error)
      sonnerToast.error("Failed to update product status", {
        description: error.message || "Please try again later",
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Products</h1>
          <p className="text-muted-foreground mt-1">Manage available loan products and their terms</p>
        </div>
        <Link href="/admin/loan-products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Loan Product
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter((p) => p.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + (p.total_applicants || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Interest Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.length > 0
                ? (products.reduce((sum, p) => sum + p.interest_rate, 0) / products.length).toFixed(2)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
          <CardTitle>All Loan Products</CardTitle>
          <CardDescription>Configure and manage loan products available to members</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No loan products found. Create your first product to get started.
            </div>
          ) : (
          <div className="space-y-4">
              {products.map((product) => (
              <div key={product.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                      {product.description && (
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                      )}
                    <div className="grid sm:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount Range</p>
                        <p className="font-medium text-sm">
                            {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                          <p className="font-medium text-sm">{product.interest_rate}% per annum</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tenure</p>
                          <p className="font-medium text-sm">
                            {product.min_tenure_months} - {product.max_tenure_months} months
                          </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Applicants</p>
                          <p className="font-medium text-sm">{product.total_applicants || 0} members</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(product)}
                        title={product.is_active ? "Deactivate" : "Activate"}
                      >
                        {product.is_active ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/loan-products/${product.id}`)}
                      >
                      <Eye className="h-4 w-4" />
                    </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/admin/loan-products/${product.id}/edit`)}
                      >
                      <Edit className="h-4 w-4" />
                    </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedProduct(product)
                          setShowDeleteDialog(true)
                        }}
                      >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Loan Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedProduct(null) }} disabled={processing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
