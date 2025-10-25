import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActiveLoans } from "@/components/loans/active-loans"
import { LoanProducts } from "@/components/loans/loan-products"
import { LoanHistory } from "@/components/loans/loan-history"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function LoansPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Loan Management</h1>
          <p className="text-muted-foreground mt-1">Apply for loans and manage your repayments</p>
        </div>
        <Link href="/dashboard/loans/apply">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Apply for Loan
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Loans</TabsTrigger>
          <TabsTrigger value="products">Loan Products</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveLoans />
        </TabsContent>

        <TabsContent value="products">
          <LoanProducts />
        </TabsContent>

        <TabsContent value="history">
          <LoanHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
