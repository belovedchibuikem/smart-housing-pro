"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  Building2, 
  DollarSign, 
  Wallet,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Save,
  TestTube,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface PaymentGateway {
  id: string
  name: string
  display_name: string
  description: string
  is_active: boolean
  is_test_mode: boolean
  credentials: Record<string, any>
  configuration: Record<string, any>
  supported_currencies: string[]
  supported_countries: string[]
  transaction_fee_percentage: number
  transaction_fee_fixed: number
  minimum_amount: number
  maximum_amount: number
  platform_fee_percentage: number
  platform_fee_fixed: number
  created_at: string
  updated_at: string
}

interface BankAccount {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  is_primary: boolean
}

export default function TenantPaymentGatewaysPage() {
  const { toast } = useToast()
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [newBankAccount, setNewBankAccount] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    is_primary: false
  })

  useEffect(() => {
    loadGateways()
  }, [])

  const loadGateways = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ gateways: PaymentGateway[] }>("/admin/payment-gateways")
      setGateways(response.gateways)
    } catch (error) {
      console.error("Error loading gateways:", error)
      toast({
        title: "Error",
        description: "Failed to load payment gateways",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateGateway = async (gatewayId: string, updates: Partial<PaymentGateway>) => {
    try {
      await apiFetch(`/admin/payment-gateways/${gatewayId}`, {
        method: "PUT",
        body: updates
      })

      setGateways(prev => 
        prev.map(gateway => 
          gateway.id === gatewayId 
            ? { ...gateway, ...updates }
            : gateway
        )
      )

      toast({
        title: "Success",
        description: "Payment gateway updated successfully",
      })
    } catch (error) {
      console.error("Error updating gateway:", error)
      toast({
        title: "Error",
        description: "Failed to update payment gateway",
        variant: "destructive",
      })
    }
  }

  const testConnection = async (gatewayId: string) => {
    try {
      const response = await apiFetch(`/admin/payment-gateways/${gatewayId}/test`, {
        method: "POST"
      })

      toast({
        title: response.success ? "Success" : "Error",
        description: response.message,
        variant: response.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error testing connection:", error)
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive",
      })
    }
  }

  const toggleSecretVisibility = (gatewayId: string, field: string) => {
    const key = `${gatewayId}_${field}`
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const addBankAccount = () => {
    if (!newBankAccount.bank_name || !newBankAccount.account_number || !newBankAccount.account_name) {
      toast({
        title: "Error",
        description: "Please fill in all bank account fields",
        variant: "destructive",
      })
      return
    }

    const account: BankAccount = {
      id: Date.now().toString(),
      ...newBankAccount
    }

    setBankAccounts(prev => [...prev, account])
    setNewBankAccount({
      bank_name: "",
      account_number: "",
      account_name: "",
      is_primary: false
    })

    toast({
      title: "Success",
      description: "Bank account added successfully",
    })
  }

  const removeBankAccount = (accountId: string) => {
    setBankAccounts(prev => prev.filter(account => account.id !== accountId))
    toast({
      title: "Success",
      description: "Bank account removed successfully",
    })
  }

  const updateBankAccount = (accountId: string, updates: Partial<BankAccount>) => {
    setBankAccounts(prev => 
      prev.map(account => 
        account.id === accountId 
          ? { ...account, ...updates }
          : account
      )
    )
  }

  const getGatewayIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'paystack':
        return <CreditCard className="h-5 w-5" />
      case 'remita':
        return <Building2 className="h-5 w-5" />
      case 'stripe':
        return <DollarSign className="h-5 w-5" />
      case 'manual':
        return <Wallet className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getGatewayStatus = (gateway: PaymentGateway) => {
    if (!gateway.is_active) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (gateway.is_test_mode) {
      return <Badge variant="outline">Test Mode</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateways</h1>
          <p className="text-muted-foreground mt-2">Configure payment methods for member payments</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading payment gateways...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Gateways</h1>
        <p className="text-muted-foreground mt-2">Configure payment methods for member payments</p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Configure payment gateways to enable members to make payments for contributions, loans, investments, and other services.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="paystack" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="paystack" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Paystack
          </TabsTrigger>
          <TabsTrigger value="remita" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Remita
          </TabsTrigger>
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Manual
          </TabsTrigger>
        </TabsList>

        {gateways.map((gateway) => (
          <TabsContent key={gateway.id} value={gateway.name} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getGatewayIcon(gateway.name)}
                    <div>
                      <CardTitle>{gateway.display_name}</CardTitle>
                      <CardDescription>{gateway.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getGatewayStatus(gateway)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(gateway.id)}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Connection
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${gateway.id}-active`}>Enable Gateway</Label>
                    <Switch
                      id={`${gateway.id}-active`}
                      checked={gateway.is_active}
                      onCheckedChange={(checked) => updateGateway(gateway.id, { is_active: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${gateway.id}-test`}>Test Mode</Label>
                    <Switch
                      id={`${gateway.id}-test`}
                      checked={gateway.is_test_mode}
                      onCheckedChange={(checked) => updateGateway(gateway.id, { is_test_mode: checked })}
                    />
                  </div>
                </div>

                {gateway.name === 'paystack' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Paystack Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paystack-public-key">Public Key</Label>
                        <div className="flex">
                          <Input
                            id="paystack-public-key"
                            type={showSecrets[`${gateway.id}_public_key`] ? "text" : "password"}
                            value={gateway.credentials?.public_key || ""}
                            onChange={(e) => updateGateway(gateway.id, {
                              credentials: { ...gateway.credentials, public_key: e.target.value }
                            })}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => toggleSecretVisibility(gateway.id, 'public_key')}
                          >
                            {showSecrets[`${gateway.id}_public_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="paystack-secret-key">Secret Key</Label>
                        <div className="flex">
                          <Input
                            id="paystack-secret-key"
                            type={showSecrets[`${gateway.id}_secret_key`] ? "text" : "password"}
                            value={gateway.credentials?.secret_key || ""}
                            onChange={(e) => updateGateway(gateway.id, {
                              credentials: { ...gateway.credentials, secret_key: e.target.value }
                            })}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => toggleSecretVisibility(gateway.id, 'secret_key')}
                          >
                            {showSecrets[`${gateway.id}_secret_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {gateway.name === 'remita' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Remita Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="remita-merchant-id">Merchant ID</Label>
                        <Input
                          id="remita-merchant-id"
                          value={gateway.credentials?.merchant_id || ""}
                          onChange={(e) => updateGateway(gateway.id, {
                            credentials: { ...gateway.credentials, merchant_id: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="remita-api-key">API Key</Label>
                        <div className="flex">
                          <Input
                            id="remita-api-key"
                            type={showSecrets[`${gateway.id}_api_key`] ? "text" : "password"}
                            value={gateway.credentials?.api_key || ""}
                            onChange={(e) => updateGateway(gateway.id, {
                              credentials: { ...gateway.credentials, api_key: e.target.value }
                            })}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => toggleSecretVisibility(gateway.id, 'api_key')}
                          >
                            {showSecrets[`${gateway.id}_api_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {gateway.name === 'stripe' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Stripe Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
                        <div className="flex">
                          <Input
                            id="stripe-publishable-key"
                            type={showSecrets[`${gateway.id}_publishable_key`] ? "text" : "password"}
                            value={gateway.credentials?.publishable_key || ""}
                            onChange={(e) => updateGateway(gateway.id, {
                              credentials: { ...gateway.credentials, publishable_key: e.target.value }
                            })}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => toggleSecretVisibility(gateway.id, 'publishable_key')}
                          >
                            {showSecrets[`${gateway.id}_publishable_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="stripe-secret-key">Secret Key</Label>
                        <div className="flex">
                          <Input
                            id="stripe-secret-key"
                            type={showSecrets[`${gateway.id}_secret_key`] ? "text" : "password"}
                            value={gateway.credentials?.secret_key || ""}
                            onChange={(e) => updateGateway(gateway.id, {
                              credentials: { ...gateway.credentials, secret_key: e.target.value }
                            })}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => toggleSecretVisibility(gateway.id, 'secret_key')}
                          >
                            {showSecrets[`${gateway.id}_secret_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {gateway.name === 'manual' && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Manual Payment Configuration</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Bank Accounts</Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add bank accounts for manual payment collection
                        </p>
                        
                        <div className="space-y-4">
                          {bankAccounts.map((account) => (
                            <Card key={account.id} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <Label className="text-sm">Bank Name</Label>
                                      <Input
                                        value={account.bank_name}
                                        onChange={(e) => updateBankAccount(account.id, { bank_name: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm">Account Number</Label>
                                      <Input
                                        value={account.account_number}
                                        onChange={(e) => updateBankAccount(account.id, { account_number: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm">Account Name</Label>
                                      <Input
                                        value={account.account_name}
                                        onChange={(e) => updateBankAccount(account.id, { account_name: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateBankAccount(account.id, { is_primary: !account.is_primary })}
                                  >
                                    {account.is_primary ? "Primary" : "Set Primary"}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeBankAccount(account.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                          <h5 className="font-medium mb-3">Add New Bank Account</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <Label>Bank Name</Label>
                              <Input
                                value={newBankAccount.bank_name}
                                onChange={(e) => setNewBankAccount(prev => ({ ...prev, bank_name: e.target.value }))}
                                placeholder="e.g., First Bank of Nigeria"
                              />
                            </div>
                            <div>
                              <Label>Account Number</Label>
                              <Input
                                value={newBankAccount.account_number}
                                onChange={(e) => setNewBankAccount(prev => ({ ...prev, account_number: e.target.value }))}
                                placeholder="1234567890"
                              />
                            </div>
                            <div>
                              <Label>Account Name</Label>
                              <Input
                                value={newBankAccount.account_name}
                                onChange={(e) => setNewBankAccount(prev => ({ ...prev, account_name: e.target.value }))}
                                placeholder="Your Organization Name"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button onClick={addBankAccount} size="sm">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Bank Account
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={() => updateGateway(gateway.id, {})}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}