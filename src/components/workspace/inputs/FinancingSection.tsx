import { useMemo, useState } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DebtItemSchema, type DebtItemInput } from "@/schemas/inputs";
import { Plus, Trash2, Save, Percent } from "lucide-react";

function newDebtItem(): DebtItemInput {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    interest_rate: 0,
    start_month: 0,
    term_months: 12,
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
      amount: Number(debt.amount || debt.principal || 0),
      interest_rate: Number(debt.interest_rate || debt.rate || 0),
      start_month: Number(debt.start_month || 0),
      term_months: Number(debt.term_months || debt.term || 12),
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
      start_month: Number(draft.start_month),
      term_months: Number(draft.term_months),
    });
    if (!parsed.success) {
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

  return (
    <Card className="p-4 space-y-4" data-section="financing">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Debt & Financing</h3>
          <p className="text-xs text-muted-foreground">Configure loans, credit facilities, and other financing instruments</p>
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
              <th className="text-right p-2">Amount</th>
              <th className="text-right p-2">Interest Rate (%)</th>
              <th className="text-right p-2">Start (mo)</th>
              <th className="text-right p-2">Term (mo)</th>
              <th className="p-2 w-24"></th>
            </tr>
          </thead>

          <tbody>
            {debtItems.length === 0 && !draft && (
              <tr>
                <td colSpan={6} className="p-4 text-muted-foreground text-center">
                  No debt items yet. Click "Add Debt Item".
                </td>
              </tr>
            )}

            {debtItems.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-2">{d.name}</td>
                <td className="p-2 text-right">{d.amount.toLocaleString()}</td>
                <td className="p-2 text-right">{d.interest_rate}%</td>
                <td className="p-2 text-right">{d.start_month}</td>
                <td className="p-2 text-right">{d.term_months}</td>
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
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={draft.amount}
                    onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
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
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={draft.start_month}
                    onChange={(e) => setDraft({ ...draft, start_month: Number(e.target.value) })}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={draft.term_months}
                    onChange={(e) => setDraft({ ...draft, term_months: Number(e.target.value) })}
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