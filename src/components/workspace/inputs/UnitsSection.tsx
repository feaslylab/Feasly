import { useMemo, useState } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitTypeSchema, type UnitTypeInput } from "@/schemas/inputs";
import { Plus, Trash2, Save } from "lucide-react";

function newRow(): UnitTypeInput {
  return {
    id: crypto.randomUUID(),
    name: "",
    units: 1,
    revenue_mode: "sale",
    price: 0,
    rent_per_month: 0,
    occupancy_rate: 0.8,
    lease_term_months: 12,
    start_month: 0,
    duration_months: 1,
  };
}

export default function UnitsSection() {
  const { inputs, setInputs } = useEngine();
  const [draft, setDraft] = useState<UnitTypeInput | null>(null);

  const unitTypes = useMemo<UnitTypeInput[]>(() => {
    if (!Array.isArray(inputs?.unit_types)) return [];
    
    // Transform existing data to our schema format
    return inputs.unit_types.map((unit: any, index: number) => ({
      id: unit.id || unit.key || `unit-${index}`,
      name: unit.name || `Unit Type ${index + 1}`,
      units: Number(unit.units || unit.count || 1),
      revenue_mode: unit.revenue_mode || "sale",
      price: Number(unit.price || unit.initial_price_sqm_sale || 0),
      rent_per_month: Number(unit.rent_per_month || 0),
      occupancy_rate: Number(unit.occupancy_rate || 0.8),
      lease_term_months: Number(unit.lease_term_months || 12),
      start_month: Number(unit.start_month || unit.delivery_month || 0),
      duration_months: Number(unit.duration_months || 1),
    }));
  }, [inputs]);

  const add = () => setDraft(newRow());
  const cancel = () => setDraft(null);

  const save = () => {
    if (!draft) return;
    const parsed = UnitTypeSchema.safeParse({
      ...draft,
      units: Number(draft.units),
      price: draft.price ? Number(draft.price) : undefined,
      rent_per_month: draft.rent_per_month ? Number(draft.rent_per_month) : undefined,
      occupancy_rate: draft.occupancy_rate ? Number(draft.occupancy_rate) : undefined,
      lease_term_months: draft.lease_term_months ? Number(draft.lease_term_months) : undefined,
      start_month: Number(draft.start_month),
      duration_months: Number(draft.duration_months),
    });
    if (!parsed.success) {
      console.error('Validation errors:', parsed.error.errors);
      // minimal UX: highlight invalid inputs later; for now just no-op
      return;
    }
    const idx = unitTypes.findIndex((u) => u.id === draft.id);
    const nextList =
      idx === -1
        ? [...unitTypes, parsed.data]
        : unitTypes.map((u, i) => (i === idx ? parsed.data : u));

    setInputs((prev: any) => ({ ...prev, unit_types: nextList }));
    setDraft(null);
  };

  const remove = (id: string) => {
    setInputs((prev: any) => ({
      ...prev,
      unit_types: unitTypes.filter((u) => u.id !== id),
    }));
  };

  const edit = (row: UnitTypeInput) => setDraft({ ...row });

  return (
    <Card className="p-4 space-y-4" data-section="units">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Unit Types</h3>
          <p className="text-xs text-muted-foreground">Define sellable/lettable units</p>
        </div>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add Unit Type
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-center p-2">Mode</th>
              <th className="text-right p-2">Units</th>
              <th className="text-right p-2">Revenue Value</th>
              <th className="text-right p-2">Start (mo)</th>
              <th className="text-right p-2">Duration (mo)</th>
              <th className="p-2 w-24"></th>
            </tr>
          </thead>

          <tbody>
            {unitTypes.length === 0 && !draft && (
              <tr>
                <td colSpan={7} className="p-4 text-muted-foreground">
                  No unit types yet. Click "Add Unit Type".
                </td>
              </tr>
            )}

            {unitTypes.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2 text-center">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    u.revenue_mode === 'sale' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {u.revenue_mode === 'sale' ? 'Sale' : 'Rent'}
                  </span>
                </td>
                <td className="p-2 text-right">{u.units}</td>
                <td className="p-2 text-right">
                  {u.revenue_mode === 'sale' 
                    ? `${u.price?.toLocaleString() || 0}` 
                    : `${u.rent_per_month?.toLocaleString() || 0}/mo @ ${((u.occupancy_rate || 0) * 100).toFixed(0)}%`}
                </td>
                <td className="p-2 text-right">{u.start_month}</td>
                <td className="p-2 text-right">{u.duration_months}</td>
                <td className="p-2 text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => edit(u)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(u.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}

            {draft && (
              <tr className="border-t bg-muted/30">
                <td className="p-2 space-y-2">
                  <Label className="sr-only">Name</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="e.g. 2BR Apartments"
                  />
                </td>
                <td className="p-2">
                  <Select 
                    value={draft.revenue_mode} 
                    onValueChange={(value: "sale" | "rent") => setDraft({ ...draft, revenue_mode: value })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={draft.units}
                    onChange={(e) => setDraft({ ...draft, units: Number(e.target.value) })}
                  />
                </td>
                <td className="p-2 space-y-1">
                  {draft.revenue_mode === 'sale' ? (
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      value={draft.price || 0}
                      onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                      placeholder="Sale price per unit"
                    />
                  ) : (
                    <div className="space-y-1">
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        value={draft.rent_per_month || 0}
                        onChange={(e) => setDraft({ ...draft, rent_per_month: Number(e.target.value) })}
                        placeholder="Rent per month"
                      />
                      <Input
                        type="number"
                        inputMode="decimal"
                        min={0}
                        max={1}
                        step={0.01}
                        value={draft.occupancy_rate || 0.8}
                        onChange={(e) => setDraft({ ...draft, occupancy_rate: Number(e.target.value) })}
                        placeholder="Occupancy rate (0-1)"
                      />
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        value={draft.lease_term_months || 12}
                        onChange={(e) => setDraft({ ...draft, lease_term_months: Number(e.target.value) })}
                        placeholder="Lease term (months)"
                      />
                    </div>
                  )}
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