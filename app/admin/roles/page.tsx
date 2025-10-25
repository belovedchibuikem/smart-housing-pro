import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Users, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default function RolesPage() {
  const roles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full access to all system features and settings",
      userCount: 2,
      permissions: ["All Permissions"],
      color: "bg-red-500",
    },
    {
      id: 2,
      name: "Accounts Admin",
      description: "Manage financial records, contributions, and reports",
      userCount: 5,
      permissions: ["View Contributions", "Manage Payments", "Financial Reports", "Wallet Management"],
      color: "bg-blue-500",
    },
    {
      id: 3,
      name: "Loans & Credit Admin",
      description: "Manage loan applications, approvals, and repayments",
      userCount: 3,
      permissions: ["View Loans", "Approve Loans", "Manage Repayments", "Loan Reports"],
      color: "bg-green-500",
    },
    {
      id: 4,
      name: "Mortgage Admin",
      description: "Handle mortgage agreements and property financing",
      userCount: 2,
      permissions: ["View Mortgages", "Create Mortgages", "Manage Agreements", "Mortgage Reports"],
      color: "bg-purple-500",
    },
    {
      id: 5,
      name: "Legal Admin",
      description: "Manage legal documents, compliance, and agreements",
      userCount: 2,
      permissions: ["View Documents", "Manage Agreements", "Legal Reports", "Compliance"],
      color: "bg-yellow-500",
    },
    {
      id: 6,
      name: "Engineering Admin",
      description: "Manage properties, maintenance, and construction projects",
      userCount: 4,
      permissions: ["View Properties", "Manage Maintenance", "Estate Management", "Engineering Reports"],
      color: "bg-orange-500",
    },
    {
      id: 7,
      name: "Member",
      description: "Standard member access to personal records and transactions",
      userCount: 1250,
      permissions: ["View Profile", "Make Contributions", "Apply for Loans", "View Properties"],
      color: "bg-gray-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">Manage user roles and access control across the system</p>
        </div>
        <Link href="/admin/roles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.slice(0, 3).map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`${role.color} p-2 rounded-lg`}>
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      {role.userCount} users
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {role.permissions.slice(0, 3).map((permission, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
                {role.permissions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{role.permissions.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/roles/${role.id}/edit`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </Link>
                <Link href={`/admin/roles/${role.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>Complete list of system roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`${role.color} p-1.5 rounded`}>
                        <Shield className="h-3 w-3 text-white" />
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">{role.description}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.userCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 2).map((permission, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/roles/${role.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      {role.name !== "Super Admin" && role.name !== "Member" && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
