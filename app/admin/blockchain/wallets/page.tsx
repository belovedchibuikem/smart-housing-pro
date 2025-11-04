"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Loader2, Trash2, Star, RefreshCw, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getBlockchainWallets, createBlockchainWallet, deleteBlockchainWallet, setDefaultWallet, syncWalletBalance } from "@/lib/api/client"

interface Wallet {
  id: string
  name: string
  network: string
  address: string
  is_active: boolean
  is_default: boolean
  balance: number
  last_synced_at?: string
  notes?: string
}

export default function BlockchainWalletsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [networkFilter, setNetworkFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    action: "import" as "create" | "import",
    network: "ethereum",
    name: "",
    private_key: "",
    address: "",
    mnemonic: "",
    notes: "",
  })

  useEffect(() => {
    fetchWallets()
  }, [networkFilter])

  const fetchWallets = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (networkFilter !== "all") params.network = networkFilter

      const response = await getBlockchainWallets(params)
      if (response.success) {
        setWallets(response.data || [])
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch wallets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWallet = async () => {
    if (!formData.name || !formData.address || !formData.private_key) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await createBlockchainWallet(formData)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Wallet created successfully",
        })
        setDialogOpen(false)
        setFormData({
          action: "import",
          network: "ethereum",
          name: "",
          private_key: "",
          address: "",
          mnemonic: "",
          notes: "",
        })
        fetchWallets()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create wallet",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wallet?")) return

    try {
      const response = await deleteBlockchainWallet(id)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Wallet deleted successfully",
        })
        fetchWallets()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete wallet",
        variant: "destructive",
      })
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const response = await setDefaultWallet(id)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Wallet set as default",
        })
        fetchWallets()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to set default wallet",
        variant: "destructive",
      })
    }
  }

  const handleSyncBalance = async (id: string) => {
    try {
      const response = await syncWalletBalance(id)
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Balance synced successfully",
        })
        fetchWallets()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sync balance",
        variant: "destructive",
      })
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
          <h1 className="text-3xl font-bold text-foreground">Blockchain Wallets</h1>
          <p className="text-muted-foreground mt-1">Manage wallets for blockchain transactions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Import Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import Wallet</DialogTitle>
              <DialogDescription>Import an existing wallet for blockchain transactions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Network *</Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) => setFormData({ ...formData, network: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="bsc">Binance Smart Chain</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Wallet Name *</Label>
                <Input
                  placeholder="Main Property Registry Wallet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Wallet Address *</Label>
                <Input
                  placeholder="0x..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Private Key *</Label>
                <Input
                  type="password"
                  placeholder="Enter private key (will be encrypted)"
                  value={formData.private_key}
                  onChange={(e) => setFormData({ ...formData, private_key: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Mnemonic Phrase (Optional)</Label>
                <Input
                  type="password"
                  placeholder="Enter mnemonic phrase if available"
                  value={formData.mnemonic}
                  onChange={(e) => setFormData({ ...formData, mnemonic: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  placeholder="Any additional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateWallet}>
                  Import Wallet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={networkFilter} onValueChange={setNetworkFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Networks</SelectItem>
            <SelectItem value="ethereum">Ethereum</SelectItem>
            <SelectItem value="polygon">Polygon</SelectItem>
            <SelectItem value="bsc">BSC</SelectItem>
            <SelectItem value="arbitrum">Arbitrum</SelectItem>
            <SelectItem value="optimism">Optimism</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Wallets</CardTitle>
          <CardDescription>All imported blockchain wallets</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No wallets found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Synced</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((wallet) => (
                  <TableRow key={wallet.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {wallet.name}
                        {wallet.is_default && (
                          <Badge variant="default" className="bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{wallet.network}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{formatHash(wallet.address)}</code>
                    </TableCell>
                    <TableCell>
                      {wallet.balance.toFixed(6)} {wallet.network === "polygon" ? "MATIC" : wallet.network === "bsc" ? "BNB" : "ETH"}
                    </TableCell>
                    <TableCell>
                      {wallet.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {wallet.last_synced_at
                        ? new Date(wallet.last_synced_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!wallet.is_default && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSetDefault(wallet.id)}
                            title="Set as default"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSyncBalance(wallet.id)}
                          title="Sync balance"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        {!wallet.is_default && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(wallet.id)}
                            title="Delete"
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

