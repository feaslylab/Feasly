import { useMemo, useState } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CostItemSchema, type CostItemInput } from "@/schemas/inputs";
import { Plus, Trash2, Save, DollarSign } from "lucide-react";

function newCostItem(): CostItemInput {
  return {
    id: crypto.randomUUID(),
    name: "",
    amount: 0,
    start_month: 0,
    duration_months: 1,
  };
}

export default function CostSection() {
  const { inputs, setInputs } = useEngine();
  const [draft, setDraft] = useState<CostItemInput | null>(null);

  const costItems = useMemo<CostItemInput[]>(() => {
    if (!Array.isArray(inputs?.cost_items)) return [];
    
    // Transform existing data to our schema format
    return inputs.cost_items.map((cost: any, index: number) => ({
      id: cost.id || `cost-${index}`,
      name: cost.name || `Cost Item ${index + 1}`,
      amount: Number(cost.amount || cost.value || 0),
      start_month: Number(cost.start_month || 0),
      duration_months: Number(cost.duration_months || 1),
    }));
  }, [inputs]);

  const add = () => setDraft(newCostItem());
  const cancel = () => setDraft(null);

  const save = () => {
    if (!draft) return;
    const parsed = CostItemSchema.safeParse({
      ...draft,
      amount: Number(draft.amount),
      start_month: Number(draft.start_month),
      duration_months: Number(draft.duration_months),
    });
    if (!parsed.success) {
      return;
    }
    const idx = costItems.findIndex((c) => c.id === draft.id);
    const nextList =
      idx === -1
        ? [...costItems, parsed.data]
        : costItems.map((c, i) => (i === idx ? parsed.data : c));

    setInputs((prev: any) => ({ ...prev, cost_items: nextList }));
    setDraft(null);
  };

  const remove = (id: string) => {
    setInputs((prev: any) => ({
      ...prev,
      cost_items: costItems.filter((c) => c.id !== id),
    }));
  };

  const edit = (row: CostItemInput) => setDraft({ ...row });

  return (
    <Card className="p-4 space-y-4" data-section="costs">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Cost Items</h3>
          <p className="text-xs text-muted-foreground">Configure development costs, operating expenses, and other project costs</p>
        </div>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add Cost Item
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-right p-2">Amount</th>
              <th className="text-right p-2">Start (mo)</th>
              <th className="text-right p-2">Duration (mo)</th>
              <th className="p-2 w-24"></th>
            </tr>
          </thead>

          <tbody>
            {costItems.length === 0 && !draft && (
              <tr>
                <td colSpan={5} className="p-4 text-muted-foreground text-center">
                  No cost items yet. Click "Add Cost Item".
                </td>
              </tr>
            )}

            {costItems.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.name}</td>
                <td className="p-2 text-right">{c.amount.toLocaleString()}</td>
                <td className="p-2 text-right">{c.start_month}</td>
                <td className="p-2 text-right">{c.duration_months}</td>
                <td className="p-2 text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => edit(c)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>
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
                    placeholder="e.g. Construction Materials"
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
                    value={draft.duration_months}
                    onChange={(e) => setDraft({ ...draft, duration_months: Number(e.target.value) })}
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