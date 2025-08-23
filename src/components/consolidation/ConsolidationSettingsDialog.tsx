import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ConsolidationSettings } from "@/types/consolidation";

interface ConsolidationSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  settings: ConsolidationSettings;
  onSave: (settings: Partial<ConsolidationSettings>) => void;
  isLoading?: boolean;
}

export function ConsolidationSettingsDialog({ 
  open, 
  onClose, 
  settings, 
  onSave,
  isLoading = false
}: ConsolidationSettingsDialogProps) {
  const [selectedWeighting, setSelectedWeighting] = useState<ConsolidationSettings['weightingMethod']>(settings.weightingMethod);

  const handleWeightingChange = (value: string) => {
    setSelectedWeighting(value as ConsolidationSettings['weightingMethod']);
  };

  const handleSave = () => {
    onSave({ weightingMethod: selectedWeighting });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Consolidation Settings</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-sm font-medium mb-3 block">
            Portfolio Weighting Method
          </Label>
          
          <RadioGroup 
            value={selectedWeighting} 
            onValueChange={handleWeightingChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="equity" id="equity" />
              <Label htmlFor="equity" className="text-sm">
                Weight by Equity Contribution
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gfa" id="gfa" />
              <Label htmlFor="gfa" className="text-sm">
                Weight by Gross Floor Area (GFA)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="revenue" id="revenue" />
              <Label htmlFor="revenue" className="text-sm">
                Weight by Revenue
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="equal" id="equal" />
              <Label htmlFor="equal" className="text-sm">
                Equal Weighting
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}