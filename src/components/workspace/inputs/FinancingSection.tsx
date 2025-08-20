import { useMemo, useState } from "react";
import { useEngine } from "@/lib/engine/EngineContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinancingSliceSchema, type FinancingSliceInput } from "@/schemas/inputs";
import { Plus, Trash2, Save, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CurveEditor, { type CurveData } from "@/components/shared/CurveEditor";

const financingTypes = [
  { value: "equity", label: "Equity" },
  { value: "senior_debt", label: "Senior Debt" },
  { value: "mezzanine_debt", label: "Mezzanine Debt" },
] as const;

function newFinancingSlice(): FinancingSliceInput {
  return {
    id: crypto.randomUUID(),
    type: "equity",
    label: "",
    amount: 0,
    interest_rate: undefined,
    tenor_months: undefined,
    dscr_min: undefined,
    is_interest_only: false,
    start_month: 0,
    curve: {
      meaning: "drawdown",
      values: [0] // Will be populated for debt financing
    }
  };
}

export default function FinancingSection() {
  const { inputs, setInputs } = useEngine();
  const [draft, setDraft] = useState<FinancingSliceInput | null>(null);
  const [expandedCurves, setExpandedCurves] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const financingSlices = useMemo<FinancingSliceInput[]>(() => {
    if (!Array.isArray(inputs?.financing_slices)) return [];
    
    const projectPeriods = inputs?.project?.periods || inputs?.project?.duration_months || 60;
    
    // Transform existing data to our schema format
    return inputs.financing_slices.map((slice: any, index: number) => {
      const amount = Number(slice.amount || 0);
      const type = slice.type || "equity";
      
      // Generate default curve if not present (for debt only)
      let curve = slice.curve;
      if (!curve || !curve.values) {
        if (type !== "equity") {
          // Default linear drawdown over first 24 months
          const drawdownPeriods = Math.min(24, projectPeriods);
          const monthlyDraw = amount / drawdownPeriods;
          const defaultDrawdown = Array(projectPeriods).fill(0);
          
          for (let i = 0; i < drawdownPeriods; i++) {
            defaultDrawdown[i] = monthlyDraw;
          }
          
          curve = {
            meaning: "drawdown",
            values: defaultDrawdown
          };
        } else {
          curve = {
            meaning: "drawdown",
            values: Array(projectPeriods).fill(0)
          };
        }
      }
      
      return {
        id: slice.id || `financing-${index}`,
        type,
        label: slice.label || slice.name || `Financing ${index + 1}`,
        amount,
        interest_rate: slice.interest_rate ? Number(slice.interest_rate) : undefined,
        tenor_months: slice.tenor_months ? Number(slice.tenor_months) : undefined,
        dscr_min: slice.dscr_min ? Number(slice.dscr_min) : undefined,
        is_interest_only: Boolean(slice.is_interest_only),
        start_month: Number(slice.start_month || 0),
        curve
      };
    });
  }, [inputs]);

  // Group financing by type
  const groupedFinancing = useMemo(() => {
    const groups: Record<string, FinancingSliceInput[]> = {
      equity: [],
      senior_debt: [],
      mezzanine_debt: [],
    };
    
    financingSlices.forEach(slice => {
      if (groups[slice.type]) {
        groups[slice.type].push(slice);
      }
    });
    
    return groups;
  }, [financingSlices]);

  // Calculate totals and validation
  const analysis = useMemo(() => {
    const equity = financingSlices.filter(s => s.type === "equity").reduce((sum, s) => sum + s.amount, 0);
    const seniorDebt = financingSlices.filter(s => s.type === "senior_debt").reduce((sum, s) => sum + s.amount, 0);
    const mezzanineDebt = financingSlices.filter(s => s.type === "mezzanine_debt").reduce((sum, s) => sum + s.amount, 0);
    const totalDebt = seniorDebt + mezzanineDebt;
    const totalCapital = equity + totalDebt;
    
    // Calculate cost estimate from cost_items
    const totalCosts = Array.isArray(inputs?.cost_items) 
      ? inputs.cost_items.reduce((sum: number, cost: any) => sum + (Number(cost.amount) || 0), 0)
      : 0;
    
    const ltc = totalCosts > 0 ? totalDebt / totalCosts : 0;
    const equityRatio = totalCapital > 0 ? equity / totalCapital : 0;
    const debtRatio = totalCapital > 0 ? totalDebt / totalCapital : 0;
    
    // Validation warnings
    const warnings: string[] = [];
    if (ltc > 0.8) warnings.push("LTC ratio exceeds 80%");
    if (equityRatio < 0.2) warnings.push("Equity ratio below 20%");
    if (totalCapital < totalCosts * 0.9) warnings.push("Capital shortfall detected");
    
    return {
      equity,
      seniorDebt,
      mezzanineDebt,
      totalDebt,
      totalCapital,
      totalCosts,
      ltc,
      equityRatio,
      debtRatio,
      warnings,
    };
  }, [financingSlices, inputs]);

  const add = () => setDraft(newFinancingSlice());
  const cancel = () => setDraft(null);

  const save = () => {
    if (!draft) return;
    const parsed = FinancingSliceSchema.safeParse(draft);
    if (!parsed.success) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const idx = financingSlices.findIndex((s) => s.id === draft.id);
    const nextList =
      idx === -1
        ? [...financingSlices, parsed.data]
        : financingSlices.map((s, i) => (i === idx ? parsed.data : s));

    setInputs((prev: any) => ({ ...prev, financing_slices: nextList }));
    setDraft(null);
    
    toast({
      title: "Financing Slice Saved",
      description: `${parsed.data.label} has been saved successfully`,
    });
  };

  const remove = (id: string) => {
    const slice = financingSlices.find(s => s.id === id);
    setInputs((prev: any) => ({
      ...prev,
      financing_slices: financingSlices.filter((s) => s.id !== id),
    }));
    
    if (slice) {
      toast({
        title: "Financing Slice Deleted",
        description: `${slice.label} has been removed`,
      });
    }
  };

  const edit = (row: FinancingSliceInput) => setDraft({ ...row });

  const updateFinancingCurve = (financeId: string, newValues: number[]) => {
    setInputs((prev: any) => ({
      ...prev,
      financing_slices: financingSlices.map(slice => 
        slice.id === financeId 
          ? { ...slice, curve: { ...slice.curve, values: newValues } }
          : slice
      )
    }));
  };

  const toggleCurveExpanded = (financeId: string) => {
    setExpandedCurves(prev => {
      const next = new Set(prev);
      if (next.has(financeId)) {
        next.delete(financeId);
      } else {
        next.add(financeId);
      }
      return next;
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "equity": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "senior_debt": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "mezzanine_debt": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const projectPeriods = inputs?.project?.periods || inputs?.project?.duration_months || 60;

  return (
    <Card className="p-4 space-y-4" data-section="financing">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Capital Stack</h3>
          <p className="text-xs text-muted-foreground">Configure equity and debt financing for your project</p>
        </div>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4 mr-1" /> Add Financing
        </Button>
      </div>

      {/* Capital Analysis Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-xs text-green-600 dark:text-green-400">Total Equity</div>
          <div className="text-lg font-semibold text-green-800 dark:text-green-200">
            {analysis.equity.toLocaleString()}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            {(analysis.equityRatio * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-xs text-blue-600 dark:text-blue-400">Total Debt</div>
          <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">
            {analysis.totalDebt.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {(analysis.debtRatio * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">LTC Ratio</div>
          <div className="text-lg font-semibold">{(analysis.ltc * 100).toFixed(1)}%</div>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground">Total Capital</div>
          <div className="text-lg font-semibold">{analysis.totalCapital.toLocaleString()}</div>
        </div>
      </div>

      {/* Validation Warnings */}
      {analysis.warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Capital Stack Warnings</span>
          </div>
          <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {analysis.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-2">Label</th>
              <th className="text-left p-2">Type</th>
              <th className="text-right p-2">Amount</th>
              <th className="text-right p-2">Rate (%)</th>
              <th className="text-right p-2">Tenor (mo)</th>
              <th className="text-center p-2">DSCR Min</th>
              <th className="text-center p-2">IO</th>
              <th className="p-2 w-32"></th>
            </tr>
          </thead>

          <tbody>
            {financingSlices.length === 0 && !draft && (
              <tr>
                <td colSpan={8} className="p-8 text-muted-foreground text-center">
                  <div className="flex flex-col items-center gap-2">
                    <TrendingUp className="h-8 w-8 opacity-50" />
                    <p>No financing configured yet</p>
                    <Button size="sm" onClick={add}>Add your first financing slice</Button>
                  </div>
                </td>
              </tr>
            )}

            {/* Render financing grouped by type */}
            {financingTypes.map((typeInfo) => {
              const items = groupedFinancing[typeInfo.value];
              if (items.length === 0) return null;
              
              return (
                <tr key={`type-${typeInfo.value}`} className="bg-muted/30">
                  <td colSpan={8} className="p-2 font-medium text-xs uppercase tracking-wide">
                    {typeInfo.label} ({items.length})
                  </td>
                </tr>
              );
            })}

            {financingSlices.map((slice) => (
              <tr key={slice.id} className="border-t hover:bg-muted/20">
                <td className="p-2 font-medium">{slice.label}</td>
                <td className="p-2">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeColor(slice.type)}`}>
                    {financingTypes.find(t => t.value === slice.type)?.label}
                  </span>
                </td>
                <td className="p-2 text-right font-mono">{slice.amount.toLocaleString()}</td>
                <td className="p-2 text-right">
                  {slice.interest_rate ? (slice.interest_rate * 100).toFixed(2) : "-"}
                </td>
                <td className="p-2 text-right">{slice.tenor_months || "-"}</td>
                <td className="p-2 text-center">{slice.dscr_min?.toFixed(2) || "-"}</td>
                <td className="p-2 text-center">
                  {slice.type !== "equity" && slice.is_interest_only ? "✓" : "-"}
                </td>
                <td className="p-2 text-right space-x-1">
                  {slice.type !== "equity" && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => toggleCurveExpanded(slice.id)}
                      title="Edit Drawdown Curve"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => edit(slice)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(slice.id)}>
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
                    placeholder="e.g. Senior Construction Loan"
                  />
                </td>
                <td className="p-2">
                  <Select
                    value={draft.type}
                    onValueChange={(value) => setDraft({ ...draft, type: value as any })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {financingTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step={0.1}
                    value={draft.interest_rate ? draft.interest_rate * 100 : ""}
                    onChange={(e) => setDraft({ ...draft, interest_rate: e.target.value ? Number(e.target.value) / 100 : undefined })}
                    placeholder="7.0"
                    disabled={draft.type === "equity"}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    value={draft.tenor_months || ""}
                    onChange={(e) => setDraft({ ...draft, tenor_months: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="48"
                    disabled={draft.type === "equity"}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={5}
                    step={0.1}
                    value={draft.dscr_min || ""}
                    onChange={(e) => setDraft({ ...draft, dscr_min: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="1.2"
                    disabled={draft.type === "equity"}
                  />
                </td>
                <td className="p-2 text-center">
                  <Switch
                    checked={draft.is_interest_only || false}
                    onCheckedChange={(checked) => setDraft({ ...draft, is_interest_only: checked })}
                    disabled={draft.type === "equity"}
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

      {/* Capital Structure Visualization */}
      {financingSlices.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Capital Structure</h4>
          <div className="h-6 bg-muted rounded-lg overflow-hidden flex">
            {analysis.equity > 0 && (
              <div 
                className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${analysis.equityRatio * 100}%` }}
              >
                {analysis.equityRatio > 0.15 ? `${(analysis.equityRatio * 100).toFixed(0)}%` : ""}
              </div>
            )}
            {analysis.seniorDebt > 0 && (
              <div 
                className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(analysis.seniorDebt / analysis.totalCapital) * 100}%` }}
              >
                {(analysis.seniorDebt / analysis.totalCapital) > 0.15 ? 
                  `${((analysis.seniorDebt / analysis.totalCapital) * 100).toFixed(0)}%` : ""}
              </div>
            )}
            {analysis.mezzanineDebt > 0 && (
              <div 
                className="bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${(analysis.mezzanineDebt / analysis.totalCapital) * 100}%` }}
              >
                {(analysis.mezzanineDebt / analysis.totalCapital) > 0.15 ? 
                  `${((analysis.mezzanineDebt / analysis.totalCapital) * 100).toFixed(0)}%` : ""}
              </div>
            )}
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Equity</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Senior Debt</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>Mezzanine</span>
            </div>
          </div>
        </div>
      )}

      {/* Curve Editors for Financing Slices (Debt Only) */}
      {financingSlices.map((slice) => (
        slice.type !== "equity" && expandedCurves.has(slice.id) && (
          <div key={`curve-${slice.id}`} className="mt-4">
            <CurveEditor
              id={slice.id}
              label={`${slice.label} Drawdown Schedule`}
              totalAmount={slice.amount}
              curve={slice.curve as CurveData}
              totalPeriods={projectPeriods}
              currency={inputs?.project?.currency || "AED"}
              onChange={(newValues) => updateFinancingCurve(slice.id, newValues)}
            />
          </div>
        )
      ))}
    </Card>
  );
}