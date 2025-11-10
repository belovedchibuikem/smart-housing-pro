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
import { toast as sonnerToast } from "sonner"
import { apiFetch } from "@/lib/api/client"

interface PaymentGateway {
  id: string
  name: string
  display_name: string
  description: string
  is_active: boolean
  settings: Record<string, any>
  configuration?: Record<string, any>
  supported_currencies?: string[]
  supported_countries?: string[]
  transaction_fee_percentage?: number
  transaction_fee_fixed?: number
  minimum_amount?: number
  maximum_amount?: number
  platform_fee_percentage?: number
  platform_fee_fixed?: number
  created_at?: string
  updated_at?: string
}

interface BankAccount {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  is_primary: boolean
}

export default function TenantPaymentGatewaysPage() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<string>("paystack")
  const [localSettings, setLocalSettings] = useState<Record<string, Record<string, any>>>({})
  const [localConfigs, setLocalConfigs] = useState<Record<string, Record<string, any>>>({})
  const [newBankAccount, setNewBankAccount] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    is_primary: false
  })

  const getDefaultManualConfig = () => ({
    require_payer_name: true,
    require_payer_phone: false,
    require_transaction_reference: true,
    require_payment_evidence: true,
    bank_accounts: [] as BankAccount[],
  })

  const prepareGatewayConfig = (gateway: PaymentGateway) => {
    if (gateway.name === "manual") {
      const merged = {
        ...getDefaultManualConfig(),
        ...(gateway.configuration || {}),
      }

      if (Array.isArray(merged.bank_accounts)) {
        merged.bank_accounts = merged.bank_accounts.map((account: BankAccount) => ({
          ...account,
          id:
            account.id ||
            (typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        }))
      } else {
        merged.bank_accounts = []
      }

      return merged
    }

    return gateway.configuration || {}
  }

  useEffect(() => {
    loadGateways()
  }, [])

  const createDefaultGateways = (): PaymentGateway[] => [
    {
      id: "default-paystack",
      name: "paystack",
      display_name: "Paystack",
      description: "Accept payments via Paystack",
      is_active: false,
      settings: {},
      configuration: {},
    },
    {
      id: "default-remita",
      name: "remita",
      display_name: "Remita",
      description: "Accept payments via Remita",
      is_active: false,
      settings: {},
      configuration: {},
    },
    {
      id: "default-stripe",
      name: "stripe",
      display_name: "Stripe",
      description: "Accept payments via Stripe",
      is_active: false,
      settings: {},
      configuration: {},
    },
    {
      id: "default-manual",
      name: "manual",
      display_name: "Manual Transfer",
      description: "Manual bank transfer payments",
      is_active: false,
      settings: {},
      configuration: getDefaultManualConfig(),
    },
  ]

  const loadGateways = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ gateways: PaymentGateway[] }>("/admin/payment-gateways")
      const gatewaysList = response.gateways || []
      
      const defaultGateways = createDefaultGateways()
      const existingByName = new Map<string, PaymentGateway>()
      gatewaysList.forEach((gateway) => {
        existingByName.set(gateway.name, gateway)
      })

      const merged = defaultGateways.map((template) => {
        const existing = existingByName.get(template.name)
        if (!existing) {
          return template
        }

        return {
          ...template,
          ...existing,
          id: existing.id,
          display_name: existing.display_name || template.display_name,
          description: existing.description || template.description,
          settings: existing.settings || existing.credentials || {},
          configuration:
            existing.name === "manual"
              ? prepareGatewayConfig(existing)
              : existing.configuration || template.configuration || {},
          is_active: existing.is_active,
        }
      })

      const additionalGateways = gatewaysList.filter(
        (gateway) => !merged.some((item) => item.name === gateway.name),
      )

      const combinedGateways = [...merged, ...additionalGateways]

      setGateways(combinedGateways)

        const settingsMap: Record<string, Record<string, any>> = {}
      const configMap: Record<string, Record<string, any>> = {}

      combinedGateways.forEach((gateway) => {
          settingsMap[gateway.name] = gateway.settings || {}
        configMap[gateway.name] = gateway.name === "manual"
          ? prepareGatewayConfig(gateway)
          : gateway.configuration || {}
        })

        setLocalSettings(settingsMap)
      setLocalConfigs(configMap)

      if (combinedGateways.length > 0) {
        setActiveTab(combinedGateways[0].name)
      }
    } catch (error: any) {
      console.error("Error loading gateways:", error)
      
      const defaultGateways = createDefaultGateways()
      setGateways(defaultGateways)
      
      const settingsMap: Record<string, Record<string, any>> = {}
      const configMap: Record<string, Record<string, any>> = {}
      defaultGateways.forEach((gateway) => {
        settingsMap[gateway.name] = gateway.settings || {}
        configMap[gateway.name] = gateway.configuration || {}
      })
      setLocalSettings(settingsMap)
      setLocalConfigs(configMap)
      setActiveTab(defaultGateways[0].name)
      
      sonnerToast.error("Failed to load payment gateways", {
        description: error.message || "Please try again later.",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateLocalSetting = (gatewayName: string, key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [gatewayName]: {
        ...(prev[gatewayName] || {}),
        [key]: value
      }
    }))
  }

  const updateLocalConfig = (gatewayName: string, key: string, value: any) => {
    setLocalConfigs(prev => ({
      ...prev,
      [gatewayName]: {
        ...(prev[gatewayName] || {}),
        [key]: value
      }
    }))
  }

  const saveGatewaySettings = async (gateway: PaymentGateway) => {
    try {
      setSaving(prev => ({ ...prev, [gateway.id]: true }))
      
      const settings = localSettings[gateway.name] || gateway.settings || {}
    const configuration = gateway.name === 'manual'
      ? (localConfigs[gateway.name] || gateway.configuration || {})
      : (gateway.configuration || {})
      
      // Use gateway name for lookup (works for both real IDs and default names)
      // The backend will handle finding by name if ID doesn't exist
      const gatewayIdentifier = gateway.id.startsWith('default-') ? gateway.name : gateway.id
      
      await apiFetch(`/admin/payment-gateways/${gatewayIdentifier}`, {
        method: "PUT",
        body: {
          is_active: gateway.is_active,
        settings: settings,
        configuration
        }
      })

      // Reload gateways to get updated data from server
      await loadGateways()

      sonnerToast.success("Settings saved successfully", {
        description: `${gateway.display_name} configuration has been updated.`
      })
    } catch (error: any) {
      console.error("Error saving gateway settings:", error)
      sonnerToast.error("Failed to save settings", {
        description: error.message || "Please check your input and try again."
      })
    } finally {
      setSaving(prev => ({ ...prev, [gateway.id]: false }))
    }
  }

  const toggleGatewayStatus = async (gateway: PaymentGateway) => {
    try {
      const newStatus = !gateway.is_active
      
      // Use gateway name for lookup (works for both real IDs and default names)
      const gatewayIdentifier = gateway.id.startsWith('default-') ? gateway.name : gateway.id
      
      await apiFetch(`/admin/payment-gateways/${gatewayIdentifier}`, {
        method: "PUT",
        body: {
          is_active: newStatus,
          settings: gateway.settings || localSettings[gateway.name] || {}
        }
      })

      // Reload gateways to get updated data from server
      await loadGateways()

      sonnerToast.success(
        newStatus ? "Gateway enabled" : "Gateway disabled",
        {
          description: `${gateway.display_name} has been ${newStatus ? 'enabled' : 'disabled'}.`
        }
      )
    } catch (error: any) {
      console.error("Error toggling gateway:", error)
      sonnerToast.error("Failed to update gateway status", {
        description: error.message || "Please try again."
      })
    }
  }

  const testConnection = async (gateway: PaymentGateway) => {
    try {
      // Use gateway name for lookup (works for both real IDs and default names)
      const gatewayIdentifier = gateway.id.startsWith('default-') ? gateway.name : gateway.id
      
      const response = await apiFetch<{ success: boolean; message: string }>(`/admin/payment-gateways/${gatewayIdentifier}/test`, {
        method: "POST"
      })

      if (response.success) {
        sonnerToast.success("Connection test successful", {
          description: response.message
        })
      } else {
        sonnerToast.error("Connection test failed", {
          description: response.message
        })
      }
    } catch (error: any) {
      console.error("Error testing connection:", error)
      sonnerToast.error("Connection test failed", {
        description: error.message || "Please check your configuration and try again."
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
      sonnerToast.error("Validation Error", {
        description: "Please fill in all bank account fields"
      })
      return
    }

    const account: BankAccount = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      ...newBankAccount
    }

    const existingAccounts = getConfig('manual', 'bank_accounts', []) as BankAccount[]
    const hasPrimary = existingAccounts.some(acc => acc.is_primary)
    const accounts = [
      ...existingAccounts,
      {
        ...account,
        is_primary: hasPrimary ? account.is_primary : true,
      },
    ]

    updateLocalConfig('manual', 'bank_accounts', accounts)
    setNewBankAccount({
      bank_name: "",
      account_number: "",
      account_name: "",
      is_primary: false
    })

    sonnerToast.success("Bank account added", {
      description: "Bank account has been added successfully."
    })
  }

  const removeBankAccount = (accountId: string) => {
    const updated = (getConfig('manual', 'bank_accounts', []) as BankAccount[]).filter(account => account.id !== accountId)
    updateLocalConfig('manual', 'bank_accounts', updated)
    sonnerToast.success("Bank account removed", {
      description: "Bank account has been removed."
    })
  }

  const updateBankAccount = (accountId: string, updates: Partial<BankAccount>) => {
    const accounts = (getConfig('manual', 'bank_accounts', []) as BankAccount[])
    const updatedAccounts = accounts.map(account => {
      if (account.id !== accountId) {
        if (updates.is_primary) {
          return { ...account, is_primary: false }
        }
        return account
      }

      return {
        ...account,
        ...updates,
        is_primary: updates.is_primary !== undefined ? updates.is_primary : account.is_primary,
      }
    })

    updateLocalConfig('manual', 'bank_accounts', updatedAccounts)
  }

  const getGateway = (name: string): PaymentGateway | undefined => {
    return gateways.find(g => g.name === name)
  }

  const getSetting = (gatewayName: string, key: string, defaultValue: any = ""): any => {
    const gateway = getGateway(gatewayName)
    if (localSettings[gatewayName] && localSettings[gatewayName][key] !== undefined) {
      return localSettings[gatewayName][key]
    }
    return gateway?.settings?.[key] || defaultValue
  }

  const getConfig = (gatewayName: string, key: string, defaultValue: any = ""): any => {
    if (localConfigs[gatewayName] && localConfigs[gatewayName][key] !== undefined) {
      return localConfigs[gatewayName][key]
    }
    const gateway = getGateway(gatewayName)
    return gateway?.configuration?.[key] ?? defaultValue
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
    return <Badge variant="default" className="bg-green-500">Active</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateways</h1>
          <p className="text-muted-foreground mt-2">Configure payment methods for member payments</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <div className="text-muted-foreground">Loading payment gateways...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!gateways || gateways.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Gateways</h1>
          <p className="text-muted-foreground mt-2">Configure payment methods for member payments</p>
        </div>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No payment gateways found. Please contact support to set up payment gateways.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${gateways.length === 4 ? 'grid-cols-4' : gateways.length === 3 ? 'grid-cols-3' : gateways.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {gateways.map((gateway) => {
            const iconMap: Record<string, any> = {
              paystack: <CreditCard className="h-4 w-4" />,
              remita: <Building2 className="h-4 w-4" />,
              stripe: <DollarSign className="h-4 w-4" />,
              manual: <Wallet className="h-4 w-4" />,
            }
            const Icon = iconMap[gateway.name] || <CreditCard className="h-4 w-4" />
            
            return (
              <TabsTrigger key={gateway.id} value={gateway.name} className="flex items-center gap-2">
                {Icon}
                {gateway.display_name || gateway.name}
              </TabsTrigger>
            )
          })}
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
                      onCheckedChange={() => toggleGatewayStatus(gateway)}
                    />
                  </div>
                </div>

                {gateway.name === 'paystack' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Paystack Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter your Paystack API keys. Get these from your Paystack dashboard.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paystack-public-key">Public Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="paystack-public-key"
                            type={showSecrets[`${gateway.id}_public_key`] ? "text" : "password"}
                            value={getSetting('paystack', 'public_key')}
                            onChange={(e) => updateLocalSetting('paystack', 'public_key', e.target.value)}
                            placeholder="pk_test_..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(gateway.id, 'public_key')}
                          >
                            {showSecrets[`${gateway.id}_public_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="paystack-secret-key">Secret Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="paystack-secret-key"
                            type={showSecrets[`${gateway.id}_secret_key`] ? "text" : "password"}
                            value={getSetting('paystack', 'secret_key')}
                            onChange={(e) => updateLocalSetting('paystack', 'secret_key', e.target.value)}
                            placeholder="sk_test_..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
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
                    <div>
                      <h4 className="font-medium mb-2">Remita Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter your Remita merchant credentials. Get these from your Remita dashboard.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="remita-merchant-id">Merchant ID</Label>
                        <Input
                          id="remita-merchant-id"
                          value={getSetting('remita', 'merchant_id')}
                          onChange={(e) => updateLocalSetting('remita', 'merchant_id', e.target.value)}
                          placeholder="Enter merchant ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="remita-api-key">API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="remita-api-key"
                            type={showSecrets[`${gateway.id}_api_key`] ? "text" : "password"}
                            value={getSetting('remita', 'api_key')}
                            onChange={(e) => updateLocalSetting('remita', 'api_key', e.target.value)}
                            placeholder="Enter API key"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(gateway.id, 'api_key')}
                          >
                            {showSecrets[`${gateway.id}_api_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="remita-service-type-id">Service Type ID</Label>
                        <Input
                          id="remita-service-type-id"
                          value={getSetting('remita', 'service_type_id')}
                          onChange={(e) => updateLocalSetting('remita', 'service_type_id', e.target.value)}
                          placeholder="Enter service type ID"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {gateway.name === 'stripe' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Stripe Configuration</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter your Stripe API keys. Get these from your Stripe dashboard.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stripe-publishable-key">Publishable Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="stripe-publishable-key"
                            type={showSecrets[`${gateway.id}_publishable_key`] ? "text" : "password"}
                            value={getSetting('stripe', 'publishable_key')}
                            onChange={(e) => updateLocalSetting('stripe', 'publishable_key', e.target.value)}
                            placeholder="pk_test_..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSecretVisibility(gateway.id, 'publishable_key')}
                          >
                            {showSecrets[`${gateway.id}_publishable_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="stripe-secret-key">Secret Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="stripe-secret-key"
                            type={showSecrets[`${gateway.id}_secret_key`] ? "text" : "password"}
                            value={getSetting('stripe', 'secret_key')}
                            onChange={(e) => updateLocalSetting('stripe', 'secret_key', e.target.value)}
                            placeholder="sk_test_..."
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
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
                          {(getConfig('manual', 'bank_accounts', []) as BankAccount[]).map((account) => (
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <Label className="text-sm">Require payer name</Label>
                            <p className="text-xs text-muted-foreground">Member must provide the sender's full name</p>
                          </div>
                          <Switch
                            checked={getConfig('manual', 'require_payer_name', true)}
                            onCheckedChange={(checked) => updateLocalConfig('manual', 'require_payer_name', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <Label className="text-sm">Require payer phone</Label>
                            <p className="text-xs text-muted-foreground">Collect member contact for follow-up</p>
                          </div>
                          <Switch
                            checked={getConfig('manual', 'require_payer_phone', false)}
                            onCheckedChange={(checked) => updateLocalConfig('manual', 'require_payer_phone', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <Label className="text-sm">Require transaction reference</Label>
                            <p className="text-xs text-muted-foreground">Member must provide bank transfer reference/ID</p>
                          </div>
                          <Switch
                            checked={getConfig('manual', 'require_transaction_reference', true)}
                            onCheckedChange={(checked) => updateLocalConfig('manual', 'require_transaction_reference', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between border rounded-lg p-3">
                          <div>
                            <Label className="text-sm">Require payment evidence upload</Label>
                            <p className="text-xs text-muted-foreground">Member must upload receipt or screenshot</p>
                          </div>
                          <Switch
                            checked={getConfig('manual', 'require_payment_evidence', true)}
                            onCheckedChange={(checked) => updateLocalConfig('manual', 'require_payment_evidence', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => testConnection(gateway)}
                    disabled={saving[gateway.id]}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button
                    onClick={() => saveGatewaySettings(gateway)}
                    disabled={saving[gateway.id]}
                  >
                    {saving[gateway.id] ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Configuration
                      </>
                    )}
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