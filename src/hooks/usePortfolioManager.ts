import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export type Portfolio = {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_portfolio: boolean;
  portfolio_settings: {
    weighting_method: 'equal' | 'equity' | 'gfa' | 'revenue';
    aggregation_rules: {
      irr: 'weighted' | 'average';
      npv: 'sum' | 'weighted';
      roi: 'weighted' | 'average';
    };
  };
  created_at: string;
  updated_at: string;
};

export type PortfolioAsset = {
  id: string;
  name: string;
  project_id: string;
  portfolio_weight: number;
  portfolio_scenario_id: string | null;
  scenario_name?: string;
  is_base_scenario?: boolean;
};

/**
 * Hook for managing portfolio operations - create, list, update, delete portfolios
 */
export function usePortfolioManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPortfolios = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_portfolio', true)
        .or(`user_id.eq.${user.id},organization_id.in.(${user.id})`) // Handle both user and org ownership
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPortfolios(data as unknown as Portfolio[] || []);
    } catch (error) {
      console.error('Error loading portfolios:', error);
      toast({
        title: 'Error loading portfolios',
        description: error instanceof Error ? error.message : 'Failed to load portfolios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  const createPortfolio = useCallback(async (
    name: string, 
    description?: string,
    settings?: Portfolio['portfolio_settings']
  ): Promise<Portfolio | null> => {
    if (!user) return null;

    try {
      const portfolioData = {
        name,
        description,
        user_id: user.id,
        is_portfolio: true,
        portfolio_settings: settings || {
          weighting_method: 'equal' as const,
          aggregation_rules: {
            irr: 'weighted' as const,
            npv: 'sum' as const, 
            roi: 'weighted' as const,
          },
        },
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(portfolioData)
        .select()
        .single();

      if (error) throw error;

      const newPortfolio = data as unknown as Portfolio;
      setPortfolios(prev => [newPortfolio, ...prev]);

      toast({
        title: 'Portfolio created',
        description: `"${name}" portfolio created successfully`,
      });

      return newPortfolio;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast({
        title: 'Error creating portfolio',
        description: error instanceof Error ? error.message : 'Failed to create portfolio',
        variant: 'destructive',
      });
      return null;
    }
  }, [user?.id, toast]);

  const updatePortfolio = useCallback(async (
    id: string,
    updates: Partial<Pick<Portfolio, 'name' | 'description' | 'portfolio_settings'>>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPortfolios(prev => 
        prev.map(p => 
          p.id === id 
            ? { ...p, ...updates, updated_at: new Date().toISOString() }
            : p
        )
      );

      toast({
        title: 'Portfolio updated',
        description: 'Portfolio settings saved successfully',
      });

      return true;
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast({
        title: 'Error updating portfolio',
        description: error instanceof Error ? error.message : 'Failed to update portfolio',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, toast]);

  const deletePortfolio = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      setPortfolios(prev => prev.filter(p => p.id !== id));

      toast({
        title: 'Portfolio deleted',
        description: 'Portfolio removed successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast({
        title: 'Error deleting portfolio',
        description: error instanceof Error ? error.message : 'Failed to delete portfolio',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, toast]);

  const convertProjectToPortfolio = useCallback(async (
    projectId: string, 
    portfolioName?: string
  ): Promise<boolean> => {
    try {
      // Convert project to portfolio by updating the project directly
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          is_portfolio: true,
          name: portfolioName || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .eq('user_id', user?.id);

      if (projectError) throw projectError;

      // Set default portfolio scenarios for assets (use base scenarios)
      const { error: assetError } = await supabase
        .from('assets')
        .update({
          portfolio_scenario_id: null, // Will be set to base scenario later
        })
        .eq('project_id', projectId);

      if (assetError) throw assetError;

      await loadPortfolios(); // Refresh the list

      toast({
        title: 'Project converted to portfolio',
        description: `Project successfully converted to portfolio`,
      });

      return true;
    } catch (error) {
      console.error('Error converting project to portfolio:', error);
      toast({
        title: 'Error converting project',
        description: error instanceof Error ? error.message : 'Failed to convert project',
        variant: 'destructive',
      });
      return false;
    }
  }, [loadPortfolios, toast]);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  return {
    portfolios,
    loading,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    convertProjectToPortfolio,
    reload: loadPortfolios,
  };
}