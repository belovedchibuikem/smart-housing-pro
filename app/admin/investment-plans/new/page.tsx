"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Upload, X, FileText } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NewInvestmentPlanPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    investmentType: "money",
    targetAmount: "",
    minInvestment: "",
    maxInvestment: "",
    // Land-specific fields
    location: "",
    landSize: "",
    pricePerSqm: "",
    totalPlots: "",
    // House-specific fields
    houseType: "",
    numberOfUnits: "",
    pricePerUnit: "",
    roi: "",
    roiPaymentMode: "quarterly",
    closingDate: "",
    moratoriumMonths: "",
    allowMultipleInvestments: true,
  })

  const [images, setImages] = useState<File[]>([])
  const [documents, setDocuments] = useState<File[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)])
    }
  }

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    // Handle create investment plan with images and documents
    router.push("/admin/investment-plans")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/investment-plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Investment Plan</h1>
          <p className="text-muted-foreground mt-1">Set up a new investment opportunity for members</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="investmentType">Investment Type</Label>
            <Select
              value={formData.investmentType}
              onValueChange={(value) => setFormData({ ...formData, investmentType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="money">Money (Cash Investment)</SelectItem>
                <SelectItem value="land">Land</SelectItem>
                <SelectItem value="house">House</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Investment Plan Name</Label>
            <Input
              id="name"
              placeholder="e.g., Housing Development Project Phase 3"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the investment opportunity..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {formData.investmentType === "money" && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount (₦)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="50000000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closingDate">Closing Date</Label>
                  <Input
                    id="closingDate"
                    type="date"
                    value={formData.closingDate}
                    onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minInvestment">Minimum Investment (₦)</Label>
                  <Input
                    id="minInvestment"
                    type="number"
                    placeholder="100000"
                    value={formData.minInvestment}
                    onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxInvestment">Maximum Investment (₦)</Label>
                  <Input
                    id="maxInvestment"
                    type="number"
                    placeholder="5000000"
                    value={formData.maxInvestment}
                    onChange={(e) => setFormData({ ...formData, maxInvestment: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="roi">ROI (% per annum)</Label>
                  <Input
                    id="roi"
                    type="number"
                    placeholder="15"
                    value={formData.roi}
                    onChange={(e) => setFormData({ ...formData, roi: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roiPaymentMode">ROI Payment Mode</Label>
                  <Select
                    value={formData.roiPaymentMode}
                    onValueChange={(value) => setFormData({ ...formData, roiPaymentMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="biannually">Bi-annually</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                      <SelectItem value="maturity">At Maturity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moratoriumMonths">Moratorium Period (months)</Label>
                <Input
                  id="moratoriumMonths"
                  type="number"
                  placeholder="6"
                  value={formData.moratoriumMonths}
                  onChange={(e) => setFormData({ ...formData, moratoriumMonths: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">Grace period before investment starts yielding profit</p>
              </div>
            </>
          )}

          {formData.investmentType === "land" && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Abuja, Gwarinpa Estate"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="landSize">Total Land Size (sqm)</Label>
                  <Input
                    id="landSize"
                    type="number"
                    placeholder="10000"
                    value={formData.landSize}
                    onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pricePerSqm">Price per Sqm (₦)</Label>
                  <Input
                    id="pricePerSqm"
                    type="number"
                    placeholder="50000"
                    value={formData.pricePerSqm}
                    onChange={(e) => setFormData({ ...formData, pricePerSqm: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPlots">Number of Plots Available</Label>
                  <Input
                    id="totalPlots"
                    type="number"
                    placeholder="50"
                    value={formData.totalPlots}
                    onChange={(e) => setFormData({ ...formData, totalPlots: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingDate">Closing Date</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                />
              </div>
            </>
          )}

          {formData.investmentType === "house" && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Lagos, Lekki Phase 1"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="houseType">House Type</Label>
                  <Select
                    value={formData.houseType}
                    onValueChange={(value) => setFormData({ ...formData, houseType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select house type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bungalow">Bungalow</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                      <SelectItem value="terrace">Terrace</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="mansion">Mansion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="numberOfUnits">Number of Units Available</Label>
                  <Input
                    id="numberOfUnits"
                    type="number"
                    placeholder="20"
                    value={formData.numberOfUnits}
                    onChange={(e) => setFormData({ ...formData, numberOfUnits: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerUnit">Price per Unit (₦)</Label>
                  <Input
                    id="pricePerUnit"
                    type="number"
                    placeholder="25000000"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingDate">Closing Date</Label>
                <Input
                  id="closingDate"
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => setFormData({ ...formData, closingDate: e.target.value })}
                />
              </div>
            </>
          )}

          {(formData.investmentType === "land" || formData.investmentType === "house") && (
            <>
              <div className="space-y-3 pt-4 border-t">
                <Label>Property Images</Label>
                <p className="text-sm text-muted-foreground">Upload images of the property (land or house)</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label>Property Documents</Label>
                <p className="text-sm text-muted-foreground">
                  Upload relevant documents (title deeds, survey plans, building permits, etc.)
                </p>
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeDocument(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Document</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      multiple
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 pt-4 border-t">
            <Button onClick={handleSubmit}>
              <Save className="h-4 w-4 mr-2" />
              Create Investment Plan
            </Button>
            <Link href="/admin/investment-plans">
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
