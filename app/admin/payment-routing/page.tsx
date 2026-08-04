"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { apiFetch } from "@/lib/api/client"

export default function PaymentRoutingPage() {
	const { toast } = useToast()
	const [loading, setLoading] = useState(true)
	const [rows, setRows] = useState<Array<Record<string, any>>>([])
	const [categories, setCategories] = useState<string[]>([])
	const [form, setForm] = useState({
		payment_category: "house_purchase",
		destination_bank: "",
		account_number: "",
		account_name: "",
		reference_prefix: "",
	})

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await apiFetch<{ success: boolean; data: Array<Record<string, any>>; categories: string[] }>(
				"/admin/payment-routing",
			)
			setRows(res.data || [])
			setCategories(res.categories || [])
		} catch (e) {
			toast({ title: "Failed to load routing rules", description: String(e), variant: "destructive" })
		} finally {
			setLoading(false)
		}
	}, [toast])

	useEffect(() => {
		void load()
	}, [load])

	const create = async () => {
		try {
			await apiFetch("/admin/payment-routing", { method: "POST", body: JSON.stringify(form) })
			toast({ title: "Routing rule created" })
			await load()
		} catch (e) {
			toast({ title: "Create failed", description: String(e), variant: "destructive" })
		}
	}

	const remove = async (id: string) => {
		try {
			await apiFetch(`/admin/payment-routing/${id}`, { method: "DELETE" })
			await load()
		} catch (e) {
			toast({ title: "Delete failed", description: String(e), variant: "destructive" })
		}
	}

	return (
		<div className="space-y-6 p-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Payment Routing</h1>
					<p className="text-sm text-muted-foreground">
						Route payment categories to designated bank accounts for reconciliation.
					</p>
				</div>
				<Button variant="outline" onClick={() => void load()}>
					{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
					<span className="ml-2">Refresh</span>
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>New rule</CardTitle>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
					<div>
						<Label>Category</Label>
						<select
							className="h-10 w-full rounded-md border bg-background px-3 text-sm"
							value={form.payment_category}
							onChange={(e) => setForm((f) => ({ ...f, payment_category: e.target.value }))}
						>
							{(categories.length ? categories : ["house_purchase"]).map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>
					<div>
						<Label>Bank</Label>
						<Input
							value={form.destination_bank}
							onChange={(e) => setForm((f) => ({ ...f, destination_bank: e.target.value }))}
						/>
					</div>
					<div>
						<Label>Account number</Label>
						<Input
							value={form.account_number}
							onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))}
						/>
					</div>
					<div>
						<Label>Account name</Label>
						<Input
							value={form.account_name}
							onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
						/>
					</div>
					<div>
						<Label>Reference prefix</Label>
						<Input
							value={form.reference_prefix}
							onChange={(e) => setForm((f) => ({ ...f, reference_prefix: e.target.value }))}
						/>
					</div>
					<div className="flex items-end">
						<Button onClick={() => void create()}>
							<Plus className="h-4 w-4 mr-1" /> Save rule
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Rules</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Category</TableHead>
								<TableHead>Bank</TableHead>
								<TableHead>Account</TableHead>
								<TableHead>Prefix</TableHead>
								<TableHead />
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.map((row) => (
								<TableRow key={String(row.id)}>
									<TableCell>{String(row.payment_category)}</TableCell>
									<TableCell>{String(row.destination_bank)}</TableCell>
									<TableCell>
										{String(row.account_number)}
										{row.account_name ? ` · ${row.account_name}` : ""}
									</TableCell>
									<TableCell>{String(row.reference_prefix || "—")}</TableCell>
									<TableCell>
										<Button size="icon" variant="ghost" onClick={() => void remove(String(row.id))}>
											<Trash2 className="h-4 w-4" />
										</Button>
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
