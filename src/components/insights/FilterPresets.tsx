import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface FilterPreset {
  id: string;
  name: string;
  scenarioFilter: string;
  statusFilter: string;
  countryFilter: string;
  dateRange: DateRange | undefined;
  currencyFormat: string;
  createdAt: Date;
}

interface FilterPresetsProps {
  scenarioFilter: string;
  statusFilter: string;
  countryFilter: string;
  dateRange: DateRange | undefined;
  currencyFormat: string;
  onFiltersChange: (filters: {
    scenarioFilter: string;
    statusFilter: string;
    countryFilter: string;
    dateRange: DateRange | undefined;
    currencyFormat: string;
  }) => void;
}

export const FilterPresets = ({
  scenarioFilter,
  statusFilter,
  countryFilter,
  dateRange,
  currencyFormat,
  onFiltersChange
}: FilterPresetsProps) => {
  const { isRTL } = useLanguage();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('feasly_filter_presets');
    if (savedPresets) {
      try {
        const parsed = JSON.parse(savedPresets).map((preset: any) => ({
          ...preset,
          createdAt: new Date(preset.createdAt),
          dateRange: preset.dateRange ? {
            from: preset.dateRange.from ? new Date(preset.dateRange.from) : undefined,
            to: preset.dateRange.to ? new Date(preset.dateRange.to) : undefined
          } : undefined
        }));
        setPresets(parsed);
      } catch (error) {
        console.error('Failed to load filter presets:', error);
      }
    }
  }, []);

  // Save presets to localStorage when presets change
  useEffect(() => {
    localStorage.setItem('feasly_filter_presets', JSON.stringify(presets));
  }, [presets]);

  const saveCurrentFilters = () => {
    if (!newPresetName.trim()) {
      toast("Please enter a preset name");
      return;
    }

    if (presets.some(preset => preset.name === newPresetName.trim())) {
      toast("A preset with this name already exists");
      return;
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      scenarioFilter,
      statusFilter,
      countryFilter,
      dateRange,
      currencyFormat,
      createdAt: new Date()
    };

    setPresets(prev => [...prev, newPreset]);
    setNewPresetName("");
    setShowSaveDialog(false);
    toast(`Filter preset "${newPreset.name}" saved successfully!`);
  };

  const loadPreset = (preset: FilterPreset) => {
    onFiltersChange({
      scenarioFilter: preset.scenarioFilter,
      statusFilter: preset.statusFilter,
      countryFilter: preset.countryFilter,
      dateRange: preset.dateRange,
      currencyFormat: preset.currencyFormat
    });
    toast(`Loaded preset "${preset.name}"`);
  };

  const deletePreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    setPresets(prev => prev.filter(p => p.id !== presetId));
    toast(`Deleted preset "${preset?.name}"`);
  };

  const hasActiveFilters = () => {
    return scenarioFilter !== 'all' || 
           statusFilter !== 'all' || 
           countryFilter !== 'all' || 
           currencyFormat !== 'AED' ||
           (dateRange?.from && dateRange?.to);
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", isRTL && "flex-row-reverse")}>
      {/* Save Preset Button */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!hasActiveFilters()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Filter
          </Button>
        </DialogTrigger>
        <DialogContent className={cn("sm:max-w-md", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Enter preset name..."
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveCurrentFilters()}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Current filters to save:</p>
              <ul className="mt-2 space-y-1">
                {scenarioFilter !== 'all' && <li>• Scenario: {scenarioFilter}</li>}
                {statusFilter !== 'all' && <li>• Status: {statusFilter}</li>}
                {countryFilter !== 'all' && <li>• Country: {countryFilter}</li>}
                {currencyFormat !== 'AED' && <li>• Currency: {currencyFormat}</li>}
                {dateRange?.from && dateRange?.to && (
                  <li>• Date Range: {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}</li>
                )}
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveCurrentFilters}>
                <Save className="h-4 w-4 mr-2" />
                Save Preset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Preset Dropdown */}
      {presets.length > 0 && (
        <Select onValueChange={(value) => {
          const preset = presets.find(p => p.id === value);
          if (preset) loadPreset(preset);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Load Preset" />
          </SelectTrigger>
          <SelectContent>
            {presets.map(preset => (
              <SelectItem key={preset.id} value={preset.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{preset.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePreset(preset.id);
                    }}
                    className="h-6 w-6 p-0 ml-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Active Filter Badges */}
      {hasActiveFilters() && (
        <div className="flex items-center gap-1 flex-wrap">
          {scenarioFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Scenario: {scenarioFilter}
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Status: {statusFilter}
            </Badge>
          )}
          {countryFilter !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Country: {countryFilter}
            </Badge>
          )}
          {currencyFormat !== 'AED' && (
            <Badge variant="secondary" className="text-xs">
              Currency: {currencyFormat}
            </Badge>
          )}
        </div>
      )}

      {/* Preset Count Info */}
      {presets.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {presets.length} saved preset{presets.length !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};