"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Upload, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

export default function NewMemberPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    // User fields
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    // Member fields
    staff_id: '',
    ippis_number: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    nationality: 'Nigerian',
    state_of_origin: '',
    lga: '',
    residential_address: '',
    city: '',
    state: '',
    rank: '',
    department: '',
    command_state: '',
    employment_date: '',
    years_of_service: '',
    membership_type: 'regular',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateYearsOfService = (employmentDate: string): number => {
    if (!employmentDate) return 0
    const start = new Date(employmentDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - start.getTime())
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25)
    return Math.floor(diffYears)
  }

  // Auto-calculate years of service when employment date changes
  useEffect(() => {
    if (formData.employment_date) {
      const years = calculateYearsOfService(formData.employment_date)
      setFormData(prev => ({ ...prev, years_of_service: years.toString() }))
    }
  }, [formData.employment_date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calculate years of service automatically
      const yearsOfService = calculateYearsOfService(formData.employment_date)

      // Prepare member data
      const memberData = {
        staff_id: formData.staff_id || null,
        ippis_number: formData.ippis_number || null,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        marital_status: formData.marital_status || null,
        nationality: formData.nationality || 'Nigerian',
        state_of_origin: formData.state_of_origin || null,
        lga: formData.lga || null,
        residential_address: formData.residential_address || null,
        city: formData.city || null,
        state: formData.state || null,
        rank: formData.rank || null,
        department: formData.department || null,
        command_state: formData.command_state || null,
        employment_date: formData.employment_date || null,
        years_of_service: yearsOfService,
        membership_type: formData.membership_type || 'regular',
        kyc_status: 'pending',
        status: 'active',
      }

                   // Create member - the backend will handle user creation
             const memberResponse = await apiFetch('/admin/members', {
               method: 'POST',
               body: {
                 // User data
                 first_name: formData.first_name,
                 last_name: formData.last_name,
                 email: formData.email,
                 phone: formData.phone,
                 password: formData.password,
                 // Member data
                 ...memberData
               }
             })

      toast({
        title: "Member Added",
        description: "New member has been added successfully.",
      })
      router.push("/admin/members")
    } catch (error) {
      console.error("Failed to add member:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/members">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Member</h1>
          <p className="text-muted-foreground mt-1">Register a new cooperative member</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic details about the member</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Doe" required />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@frsc.gov.ng" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+234 801 234 5678" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Initial Password *</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="Enter initial password" 
                      required 
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Member will need to change this password on first login</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select value={formData.marital_status} onValueChange={(value) => handleSelectChange('marital_status', value)}>
                      <SelectTrigger id="marital_status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nigerian" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="state_of_origin">State of Origin</Label>
                    <Input id="state_of_origin" name="state_of_origin" value={formData.state_of_origin} onChange={handleChange} placeholder="Lagos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lga">LGA</Label>
                    <Input id="lga" name="lga" value={formData.lga} onChange={handleChange} placeholder="Ikeja" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residential_address">Residential Address</Label>
                  <Input id="residential_address" name="residential_address" value={formData.residential_address} onChange={handleChange} placeholder="123 Main Street, Lagos" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} placeholder="Lagos" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} placeholder="Lagos" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employment Information</CardTitle>
                <CardDescription>FRSC employment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="staff_id">Staff ID</Label>
                    <Input id="staff_id" name="staff_id" value={formData.staff_id} onChange={handleChange} placeholder="FRSC/HMS/2024/001" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ippis_number">IPPIS Number</Label>
                    <Input id="ippis_number" name="ippis_number" value={formData.ippis_number} onChange={handleChange} placeholder="1234567890" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="rank">Rank</Label>
                    <Select value={formData.rank} onValueChange={(value) => handleSelectChange('rank', value)}>
                      <SelectTrigger id="rank">
                        <SelectValue placeholder="Select rank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inspector">Inspector</SelectItem>
                        <SelectItem value="sergeant">Sergeant</SelectItem>
                        <SelectItem value="corporal">Corporal</SelectItem>
                        <SelectItem value="officer">Officer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" name="department" value={formData.department} onChange={handleChange} placeholder="Operations" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="command_state">Command/State</Label>
                    <Input id="command_state" name="command_state" value={formData.command_state} onChange={handleChange} placeholder="Lagos Command" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment_date">Employment Date</Label>
                    <Input id="employment_date" name="employment_date" type="date" value={formData.employment_date} onChange={handleChange} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="years_of_service">Years of Service (Auto-calculated)</Label>
                    <Input id="years_of_service" name="years_of_service" type="number" value={formData.years_of_service} onChange={handleChange} placeholder="Auto-calculated" min="0" readOnly className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Member account configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="membership_type">Membership Type</Label>
                  <Select value={formData.membership_type} onValueChange={(value) => handleSelectChange('membership_type', value)} required>
                    <SelectTrigger id="membership_type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular Member</SelectItem>
                      <SelectItem value="premium">Premium Member</SelectItem>
                      <SelectItem value="vip">VIP Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload photo</p>
                    </div>
                    <input id="photo-upload" type="file" className="hidden" accept="image/*" />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Initial Status</p>
                  <p className="text-sm font-medium">Active</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">KYC Status</p>
                  <p className="text-sm font-medium">Pending Verification</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Adding Member...' : 'Add Member'}
                </Button>
                <Link href="/admin/members" className="block">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
