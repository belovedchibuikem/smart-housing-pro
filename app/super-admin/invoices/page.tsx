"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle, AlertCircle, XCircle, Download, Eye, FileText } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface Invoice {
  id: string
  invoice_number: string
  business_name: string
  business_id: string
  amount: number
  tax: number
  total: number
  status: string
  due_date: string
  paid_at?: string
  created_at: string
}

interface InvoicesResponse {
  invoices: Invoice[]
  stats: {
    total: number
    paid: number
    pending: number
    failed: number
    total_revenue: number
  }
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { isLoading, data, error, loadData } = usePageLoading<InvoicesResponse>()

  const debouncedSearch = useCallback(() => {
    const timeoutId = setTimeout(() => {
      loadData(async () => {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        if (statusFilter !== 'all') params.append('status', statusFilter)
        
        const response = await apiFetch<InvoicesResponse>(`/super-admin/invoices?${params.toString()}`)
        return response
      })
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, statusFilter, loadData])

  useEffect(() => {
    debouncedSearch()
  }, [debouncedSearch])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const invoices = data?.invoices || []
  const stats = data?.stats

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            Paid
          </div>
        )
      case "pending":
        return (
          <div className="flex items-center gap-1 text-orange-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            Pending
          </div>
        )
      case "failed":
        return (
          <div className="flex items-center gap-1 text-red-600 text-sm">
            <XCircle className="h-4 w-4" />
            Failed
          </div>
        )
      default:
        return null
    }
  }


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground mt-2">View and manage all invoices</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Invoices</p>
          <p className="text-2xl font-bold mt-1">{stats?.total || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{stats?.paid || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold mt-1 text-orange-600">{stats?.pending || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Failed</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{stats?.failed || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold mt-1">₦{(stats?.total_revenue || 0).toLocaleString()}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{invoice.business_name}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">₦{invoice.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(invoice.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paid Date</p>
                      <p className="font-medium">
                        {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : "Not paid"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <Link href={`/super-admin/invoices/${invoice.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {invoices.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">No invoices found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </Card>
      )}
    </div>
  )
}
