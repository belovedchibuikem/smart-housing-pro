"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement profile update
    setTimeout(() => {
      setIsLoading(false)
      alert("Profile updated successfully!")
    }, 1500)
  }

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="personal">Personal Info</TabsTrigger>
        <TabsTrigger value="employment">Employment</TabsTrigger>
        <TabsTrigger value="nok">Next of Kin</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="john.doe@frsc.gov.ng" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" defaultValue="+234 800 000 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" defaultValue="1985-05-15" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" defaultValue="Nigerian" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Residential Address</Label>
              <Textarea id="address" defaultValue="123 Main Street, Ikeja, Lagos State" />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="employment">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staffId">Staff ID</Label>
                <Input id="staffId" defaultValue="FRSC/2020/12345" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ippisNumber">IPPIS Number</Label>
                <Input id="ippisNumber" placeholder="Enter IPPIS number" defaultValue="123456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rank">Rank/Position</Label>
                <Input id="rank" defaultValue="Route Commander" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" defaultValue="Operations" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="command">Command State</Label>
                <Input id="command" defaultValue="Lagos State Command" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentDate">Date of Employment</Label>
                <Input id="employmentDate" type="date" defaultValue="2020-01-15" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfService">Years of Service</Label>
                <Input id="yearsOfService" defaultValue="4" disabled />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="nok">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Next of Kin Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nokFullName">Full Name</Label>
                  <Input id="nokFullName" placeholder="Next of kin full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nokRelationship">Relationship</Label>
                  <Input id="nokRelationship" placeholder="e.g., Spouse, Sibling, Parent" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nokPhone">Phone Number</Label>
                  <Input id="nokPhone" type="tel" placeholder="+234 800 000 0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nokEmail">Email Address</Label>
                  <Input id="nokEmail" type="email" placeholder="nok@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nokAddress">Residential Address</Label>
                <Textarea id="nokAddress" placeholder="Next of kin residential address" />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
