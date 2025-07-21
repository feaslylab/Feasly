import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Minus, Copy } from "lucide-react";

interface Scenario {
  id: string;
  project_id: string;
  name: string;
  type: 'Base Case' | 'Optimistic' | 'Pessimistic';
  is_base: boolean;
  created_at: string;
  updated_at: string;
}

interface ScenarioSelectorProps {
  projectId: string;
  selectedScenarioId: string | null;
  onScenarioChange: (scenarioId: string) => void;
}

const getScenarioIcon = (type: string) => {
  switch (type) {
    case 'Optimistic':
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    case 'Pessimistic':
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    default:
      return <Minus className="w-4 h-4 text-blue-600" />;
  }
};

const getScenarioBadgeVariant = (type: string) => {
  switch (type) {
    case 'Optimistic':
      return 'default';
    case 'Pessimistic':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const ScenarioSelector = ({ projectId, selectedScenarioId, onScenarioChange }: ScenarioSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState("");
  const [isDuplicating, setIsDuplicating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: scenarios, isLoading } = useQuery({
    queryKey: ["scenarios", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq("project_id", projectId)
        .order("type", { ascending: true }); // Base Case first

      if (error) throw error;
      return data as Scenario[];
    },
    enabled: !!projectId,
  });

  const duplicateScenario = async () => {
    if (!selectedScenarioId || !newScenarioName.trim()) return;

    try {
      setIsDuplicating(true);

      // Get the current scenario details
      const { data: originalScenario, error: scenarioError } = await supabase
        .from("scenarios")
        .select("*")
        .eq("id", selectedScenarioId)
        .single();

      if (scenarioError) throw scenarioError;

      // Create new scenario
      const { data: newScenario, error: createError } = await supabase
        .from("scenarios")
        .insert({
          project_id: projectId,
          name: newScenarioName.trim(),
          type: originalScenario.type,
          is_base: false, // Duplicates are never base scenarios
        })
        .select()
        .single();

      if (createError) throw createError;

      // Get all overrides from the original scenario
      const { data: originalOverrides, error: overridesError } = await supabase
        .from("scenario_overrides")
        .select("*")
        .eq("scenario_id", selectedScenarioId);

      if (overridesError) throw overridesError;

      // Copy overrides to the new scenario if any exist
      if (originalOverrides && originalOverrides.length > 0) {
        const newOverrides = originalOverrides.map(override => ({
          scenario_id: newScenario.id,
          asset_id: override.asset_id,
          field_name: override.field_name,
          override_value: override.override_value,
        }));

        const { error: insertOverridesError } = await supabase
          .from("scenario_overrides")
          .insert(newOverrides);

        if (insertOverridesError) throw insertOverridesError;
      }

      // Refresh scenarios data
      await queryClient.invalidateQueries({ queryKey: ["scenarios", projectId] });

      // Switch to the new scenario
      onScenarioChange(newScenario.id);

      // Show success toast
      toast({
        title: "Scenario Duplicated",
        description: `"${newScenarioName}" has been created successfully.`,
      });

      // Reset and close dialog
      setIsDialogOpen(false);
      setNewScenarioName("");

    } catch (error) {
      console.error("Error duplicating scenario:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate scenario. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDuplicateClick = () => {
    const selectedScenario = scenarios?.find(s => s.id === selectedScenarioId);
    if (selectedScenario) {
      setNewScenarioName(`${selectedScenario.name} Copy`);
      setIsDialogOpen(true);
    }
  };

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
                {getScenarioIcon(selectedScenario.type)}
                <span>{selectedScenario.name}</span>
                <Badge variant={getScenarioBadgeVariant(selectedScenario.type)} className="ml-auto">
                  {selectedScenario.type}
                </Badge>
              </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-md z-50 max-h-60 overflow-y-auto">
          {scenarios.map((scenario) => (
            <SelectItem key={scenario.id} value={scenario.id}>
              <div className="flex items-center space-x-2 w-full">
                {getScenarioIcon(scenario.type)}
                <span className="flex-1">{scenario.name}</span>
                <Badge variant={getScenarioBadgeVariant(scenario.type)}>
                  {scenario.type}
                </Badge>
              </div>
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
      </div>
      {selectedScenarioId && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicateClick}
              className="flex items-center gap-2 w-full sm:w-auto whitespace-nowrap"
            >
              <Copy className="w-4 h-4" />
              Duplicate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Duplicate Scenario</DialogTitle>
              <DialogDescription>
                Create a copy of the current scenario with all its override values.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scenario-name">New Scenario Name</Label>
                <Input
                  id="scenario-name"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Enter scenario name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isDuplicating}
              >
                Cancel
              </Button>
              <Button
                onClick={duplicateScenario}
                disabled={!newScenarioName.trim() || isDuplicating}
              >
                {isDuplicating ? "Duplicating..." : "Duplicate Scenario"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};