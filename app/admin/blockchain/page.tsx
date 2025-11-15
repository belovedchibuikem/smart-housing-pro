"use client"

import { useState, useEffect } from "react"
import { Plus, Search, ExternalLink, CheckCircle2, AlertCircle, Loader2, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getBlockchainProperties, getAdminBlockchainStats, deleteBlockchainProperty, verifyAdminBlockchainTransaction } from "@/lib/api/client"
import { apiFetch } from "@/lib/api/client"

interface BlockchainProperty {
  id: string
  property_id: string
  blockchain_hash: string
  transaction_hash?: string
  status: string
  network: string
  registered_at?: string
  confirmed_at?: string
  ownership_data?: Array<{ member_id: string; name?: string }>
  property?: {
    id: string
    title?: string
    location?: string
  }
  blockchain_explorer_url?: string
  owners_count?: number
}

export default function AdminBlockchainPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [properties, setProperties] = useState<BlockchainProperty[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState<any>(null)

  useEffect(() => {
    checkSetupStatus()
    fetchStats()
    fetchProperties()
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await apiFetch<{ success: boolean; data: any }>("/admin/blockchain-setup/status")
      if (response.success && !response.data.setup_completed) {
        // Redirect to setup wizard if not completed
        router.push("/admin/blockchain/setup")
        return
      }
    } catch (error) {
      // If setup check fails, assume setup is needed
      router.push("/admin/blockchain/setup")
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [searchQuery, statusFilter])

  const fetchStats = async () => {
    try {
      const response = await getAdminBlockchainStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch blockchain statistics",
        variant: "destructive",
      })
    }
  }

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params: any = { page: 1, per_page: 15 }
      if (searchQuery) params.search = searchQuery
      if (statusFilter !== "all") params.status = statusFilter

      const response = await getBlockchainProperties(params)
      if (response.success) {
        setProperties(response.data || [])
        setPagination(response.pagination)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch blockchain properties",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    try {
      const response = await verifyAdminBlockchainTransaction(id)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Transaction verified successfully",
        })
        fetchProperties()
        fetchStats()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify transaction",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blockchain record?")) return

    try {
      const response = await deleteBlockchainProperty(id)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Blockchain record deleted successfully",
        })
        fetchProperties()
        fetchStats()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete blockchain record",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Verified</Badge>
      case "pending":
        return (
          <Badge variant="secondary">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatHash = (hash: string) => {
    if (!hash) return "—"
    return hash.length > 10 ? `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}` : hash
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blockchain Management</h1>
          <p className="text-muted-foreground mt-1">Manage property ownership records on the blockchain</p>
        </div>
        <Button asChild>
          <Link href="/admin/blockchain/new">
            <Plus className="mr-2 h-4 w-4" />
            Register Property
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.total_properties || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">On blockchain</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Verified Owners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.verified_owners || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.pending_properties || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Network Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-lg font-bold text-foreground">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats?.network_status || "Ethereum Mainnet"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by property ID, owner, or transaction hash..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="failed">Failed</option>
          <option value="rejected">Rejected</option>
        </select>
        <Button onClick={fetchProperties}>Search</Button>
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blockchain Property Records</CardTitle>
          <CardDescription>All properties registered on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No blockchain records found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner(s)</TableHead>
                  <TableHead>Blockchain Hash</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{record.property?.title || record.property_id}</div>
                        <div className="text-xs text-muted-foreground">{record.property?.location || "—"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.owners_count || (record.ownership_data?.length || 0)} Owner{(record.owners_count || record.ownership_data?.length || 0) !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{formatHash(record.blockchain_hash)}</code>
                    </TableCell>
                    <TableCell>
                      {record.transaction_hash ? (
                        <a
                          href={record.blockchain_explorer_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          {formatHash(record.transaction_hash)}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.confirmed_at
                        ? new Date(record.confirmed_at).toLocaleDateString()
                        : record.registered_at
                        ? new Date(record.registered_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.transaction_hash && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVerify(record.id)}
                            disabled={record.status === "confirmed"}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        {record.transaction_hash && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a href={record.blockchain_explorer_url || "#"} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        {record.status !== "confirmed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
