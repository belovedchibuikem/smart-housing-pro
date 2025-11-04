"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface SetupStatus {
  setup_completed: boolean
  is_enabled: boolean
  primary_network: string
  wallets_count: number
  has_default_wallet: boolean
}

export default function BlockchainSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null)

  // Step 1: Network Settings
  const [networkSettings, setNetworkSettings] = useState({
    primary_network: "ethereum",
    ethereum_rpc_url: "",
    polygon_rpc_url: "",
    bsc_rpc_url: "",
    arbitrum_rpc_url: "",
    optimism_rpc_url: "",
  })

  // Step 2: Explorer API Keys
  const [apiKeys, setApiKeys] = useState({
    etherscan_api_key: "",
    polygonscan_api_key: "",
    bscscan_api_key: "",
    arbiscan_api_key: "",
    optimistic_etherscan_api_key: "",
  })

  // Step 3: Smart Contracts
  const [contracts, setContracts] = useState({
    ethereum_contract_address: "",
    polygon_contract_address: "",
    bsc_contract_address: "",
    arbitrum_contract_address: "",
    optimism_contract_address: "",
  })

  // Step 4: Wallet
  const [wallet, setWallet] = useState({
    action: "import" as "create" | "import",
    network: "ethereum",
    name: "",
    private_key: "",
    address: "",
    mnemonic: "",
  })

  // Step 5: Complete
  const [finalSettings, setFinalSettings] = useState({
    webhooks_enabled: false,
    webhook_secret: "",
    webhook_url: "",
    gas_price_multiplier: 1.2,
    default_gas_limit: 100000,
  })

  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    checkSetupStatus()
  }, [])

  const checkSetupStatus = async () => {
    try {
      setLoading(true)
      const response = await apiFetch<{ success: boolean; data: any }>("/admin/blockchain-setup/status")
      if (response.success) {
        setSetupStatus(response.data)
        
        // Pre-fill form if already started
        if (response.data.settings) {
          const settings = response.data.settings
          setNetworkSettings({
            primary_network: settings.primary_network || "ethereum",
            ethereum_rpc_url: settings.ethereum_rpc_url || "",
            polygon_rpc_url: settings.polygon_rpc_url || "",
            bsc_rpc_url: settings.bsc_rpc_url || "",
            arbitrum_rpc_url: settings.arbitrum_rpc_url || "",
            optimism_rpc_url: settings.optimism_rpc_url || "",
          })
          setApiKeys({
            etherscan_api_key: settings.etherscan_api_key || "",
            polygonscan_api_key: settings.polygonscan_api_key || "",
            bscscan_api_key: settings.bscscan_api_key || "",
            arbiscan_api_key: settings.arbiscan_api_key || "",
            optimistic_etherscan_api_key: settings.optimistic_etherscan_api_key || "",
          })
          setContracts({
            ethereum_contract_address: settings.ethereum_contract_address || "",
            polygon_contract_address: settings.polygon_contract_address || "",
            bsc_contract_address: settings.bsc_contract_address || "",
            arbitrum_contract_address: settings.arbitrum_contract_address || "",
            optimism_contract_address: settings.optimism_contract_address || "",
          })
        }

        // If already completed, redirect to blockchain page
        if (response.data.setup_completed) {
          router.push("/admin/blockchain")
          return
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to check setup status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStep1 = async () => {
    try {
      setSaving(true)
      const response = await apiFetch<{ success: boolean; message: string }>("/admin/blockchain-setup/step-1-network", {
        method: "POST",
        body: networkSettings,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Network settings saved",
        })
        setCurrentStep(2)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save network settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleStep2 = async () => {
    try {
      setSaving(true)
      const response = await apiFetch<{ success: boolean; message: string }>("/admin/blockchain-setup/step-2-explorer", {
        method: "POST",
        body: apiKeys,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "API keys saved",
        })
        setCurrentStep(3)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save API keys",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleStep3 = async () => {
    try {
      setSaving(true)
      const response = await apiFetch<{ success: boolean; message: string }>("/admin/blockchain-setup/step-3-contracts", {
        method: "POST",
        body: contracts,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Contract addresses saved",
        })
        setCurrentStep(4)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save contract addresses",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleStep4 = async () => {
    if (!wallet.name || !wallet.address || !wallet.private_key) {
      toast({
        title: "Error",
        description: "Please fill in all required wallet fields",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)
      const response = await apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-setup/step-4-wallet", {
        method: "POST",
        body: wallet,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Wallet imported successfully",
        })
        setCurrentStep(5)
        await checkSetupStatus()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import wallet",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleStep5 = async () => {
    try {
      setSaving(true)
      const response = await apiFetch<{ success: boolean; message: string }>("/admin/blockchain-setup/step-5-complete", {
        method: "POST",
        body: finalSettings,
      })

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Blockchain setup completed!",
        })
        router.push("/admin/blockchain")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete setup",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async (network: string, rpcUrl: string) => {
    if (!rpcUrl) {
      toast({
        title: "Error",
        description: "Please enter an RPC URL first",
        variant: "destructive",
      })
      return
    }

    try {
      setTestingConnection(true)
      const response = await apiFetch<{ success: boolean; message: string; data: any }>("/admin/blockchain-setup/test-connection", {
        method: "POST",
        body: { network, rpc_url: rpcUrl },
      })

      if (response.success) {
        toast({
          title: "Success",
          description: `Connected to ${network}! Block number: ${response.data?.block_number}`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Connection test failed",
        variant: "destructive",
      })
    } finally {
      setTestingConnection(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const steps = [
    { number: 1, title: "Network Configuration", description: "Set up RPC URLs for blockchain networks" },
    { number: 2, title: "Explorer API Keys", description: "Configure API keys for transaction verification" },
    { number: 3, title: "Smart Contracts", description: "Add your property registry contract addresses" },
    { number: 4, title: "Wallet Setup", description: "Import or create a wallet for transactions" },
    { number: 5, title: "Finalize Setup", description: "Configure webhooks and complete setup" },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-bold">Blockchain Setup Wizard</h1>
        <p className="text-muted-foreground mt-1">Configure blockchain integration for your organization</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep > step.number
                        ? "bg-green-500 border-green-500 text-white"
                        : currentStep === step.number
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-muted border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step.number}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs font-medium">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step.number ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Network Configuration */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Network Configuration</CardTitle>
            <CardDescription>Configure RPC URLs for blockchain networks. You can use public RPCs or your own Infura/Alchemy endpoints.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Primary Network *</Label>
              <Select
                value={networkSettings.primary_network}
                onValueChange={(value) => setNetworkSettings({ ...networkSettings, primary_network: value })}
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

            {["ethereum", "polygon", "bsc", "arbitrum", "optimism"].map((network) => (
              <div key={network} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{network.charAt(0).toUpperCase() + network.slice(1)} RPC URL</Label>
                  {networkSettings[`${network}_rpc_url` as keyof typeof networkSettings] && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(network, networkSettings[`${network}_rpc_url` as keyof typeof networkSettings] as string)}
                      disabled={testingConnection}
                    >
                      {testingConnection ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test"}
                    </Button>
                  )}
                </div>
                <Input
                  placeholder={
                    network === "ethereum"
                      ? "https://mainnet.infura.io/v3/YOUR_API_KEY"
                      : network === "polygon"
                      ? "https://polygon-mainnet.infura.io/v3/YOUR_API_KEY"
                      : network === "bsc"
                      ? "https://bsc-dataseed.binance.org"
                      : `Enter ${network} RPC URL`
                  }
                  value={networkSettings[`${network}_rpc_url` as keyof typeof networkSettings] as string}
                  onChange={(e) =>
                    setNetworkSettings({
                      ...networkSettings,
                      [`${network}_rpc_url`]: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default public RPC (not recommended for production)
                </p>
              </div>
            ))}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.push("/admin/blockchain")}>
                Cancel
              </Button>
              <Button onClick={handleStep1} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Explorer API Keys */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Explorer API Keys</CardTitle>
            <CardDescription>
              Get API keys from blockchain explorers for transaction verification. These are free to obtain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm">
                <strong>How to get API keys:</strong>
              </p>
              <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                <li>Etherscan: https://etherscan.io/apis</li>
                <li>PolygonScan: https://polygonscan.com/apis</li>
                <li>BSCScan: https://bscscan.com/apis</li>
                <li>Arbiscan: https://arbiscan.io/apis</li>
                <li>Optimistic Etherscan: https://optimistic.etherscan.io/apis</li>
              </ul>
            </div>

            {[
              { key: "etherscan_api_key", label: "Etherscan API Key", network: "Ethereum" },
              { key: "polygonscan_api_key", label: "PolygonScan API Key", network: "Polygon" },
              { key: "bscscan_api_key", label: "BSCScan API Key", network: "BSC" },
              { key: "arbiscan_api_key", label: "Arbiscan API Key", network: "Arbitrum" },
              { key: "optimistic_etherscan_api_key", label: "Optimistic Etherscan API Key", network: "Optimism" },
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <Label>{item.label}</Label>
                <Input
                  type="password"
                  placeholder={`Enter ${item.network} API key (optional but recommended)`}
                  value={apiKeys[item.key as keyof typeof apiKeys]}
                  onChange={(e) => setApiKeys({ ...apiKeys, [item.key]: e.target.value })}
                />
              </div>
            ))}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleStep2} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Smart Contracts */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Smart Contract Addresses</CardTitle>
            <CardDescription>
              Enter your deployed property registry smart contract addresses. Leave empty if you haven't deployed contracts yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { key: "ethereum_contract_address", label: "Ethereum Contract Address" },
              { key: "polygon_contract_address", label: "Polygon Contract Address" },
              { key: "bsc_contract_address", label: "BSC Contract Address" },
              { key: "arbitrum_contract_address", label: "Arbitrum Contract Address" },
              { key: "optimism_contract_address", label: "Optimism Contract Address" },
            ].map((item) => (
              <div key={item.key} className="space-y-2">
                <Label>{item.label}</Label>
                <Input
                  placeholder="0x..."
                  value={contracts[item.key as keyof typeof contracts]}
                  onChange={(e) => setContracts({ ...contracts, [item.key]: e.target.value })}
                />
              </div>
            ))}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleStep3} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Wallet Setup */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Wallet Setup</CardTitle>
            <CardDescription>
              Import a wallet to sign blockchain transactions. Make sure the wallet has native tokens (ETH, MATIC, etc.) for gas fees.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <strong>Security Notice:</strong> Your private key will be encrypted and stored securely. Never share your private key with anyone.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Network *</Label>
              <Select
                value={wallet.network}
                onValueChange={(value) => setWallet({ ...wallet, network: value })}
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
                value={wallet.name}
                onChange={(e) => setWallet({ ...wallet, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Wallet Address *</Label>
              <Input
                placeholder="0x..."
                value={wallet.address}
                onChange={(e) => setWallet({ ...wallet, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Private Key *</Label>
              <Input
                type="password"
                placeholder="Enter private key (will be encrypted)"
                value={wallet.private_key}
                onChange={(e) => setWallet({ ...wallet, private_key: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                The private key will be encrypted using Laravel's encryption system
              </p>
            </div>

            <div className="space-y-2">
              <Label>Mnemonic Phrase (Optional)</Label>
              <Input
                type="password"
                placeholder="Enter mnemonic phrase if available"
                value={wallet.mnemonic}
                onChange={(e) => setWallet({ ...wallet, mnemonic: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleStep4} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import Wallet <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete Setup */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 5: Finalize Setup</CardTitle>
            <CardDescription>Configure optional webhook settings and complete the setup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="webhooks_enabled"
                  checked={finalSettings.webhooks_enabled}
                  onChange={(e) => setFinalSettings({ ...finalSettings, webhooks_enabled: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="webhooks_enabled">Enable Webhooks</Label>
              </div>

              {finalSettings.webhooks_enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input
                      placeholder="https://your-domain.com/api/webhooks/blockchain"
                      value={finalSettings.webhook_url}
                      onChange={(e) => setFinalSettings({ ...finalSettings, webhook_url: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook Secret</Label>
                    <Input
                      type="password"
                      placeholder="Enter webhook secret for verification"
                      value={finalSettings.webhook_secret}
                      onChange={(e) => setFinalSettings({ ...finalSettings, webhook_secret: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Gas Price Multiplier</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={finalSettings.gas_price_multiplier}
                  onChange={(e) => setFinalSettings({ ...finalSettings, gas_price_multiplier: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Multiply gas price by this factor for faster confirmations (default: 1.2 = 20% faster)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Default Gas Limit</Label>
                <Input
                  type="number"
                  min="21000"
                  value={finalSettings.default_gas_limit}
                  onChange={(e) => setFinalSettings({ ...finalSettings, default_gas_limit: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {setupStatus?.has_default_wallet && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <strong>Ready to Complete!</strong>
                    <p className="text-sm mt-1">All required settings are configured. Click complete to finish setup.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleStep5} disabled={saving || !setupStatus?.has_default_wallet}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    Complete Setup <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

