"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Edit, Trash2, Mail } from "lucide-react"

export default function SuperAdminTeamPage() {
  const [showAddMember, setShowAddMember] = useState(false)

  const teamMembers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@frschousing.com",
      role: "Super Administrator",
      is_active: true,
      last_login: "2024-01-20 14:30",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@frschousing.com",
      role: "Business Manager",
      is_active: true,
      last_login: "2024-01-20 10:15",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@frschousing.com",
      role: "Support Agent",
      is_active: true,
      last_login: "2024-01-19 16:45",
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage super admin team members</p>
        </div>
        <Button onClick={() => setShowAddMember(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <Card key={member.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    {member.is_active ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm">
                      <span className="text-muted-foreground">Role:</span> {member.role}
                    </span>
                    <span className="text-sm">
                      <span className="text-muted-foreground">Last login:</span> {member.last_login}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
