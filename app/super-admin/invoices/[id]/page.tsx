"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Printer, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { use, useEffect } from "react"
import { apiFetch } from "@/lib/api/client"
import { usePageLoading } from "@/hooks/use-loading"

interface InvoiceItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface InvoiceDetail {
  id: string
  invoice_number: string
  business_name: string
  business_email: string
  business_address: string
  amount: number
  tax: number
  total: number
  status: string
  due_date: string
  paid_at?: string
  created_at: string
  payment_method?: string
  transaction_id?: string
  items: InvoiceItem[]
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { isLoading, data, error, loadData } = usePageLoading<{ invoice: InvoiceDetail }>()

  useEffect(() => {
    loadData(async () => {
      const response = await apiFetch<{ invoice: InvoiceDetail }>(`/super-admin/invoices/${resolvedParams.id}`)
      return response
    })
  }, [loadData, resolvedParams.id])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (isLoading || !data) return null // Let the skeleton loader handle the display

  const invoice = data.invoice

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/invoices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
            <p className="text-muted-foreground mt-1">Invoice Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between pb-8 border-b">
            <div>
              <h2 className="text-2xl font-bold mb-2">INVOICE</h2>
              <p className="text-sm text-muted-foreground">Invoice Number: {invoice.invoice_number}</p>
              <p className="text-sm text-muted-foreground">Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">
                Due Date: {new Date(invoice.due_date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              {getStatusBadge(invoice.status)}
              {invoice.paid_at && (
                <p className="text-sm text-muted-foreground mt-2">
                  Paid on: {new Date(invoice.paid_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Business Details */}
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">From:</h3>
              <p className="text-sm font-medium">FRSC Housing Platform</p>
              <p className="text-sm text-muted-foreground">Platform Administrator</p>
              <p className="text-sm text-muted-foreground">support@frschousing.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <p className="text-sm font-medium">{invoice.business_name}</p>
              <p className="text-sm text-muted-foreground">{invoice.business_email}</p>
              <p className="text-sm text-muted-foreground">{invoice.business_address}</p>
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 text-sm font-semibold">Description</th>
                  <th className="text-right py-3 text-sm font-semibold">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold">Unit Price</th>
                  <th className="text-right py-3 text-sm font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-4 text-sm">{item.description}</td>
                    <td className="py-4 text-sm text-right">{item.quantity}</td>
                    <td className="py-4 text-sm text-right">₦{item.unit_price.toFixed(2)}</td>
                    <td className="py-4 text-sm text-right">₦{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>₦{invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>₦{invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span>₦{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {invoice.status === "paid" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Payment Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Payment Method:</p>
                  <p className="font-medium text-green-900">{invoice.payment_method}</p>
                </div>
                <div>
                  <p className="text-green-700">Transaction ID:</p>
                  <p className="font-medium text-green-900">{invoice.transaction_id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
