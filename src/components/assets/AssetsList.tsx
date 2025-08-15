import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EditScenarioValuesForm } from "@/components/scenarios/EditScenarioValuesForm";

interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: string; // Made more flexible to accept any string
  gfa_sqm: number | null;
  construction_cost_aed: number | null;
  annual_operating_cost_aed: number | null;
  annual_revenue_aed: number | null;
  occupancy_rate_percent: number | null;
  cap_rate_percent: number | null;
  development_timeline_months: number | null;
  stabilization_period_months: number | null;
  created_at: string | null;
  updated_at: string | null;
  [key: string]: any; // Allow any additional properties
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

interface AssetsListProps {
  projectId: string;
  selectedScenarioId?: string | null;
  selectedScenario?: Scenario | null;
  canEdit?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const AssetsList = ({ projectId, selectedScenarioId, selectedScenario, canEdit = true }: AssetsListProps) => {
  const { data: assets, isLoading, error } = useQuery({
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

  // Helper function to get the display value for a field (with override if exists)
  const getDisplayValue = (asset: Asset, fieldName: string): number => {
    const override = overrides?.find(o => o.asset_id === asset.id && o.field_name === fieldName);
    if (override) {
      return override.override_value;
    }
    const value = asset[fieldName as keyof Asset] as number | null | undefined;
    return value ?? 0;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-2 text-destructive">Error loading assets</h3>
          <p className="text-muted-foreground">
            There was an error loading the assets. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No assets yet</h3>
          <p className="text-muted-foreground">
            Start building your financial model by adding your first asset
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset) => {
        const constructionCost = getDisplayValue(asset, 'construction_cost_aed');
        const annualRevenue = getDisplayValue(asset, 'annual_revenue_aed');
        const occupancyRate = getDisplayValue(asset, 'occupancy_rate_percent');
        const capRate = getDisplayValue(asset, 'cap_rate_percent');
        
        return (
        <Card key={asset.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{asset.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{asset.type}</Badge>
                {canEdit && selectedScenario && !selectedScenario.is_base && selectedScenarioId && (
                  <EditScenarioValuesForm 
                    asset={asset}
                    scenarioId={selectedScenarioId}
                    scenario={selectedScenario}
                  />
                )}
              </div>
            </div>
            <CardDescription>
              {formatNumber(asset.gfa_sqm || 0)} sqm • {(asset.development_timeline_months ?? 0)} months
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Construction Cost</span>
                </div>
                <span className="font-medium">{formatCurrency(constructionCost)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Annual Revenue</span>
                </div>
                <span className="font-medium">{formatCurrency(annualRevenue)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Occupancy Rate</span>
                </div>
                <span className="font-medium">{occupancyRate}%</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cap Rate</span>
                </div>
                <span className="font-medium">{capRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })}
      </div>
  );
};