import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function NewRolePage() {
  const permissionCategories = [
    {
      name: "Members Management",
      permissions: [
        { id: "view_members", label: "View Members" },
        { id: "create_members", label: "Create Members" },
        { id: "edit_members", label: "Edit Members" },
        { id: "delete_members", label: "Delete Members" },
        { id: "approve_kyc", label: "Approve KYC" },
      ],
    },
    {
      name: "Financial Management",
      permissions: [
        { id: "view_contributions", label: "View Contributions" },
        { id: "manage_contributions", label: "Manage Contributions" },
        { id: "view_wallets", label: "View Wallets" },
        { id: "manage_payments", label: "Manage Payments" },
        { id: "financial_reports", label: "Financial Reports" },
      ],
    },
    {
      name: "Loans & Credit",
      permissions: [
        { id: "view_loans", label: "View Loans" },
        { id: "approve_loans", label: "Approve Loans" },
        { id: "manage_repayments", label: "Manage Repayments" },
        { id: "create_loan_products", label: "Create Loan Products" },
        { id: "loan_reports", label: "Loan Reports" },
      ],
    },
    {
      name: "Mortgage Management",
      permissions: [
        { id: "view_mortgages", label: "View Mortgages" },
        { id: "create_mortgages", label: "Create Mortgages" },
        { id: "manage_agreements", label: "Manage Agreements" },
        { id: "mortgage_reports", label: "Mortgage Reports" },
      ],
    },
    {
      name: "Property Management",
      permissions: [
        { id: "view_properties", label: "View Properties" },
        { id: "create_properties", label: "Create Properties" },
        { id: "edit_properties", label: "Edit Properties" },
        { id: "delete_properties", label: "Delete Properties" },
        { id: "manage_estates", label: "Manage Estates" },
        { id: "manage_maintenance", label: "Manage Maintenance" },
      ],
    },
    {
      name: "Legal & Compliance",
      permissions: [
        { id: "view_documents", label: "View Documents" },
        { id: "manage_legal_docs", label: "Manage Legal Documents" },
        { id: "compliance_reports", label: "Compliance Reports" },
      ],
    },
    {
      name: "System Administration",
      permissions: [
        { id: "manage_roles", label: "Manage Roles" },
        { id: "view_activity_logs", label: "View Activity Logs" },
        { id: "system_settings", label: "System Settings" },
        { id: "bulk_uploads", label: "Bulk Uploads" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/roles">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Role</h1>
          <p className="text-muted-foreground mt-1">Define a new role with specific permissions</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Information</CardTitle>
              <CardDescription>Basic details about the role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name</Label>
                <Input id="roleName" placeholder="e.g., Property Manager" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  placeholder="Describe the responsibilities and scope of this role"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>Select the permissions for this role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {permissionCategories.map((category) => (
                <div key={category.name} className="space-y-3">
                  <h3 className="font-semibold text-sm text-foreground">{category.name}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {category.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox id={permission.id} />
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {permission.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Selected Permissions</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <p className="text-sm font-medium">Draft</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Create Role
              </Button>
              <Link href="/admin/roles" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
