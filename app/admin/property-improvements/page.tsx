"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import {
	approvePropertyImprovement,
	createPropertyImprovement,
	listPropertyImprovements,
	rejectPropertyImprovement,
} from "@/lib/api/property-improvements"

export default function PropertyImprovementsPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [rows, setRows] = useState<Array<Record<string, any>>>([])
	const [types, setTypes] = useState<string[]>([])
	const [propertyId, setPropertyId] = useState("")
	const [improvementType, setImprovementType] = useState("solar_installation")
	const [cost, setCost] = useState("")
	const [valueAdded, setValueAdded] = useState("")

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await listPropertyImprovements({ per_page: 50 })
			setRows(res.data?.data || [])
			setTypes(res.types || [])
		} catch (e) {
			toast({ title: "Failed to load improvements", description: String(e), variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	const create = async () => {
		try {
			await createPropertyImprovement({
				property_id: propertyId || undefined,
				improvement_type: improvementType,
				estimated_cost: Number(cost || 0),
				estimated_value_added: Number(valueAdded || cost || 0),
				completion_date: new Date().toISOString().slice(0, 10),
			})
			toast({ title: "Improvement submitted" })
			setCost("")
			setValueAdded("")
			await load()
		} catch (e) {
			toast({ title: "Create failed", description: String(e), variant: "destructive" })
		}
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Property Improvements</h1>
					<p className="text-sm text-muted-foreground">
						Track upgrades that feed AI market valuation reports.
					</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
					<span className="ml-2">Refresh</span>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Add improvement</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
					<div>
						<Label>Property ID</Label>
						<Input value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
					</div>
					<div>
						<Label>Type</Label>
						<select
							className="h-10 w-full rounded-md border bg-background px-3 text-sm"
							value={improvementType}
							onChange={(e) => setImprovementType(e.target.value)}
						>
							{(types.length ? types : ["solar_installation"]).map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</div>
					<div>
						<Label>Estimated cost</Label>
						<Input value={cost} onChange={(e) => setCost(e.target.value)} type="number" />
					</div>
					<div>
						<Label>Value added</Label>
						<Input value={valueAdded} onChange={(e) => setValueAdded(e.target.value)} type="number" />
					</div>
					<div className="md:col-span-2 lg:col-span-4">
						<Button onClick={() => void create()}>
							<Plus className="h-4 w-4 mr-1" /> Submit
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Records</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Type</TableHead>
								<TableHead>Cost</TableHead>
								<TableHead>Value added</TableHead>
								<TableHead>Status</TableHead>
								<TableHead />
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<TableRow key={String(row.id)}>
									<TableCell>{String(row.improvement_type)}</TableCell>
									<TableCell>₦{Number(row.estimated_cost || 0).toLocaleString()}</TableCell>
									<TableCell>₦{Number(row.estimated_value_added || 0).toLocaleString()}</TableCell>
									<TableCell>
										<Badge>{String(row.status)}</Badge>
									</TableCell>
									<TableCell className="space-x-2">
										{row.status === "pending" ? (
											<>
												<Button size="sm" onClick={() => void approvePropertyImprovement(String(row.id)).then(load)}>
													Approve
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() =>
														void rejectPropertyImprovement(String(row.id), "Rejected by admin").then(load)
													}
												>
													Reject
												</Button>
											</>
										) : null}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	)
}
