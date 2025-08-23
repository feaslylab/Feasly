import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export type AssetWithScenarios = {
  id: string;
  name: string;
  type: string;
  project_id: string;
  portfolio_weight: number;
  portfolio_scenario_id: string | null;
  scenarios: Array<{
    id: string;
    name: string;
    is_base: boolean;
  }>;
};

export type PortfolioComposition = {
  asset_id: string;
  asset_name: string;
  project_id: string;
  scenario_id: string;
  scenario_name: string;
  is_base_scenario: boolean;
  weight: number;
};

/**
 * Hook for managing assets within a portfolio - add/remove assets, change scenarios, adjust weights
 */
export function usePortfolioAssets(portfolioId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<AssetWithScenarios[]>([]);
  const [composition, setComposition] = useState<PortfolioComposition[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortfolioAssets = useCallback(async () => {
    if (!user || !portfolioId) return;
    
    setLoading(true);
    try {
      // Load assets that belong to this portfolio
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select(`
          id, name, type, project_id, portfolio_weight, portfolio_scenario_id,
          scenarios:scenarios(id, name, is_base)
        `)
        .eq('project_id', portfolioId);

      if (assetsError) throw assetsError;

      // Load portfolio composition using the database function
      const { data: compositionData, error: compositionError } = await supabase
        .rpc('get_portfolio_composition', { project_uuid: portfolioId });

      if (compositionError) throw compositionError;

      setAssets(assetsData as unknown as AssetWithScenarios[] || []);
      setComposition(compositionData || []);
    } catch (error) {
      console.error('Error loading portfolio assets:', error);
      toast({
        title: 'Error loading portfolio assets',
        description: error instanceof Error ? error.message : 'Failed to load portfolio assets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, portfolioId, toast]);

  const addAssetToPortfolio = useCallback(async (
    assetId: string,
    scenarioId: string,
    weight: number = 1.0
  ): Promise<boolean> => {
    if (!portfolioId) return false;

    try {
      const { error } = await supabase
        .from('assets')
        .update({
          project_id: portfolioId,
          portfolio_scenario_id: scenarioId,
          portfolio_weight: weight,
        })
        .eq('id', assetId);

      if (error) throw error;

      await loadPortfolioAssets(); // Refresh the data

      toast({
        title: 'Asset added to portfolio',
        description: 'Asset successfully added to portfolio',
      });

      return true;
    } catch (error) {
      console.error('Error adding asset to portfolio:', error);
      toast({
        title: 'Error adding asset',
        description: error instanceof Error ? error.message : 'Failed to add asset to portfolio',
        variant: 'destructive',
      });
      return false;
    }
  }, [portfolioId, loadPortfolioAssets, toast]);

  const removeAssetFromPortfolio = useCallback(async (assetId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assets')
        .update({
          portfolio_scenario_id: null,
          portfolio_weight: 1.0,
        })
        .eq('id', assetId);

      if (error) throw error;

      await loadPortfolioAssets(); // Refresh the data

      toast({
        title: 'Asset removed from portfolio',
        description: 'Asset successfully removed from portfolio',
      });

      return true;
    } catch (error) {
      console.error('Error removing asset from portfolio:', error);
      toast({
        title: 'Error removing asset',
        description: error instanceof Error ? error.message : 'Failed to remove asset from portfolio',
        variant: 'destructive',
      });
      return false;
    }
  }, [loadPortfolioAssets, toast]);

  const updateAssetScenario = useCallback(async (
    assetId: string,
    scenarioId: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assets')
        .update({
          portfolio_scenario_id: scenarioId,
        })
        .eq('id', assetId);

      if (error) throw error;

      await loadPortfolioAssets(); // Refresh the data

      toast({
        title: 'Scenario updated',
        description: 'Asset scenario successfully updated',
      });

      return true;
    } catch (error) {
      console.error('Error updating asset scenario:', error);
      toast({
        title: 'Error updating scenario',
        description: error instanceof Error ? error.message : 'Failed to update asset scenario',
        variant: 'destructive',
      });
      return false;
    }
  }, [loadPortfolioAssets, toast]);

  const updateAssetWeight = useCallback(async (
    assetId: string,
    weight: number
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('assets')
        .update({
          portfolio_weight: weight,
        })
        .eq('id', assetId);

      if (error) throw error;

      await loadPortfolioAssets(); // Refresh the data

      return true;
    } catch (error) {
      console.error('Error updating asset weight:', error);
      toast({
        title: 'Error updating weight',
        description: error instanceof Error ? error.message : 'Failed to update asset weight',
        variant: 'destructive',
      });
      return false;
    }
  }, [loadPortfolioAssets, toast]);

  useEffect(() => {
    loadPortfolioAssets();
  }, [loadPortfolioAssets]);

  return {
    assets,
    composition,
    loading,
    addAssetToPortfolio,
    removeAssetFromPortfolio,
    updateAssetScenario,
    updateAssetWeight,
    reload: loadPortfolioAssets,
  };
}