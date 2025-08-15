import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSelectionStore } from "@/state/selectionStore";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Asset } from "@/lib/types"; // Use consolidated type definition

interface ScenarioOverride {
  id?: string;
  scenario_id: string;
  asset_id: string;
  field_name: string;
  override_value: number;
}

export const AssetsList = () => {
  const { projectId, scenarioId } = useSelectionStore();
  const [selectedScenarioId] = useState(scenarioId);

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ["assets", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("id, project_id, name, type, gfa_sqm, construction_cost_aed, annual_operating_cost_aed, annual_revenue_aed, occupancy_rate_percent, cap_rate_percent, development_timeline_months, stabilization_period_months, created_at, updated_at")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error fetching assets:', error);
        return [];
      }
      return (data || []) as Asset[];
    },
    enabled: !!projectId,
  });

  const { data: overrides } = useQuery({
    queryKey: ["scenario-overrides", selectedScenarioId],
    queryFn: async () => {
      // Scenario overrides table doesn't exist yet, return empty array
      return [];
    },
    enabled: !!selectedScenarioId,
  });

  if (assetsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAssetValue = (asset: Asset, fieldName: string) => {
    const override = overrides?.find(
      (o: ScenarioOverride) => o.asset_id === asset.id && o.field_name === fieldName
    );
    return override ? override.override_value : (asset as any)[fieldName];
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatArea = (sqm: number | null) => {
    if (sqm === null || sqm === undefined) return "—";
    return `${sqm.toLocaleString()} m²`;
  };

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return `${value}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Assets</CardTitle>
      </CardHeader>
      <CardContent>
        {assets && assets.length > 0 ? (
          <div className="space-y-4">
            {assets.map((asset) => (
              <div key={asset.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{asset.name}</h3>
                  <Badge variant="secondary">{asset.type}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">GFA:</span>
                    <div className="font-medium">{formatArea(asset.gfa_sqm)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Construction Cost:</span>
                    <div className="font-medium">{formatCurrency(asset.construction_cost_aed)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Annual Revenue:</span>
                    <div className="font-medium">{formatCurrency(asset.annual_revenue_aed)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cap Rate:</span>
                    <div className="font-medium">{formatPercent(asset.cap_rate_percent)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No assets found for this project.
          </div>
        )}
      </CardContent>
    </Card>
  );
};