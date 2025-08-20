import { useMemo, useState } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { UnitTypeSchema, UnitTypeInput } from "@/schemas/inputs";
import { nanoid } from "nanoid";
import { Trash2, Edit, Plus, Calculator, ChevronDown, TrendingUp } from "lucide-react";
import CurveEditor, { type CurveData } from "@/components/shared/CurveEditor";

function newRow(): UnitTypeInput {
  return {
    id: nanoid(),
    name: "",
    asset_subtype: "",
    revenue_mode: "sale",
    units: 1,
    unit_area_sqm: 100,
    price_per_sqm: 0,
    rent_per_month: 0,
    occupancy_rate: 0.8,
    lease_term_months: 12,
    start_month: 0,
    duration_months: 1,
    curve: {
      meaning: "sell_through",
      values: [1.0] // Default to 100% in first month
    }
  };
}

export default function ProductMixSection() {
  const { inputs, setInputs } = useEngine();
  const [draft, setDraft] = useState<UnitTypeInput | null>(null);
  const [expandedCurves, setExpandedCurves] = useState<Set<string>>(new Set());

  const unitTypes = useMemo<UnitTypeInput[]>(() => {
    if (!inputs?.unit_types) return [];
    return inputs.unit_types.map((raw: any) => ({
      id: raw.id || nanoid(),
      name: String(raw.name || ""),
      asset_subtype: String(raw.asset_subtype || ""),
      revenue_mode: (raw.revenue_mode as "sale"|"rent") || "sale",
      units: Number(raw.units || 1),
      unit_area_sqm: Number(raw.unit_area_sqm || 100),
      price_per_sqm: Number(raw.price_per_sqm ?? 0),
      rent_per_month: Number(raw.rent_per_month ?? 0),
      occupancy_rate: Number(raw.occupancy_rate ?? 0.8),
      lease_term_months: Number(raw.lease_term_months ?? 12),
      start_month: Number(raw.start_month ?? 0),
      duration_months: Number(raw.duration_months ?? 1),
      curve: raw.curve || {
        meaning: raw.revenue_mode === "rent" ? "occupancy" : "sell_through",
        values: raw.revenue_mode === "rent" 
          ? Array(raw.lease_term_months || 12).fill(raw.occupancy_rate || 0.8)
          : Array(raw.duration_months || 1).fill(1.0 / (raw.duration_months || 1))
      }
    }));
  }, [inputs]);

  // Live metrics calculations
  const metrics = useMemo(() => {
    const totalGFA = unitTypes.reduce((sum, unit) => sum + (unit.units * unit.unit_area_sqm), 0);
    const totalUnits = unitTypes.reduce((sum, unit) => sum + unit.units, 0);
    
    let totalRevenue = 0;
    let weightedPriceSqm = 0;
    let totalArea = 0;

    unitTypes.forEach(unit => {
      const unitGFA = unit.units * unit.unit_area_sqm;
      totalArea += unitGFA;
      
      if (unit.revenue_mode === "sale" && unit.price_per_sqm) {
        const unitRevenue = unitGFA * unit.price_per_sqm;
        totalRevenue += unitRevenue;
        weightedPriceSqm += unit.price_per_sqm * unitGFA;
      } else if (unit.revenue_mode === "rent" && unit.rent_per_month && unit.occupancy_rate && unit.lease_term_months) {
        const annualRent = unit.rent_per_month * 12 * unit.occupancy_rate * unit.units;
        totalRevenue += annualRent;
      }
    });

    const avgPriceSqm = totalArea > 0 ? weightedPriceSqm / totalArea : 0;

    return {
      totalGFA,
      totalUnits,
      totalRevenue,
      avgPriceSqm
    };
  }, [unitTypes]);

  const add = () => setDraft(newRow());
  const cancel = () => setDraft(null);
  
  const save = () => {
    if (!draft) return;
    
    const parsed = UnitTypeSchema.safeParse(draft);
    if (!parsed.success) {
      console.error("Validation failed:", parsed.error);
      return;
    }

    setInputs((prev: any) => ({
      ...prev,
      unit_types: draft.id && unitTypes.find(u => u.id === draft.id)
        ? unitTypes.map(u => u.id === draft.id ? draft : u)
        : [...unitTypes, draft]
    }));
    setDraft(null);
  };

  const remove = (id: string) => {
    setInputs((prev: any) => ({
      ...prev,
      unit_types: unitTypes.filter(u => u.id !== id)
    }));
  };

  const edit = (row: UnitTypeInput) => setDraft(row);

  const formatCurrency = (value: number) => {
    const currency = inputs?.project?.currency || "AED";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === "AED" ? "AED" : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateRowRevenue = (unit: UnitTypeInput) => {
    if (unit.revenue_mode === "sale" && unit.price_per_sqm) {
      return unit.units * unit.unit_area_sqm * unit.price_per_sqm;
    } else if (unit.revenue_mode === "rent" && unit.rent_per_month && unit.occupancy_rate) {
      return unit.rent_per_month * 12 * unit.occupancy_rate * unit.units;
    }
    return 0;
  };

  const updateUnitCurve = (unitId: string, newValues: number[]) => {
    setInputs((prev: any) => ({
      ...prev,
      unit_types: unitTypes.map(unit => 
        unit.id === unitId 
          ? { ...unit, curve: { ...unit.curve, values: newValues } }
          : unit
      )
    }));
  };

  const toggleCurveExpanded = (unitId: string) => {
    setExpandedCurves(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  const projectPeriods = inputs?.project?.periods || inputs?.project?.duration_months || 60;

  return (
    <Card className="p-6 space-y-6" data-section="product-mix">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Product Mix
        </h3>
        <p className="text-sm text-muted-foreground">
          Define your asset types, unit configurations, and revenue assumptions
        </p>
      </div>

      {/* Live Metrics Preview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{metrics.totalUnits.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Units</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{metrics.totalGFA.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total GFA (sqm)</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="text-xs text-muted-foreground">Gross Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.avgPriceSqm)}</div>
          <div className="text-xs text-muted-foreground">Avg. Price/sqm</div>
        </div>
      </div>

      {/* Unit Types Table */}
      {unitTypes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 text-xs font-medium">Name</th>
                <th className="text-left p-2 text-xs font-medium">Subtype</th>
                <th className="text-left p-2 text-xs font-medium">Mode</th>
                <th className="text-left p-2 text-xs font-medium">Units</th>
                <th className="text-left p-2 text-xs font-medium">Area (sqm)</th>
                <th className="text-left p-2 text-xs font-medium">Revenue Value</th>
                <th className="text-left p-2 text-xs font-medium">Total Revenue</th>
                <th className="text-left p-2 text-xs font-medium">Timing</th>
                <th className="text-left p-2 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unitTypes.map((unit) => (
                <tr key={unit.id} className="border-b hover:bg-muted/20">
                  <td className="p-2 text-sm font-medium">{unit.name}</td>
                  <td className="p-2 text-sm">{unit.asset_subtype}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      unit.revenue_mode === "sale" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {unit.revenue_mode}
                    </span>
                  </td>
                  <td className="p-2 text-sm">{unit.units.toLocaleString()}</td>
                  <td className="p-2 text-sm">{unit.unit_area_sqm.toLocaleString()}</td>
                  <td className="p-2 text-sm">
                    {unit.revenue_mode === "sale" 
                      ? `${formatCurrency(unit.price_per_sqm || 0)}/sqm`
                      : `${formatCurrency(unit.rent_per_month || 0)}/mo @ ${((unit.occupancy_rate || 0) * 100).toFixed(0)}%`
                    }
                  </td>
                  <td className="p-2 text-sm font-medium text-primary">
                    {formatCurrency(calculateRowRevenue(unit))}
                  </td>
                  <td className="p-2 text-sm">M{unit.start_month}-{unit.start_month + unit.duration_months - 1}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCurveExpanded(unit.id)}
                        className="h-7 w-7 p-0"
                        title="Edit Timing Curve"
                      >
                        <TrendingUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => edit(unit)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(unit.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Curve Editors for Unit Types */}
      {unitTypes.map((unit) => (
        expandedCurves.has(unit.id) && (
          <div key={`curve-${unit.id}`} className="mt-4">
            <CurveEditor
              id={unit.id}
              label={`${unit.name} Revenue Distribution`}
              totalAmount={calculateRowRevenue(unit)}
              curve={unit.curve as CurveData}
              totalPeriods={projectPeriods}
              currency={inputs?.project?.currency || "AED"}
              onChange={(newValues) => updateUnitCurve(unit.id, newValues)}
            />
          </div>
        )
      ))}

      {/* Draft Form */}
      {draft && (
        <div className="border rounded-lg p-4 bg-muted/10 space-y-4">
          <h4 className="font-medium">
            {unitTypes.find(u => u.id === draft.id) ? "Edit Unit Type" : "Add New Unit Type"}
          </h4>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g., 1BR Apartment"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Asset Subtype *</Label>
              <Input
                value={draft.asset_subtype}
                onChange={(e) => setDraft({ ...draft, asset_subtype: e.target.value })}
                placeholder="e.g., Residential, Retail, Office"
              />
            </div>

            <div className="space-y-2">
              <Label>Revenue Mode *</Label>
              <Select 
                value={draft.revenue_mode} 
                onValueChange={(v: "sale" | "rent") => setDraft({ ...draft, revenue_mode: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background border border-border z-dropdown">
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Units *</Label>
              <Input
                type="number"
                value={draft.units}
                onChange={(e) => setDraft({ ...draft, units: Number(e.target.value) })}
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Unit Area (sqm) *</Label>
              <Input
                type="number"
                value={draft.unit_area_sqm}
                onChange={(e) => setDraft({ ...draft, unit_area_sqm: Number(e.target.value) })}
                min={1}
                step={0.1}
              />
            </div>

            {draft.revenue_mode === "sale" && (
              <div className="space-y-2">
                <Label>Price per sqm *</Label>
                <Input
                  type="number"
                  value={draft.price_per_sqm || 0}
                  onChange={(e) => setDraft({ ...draft, price_per_sqm: Number(e.target.value) })}
                  min={0}
                />
              </div>
            )}

            {draft.revenue_mode === "rent" && (
              <>
                <div className="space-y-2">
                  <Label>Rent per Month *</Label>
                  <Input
                    type="number"
                    value={draft.rent_per_month || 0}
                    onChange={(e) => setDraft({ ...draft, rent_per_month: Number(e.target.value) })}
                    min={0}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Occupancy Rate * (0-1)</Label>
                  <Input
                    type="number"
                    value={draft.occupancy_rate || 0.8}
                    onChange={(e) => setDraft({ ...draft, occupancy_rate: Number(e.target.value) })}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Lease Term (Months) *</Label>
                  <Input
                    type="number"
                    value={draft.lease_term_months || 12}
                    onChange={(e) => setDraft({ ...draft, lease_term_months: Number(e.target.value) })}
                    min={1}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Start Month</Label>
              <Input
                type="number"
                value={draft.start_month}
                onChange={(e) => setDraft({ ...draft, start_month: Number(e.target.value) })}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (Months)</Label>
              <Input
                type="number"
                value={draft.duration_months}
                onChange={(e) => setDraft({ ...draft, duration_months: Number(e.target.value) })}
                min={1}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} size="sm">Save</Button>
            <Button onClick={cancel} variant="outline" size="sm">Cancel</Button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!draft && (
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {unitTypes.length === 0 ? "No unit types defined yet" : `${unitTypes.length} unit type(s) configured`}
          </div>
          <Button onClick={add} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Unit Type
          </Button>
        </div>
      )}
    </Card>
  );
}