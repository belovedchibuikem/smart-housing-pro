"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  createEcpmMaterialRequest,
  createEcpmPurchaseOrder,
  createEcpmStock,
  listEcpmMaterialRequests,
  listEcpmProjects,
  listEcpmPurchaseOrders,
  listEcpmStock,
} from "@/lib/api/ecpm"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function EcpmProcurementPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stock, setStock] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [pos, setPos] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [skuName, setSkuName] = useState("")
  const [projectId, setProjectId] = useState("")
  const [itemDesc, setItemDesc] = useState("Cement 50kg")
  const [qty, setQty] = useState("10")
  const [rate, setRate] = useState("5000")

  const load = async () => {
    try {
      setLoading(true)
      const [s, m, p, pr] = await Promise.all([
        listEcpmStock(), listEcpmMaterialRequests(), listEcpmPurchaseOrders(), listEcpmProjects(),
      ])
      setStock(s.data?.data || s.data || [])
      setRequests(m.data?.data || m.data || [])
      setPos(p.data?.data || p.data || [])
      setProjects(pr.data?.data || pr.data || [])
    } catch (e: any) {
      toast({ title: "Load failed", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Procurement & Inventory</h1>
        <p className="text-muted-foreground">Stock, material requests, purchase orders, GRN and issuance</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Stock Item</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><Label>Name</Label><Input value={skuName} onChange={(e) => setSkuName(e.target.value)} /></div>
            <Button disabled={!skuName} onClick={async () => {
              await createEcpmStock({ name: skuName, category: "material", unit: "bag", quantity_on_hand: 0, reorder_level: 20 })
              toast({ title: "Stock item created" }); setSkuName(""); await load()
            }}>Add Stock</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Material Request</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <select className="w-full border rounded-md h-10 px-3" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Input value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            <Button disabled={!projectId} onClick={async () => {
              await createEcpmMaterialRequest({
                project_id: projectId,
                items: [{ description: itemDesc, quantity: Number(qty), unit: "bag", stock_item_id: stock[0]?.id }],
              })
              toast({ title: "Request created" }); await load()
            }}>Create MR</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Purchase Order</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <select className="w-full border rounded-md h-10 px-3" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="Unit cost" />
            <Button disabled={!projectId} onClick={async () => {
              await createEcpmPurchaseOrder({
                project_id: projectId,
                items: [{ description: itemDesc, quantity: Number(qty), unit_cost: Number(rate), unit: "bag", stock_item_id: stock[0]?.id }],
              })
              toast({ title: "PO created" }); await load()
            }}>Create PO</Button>
          </CardContent>
        </Card>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : (
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <Card><CardHeader><CardTitle className="text-base">Stock ({stock.length})</CardTitle></CardHeader>
            <CardContent>{stock.slice(0, 10).map((s) => <div key={s.id} className="border-b py-1">{s.sku} — {s.name} ({s.quantity_on_hand})</div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Requests</CardTitle></CardHeader>
            <CardContent>{requests.slice(0, 10).map((r) => <div key={r.id} className="border-b py-1">{r.request_number} — {r.status}</div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">POs</CardTitle></CardHeader>
            <CardContent>{pos.slice(0, 10).map((r) => <div key={r.id} className="border-b py-1">{r.po_number} — ₦{Number(r.grand_total||0).toLocaleString()} ({r.status})</div>)}</CardContent></Card>
        </div>
      )}
    </div>
  )
}
