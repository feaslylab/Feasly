import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Scenario {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  description?: string;
  is_base: boolean;
  created_at: string;
  updated_at: string;
}

interface ReadOnlyScenarioSelectorProps {
  projectId: string;
  selectedScenarioId: string | null;
  onScenarioChange: (scenarioId: string) => void;
}

const getScenarioIcon = (isBase: boolean) => {
  if (isBase) {
    return <Minus className="w-4 h-4 text-blue-600" />;
  } else {
    return <TrendingUp className="w-4 h-4 text-gray-600" />;
  }
};

const getScenarioBadgeVariant = (isBase: boolean) => {
  return isBase ? 'default' : 'secondary';
};

const getScenarioTypeLabel = (isBase: boolean) => {
  return isBase ? 'Base' : 'Custom';
};

export const ReadOnlyScenarioSelector = ({ projectId, selectedScenarioId, onScenarioChange }: ReadOnlyScenarioSelectorProps) => {
  const { data: scenarios, isLoading } = useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", projectId)
        .order("is_base", { ascending: false }); // Base scenarios first

      if (error) throw error;
      return data as Scenario[];
    },
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Label className="text-sm font-medium">Scenario:</Label>
        <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <Label className="text-sm font-medium">Scenario:</Label>
        <Badge variant="outline">No scenarios available</Badge>
      </div>
    );
  }

  const selectedScenario = scenarios.find(s => s.id === selectedScenarioId);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2">
      <Label className="text-sm font-medium whitespace-nowrap">Scenario:</Label>
      <div className="flex-1 sm:flex-none">
        <Select value={selectedScenarioId || ""} onValueChange={onScenarioChange}>
          <SelectTrigger className="w-full sm:w-64 bg-background">
            <SelectValue placeholder="Select scenario">
              {selectedScenario && (
                <div className="flex items-center space-x-2">
                {getScenarioIcon(selectedScenario.is_base)}
                <span>{selectedScenario.name}</span>
                <Badge variant={getScenarioBadgeVariant(selectedScenario.is_base)} className="ml-auto">
                  {getScenarioTypeLabel(selectedScenario.is_base)}
                </Badge>
              </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-md z-50 max-h-60 overflow-y-auto">
          {scenarios.map((scenario) => (
            <SelectItem key={scenario.id} value={scenario.id}>
              <div className="flex items-center space-x-2 w-full">
                {getScenarioIcon(scenario.is_base)}
                <span className="flex-1">{scenario.name}</span>
                <Badge variant={getScenarioBadgeVariant(scenario.is_base)}>
                  {getScenarioTypeLabel(scenario.is_base)}
                </Badge>
              </div>
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};