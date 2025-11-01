"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateUser } from "@/lib/hooks/use-users"
import { useRoles } from "@/lib/hooks/use-roles"
import { CreateUserRequest } from "@/lib/types/user"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AddUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddUserModal({ open, onOpenChange, onSuccess }: AddUserModalProps) {
  const { createUser, loading } = useCreateUser()
  const { roles } = useRoles()
  const [formData, setFormData] = useState<CreateUserRequest>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    roles: [],
    status: 'active',
    password: '',
    member_data: {}
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      await createUser(formData)
      toast.success("User created successfully!")
      onSuccess?.()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      if (error.details?.errors) {
        setErrors(error.details.errors)
      } else {
        toast.error(error.message || "Failed to create user")
      }
    }
  }

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      roles: [],
      status: 'active',
      password: '',
      member_data: {}
    })
    setErrors({})
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('member_data.')) {
      const memberField = field.replace('member_data.', '')
      setFormData(prev => ({
        ...prev,
        member_data: {
          ...prev.member_data,
          [memberField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with appropriate role and permissions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className={errors.first_name ? 'border-red-500' : ''}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className={errors.last_name ? 'border-red-500' : ''}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roles">Roles *</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value && !formData.roles.includes(value)) {
                        handleInputChange('roles', [...formData.roles, value])
                      }
                    }}
                  >
                    <SelectTrigger className={errors.roles ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select roles" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.roles.map((roleName) => (
                        <Badge key={roleName} variant="secondary" className="flex items-center gap-1">
                          {roleName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          <button
                            type="button"
                            onClick={() => {
                              handleInputChange('roles', formData.roles.filter(r => r !== roleName))
                            }}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.roles && (
                    <p className="text-sm text-red-500 mt-1">{errors.roles}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-500 mt-1">{errors.status}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Member Information (only if user has member role) */}
          {formData.roles.includes('member') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Member Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="staff_id">Staff ID</Label>
                    <Input
                      id="staff_id"
                      value={formData.member_data?.staff_id || ''}
                      onChange={(e) => handleInputChange('member_data.staff_id', e.target.value)}
                      className={errors['member_data.staff_id'] ? 'border-red-500' : ''}
                    />
                    {errors['member_data.staff_id'] && (
                      <p className="text-sm text-red-500 mt-1">{errors['member_data.staff_id']}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="ippis_number">IPPIS Number</Label>
                    <Input
                      id="ippis_number"
                      value={formData.member_data?.ippis_number || ''}
                      onChange={(e) => handleInputChange('member_data.ippis_number', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.member_data?.date_of_birth || ''}
                      onChange={(e) => handleInputChange('member_data.date_of_birth', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.member_data?.gender || ''}
                      onValueChange={(value) => handleInputChange('member_data.gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rank">Rank</Label>
                    <Input
                      id="rank"
                      value={formData.member_data?.rank || ''}
                      onChange={(e) => handleInputChange('member_data.rank', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.member_data?.department || ''}
                      onChange={(e) => handleInputChange('member_data.department', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.member_data?.city || ''}
                      onChange={(e) => handleInputChange('member_data.city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.member_data?.state || ''}
                      onChange={(e) => handleInputChange('member_data.state', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="residential_address">Residential Address</Label>
                  <Input
                    id="residential_address"
                    value={formData.member_data?.residential_address || ''}
                    onChange={(e) => handleInputChange('member_data.residential_address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
