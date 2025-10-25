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
import { Separator } from "@/components/ui/separator"
import { CreditCard, DollarSign, Building2, Wallet, Eye, EyeOff, Save, AlertCircle, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface BankAccount {
  bank_name: string
  account_number: string
  account_name: string
  account_type: string
}

interface PaymentGateway {
  id: string
  name: string
  display_name: string
  description: string
  is_active: boolean
  settings: {
    secret_key?: string
    public_key?: string
    publishable_key?: string
    merchant_id?: string
    api_key?: string
    service_type_id?: string
    webhook_secret?: string
    test_mode?: boolean
  }
  supported_currencies: string[]
  supported_countries: string[]
  transaction_fee_percentage: number
  transaction_fee_fixed: number
  minimum_amount: number
  maximum_amount: number
  platform_fee_percentage: number
  platform_fee_fixed: number
}

interface PaymentGatewaysResponse {
  gateways: PaymentGateway[]
}

export default function SuperAdminPaymentGatewaysPage() {
  const { toast } = useToast()
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])

  useEffect(() => {
    loadGateways()
  }, [])

  const loadGateways = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<PaymentGatewaysResponse>("/super-admin/payment-gateways")
      setGateways(response.gateways || [])
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

  const updateGateway = async (gatewayName: string, updates: Partial<PaymentGateway['settings']>) => {
    try {
      const gateway = gateways.find(g => g.name?.toLowerCase() === gatewayName.toLowerCase())
      if (!gateway) return

      const updatedSettings = { ...gateway.settings, ...updates }
      
      await apiFetch(`/super-admin/payment-gateways/${gateway.id}`, {
        method: "PUT",
        body: {
          is_active: updates.is_active !== undefined ? updates.is_active : gateway.is_active,
          settings: updatedSettings,
        },
      })

      // Update local state
      setGateways(prev => prev.map(g => 
        g.id === gateway.id 
          ? { ...g, settings: updatedSettings, is_active: updates.is_active !== undefined ? updates.is_active : g.is_active }
          : g
      ))

      toast({
        title: "Success",
        description: `${gateway.display_name} settings updated successfully`,
      })
    } catch (error) {
      console.error("Error updating gateway:", error)
      toast({
        title: "Error",
        description: "Failed to update gateway settings",
        variant: "destructive",
      })
    }
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const addBankAccount = () => {
    setBankAccounts(prev => [...prev, {
      bank_name: "",
      account_number: "",
      account_name: "",
      account_type: "savings"
    }])
  }

  const removeBankAccount = (index: number) => {
    setBankAccounts(prev => prev.filter((_, i) => i !== index))
  }

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    setBankAccounts(prev => prev.map((account, i) => 
      i === index ? { ...account, [field]: value } : account
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateway Setup</h1>
          <p className="text-muted-foreground mt-2">Configure your payment gateways to accept payments from members</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading payment gateways...</div>
        </div>
      </div>
    )
  }

  // Find gateways by name
  const paystackGateway = gateways.find((g) => g.name?.toLowerCase() === "paystack")
  const remitaGateway = gateways.find((g) => g.name?.toLowerCase() === "remita")
  const stripeGateway = gateways.find((g) => g.name?.toLowerCase() === "stripe")
  const manualGateway = gateways.find((g) => g.name?.toLowerCase() === "manual")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Gateway Setup</h1>
        <p className="text-muted-foreground mt-2">Configure your payment gateways to accept payments from members</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Your payment gateway credentials are encrypted and stored securely. Never share your secret keys with anyone.
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

        {/* Paystack Gateway */}
        <TabsContent value="paystack">
          {paystackGateway && (
            <Card>
              <CardHeader>
      <div className="flex items-center justify-between">
        <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Paystack Configuration
                    </CardTitle>
                    <CardDescription>Configure Paystack payment gateway for card and bank payments</CardDescription>
                  </div>
                  <Badge variant={paystackGateway.is_active ? "default" : "secondary"}>
                    {paystackGateway.is_active ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Paystack</Label>
                    <p className="text-sm text-muted-foreground">Accept payments via Paystack</p>
                  </div>
                  <Switch
                    checked={paystackGateway.is_active}
                    onCheckedChange={(checked) => updateGateway("paystack", { is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-muted-foreground">Use test credentials for development</p>
                  </div>
                  <Switch
                    checked={paystackGateway.settings.test_mode || false}
                    onCheckedChange={(checked) => updateGateway("paystack", { test_mode: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paystack-public-key">Public Key</Label>
                    <Input
                      id="paystack-public-key"
                      placeholder="pk_test_xxxxxxxxxxxxx or pk_live_xxxxxxxxxxxxx"
                      value={paystackGateway.settings.public_key || ""}
                      onChange={(e) => updateGateway("paystack", { public_key: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paystack-secret-key">Secret Key</Label>
                    <div className="relative">
                      <Input
                        id="paystack-secret-key"
                        type={showSecrets["paystack-secret"] ? "text" : "password"}
                        placeholder="sk_test_xxxxxxxxxxxxx or sk_live_xxxxxxxxxxxxx"
                        value={paystackGateway.settings.secret_key || ""}
                        onChange={(e) => updateGateway("paystack", { secret_key: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleSecretVisibility("paystack-secret")}
                      >
                        {showSecrets["paystack-secret"] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
        </div>
      </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Paystack Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Remita Gateway */}
        <TabsContent value="remita">
          {remitaGateway && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
              <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Remita Configuration
                    </CardTitle>
                    <CardDescription>Configure Remita payment gateway for bank transfers and collections</CardDescription>
                  </div>
                  <Badge variant={remitaGateway.is_active ? "default" : "secondary"}>
                    {remitaGateway.is_active ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Remita</Label>
                    <p className="text-sm text-muted-foreground">Accept payments via Remita</p>
              </div>
                  <Switch
                    checked={remitaGateway.is_active}
                    onCheckedChange={(checked) => updateGateway("remita", { is_active: checked })}
                  />
            </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-muted-foreground">Use test credentials for development</p>
                  </div>
                  <Switch
                    checked={remitaGateway.settings.test_mode || false}
                    onCheckedChange={(checked) => updateGateway("remita", { test_mode: checked })}
                  />
              </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="remita-merchant-id">Merchant ID</Label>
                    <Input
                      id="remita-merchant-id"
                      placeholder="Enter your Remita Merchant ID"
                      value={remitaGateway.settings.merchant_id || ""}
                      onChange={(e) => updateGateway("remita", { merchant_id: e.target.value })}
                    />
            </div>

                  <div className="space-y-2">
                    <Label htmlFor="remita-api-key">API Key</Label>
                    <div className="relative">
                      <Input
                        id="remita-api-key"
                        type={showSecrets["remita-api"] ? "text" : "password"}
                        placeholder="Enter your Remita API Key"
                        value={remitaGateway.settings.api_key || ""}
                        onChange={(e) => updateGateway("remita", { api_key: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleSecretVisibility("remita-api")}
                      >
                        {showSecrets["remita-api"] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
              </div>
            </div>

                  <div className="space-y-2">
                    <Label htmlFor="remita-service-type-id">Service Type ID</Label>
                    <Input
                      id="remita-service-type-id"
                      placeholder="Enter your Remita Service Type ID"
                      value={remitaGateway.settings.service_type_id || ""}
                      onChange={(e) => updateGateway("remita", { service_type_id: e.target.value })}
                    />
              </div>
            </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Remita Settings
                </Button>
              </CardContent>
          </Card>
          )}
        </TabsContent>

        {/* Stripe Gateway */}
        <TabsContent value="stripe">
          {stripeGateway && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Stripe Configuration
                    </CardTitle>
                    <CardDescription>Configure Stripe payment gateway for international payments</CardDescription>
                    </div>
                  <Badge variant={stripeGateway.is_active ? "default" : "secondary"}>
                    {stripeGateway.is_active ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Stripe</Label>
                    <p className="text-sm text-muted-foreground">Accept payments via Stripe</p>
                  </div>
                  <Switch
                    checked={stripeGateway.is_active}
                    onCheckedChange={(checked) => updateGateway("stripe", { is_active: checked })}
                  />
                </div>

                  <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Test Mode</Label>
                    <p className="text-sm text-muted-foreground">Use test credentials for development</p>
                  </div>
                    <Switch
                    checked={stripeGateway.settings.test_mode || false}
                    onCheckedChange={(checked) => updateGateway("stripe", { test_mode: checked })}
                    />
                  </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
                    <Input
                      id="stripe-publishable-key"
                      placeholder="pk_test_xxxxxxxxxxxxx or pk_live_xxxxxxxxxxxxx"
                      value={stripeGateway.settings.publishable_key || ""}
                      onChange={(e) => updateGateway("stripe", { publishable_key: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stripe-secret-key">Secret Key</Label>
                    <div className="relative">
                      <Input
                        id="stripe-secret-key"
                        type={showSecrets["stripe-secret"] ? "text" : "password"}
                        placeholder="sk_test_xxxxxxxxxxxxx or sk_live_xxxxxxxxxxxxx"
                        value={stripeGateway.settings.secret_key || ""}
                        onChange={(e) => updateGateway("stripe", { secret_key: e.target.value })}
                      />
                    <Button
                        type="button"
                        variant="ghost"
                      size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => toggleSecretVisibility("stripe-secret")}
                      >
                        {showSecrets["stripe-secret"] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                    </Button>
                  </div>
                </div>
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Stripe Settings
                </Button>
              </CardContent>
              </Card>
          )}
        </TabsContent>

        {/* Manual Gateway */}
        <TabsContent value="manual">
          {manualGateway && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Manual Payment Configuration
                    </CardTitle>
                    <CardDescription>Configure bank accounts for manual bank transfer payments</CardDescription>
            </div>
                  <Badge variant={manualGateway.is_active ? "default" : "secondary"}>
                    {manualGateway.is_active ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Manual Payments</Label>
                    <p className="text-sm text-muted-foreground">Accept manual bank transfer payments</p>
                </div>
                  <Switch
                    checked={manualGateway.is_active}
                    onCheckedChange={(checked) => updateGateway("manual", { is_active: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Bank Accounts</Label>
                    <Button onClick={addBankAccount} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
              </div>

                  {bankAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No bank accounts added yet</p>
                      <p className="text-sm text-muted-foreground">Click "Add Account" to add your first bank account</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bankAccounts.map((account, index) => (
                        <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Bank Account {index + 1}</h4>
                            <Button
                              onClick={() => removeBankAccount(index)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Bank Name</Label>
                              <Input
                                placeholder="Enter bank name"
                                value={account.bank_name}
                                onChange={(e) => updateBankAccount(index, "bank_name", e.target.value)}
              />
            </div>
                            <div className="space-y-2">
                              <Label>Account Number</Label>
                              <Input
                                placeholder="Enter account number"
                                value={account.account_number}
                                onChange={(e) => updateBankAccount(index, "account_number", e.target.value)}
                              />
                </div>
                            <div className="space-y-2">
                              <Label>Account Name</Label>
                              <Input
                                placeholder="Enter account name"
                                value={account.account_name}
                                onChange={(e) => updateBankAccount(index, "account_name", e.target.value)}
                              />
                </div>
                            <div className="space-y-2">
                              <Label>Account Type</Label>
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={account.account_type}
                                onChange={(e) => updateBankAccount(index, "account_type", e.target.value)}
                              >
                                <option value="savings">Savings</option>
                                <option value="current">Current</option>
                              </select>
                </div>
                          </div>
                        </Card>
                      ))}
              </div>
            )}
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Manual Payment Settings
                </Button>
              </CardContent>
          </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
