import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Scenario {
  id: string;
  name: string;
  is_base: boolean;
}

interface AssetScenarioSelectorProps {
  assetId: string;
  selectedScenarioId?: string | null;
  onScenarioChange: (scenarioId: string) => void;
}

export const AssetScenarioSelector = ({ 
  assetId, 
  selectedScenarioId, 
  onScenarioChange 
}: AssetScenarioSelectorProps) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadScenarios();
  }, [assetId]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('scenarios')
        .select('id, name, is_base')
        .eq('asset_id', assetId)
        .order('is_base', { ascending: false }) // Base scenarios first
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading scenarios:', error);
        toast({
          title: "Error",
          description: "Failed to load scenarios for this asset.",
          variant: "destructive",
        });
        return;
      }

      setScenarios(data || []);
    } catch (error) {
      console.error('Error loading scenarios:', error);
      toast({
        title: "Error",
        description: "Failed to load scenarios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScenarioLabel = (scenario: Scenario) => {
    return scenario.is_base ? `${scenario.name} (Base)` : scenario.name;
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading scenarios..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (scenarios.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No scenarios available" />
        </SelectTrigger>
      </Select>
    );
  }

  // Auto-select base scenario if no scenario is selected
  const currentSelection = selectedScenarioId || 
    scenarios.find(s => s.is_base)?.id || 
    scenarios[0]?.id;

  return (
    <Select 
      value={currentSelection} 
      onValueChange={onScenarioChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select scenario" />
      </SelectTrigger>
      <SelectContent>
        {scenarios.map((scenario) => (
          <SelectItem key={scenario.id} value={scenario.id}>
            {getScenarioLabel(scenario)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};