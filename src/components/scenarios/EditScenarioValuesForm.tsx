import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Edit3 } from "lucide-react";

const scenarioValuesSchema = z.object({
  gfa_sqm: z.number().min(1, "GFA must be greater than 0"),
  construction_cost_aed: z.number().min(1, "Construction cost must be greater than 0"),
  annual_revenue_potential_aed: z.number().min(0, "Annual revenue potential must be 0 or greater"),
  annual_operating_cost_aed: z.number().min(0, "Operating cost must be 0 or greater"),
  occupancy_rate_percent: z.number().min(0).max(100, "Occupancy rate must be between 0 and 100"),
  cap_rate_percent: z.number().min(0).max(100, "Cap rate must be between 0 and 100"),
  development_timeline_months: z.number().min(1, "Development timeline must be at least 1 month"),
  stabilization_period_months: z.number().min(0, "Stabilization period must be 0 or greater"),
});

type ScenarioValuesFormData = z.infer<typeof scenarioValuesSchema>;

interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: 'Residential' | 'Mixed Use' | 'Retail' | 'Hospitality' | 'Infrastructure';
  gfa_sqm: number;
  construction_cost_aed: number;
  annual_operating_cost_aed: number;
  annual_revenue_potential_aed: number;
  occupancy_rate_percent: number;
  cap_rate_percent: number;
  development_timeline_months: number;
  stabilization_period_months: number;
  created_at: string;
  updated_at: string;
}

interface ScenarioOverride {
  id: string;
  scenario_id: string;
  asset_id: string;
  field_name: string;
  override_value: number;
}

interface Scenario {
  id: string;
  project_id: string;
  name: string;
  type: 'Base Case' | 'Optimistic' | 'Pessimistic';
  is_base: boolean;
}

interface EditScenarioValuesFormProps {
  asset: Asset;
  scenarioId: string;
  scenario: Scenario;
  trigger?: React.ReactNode;
}

export const EditScenarioValuesForm = ({ asset, scenarioId, scenario, trigger }: EditScenarioValuesFormProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing overrides for this asset and scenario
  const { data: existingOverrides } = useQuery({
    queryKey: ["scenario-overrides", scenarioId, asset.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scenario_overrides")
        .select("*")
        .eq("scenario_id", scenarioId)
        .eq("asset_id", asset.id);

      if (error) throw error;
      return data as ScenarioOverride[];
    },
    enabled: !!scenarioId && !!asset.id,
  });

  // Helper function to get current value (override or base)
  const getCurrentValue = (fieldName: string): number => {
    const override = existingOverrides?.find(o => o.field_name === fieldName);
    if (override) {
      return override.override_value;
    }
    return asset[fieldName as keyof Asset] as number;
  };

  const form = useForm<ScenarioValuesFormData>({
    resolver: zodResolver(scenarioValuesSchema),
    defaultValues: {
      gfa_sqm: getCurrentValue('gfa_sqm'),
      construction_cost_aed: getCurrentValue('construction_cost_aed'),
      annual_revenue_potential_aed: getCurrentValue('annual_revenue_potential_aed'),
      annual_operating_cost_aed: getCurrentValue('annual_operating_cost_aed'),
      occupancy_rate_percent: getCurrentValue('occupancy_rate_percent'),
      cap_rate_percent: getCurrentValue('cap_rate_percent'),
      development_timeline_months: getCurrentValue('development_timeline_months'),
      stabilization_period_months: getCurrentValue('stabilization_period_months'),
    },
  });

  // Reset form values when overrides change
  useState(() => {
    if (existingOverrides) {
      form.reset({
        gfa_sqm: getCurrentValue('gfa_sqm'),
        construction_cost_aed: getCurrentValue('construction_cost_aed'),
        annual_revenue_potential_aed: getCurrentValue('annual_revenue_potential_aed'),
        annual_operating_cost_aed: getCurrentValue('annual_operating_cost_aed'),
        occupancy_rate_percent: getCurrentValue('occupancy_rate_percent'),
        cap_rate_percent: getCurrentValue('cap_rate_percent'),
        development_timeline_months: getCurrentValue('development_timeline_months'),
        stabilization_period_months: getCurrentValue('stabilization_period_months'),
      });
    }
  });

  const saveOverridesMutation = useMutation({
    mutationFn: async (data: ScenarioValuesFormData) => {
      const fieldNames = Object.keys(data) as Array<keyof ScenarioValuesFormData>;
      
      for (const fieldName of fieldNames) {
        const value = data[fieldName];
        const baseValue = asset[fieldName];
        
        // Only create/update override if value differs from base
        if (value !== baseValue) {
          const { error } = await supabase
            .from("scenario_overrides")
            .upsert({
              scenario_id: scenarioId,
              asset_id: asset.id,
              field_name: fieldName,
              override_value: value,
            }, {
              onConflict: 'scenario_id,asset_id,field_name'
            });

          if (error) throw error;
        } else {
          // Remove override if value matches base (reset to default)
          const { error } = await supabase
            .from("scenario_overrides")
            .delete()
            .eq("scenario_id", scenarioId)
            .eq("asset_id", asset.id)
            .eq("field_name", fieldName);

          if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
        }
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Scenario values updated for ${asset.name}`,
      });
      setOpen(false);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["scenario-overrides", scenarioId] });
      queryClient.invalidateQueries({ queryKey: ["scenario-overrides", scenarioId, asset.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update scenario values. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving scenario overrides:", error);
    },
  });

  const onSubmit = (data: ScenarioValuesFormData) => {
    saveOverridesMutation.mutate(data);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="flex items-center gap-1">
      <Edit3 className="w-3 h-3" />
      Edit Scenario Values
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Edit Scenario Values
            <Badge variant="secondary">{scenario.type}</Badge>
          </DialogTitle>
          <DialogDescription>
            Edit financial values for <strong>{asset.name}</strong> in the <strong>{scenario.name}</strong> scenario.
            Values that differ from the base case will be saved as overrides.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Physical Characteristics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Physical Characteristics</h3>
              
              <FormField
                control={form.control}
                name="gfa_sqm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gross Floor Area (sqm)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter GFA in square meters"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="construction_cost_aed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Construction Cost (AED)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter construction cost"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annual_revenue_potential_aed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue Potential (AED/year)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter annual revenue potential"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annual_operating_cost_aed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Cost (AED/year)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter annual operating cost"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occupancy_rate_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter occupancy rate"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cap_rate_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cap Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter cap rate"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="development_timeline_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Development Timeline (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter development timeline"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stabilization_period_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stabilization Period (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter stabilization period"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saveOverridesMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveOverridesMutation.isPending}>
                {saveOverridesMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};