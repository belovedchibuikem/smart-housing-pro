"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function LoanSettingsPage() {
  const [settings, setSettings] = useState({
    autoApproval: false,
    maxLoanAmount: "10000000",
    minLoanAmount: "100000",
    defaultInterestRate: "12",
    maxTenure: "25",
    loanToNetPayPercentage: "40",
    requireGuarantor: true,
    requireCollateral: false,
    gracePeriod: "30",
    penaltyRate: "2",
  })

  const handleSave = () => {
    console.log("Saving loan settings:", settings)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/loans">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Loan Settings</h1>
          <p className="text-muted-foreground mt-1">Configure loan system parameters and rules</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="limits">Limits & Rates</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="penalties">Penalties</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general loan system behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Approval</Label>
                  <p className="text-sm text-muted-foreground">Automatically approve loans that meet criteria</p>
                </div>
                <Switch
                  checked={settings.autoApproval}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproval: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gracePeriod">Grace Period (days)</Label>
                <Input
                  id="gracePeriod"
                  type="number"
                  value={settings.gracePeriod}
                  onChange={(e) => setSettings({ ...settings, gracePeriod: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">Number of days before first repayment is due</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle>Loan Limits & Interest Rates</CardTitle>
              <CardDescription>Set minimum and maximum loan amounts and default rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minLoanAmount">Minimum Loan Amount (₦)</Label>
                  <Input
                    id="minLoanAmount"
                    type="number"
                    value={settings.minLoanAmount}
                    onChange={(e) => setSettings({ ...settings, minLoanAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLoanAmount">Maximum Loan Amount (₦)</Label>
                  <Input
                    id="maxLoanAmount"
                    type="number"
                    value={settings.maxLoanAmount}
                    onChange={(e) => setSettings({ ...settings, maxLoanAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultInterestRate">Default Interest Rate (%)</Label>
                  <Input
                    id="defaultInterestRate"
                    type="number"
                    step="0.1"
                    value={settings.defaultInterestRate}
                    onChange={(e) => setSettings({ ...settings, defaultInterestRate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTenure">Maximum Tenure (months)</Label>
                  <Input
                    id="maxTenure"
                    type="number"
                    value={settings.maxTenure}
                    onChange={(e) => setSettings({ ...settings, maxTenure: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Maximum repayment period in months</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loanToNetPayPercentage">Max Loan Repayment to Net Pay (%)</Label>
                  <Input
                    id="loanToNetPayPercentage"
                    type="number"
                    step="0.1"
                    value={settings.loanToNetPayPercentage}
                    onChange={(e) => setSettings({ ...settings, loanToNetPayPercentage: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum percentage of net pay that can go to loan repayment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Loan Requirements</CardTitle>
              <CardDescription>Configure what is required for loan approval</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Guarantor</Label>
                  <p className="text-sm text-muted-foreground">Members must provide a guarantor for loans</p>
                </div>
                <Switch
                  checked={settings.requireGuarantor}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireGuarantor: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Collateral</Label>
                  <p className="text-sm text-muted-foreground">Members must provide collateral for large loans</p>
                </div>
                <Switch
                  checked={settings.requireCollateral}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireCollateral: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="penalties">
          <Card>
            <CardHeader>
              <CardTitle>Penalty Settings</CardTitle>
              <CardDescription>Configure penalties for late payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="penaltyRate">Late Payment Penalty Rate (%)</Label>
                <Input
                  id="penaltyRate"
                  type="number"
                  step="0.1"
                  value={settings.penaltyRate}
                  onChange={(e) => setSettings({ ...settings, penaltyRate: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">Additional interest charged on overdue payments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
