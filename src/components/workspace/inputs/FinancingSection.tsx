import { useMemo, useState } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DebtItemSchema, type DebtItemInput } from "@/schemas/inputs";
import { Plus, Trash2, Save, Building, Percent, DollarSign } from "lucide-react";

function newDebtItem(): DebtItemInput {
  return {
    id: crypto.randomUUID(),
    name: "",
    type: "senior",
    amount: 0,
    interest_rate: 0,
    payment_type: "paid",
    amortization: "linear",
    drawdown_start: 0,
    drawdown_end: 12,
    fees: 0,
  };
}

export default function FinancingSection() {
  const { inputs, setInputs } = useEngine();
  const [draft, setDraft] = useState<DebtItemInput | null>(null);

  const debtItems = useMemo<DebtItemInput[]>(() => {
    if (!Array.isArray(inputs?.debt)) return [];
    
    // Transform existing data to our schema format
    return inputs.debt.map((debt: any, index: number) => ({
      id: debt.id || `debt-${index}`,
      name: debt.name || `Debt Item ${index + 1}`,
      type: debt.type || "senior",
      amount: Number(debt.amount || debt.principal || 0),
      interest_rate: Number(debt.interest_rate || debt.rate || 0),
      payment_type: debt.payment_type || "paid",
      amortization: debt.amortization || "linear",
      drawdown_start: Number(debt.drawdown_start || debt.start_month || 0),
      drawdown_end: Number(debt.drawdown_end || debt.term_months || 12),
      fees: Number(debt.fees || 0),
    }));
  }, [inputs]);

  const add = () => setDraft(newDebtItem());
  const cancel = () => setDraft(null);

  const save = () => {
    if (!draft) return;
    const parsed = DebtItemSchema.safeParse({
      ...draft,
      amount: Number(draft.amount),
      interest_rate: Number(draft.interest_rate),
      drawdown_start: Number(draft.drawdown_start),
      drawdown_end: Number(draft.drawdown_end),
      fees: Number(draft.fees),
    });
    if (!parsed.success) {
      console.error('Validation errors:', parsed.error.errors);
      return;
    }
    const idx = debtItems.findIndex((d) => d.id === draft.id);
    const nextList =
      idx === -1
        ? [...debtItems, parsed.data]
        : debtItems.map((d, i) => (i === idx ? parsed.data : d));

    setInputs((prev: any) => ({ ...prev, debt: nextList }));
    setDraft(null);
  };

  const remove = (id: string) => {
    setInputs((prev: any) => ({
      ...prev,
      debt: debtItems.filter((d) => d.id !== id),
    }));
  };

  const edit = (row: DebtItemInput) => setDraft({ ...row });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'senior': return 'bg-blue-100 text-blue-800';
      case 'mezzanine': return 'bg-purple-100 text-purple-800';
      case 'bridge': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-4 space-y-4" data-section="financing">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Advanced Financing</h3>
          <p className="text-xs text-muted-foreground">Configure senior debt, mezzanine, bridge loans and other financing instruments</p>
        </div>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add Debt Item
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-center p-2">Type</th>
              <th className="text-right p-2">Amount</th>
              <th className="text-right p-2">Rate (%)</th>
              <th className="text-center p-2">Payment</th>
              <th className="text-center p-2">Amort.</th>
              <th className="text-right p-2">Start</th>
              <th className="text-right p-2">End</th>
              <th className="text-right p-2">Fees</th>
              <th className="p-2 w-24"></th>
            </tr>
          </thead>

          <tbody>
            {debtItems.length === 0 && !draft && (
              <tr>
                <td colSpan={10} className="p-4 text-muted-foreground text-center">
                  No debt items yet. Click "Add Debt Item".
                </td>
              </tr>
            )}

            {debtItems.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-2 font-medium">{d.name}</td>
                <td className="p-2 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(d.type)}`}>
                    {d.type}
                  </span>
                </td>
                <td className="p-2 text-right">{d.amount.toLocaleString()}</td>
                <td className="p-2 text-right">{d.interest_rate}%</td>
                <td className="p-2 text-center capitalize">{d.payment_type}</td>
                <td className="p-2 text-center capitalize">{d.amortization}</td>
                <td className="p-2 text-right">{d.drawdown_start}</td>
                <td className="p-2 text-right">{d.drawdown_end}</td>
                <td className="p-2 text-right">{d.fees.toLocaleString()}</td>
                <td className="p-2 text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => edit(d)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(d.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}

            {draft && (
              <tr className="border-t bg-muted/30">
                <td className="p-2">
                  <Label className="sr-only">Name</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g. Construction Loan"
                  />
                </td>
                <td className="p-2">
                  <Select 
                    value={draft.type} 
                    onValueChange={(value: "senior" | "mezzanine" | "bridge") => setDraft({ ...draft, type: value })}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="mezzanine">Mezzanine</SelectItem>
                      <SelectItem value="bridge">Bridge</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={draft.amount}
                    onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
                    placeholder="Amount"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step={0.1}
                    value={draft.interest_rate}
                    onChange={(e) => setDraft({ ...draft, interest_rate: Number(e.target.value) })}
                    placeholder="Rate"
                  />
                </td>
                <td className="p-2">
                  <Select 
                    value={draft.payment_type} 
                    onValueChange={(value: "paid" | "capitalized" | "bullet") => setDraft({ ...draft, payment_type: value })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="capitalized">Cap.</SelectItem>
                      <SelectItem value="bullet">Bullet</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Select 
                    value={draft.amortization} 
                    onValueChange={(value: "linear" | "bullet") => setDraft({ ...draft, amortization: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="bullet">Bullet</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={draft.drawdown_start}
                    onChange={(e) => setDraft({ ...draft, drawdown_start: Number(e.target.value) })}
                    placeholder="Start"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={draft.drawdown_end}
                    onChange={(e) => setDraft({ ...draft, drawdown_end: Number(e.target.value) })}
                    placeholder="End"
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={draft.fees}
                    onChange={(e) => setDraft({ ...draft, fees: Number(e.target.value) })}
                    placeholder="Fees"
                  />
                </td>
                <td className="p-2 text-right space-x-2">
                  <Button size="sm" onClick={save}><Save className="h-4 w-4 mr-1" />Save</Button>
                  <Button size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}