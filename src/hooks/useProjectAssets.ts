import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

type Asset = {
  id: string;
  project_id: string | null;
  name: string;
  type: string;
  created_at: string | null;
};

/**
 * Hook to bridge the gap between project-centric UI and asset-centric data model.
 * Given a projectId, returns the assets belonging to that project and a primary asset.
 */
export function useProjectAssets(projectId: string | null) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [primaryAsset, setPrimaryAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAssets = useCallback(async () => {
    if (!user || !projectId) {
      setAssets([]);
      setPrimaryAsset(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const assetData = (data as unknown as Asset[]) || [];
      setAssets(assetData);
      
      // Set primary asset - prefer first asset, could add logic for "main" asset later
      setPrimaryAsset(assetData.length > 0 ? assetData[0] : null);
    } catch (error) {
      console.error('Error loading assets:', error);
      setAssets([]);
      setPrimaryAsset(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, user?.id]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  return {
    assets,
    primaryAsset,
    primaryAssetId: primaryAsset?.id || null,
    loading,
    reload: loadAssets,
  };
}