import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Eye, Download } from "lucide-react";
import { useEngine } from "@/lib/engine/EngineContext";
import { useToast } from "@/hooks/use-toast";
import { PRESETS, FeaslyPreset, getPresetsByCategory } from "@/lib/presets/presets";
import { fmtAED } from "@/lib/format";

export default function PresetsPanel() {
  const { setInputs, inputs } = useEngine();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'residential' | 'retail' | 'mixed_use'>('all');
  const [expandedPresets, setExpandedPresets] = useState<Set<string>>(new Set());

  const filteredPresets = selectedCategory === 'all' 
    ? PRESETS 
    : getPresetsByCategory(selectedCategory);

  const handleApplyPreset = (preset: FeaslyPreset) => {
    const newInputs = {
      ...inputs,
      unit_types: preset.inputs.unit_types,
      cost_items: preset.inputs.cost_items
    };
    
    setInputs(newInputs);
    
    toast({
      title: "Preset Applied",
      description: `Applied preset: ${preset.name}`,
    });

    // Analytics event
    console.log('Analytics: preset_applied', { presetId: preset.id, presetName: preset.name });
  };

  const togglePresetExpansion = (presetId: string) => {
    setExpandedPresets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(presetId)) {
        newSet.delete(presetId);
      } else {
        newSet.add(presetId);
      }
      return newSet;
    });
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'residential': return 'default';
      case 'retail': return 'secondary';
      case 'mixed_use': return 'outline';
      default: return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'residential': return 'Residential';
      case 'retail': return 'Retail';  
      case 'mixed_use': return 'Mixed Use';
      default: return category;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div data-section="presets" className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Presets Library</h2>
        <p className="text-muted-foreground">
          Browse and apply starter templates for common project types.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter by category:</span>
          <Select value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="mixed_use">Mixed Use</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline" className="ml-auto">
          {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-6">
        {filteredPresets.map((preset) => (
          <Card key={preset.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{preset.name}</CardTitle>
                  <CardDescription>{preset.description}</CardDescription>
                </div>
                <Badge variant={getCategoryVariant(preset.category)}>
                  {getCategoryLabel(preset.category)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Collapsible
                  open={expandedPresets.has(preset.id)}
                  onOpenChange={() => togglePresetExpansion(preset.id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm">
                      {expandedPresets.has(preset.id) ? (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Hide Preview
                        </>
                      ) : (
                        <>
                          <ChevronRight className="h-4 w-4 mr-1" />
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
                <Button 
                  onClick={() => handleApplyPreset(preset)}
                  size="sm"
                  className="ml-auto"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Apply Preset
                </Button>
              </div>
            </CardHeader>

            <Collapsible
              open={expandedPresets.has(preset.id)}
              onOpenChange={() => togglePresetExpansion(preset.id)}
            >
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {/* Unit Mix Preview */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        Unit Mix
                        <Badge variant="outline" className="text-xs">
                          {preset.inputs.unit_types.length} type{preset.inputs.unit_types.length !== 1 ? 's' : ''}
                        </Badge>
                      </h4>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-5 gap-4 p-3 bg-muted/50 border-b text-sm font-medium">
                          <div>Name</div>
                          <div>Units</div>
                          <div>Price</div>
                          <div>Start Month</div>
                          <div>Duration</div>
                        </div>
                        {preset.inputs.unit_types.map((unit, index) => (
                          <div key={unit.id} className={`grid grid-cols-5 gap-4 p-3 text-sm ${index !== preset.inputs.unit_types.length - 1 ? 'border-b' : ''}`}>
                            <div className="font-medium">{unit.name}</div>
                            <div>{unit.units}</div>
                            <div>{formatCurrency(unit.unit_area_sqm * unit.price_per_sqm || 0)}</div>
                            <div>{unit.start_month}</div>
                            <div>{unit.duration_months} months</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost Items Preview */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        Cost Items
                        <Badge variant="outline" className="text-xs">
                          {preset.inputs.cost_items.length} item{preset.inputs.cost_items.length !== 1 ? 's' : ''}
                        </Badge>
                      </h4>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 border-b text-sm font-medium">
                          <div>Name</div>
                          <div>Amount</div>
                          <div>Start Month</div>
                          <div>Duration</div>
                        </div>
                        {preset.inputs.cost_items.map((cost, index) => (
                          <div key={cost.id} className={`grid grid-cols-4 gap-4 p-3 text-sm ${index !== preset.inputs.cost_items.length - 1 ? 'border-b' : ''}`}>
                            <div className="font-medium">{cost.name}</div>
                            <div>{fmtAED(cost.amount)}</div>
                            <div>{cost.start_month}</div>
                            <div>{cost.duration_months} months</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No presets found for the selected category.</p>
              <Button variant="outline" onClick={() => setSelectedCategory('all')}>
                Show All Presets
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}