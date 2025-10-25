import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Shield, Mail, Phone } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  const users = [
    {
      id: 1,
      name: "Adebayo Ogunleye",
      email: "adebayo.ogunleye@frsc.gov.ng",
      phone: "+234 803 456 7890",
      role: "Super Admin",
      roleColor: "bg-red-500",
      status: "Active",
      memberId: "FRSC/HMS/2024/001",
    },
    {
      id: 2,
      name: "Chioma Nwosu",
      email: "chioma.nwosu@frsc.gov.ng",
      phone: "+234 805 123 4567",
      role: "Accounts Admin",
      roleColor: "bg-blue-500",
      status: "Active",
      memberId: "FRSC/HMS/2024/002",
    },
    {
      id: 3,
      name: "Ibrahim Musa",
      email: "ibrahim.musa@frsc.gov.ng",
      phone: "+234 807 890 1234",
      role: "Loans & Credit Admin",
      roleColor: "bg-green-500",
      status: "Active",
      memberId: "FRSC/HMS/2024/003",
    },
    {
      id: 4,
      name: "Funmilayo Adeyemi",
      email: "funmilayo.adeyemi@frsc.gov.ng",
      phone: "+234 809 234 5678",
      role: "Engineering Admin",
      roleColor: "bg-orange-500",
      status: "Active",
      memberId: "FRSC/HMS/2024/004",
    },
    {
      id: 5,
      name: "Emeka Okafor",
      email: "emeka.okafor@frsc.gov.ng",
      phone: "+234 810 345 6789",
      role: "Member",
      roleColor: "bg-gray-500",
      status: "Active",
      memberId: "FRSC/HMS/2024/005",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users and assign roles across the system</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>View and manage user accounts and roles</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super">Super Admin</SelectItem>
                  <SelectItem value="accounts">Accounts</SelectItem>
                  <SelectItem value="loans">Loans & Credit</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Member ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{user.memberId}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`${user.roleColor} p-1 rounded`}>
                        <Shield className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium">{user.role}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/users/${user.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit Role
                      </Button>
                    </Link>
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
