import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePortfolioAssets } from "@/hooks/usePortfolioAssets";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  name: string;
  project_id?: string | null;
  type: string;
}

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  existingAssetIds: string[];
  onAssetAdded: () => void;
}

export const AddAssetDialog = ({ 
  open, 
  onOpenChange, 
  portfolioId, 
  existingAssetIds, 
  onAssetAdded 
}: AddAssetDialogProps) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { addAssetToPortfolio } = usePortfolioAssets(portfolioId);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadAvailableAssets();
      setSelectedAssetIds([]);
      setSearchQuery("");
    }
  }, [open]);

  useEffect(() => {
    // Filter assets based on search query
    const filtered = assets.filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAssets(filtered);
  }, [assets, searchQuery]);

  const loadAvailableAssets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assets')
        .select('id, name, project_id, type')
        .not('id', 'in', `(${existingAssetIds.join(',') || 'null'})`) // Exclude already added assets
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading assets:', error);
        toast({
          title: "Error",
          description: "Failed to load available assets.",
          variant: "destructive",
        });
        return;
      }

      setAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
      toast({
        title: "Error",
        description: "Failed to load assets.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAsset = (assetId: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const handleAddAssets = async () => {
    if (selectedAssetIds.length === 0) {
      toast({
        title: "No assets selected",
        description: "Please select at least one asset to add.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Add each selected asset to the portfolio
      for (const assetId of selectedAssetIds) {
        // Get first available scenario for the asset
        const { data: scenarios } = await supabase
          .from('scenarios')
          .select('id, is_base')
          .eq('asset_id', assetId)
          .order('is_base', { ascending: false })
          .limit(1);
        
        const scenarioId = scenarios?.[0]?.id;
        if (scenarioId) {
          await addAssetToPortfolio(assetId, scenarioId, 1.0);
        }
      }

      toast({
        title: "Assets added",
        description: `Successfully added ${selectedAssetIds.length} asset(s) to the portfolio.`,
      });

      onAssetAdded();
    } catch (error) {
      console.error('Error adding assets:', error);
      toast({
        title: "Error",
        description: "Failed to add assets to portfolio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Assets to Portfolio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="asset-search">Search Assets</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="asset-search"
                placeholder="Search by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Asset List */}
          <ScrollArea className="h-64 border rounded-md p-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading assets...
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No assets found matching your search." : "No available assets to add."}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md">
                    <Checkbox
                      id={`asset-${asset.id}`}
                      checked={selectedAssetIds.includes(asset.id)}
                      onCheckedChange={() => handleToggleAsset(asset.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium truncate">{asset.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {asset.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selection Summary */}
          {selectedAssetIds.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {selectedAssetIds.length} asset(s) selected
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddAssets}
            disabled={loading || selectedAssetIds.length === 0}
          >
            Add {selectedAssetIds.length > 0 ? `${selectedAssetIds.length} ` : ""}Asset{selectedAssetIds.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};