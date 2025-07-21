import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Edit, Info } from "lucide-react";
import type { FeaslyModelFormData, ScenarioType, ScenarioOverrides } from "./types";

export function ScenariosSection() {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("base");
  const [editingScenario, setEditingScenario] = useState<ScenarioType | null>(null);
  const [scenarioOverrides, setScenarioOverrides] = useState<Record<ScenarioType, ScenarioOverrides>>({
    base: {},
    optimistic: {},
    pessimistic: {},
    custom: {},
  });

  // Base values from form
  const baseValues = {
    construction_cost: form.watch("construction_cost") || 0,
    land_cost: form.watch("land_cost") || 0,
    average_sale_price: form.watch("average_sale_price") || 0,
    yield_estimate: form.watch("yield_estimate") || 0,
    target_irr: form.watch("target_irr") || 0,
    expected_lease_rate: form.watch("expected_lease_rate") || 0,
  };

  const scenarios = [
    { key: "base" as ScenarioType, label: t('feasly.model.scenario_base'), color: "bg-blue-500" },
    { key: "optimistic" as ScenarioType, label: t('feasly.model.scenario_optimistic'), color: "bg-green-500" },
    { key: "pessimistic" as ScenarioType, label: t('feasly.model.scenario_pessimistic'), color: "bg-red-500" },
    { key: "custom" as ScenarioType, label: t('feasly.model.scenario_custom'), color: "bg-purple-500" },
  ];

  const getScenarioValue = (scenario: ScenarioType, field: keyof ScenarioOverrides) => {
    if (scenario === "base") {
      return baseValues[field];
    }
    return scenarioOverrides[scenario][field] ?? baseValues[field];
  };

  const updateScenarioOverride = (scenario: ScenarioType, field: keyof ScenarioOverrides, value: number | undefined) => {
    setScenarioOverrides(prev => ({
      ...prev,
      [scenario]: {
        ...prev[scenario],
        [field]: value,
      },
    }));
  };

  const applyScenarioDefaults = (scenario: ScenarioType) => {
    if (scenario === "optimistic") {
      setScenarioOverrides(prev => ({
        ...prev,
        optimistic: {
          construction_cost: baseValues.construction_cost * 0.9, // 10% reduction
          average_sale_price: baseValues.average_sale_price * 1.15, // 15% increase
          yield_estimate: baseValues.yield_estimate * 1.1, // 10% increase
          target_irr: baseValues.target_irr * 1.1, // 10% increase
        },
      }));
    } else if (scenario === "pessimistic") {
      setScenarioOverrides(prev => ({
        ...prev,
        pessimistic: {
          construction_cost: baseValues.construction_cost * 1.15, // 15% increase
          average_sale_price: baseValues.average_sale_price * 0.9, // 10% reduction
          yield_estimate: baseValues.yield_estimate * 0.85, // 15% reduction
          target_irr: baseValues.target_irr * 0.85, // 15% reduction
        },
      }));
    }
  };

  const ScenarioEditDialog = ({ scenario }: { scenario: ScenarioType }) => {
    const [tempOverrides, setTempOverrides] = useState<ScenarioOverrides>(
      scenarioOverrides[scenario] || {}
    );

    const handleSave = () => {
      setScenarioOverrides(prev => ({
        ...prev,
        [scenario]: tempOverrides,
      }));
      setEditingScenario(null);
    };

    return (
      <Dialog open={editingScenario === scenario} onOpenChange={(open) => !open && setEditingScenario(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('feasly.model.editing_scenario')}: {scenarios.find(s => s.key === scenario)?.label}
            </DialogTitle>
            <DialogDescription>
              {t('feasly.model.scenario_override_note')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="construction_cost_override">
                {t('feasly.model.override_construction_cost')}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('feasly.model.override_construction_cost_tooltip')}</p>
                      <p>{t('feasly.model.base_value')}: {baseValues.construction_cost.toLocaleString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="construction_cost_override"
                type="number"
                placeholder={baseValues.construction_cost.toString()}
                value={tempOverrides.construction_cost || ""}
                onChange={(e) => setTempOverrides(prev => ({
                  ...prev,
                  construction_cost: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </div>

            <div>
              <Label htmlFor="land_cost_override">
                {t('feasly.model.override_land_cost')}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('feasly.model.override_land_cost_tooltip')}</p>
                      <p>{t('feasly.model.base_value')}: {baseValues.land_cost.toLocaleString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="land_cost_override"
                type="number"
                placeholder={baseValues.land_cost.toString()}
                value={tempOverrides.land_cost || ""}
                onChange={(e) => setTempOverrides(prev => ({
                  ...prev,
                  land_cost: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </div>

            <div>
              <Label htmlFor="revenue_override">
                {t('feasly.model.override_revenue')}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('feasly.model.override_revenue_tooltip')}</p>
                      <p>{t('feasly.model.base_value')}: {baseValues.average_sale_price.toLocaleString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="revenue_override"
                type="number"
                placeholder={baseValues.average_sale_price.toString()}
                value={tempOverrides.average_sale_price || ""}
                onChange={(e) => setTempOverrides(prev => ({
                  ...prev,
                  average_sale_price: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </div>

            <div>
              <Label htmlFor="yield_override">
                {t('feasly.model.override_yield_estimate')}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('feasly.model.override_yield_estimate_tooltip')}</p>
                      <p>{t('feasly.model.base_value')}: {baseValues.yield_estimate}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="yield_override"
                type="number"
                placeholder={baseValues.yield_estimate.toString()}
                value={tempOverrides.yield_estimate || ""}
                onChange={(e) => setTempOverrides(prev => ({
                  ...prev,
                  yield_estimate: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </div>

            <div>
              <Label htmlFor="irr_override">
                {t('feasly.model.override_target_irr')}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('feasly.model.override_target_irr_tooltip')}</p>
                      <p>{t('feasly.model.base_value')}: {baseValues.target_irr}%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="irr_override"
                type="number"
                placeholder={baseValues.target_irr.toString()}
                value={tempOverrides.target_irr || ""}
                onChange={(e) => setTempOverrides(prev => ({
                  ...prev,
                  target_irr: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </div>

            <div>
              <Label htmlFor="lease_override">
                {t('feasly.model.override_lease_rate')}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="inline h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('feasly.model.override_lease_rate_tooltip')}</p>
                      <p>{t('feasly.model.base_value')}: {baseValues.expected_lease_rate.toLocaleString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="lease_override"
                type="number"
                placeholder={baseValues.expected_lease_rate.toString()}
                value={tempOverrides.expected_lease_rate || ""}
                onChange={(e) => setTempOverrides(prev => ({
                  ...prev,
                  expected_lease_rate: e.target.value ? Number(e.target.value) : undefined,
                }))}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setEditingScenario(null)}>
              Cancel
            </Button>
            {scenario !== "base" && (
              <Button variant="outline" onClick={() => applyScenarioDefaults(scenario)}>
                Apply Defaults
              </Button>
            )}
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <CardTitle>{t('feasly.model.scenario_analysis')}</CardTitle>
        </div>
        <CardDescription>
          {t('feasly.model.scenario_analysis_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeScenario} onValueChange={(value) => setActiveScenario(value as ScenarioType)}>
          <TabsList className="grid w-full grid-cols-4">
            {scenarios.map((scenario) => (
              <TabsTrigger key={scenario.key} value={scenario.key} className="relative">
                <div className={`w-2 h-2 rounded-full ${scenario.color} mr-2`} />
                {scenario.label}
                {Object.keys(scenarioOverrides[scenario.key]).length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {t('feasly.model.override_active')}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {scenarios.map((scenario) => (
            <TabsContent key={scenario.key} value={scenario.key} className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{scenario.label}</h3>
                <div className="flex space-x-2">
                  {scenario.key !== "base" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyScenarioDefaults(scenario.key)}
                      >
                        Apply Defaults
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingScenario(scenario.key)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t('feasly.model.edit_scenario')}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Scenario Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(baseValues).map(([key, baseValue]) => {
                  const scenarioValue = getScenarioValue(scenario.key, key as keyof ScenarioOverrides);
                  const isOverridden = scenario.key !== "base" && scenarioOverrides[scenario.key][key as keyof ScenarioOverrides] !== undefined;
                  const changePercent = baseValue ? ((scenarioValue - baseValue) / baseValue) * 100 : 0;

                  return (
                    <div key={key} className="bg-muted/50 rounded-lg p-3">
                      <div className="text-sm font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </div>
                      <div className="text-lg font-bold">
                        {scenarioValue.toLocaleString()}
                        {key.includes("percent") || key.includes("rate") || key.includes("irr") || key.includes("roi") || key.includes("yield") ? "%" : ""}
                      </div>
                      {scenario.key !== "base" && (
                        <div className="text-xs text-muted-foreground">
                          {isOverridden && <Badge variant="outline" className="mr-1">Override</Badge>}
                          {changePercent !== 0 && (
                            <span className={changePercent > 0 ? "text-green-600" : "text-red-600"}>
                              {changePercent > 0 ? "+" : ""}{changePercent.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <ScenarioEditDialog scenario={scenario.key} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}