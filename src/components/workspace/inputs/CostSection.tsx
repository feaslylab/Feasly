import { useMemo, useState } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CostItemSchema, type CostItemInput } from "@/schemas/inputs";
import { Plus, Trash2, Save, DollarSign, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const costCategories = [
  { value: "construction", label: "Construction" },
  { value: "land", label: "Land" },
  { value: "soft", label: "Soft Costs" },
  { value: "infra", label: "Infrastructure" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
] as const;

function newCostItem(): CostItemInput {
  return {
    id: crypto.randomUUID(),
    label: "",
    amount: 0,
    category: "construction",
    cost_code: "",
    vat_input_eligible: false,
    is_capex: true,
    start_month: 0,
    duration_months: 1,
  };
}

export default function CostSection() {
  const { inputs, setInputs } = useEngine();
  const [draft, setDraft] = useState<CostItemInput | null>(null);
  const [showPhasing, setShowPhasing] = useState(false);
  const { toast } = useToast();

  const costItems = useMemo<CostItemInput[]>(() => {
    if (!Array.isArray(inputs?.cost_items)) return [];
    
    // Transform existing data to our schema format
    return inputs.cost_items.map((cost: any, index: number) => ({
      id: cost.id || `cost-${index}`,
      label: cost.label || cost.name || `Cost Item ${index + 1}`,
      amount: Number(cost.amount || cost.value || 0),
      category: cost.category || "construction",
      cost_code: cost.cost_code || "",
      vat_input_eligible: Boolean(cost.vat_input_eligible),
      is_capex: cost.is_capex !== undefined ? Boolean(cost.is_capex) : true,
      start_month: Number(cost.start_month || 0),
      duration_months: Number(cost.duration_months || 1),
    }));
  }, [inputs]);

  // Group costs by category
  const groupedCosts = useMemo(() => {
    const groups: Record<string, CostItemInput[]> = {};
    costCategories.forEach(cat => groups[cat.value] = []);
    
    costItems.forEach(cost => {
      if (groups[cost.category]) {
        groups[cost.category].push(cost);
      } else {
        groups.other.push(cost);
      }
    });
    
    return groups;
  }, [costItems]);

  // Calculate totals
  const totals = useMemo(() => {
    const capex = costItems.filter(c => c.is_capex).reduce((sum, c) => sum + c.amount, 0);
    const opex = costItems.filter(c => !c.is_capex).reduce((sum, c) => sum + c.amount, 0);
    const vat = costItems.filter(c => c.vat_input_eligible).reduce((sum, c) => sum + c.amount, 0);
    return { capex, opex, vat, total: capex + opex };
  }, [costItems]);

  const add = () => setDraft(newCostItem());
  const cancel = () => setDraft(null);

  const save = () => {
    if (!draft) return;
    const parsed = CostItemSchema.safeParse(draft);
    if (!parsed.success) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const idx = costItems.findIndex((c) => c.id === draft.id);
    const nextList =
      idx === -1
        ? [...costItems, parsed.data]
        : costItems.map((c, i) => (i === idx ? parsed.data : c));

    setInputs((prev: any) => ({ ...prev, cost_items: nextList }));
    setDraft(null);
    
    toast({
      title: "Cost Item Saved",
      description: `${parsed.data.label} has been saved successfully`,
    });
  };

  const remove = (id: string) => {
    const item = costItems.find(c => c.id === id);
    setInputs((prev: any) => ({
      ...prev,
      cost_items: costItems.filter((c) => c.id !== id),
    }));
    
    if (item) {
      toast({
        title: "Cost Item Deleted",
        description: `${item.label} has been removed`,
      });
    }
  };

  const edit = (row: CostItemInput) => setDraft({ ...row });

  // Generate phasing preview for a cost item
  const generatePhasing = (cost: CostItemInput, totalPeriods: number = 60) => {
    const phasing = new Array(totalPeriods).fill(0);
    const monthlyAmount = cost.amount / cost.duration_months;
    
    for (let i = 0; i < cost.duration_months && (cost.start_month + i) < totalPeriods; i++) {
      phasing[cost.start_month + i] = monthlyAmount;
    }
    
    return phasing;
  };

  return (
    <Card className="p-4 space-y-4" data-section="costs">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Cost Items</h3>
          <p className="text-xs text-muted-foreground">Configure construction, land, soft costs, and other project expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowPhasing(!showPhasing)}
          >
            {showPhasing ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showPhasing ? "Hide" : "Show"} Phasing
          </Button>
          <Button size="sm" variant="outline" onClick={add}>
            <Plus className="h-4 w-4 mr-1" /> Add Cost Item
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">Total CapEx</div>
          <div className="text-lg font-semibold">{totals.capex.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">Total OpEx</div>
          <div className="text-lg font-semibold">{totals.opex.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">VAT Eligible</div>
          <div className="text-lg font-semibold">{totals.vat.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">Total Costs</div>
          <div className="text-lg font-semibold">{totals.total.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2">Label</th>
              <th className="text-left p-2">Category</th>
              <th className="text-right p-2">Amount</th>
              <th className="text-right p-2">Start (mo)</th>
              <th className="text-right p-2">Duration (mo)</th>
              <th className="text-center p-2">CapEx</th>
              <th className="text-center p-2">VAT</th>
              <th className="p-2 w-32"></th>
            </tr>
          </thead>

          <tbody>
            {costItems.length === 0 && !draft && (
              <tr>
                <td colSpan={8} className="p-8 text-muted-foreground text-center">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="h-8 w-8 opacity-50" />
                    <p>No cost items yet</p>
                    <Button size="sm" onClick={add}>Add your first cost item</Button>
                  </div>
                </td>
              </tr>
            )}

            {/* Render costs grouped by category */}
            {costCategories.map((category) => {
              const items = groupedCosts[category.value];
              if (items.length === 0) return null;
              
              return (
                <tr key={`category-${category.value}`} className="bg-muted/30">
                  <td colSpan={8} className="p-2 font-medium text-xs uppercase tracking-wide">
                    {category.label} ({items.length})
                  </td>
                </tr>
              );
            })}

            {costItems.map((c) => (
              <tr key={c.id} className="border-t hover:bg-muted/20">
                <td className="p-2 font-medium">{c.label}</td>
                <td className="p-2">
                  <span className="inline-flex px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                    {costCategories.find(cat => cat.value === c.category)?.label}
                  </span>
                </td>
                <td className="p-2 text-right font-mono">{c.amount.toLocaleString()}</td>
                <td className="p-2 text-right">{c.start_month}</td>
                <td className="p-2 text-right">{c.duration_months}</td>
                <td className="p-2 text-center">
                  {c.is_capex ? "✓" : ""}
                </td>
                <td className="p-2 text-center">
                  {c.vat_input_eligible ? "✓" : ""}
                </td>
                <td className="p-2 text-right space-x-1">
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
                  <Input
                    value={draft.label}
                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                    placeholder="e.g. Construction Materials"
                  />
                </td>
                <td className="p-2">
                  <Select
                    value={draft.category}
                    onValueChange={(value) => setDraft({ ...draft, category: value as any })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {costCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
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
                <td className="p-2 text-center">
                  <Switch
                    checked={draft.is_capex}
                    onCheckedChange={(checked) => setDraft({ ...draft, is_capex: checked })}
                  />
                </td>
                <td className="p-2 text-center">
                  <Switch
                    checked={draft.vat_input_eligible}
                    onCheckedChange={(checked) => setDraft({ ...draft, vat_input_eligible: checked })}
                  />
                </td>
                <td className="p-2 text-right space-x-1">
                  <Button size="sm" onClick={save}>
                    <Save className="h-4 w-4 mr-1" />Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phasing Preview */}
      {showPhasing && costItems.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-3">Monthly Cost Phasing Preview</h4>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 sticky left-0 bg-muted/50">Cost Item</th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} className="text-center p-1 min-w-16">
                      M{i + 1}
                    </th>
                  ))}
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {costItems.slice(0, 5).map((cost) => {
                  const phasing = generatePhasing(cost, 12);
                  return (
                    <tr key={cost.id} className="border-t">
                      <td className="p-2 sticky left-0 bg-background font-medium">{cost.label}</td>
                      {phasing.map((amount, i) => (
                        <td key={i} className="text-center p-1 font-mono">
                          {amount > 0 ? Math.round(amount).toLocaleString() : "-"}
                        </td>
                      ))}
                      <td className="text-right p-2 font-mono font-medium">{cost.amount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {costItems.length > 5 && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing first 5 items. {costItems.length - 5} more items in full calculation.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}