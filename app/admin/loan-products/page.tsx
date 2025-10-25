"use client"
// import { AdminHeader } from "@/components/admin/admin-header"
// import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

export default function AdminLoanProductsPage() {
  // const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const loanProducts = [
    {
      id: 1,
      name: "Standard Housing Loan",
      description: "Basic housing loan for property purchase",
      minAmount: "₦1,000,000",
      maxAmount: "₦10,000,000",
      interestRate: "12%",
      tenure: "1-20 years",
      status: "active",
      applicants: 45,
    },
    {
      id: 2,
      name: "Quick Access Loan",
      description: "Fast approval loan for urgent housing needs",
      minAmount: "₦500,000",
      maxAmount: "₦5,000,000",
      interestRate: "15%",
      tenure: "1-10 years",
      status: "active",
      applicants: 23,
    },
    {
      id: 3,
      name: "Renovation Loan",
      description: "Loan for property renovation and improvement",
      minAmount: "₦200,000",
      maxAmount: "₦3,000,000",
      interestRate: "10%",
      tenure: "1-5 years",
      status: "active",
      applicants: 12,
    },
    {
      id: 4,
      name: "Land Purchase Loan",
      description: "Specialized loan for land acquisition",
      minAmount: "₦2,000,000",
      maxAmount: "₦15,000,000",
      interestRate: "14%",
      tenure: "1-15 years",
      status: "inactive",
      applicants: 8,
    },
  ]

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

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Interest Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.75%</div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Products List */}
      <Card>
        <CardHeader>
          <CardTitle>All Loan Products</CardTitle>
          <CardDescription>Configure and manage loan products available to members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loanProducts.map((product) => (
              <div key={product.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>{product.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    <div className="grid sm:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount Range</p>
                        <p className="font-medium text-sm">
                          {product.minAmount} - {product.maxAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Interest Rate</p>
                        <p className="font-medium text-sm">{product.interestRate} per annum</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tenure</p>
                        <p className="font-medium text-sm">{product.tenure}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Applicants</p>
                        <p className="font-medium text-sm">{product.applicants} members</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
