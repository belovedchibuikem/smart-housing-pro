"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, AlertCircle, Banknote, Calendar, User, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

interface ManualPaymentFormProps {
  tenantId: string
  paymentType: string
  amount: number
  currency?: string
  metadata?: Record<string, any>
  onSuccess?: (transaction: any) => void
}

export function ManualPaymentForm({ 
  tenantId, 
  paymentType, 
  amount, 
  currency = 'NGN',
  metadata = {},
  onSuccess 
}: ManualPaymentFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bank_reference: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    payment_date: '',
    payment_evidence: [] as string[],
    notes: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real implementation, you would upload files to a storage service
      // For now, we'll just simulate file URLs
      const fileUrls = Array.from(files).map(file => URL.createObjectURL(file))
      setFormData(prev => ({
        ...prev,
        payment_evidence: [...prev.payment_evidence, ...fileUrls]
      }))
    }
  }

  const removeEvidence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      payment_evidence: prev.payment_evidence.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.bank_reference || !formData.bank_name || !formData.account_number || !formData.account_name || !formData.payment_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      const response = await apiFetch('/super-admin/payment-gateways/manual-payment', {
        method: 'POST',
        body: {
          tenant_id: tenantId,
          type: paymentType,
          amount: amount,
          currency: currency,
          bank_reference: formData.bank_reference,
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_name: formData.account_name,
          payment_date: formData.payment_date,
          payment_evidence: formData.payment_evidence,
          metadata: {
            ...metadata,
            notes: formData.notes
          }
        }
      })

      toast({
        title: "Success",
        description: "Manual payment submitted successfully. It will be reviewed by our team.",
      })

      if (onSuccess) {
        onSuccess(response.transaction)
      }

    } catch (error) {
      console.error('Error submitting manual payment:', error)
      toast({
        title: "Error",
        description: "Failed to submit manual payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" />
          Manual Payment Submission
        </CardTitle>
        <CardDescription>
          Submit your bank transfer details for manual payment processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please ensure you have made the payment to the bank account details provided. 
            Your payment will be reviewed and approved within 24-48 hours.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_reference">Bank Reference/Transaction ID *</Label>
              <Input
                id="bank_reference"
                placeholder="Enter your bank transaction reference"
                value={formData.bank_reference}
                onChange={(e) => handleInputChange('bank_reference', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank Name *</Label>
              <Input
                id="bank_name"
                placeholder="Enter bank name"
                value={formData.bank_name}
                onChange={(e) => handleInputChange('bank_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number *</Label>
              <Input
                id="account_number"
                placeholder="Enter account number used"
                value={formData.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                id="account_name"
                placeholder="Enter account holder name"
                value={formData.account_name}
                onChange={(e) => handleInputChange('account_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => handleInputChange('payment_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Amount</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={`${amount.toLocaleString()} ${currency}`}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_evidence">Payment Evidence (Receipt/Screenshot)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload payment receipt or screenshot
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="max-w-xs mx-auto"
                />
              </div>
              
              {formData.payment_evidence.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Uploaded Files:</p>
                  <div className="space-y-2">
                    {formData.payment_evidence.map((url, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{url}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvidence(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about your payment..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Payment Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Payment Type:</span>
                <span className="font-medium">{paymentType.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{amount.toLocaleString()} {currency}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-orange-600 font-medium">Pending Approval</span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting Payment...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Manual Payment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
