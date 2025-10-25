"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function EditRolePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [roleName, setRoleName] = useState("Accounts Admin")
  const [roleDescription, setRoleDescription] = useState("Manage financial records, contributions, and reports")

  const permissionCategories = [
    {
      name: "Members Management",
      permissions: [
        { id: "view_members", label: "View Members", checked: false },
        { id: "create_members", label: "Create Members", checked: false },
        { id: "edit_members", label: "Edit Members", checked: false },
        { id: "delete_members", label: "Delete Members", checked: false },
        { id: "approve_kyc", label: "Approve KYC", checked: false },
      ],
    },
    {
      name: "Financial Management",
      permissions: [
        { id: "view_contributions", label: "View Contributions", checked: true },
        { id: "manage_contributions", label: "Manage Contributions", checked: true },
        { id: "view_wallets", label: "View Wallets", checked: true },
        { id: "manage_payments", label: "Manage Payments", checked: true },
        { id: "financial_reports", label: "Financial Reports", checked: true },
      ],
    },
    {
      name: "Loans & Credit",
      permissions: [
        { id: "view_loans", label: "View Loans", checked: false },
        { id: "approve_loans", label: "Approve Loans", checked: false },
        { id: "manage_repayments", label: "Manage Repayments", checked: false },
        { id: "create_loan_products", label: "Create Loan Products", checked: false },
        { id: "loan_reports", label: "Loan Reports", checked: false },
      ],
    },
    {
      name: "Mortgage Management",
      permissions: [
        { id: "view_mortgages", label: "View Mortgages", checked: false },
        { id: "create_mortgages", label: "Create Mortgages", checked: false },
        { id: "manage_agreements", label: "Manage Agreements", checked: false },
        { id: "mortgage_reports", label: "Mortgage Reports", checked: false },
      ],
    },
    {
      name: "Property Management",
      permissions: [
        { id: "view_properties", label: "View Properties", checked: false },
        { id: "create_properties", label: "Create Properties", checked: false },
        { id: "edit_properties", label: "Edit Properties", checked: false },
        { id: "delete_properties", label: "Delete Properties", checked: false },
        { id: "manage_estates", label: "Manage Estates", checked: false },
        { id: "manage_maintenance", label: "Manage Maintenance", checked: false },
      ],
    },
    {
      name: "Legal & Compliance",
      permissions: [
        { id: "view_documents", label: "View Documents", checked: false },
        { id: "manage_legal_docs", label: "Manage Legal Documents", checked: false },
        { id: "compliance_reports", label: "Compliance Reports", checked: false },
      ],
    },
    {
      name: "System Administration",
      permissions: [
        { id: "manage_roles", label: "Manage Roles", checked: false },
        { id: "view_activity_logs", label: "View Activity Logs", checked: false },
        { id: "system_settings", label: "System Settings", checked: false },
        { id: "bulk_uploads", label: "Bulk Uploads", checked: false },
      ],
    },
  ]

  const handleSave = () => {
    toast({
      title: "Role Updated",
      description: "The role has been updated successfully.",
    })
    router.push("/admin/roles")
  }

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
          <h1 className="text-3xl font-bold text-foreground">Edit Role</h1>
          <p className="text-muted-foreground mt-1">Modify role permissions and details</p>
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
                <Input
                  id="roleName"
                  placeholder="e.g., Property Manager"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  placeholder="Describe the responsibilities and scope of this role"
                  rows={3}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
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
                        <Checkbox id={permission.id} defaultChecked={permission.checked} />
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
                <p className="text-2xl font-bold">5</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Users with this role</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <p className="text-sm font-medium">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button className="w-full" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
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
