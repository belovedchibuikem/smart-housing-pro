"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getStatutoryCharge, updateStatutoryCharge, getStatutoryChargeTypes } from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"

interface Member {
  id: string
  user: {
    first_name: string
    last_name: string
    email: string
  }
  member_id?: string
  staff_id?: string
}

export default function EditStatutoryChargePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [chargeTypes, setChargeTypes] = useState<string[]>([])
  const chargeId = params?.id as string

  const [formData, setFormData] = useState({
    member_id: "",
    type: "",
    amount: "",
    description: "",
    due_date: "",
    status: "pending",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && chargeId) {
      fetchCharge()
      fetchMembers()
      fetchChargeTypes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, chargeId])

  const fetchCharge = async () => {
    try {
      setFetching(true)
      const response = await getStatutoryCharge(chargeId)
      if (response.success && response.data) {
        const charge = response.data
        setFormData({
          member_id: charge.member_id || "",
          type: charge.type || "",
          amount: charge.amount?.toString() || "",
          description: charge.description || "",
          due_date: charge.due_date ? new Date(charge.due_date).toISOString().split('T')[0] : "",
          status: charge.status || "pending",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to load statutory charge",
        variant: "destructive",
      })
    } finally {
      setFetching(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await apiFetch<{ members?: Member[]; data?: Member[] }>("/admin/members?per_page=100")
      const membersList = response.members || response.data || []
      setMembers(membersList)
    } catch (error) {
      console.error("Failed to load members", error)
    }
  }

  const fetchChargeTypes = async () => {
    try {
      const response = await getStatutoryChargeTypes()
      if (response.success && response.data) {
        const types = response.data.map((t: any) => t.type).filter(Boolean)
        setChargeTypes(types)
      }
    } catch (error) {
      console.error("Failed to load charge types", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.member_id || !formData.type || !formData.amount || !formData.due_date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const submitData = {
        member_id: formData.member_id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description || "",
        due_date: formData.due_date,
        status: formData.status,
      }

      const response = await updateStatutoryCharge(chargeId, submitData)

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Statutory charge updated successfully",
        })
        router.push("/admin/statutory-charges")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update statutory charge",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/admin/statutory-charges">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Statutory Charges
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Statutory Charge</h1>
        <p className="text-muted-foreground mt-1">Update statutory charge information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Charge Information</CardTitle>
            <CardDescription>Update the details of the statutory charge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="member_id">
                Member <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.member_id}
                onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user?.first_name} {member.user?.last_name} 
                      {member.member_id && ` (${member.member_id})`}
                      {!member.member_id && member.staff_id && ` (${member.staff_id})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">
                  Charge Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select charge type" />
                  </SelectTrigger>
                  <SelectContent>
                    {chargeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (₦) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter charge description or notes..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Charge
              </Button>
              <Link href="/admin/statutory-charges">
                <Button type="button" variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

