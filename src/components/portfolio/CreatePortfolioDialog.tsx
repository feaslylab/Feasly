import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePortfolioManager } from "@/hooks/usePortfolioManager";
import { useToast } from "@/hooks/use-toast";
import type { Portfolio } from "@/hooks/usePortfolioManager";

interface CreatePortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPortfolioCreated: (portfolio: Portfolio) => void;
}

export const CreatePortfolioDialog = ({ open, onOpenChange, onPortfolioCreated }: CreatePortfolioDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weightingMethod, setWeightingMethod] = useState<"equal" | "equity" | "gfa" | "revenue">("equal");
  const [isLoading, setIsLoading] = useState(false);
  
  const { createPortfolio } = usePortfolioManager();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a portfolio name.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting portfolio creation with data:', {
        name: name.trim(),
        description: description.trim() || undefined,
        weightingMethod
      });

      const portfolio = await createPortfolio(
        name.trim(),
        description.trim() || undefined,
        { 
          weighting_method: weightingMethod,
          aggregation_rules: {
            irr: "weighted",
            npv: "sum",
            roi: "weighted"
          }
        }
      );
      
      console.log('Portfolio creation result:', portfolio);
      
      if (portfolio) {
        console.log('Portfolio created successfully, calling callbacks');
        onPortfolioCreated(portfolio);
        handleClose();
        toast({
          title: "Portfolio created",
          description: `"${name}" has been created successfully.`,
        });
      } else {
        console.error('Portfolio creation returned null');
        toast({
          title: "Error",
          description: "Portfolio creation failed. Please check console for details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Portfolio creation error:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create portfolio. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setWeightingMethod("equal");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-popover">
        <DialogHeader>
          <DialogTitle>Create New Portfolio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Portfolio Name*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Downtown Development Portfolio"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="weighting">Weighting Method</Label>
            <Select 
              value={weightingMethod} 
              onValueChange={(value) => setWeightingMethod(value as typeof weightingMethod)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select weighting method" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-[var(--z-dropdown)]">
                <SelectItem value="equal">Equal Weight</SelectItem>
                <SelectItem value="equity">Equity Based</SelectItem>
                <SelectItem value="gfa">GFA Based</SelectItem>
                <SelectItem value="revenue">Revenue Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this portfolio's focus..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create Portfolio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};