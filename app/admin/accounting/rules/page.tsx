"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Save } from "lucide-react"
import { getChartOfAccounts, getPostingRules, updatePostingRule } from "@/lib/api/accounting"
import { useToast } from "@/hooks/use-toast"

export default function PostingRulesPage() {
  const { toast } = useToast()
  const [rules, setRules] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const [r, a] = await Promise.all([getPostingRules(), getChartOfAccounts()])
      setRules(r.data || [])
      setAccounts(a.data || [])
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async (rule: any) => {
    try {
      setSavingId(rule.id)
      await updatePostingRule(rule.id, {
        debit_account_code: rule.debit_account_code,
        credit_account_code: rule.credit_account_code,
        is_active: rule.is_active,
        generate_receipt: rule.generate_receipt,
        include_in_statement: rule.include_in_statement,
      })
      toast({ title: "Rule updated" })
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Posting Rules</h1>
        <p className="text-muted-foreground mt-1">Configurable debit/credit mappings — no hardcoded accounting in modules</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Active rules</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Debit</TableHead>
                  <TableHead>Credit</TableHead>
                  <TableHead>Bucket</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{rule.transaction_type}</div>
                    </TableCell>
                    <TableCell>
                      <Input
                        className="font-mono w-28"
                        list="coa-codes"
                        value={rule.debit_account_code}
                        onChange={(e) => setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, debit_account_code: e.target.value } : r))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="font-mono w-28"
                        list="coa-codes"
                        value={rule.credit_account_code}
                        onChange={(e) => setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, credit_account_code: e.target.value } : r))}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{rule.member_balance_bucket}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => save(rule)} disabled={savingId === rule.id}>
                        {savingId === rule.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <datalist id="coa-codes">
            {accounts.map((a) => <option key={a.id} value={a.code}>{a.code} — {a.name}</option>)}
          </datalist>
        </CardContent>
      </Card>
    </div>
  )
}
