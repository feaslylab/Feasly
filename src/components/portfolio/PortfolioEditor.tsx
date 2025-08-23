import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  BarChart3, 
  Copy, 
  Trash2,
  Save 
} from "lucide-react";
import { usePortfolioManager } from "@/hooks/usePortfolioManager";
import { usePortfolioAssets } from "@/hooks/usePortfolioAssets";
import { useToast } from "@/hooks/use-toast";
import { AssetScenarioSelector } from "./AssetScenarioSelector";
import { PortfolioWeightInput } from "./PortfolioWeightInput";
import { AddAssetDialog } from "./AddAssetDialog";
import { PortfolioResultsPanel } from "./PortfolioResultsPanel";
import { PortfolioScenarioComparison } from "./PortfolioScenarioComparison";
import type { Portfolio } from "@/hooks/usePortfolioManager";
import type { PortfolioKPIs, PortfolioComparison } from "./PortfolioResultsPanel";

interface PortfolioEditorProps {
  portfolio: Portfolio;
  onBack: () => void;
  onPortfolioUpdated: (portfolio: Portfolio) => void;
}

export const PortfolioEditor = ({ portfolio, onBack, onPortfolioUpdated }: PortfolioEditorProps) => {
  const [name, setName] = useState(portfolio.name);
  const [description, setDescription] = useState(portfolio.description || "");
  const [weightingMethod, setWeightingMethod] = useState<"equal" | "equity" | "gfa" | "revenue">(
    (portfolio.portfolio_settings?.weighting_method as "equal" | "equity" | "gfa" | "revenue") || "equal"
  );
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [portfolioComparison, setPortfolioComparison] = useState<PortfolioComparison | null>(null);
  
  const { updatePortfolio, createPortfolio } = usePortfolioManager();
  const { assets, loading, addAssetToPortfolio, removeAssetFromPortfolio, updateAssetWeight, updateAssetScenario, reload } = usePortfolioAssets(portfolio.id);
  const { toast } = useToast();

  useEffect(() => {
    reload();
  }, [portfolio.id, reload]);

  const handleSave = async () => {
    const updates = {
      name,
      description: description || undefined,
      portfolio_settings: {
        ...portfolio.portfolio_settings,
        weighting_method: weightingMethod
      }
    };
    
    const success = await updatePortfolio(portfolio.id, updates);
    if (success) {
      onPortfolioUpdated({ ...portfolio, ...updates });
      toast({
        title: "Portfolio updated",
        description: "Changes saved successfully.",
      });
    }
  };

  const handleDuplicate = async () => {
    const newName = `${name} (Copy)`;
    const newPortfolio = await createPortfolio(
      newName,
      description,
      portfolio.portfolio_settings
    );
    
    if (newPortfolio) {
      toast({
        title: "Portfolio duplicated",
        description: `Created "${newName}" successfully.`,
      });
    }
  };

  const handleRemoveAsset = async (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset && confirm(`Remove "${asset.name}" from this portfolio?`)) {
      await removeAssetFromPortfolio(assetId);
    }
  };

  const handleUpdateAssetWeight = async (assetId: string, weight: number) => {
    await updateAssetWeight(assetId, weight);
  };

  const handleUpdateAssetScenario = async (assetId: string, scenarioId: string) => {
    await updateAssetScenario(assetId, scenarioId);
  };

  const totalWeight = assets.reduce((sum, asset) => sum + (asset.portfolio_weight || 1), 0);

  // Mock KPIs calculation - in real implementation, this would call the calculation engine
  const currentKPIs: PortfolioKPIs = {
    totalNPV: 8500000,
    weightedIRR: 19.2,
    weightedROI: 24.7,
    equityMultiple: 2.3,
    profitMargin: 21.4,
    totalRevenue: 15200000,
    totalCosts: 11800000,
    paybackMonths: 42
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Portfolios
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Portfolio Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portfolio-name">Portfolio Name</Label>
              <Input
                id="portfolio-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter portfolio name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weighting-method">Weighting Method</Label>
              <Select 
                value={weightingMethod} 
                onValueChange={(value) => setWeightingMethod(value as "equal" | "equity" | "gfa" | "revenue")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Equal Weight</SelectItem>
                  <SelectItem value="equity">Equity Based</SelectItem>
                  <SelectItem value="gfa">GFA Based</SelectItem>
                  <SelectItem value="revenue">Revenue Based</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio-description">Description</Label>
            <Textarea
              id="portfolio-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter portfolio description (optional)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portfolio Assets</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Total Weight: {totalWeight.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddAsset(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Asset
              </Button>
              <Button 
                onClick={() => setShowResults(!showResults)}
                variant={showResults ? "default" : "outline"}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showResults ? "Hide Results" : "View Results"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading assets...
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No assets in this portfolio yet.
              </p>
              <Button onClick={() => setShowAddAsset(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Asset
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{asset.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAsset(asset.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Scenario</Label>
                      <AssetScenarioSelector
                        assetId={asset.id}
                        selectedScenarioId={asset.portfolio_scenario_id}
                        onScenarioChange={(scenarioId) => 
                          handleUpdateAssetScenario(asset.id, scenarioId)
                        }
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm">Weight</Label>
                      <PortfolioWeightInput
                        value={asset.portfolio_weight || 1.0}
                        onChange={(weight) => handleUpdateAssetWeight(asset.id, weight)}
                        disabled={weightingMethod === 'equal'}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      <PortfolioScenarioComparison
        assets={assets}
        portfolioId={portfolio.id}
        onComparisonChange={setPortfolioComparison}
      />

      {/* Results Panel */}
      {showResults && (
        <PortfolioResultsPanel
          portfolio={portfolio}
          assets={assets}
          currentKPIs={currentKPIs}
          comparison={portfolioComparison}
        />
      )}

      <AddAssetDialog
        open={showAddAsset}
        onOpenChange={setShowAddAsset}
        portfolioId={portfolio.id}
        existingAssetIds={assets.map(a => a.id)}
        onAssetAdded={() => {
          reload();
          setShowAddAsset(false);
        }}
      />
    </div>
  );
};