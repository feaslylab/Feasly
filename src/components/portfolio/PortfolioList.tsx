import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { FolderOpen, MoreVertical, Edit, Trash2, Copy } from "lucide-react";
import { usePortfolioManager } from "@/hooks/usePortfolioManager";
import { useToast } from "@/hooks/use-toast";
import type { Portfolio } from "@/hooks/usePortfolioManager";

interface PortfolioListProps {
  portfolios: Portfolio[];
  onOpenPortfolio: (portfolio: Portfolio) => void;
}

export const PortfolioList = ({ portfolios, onOpenPortfolio }: PortfolioListProps) => {
  const { deletePortfolio, createPortfolio } = usePortfolioManager();
  const { toast } = useToast();

  const handleDeletePortfolio = async (portfolio: Portfolio) => {
    if (confirm(`Are you sure you want to delete "${portfolio.name}"?`)) {
      const success = await deletePortfolio(portfolio.id);
      if (success) {
        toast({
          title: "Portfolio deleted",
          description: `"${portfolio.name}" has been removed.`,
        });
      }
    }
  };

  const handleDuplicatePortfolio = async (portfolio: Portfolio) => {
    const newName = `${portfolio.name} (Copy)`;
    const newPortfolio = await createPortfolio(
      newName, 
      portfolio.description, 
      portfolio.portfolio_settings
    );
    
    if (newPortfolio) {
      toast({
        title: "Portfolio duplicated",
        description: `Created "${newName}" successfully.`,
      });
    }
  };

  const getWeightingMethodLabel = (method: string) => {
    switch (method) {
      case 'equal': return 'Equal Weight';
      case 'equity': return 'Equity Based';
      case 'gfa': return 'GFA Based';
      case 'revenue': return 'Revenue Based';
      default: return 'Equal Weight';
    }
  };

  if (portfolios.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No portfolios yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first portfolio to start analyzing multiple projects together.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {portfolios.map((portfolio) => (
        <Card key={portfolio.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">
                  {portfolio.name}
                </CardTitle>
                {portfolio.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {portfolio.description}
                  </p>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onOpenPortfolio(portfolio)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicatePortfolio(portfolio)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeletePortfolio(portfolio)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weighting:</span>
                <Badge variant="outline">
                  {getWeightingMethodLabel(portfolio.portfolio_settings?.weighting_method || 'equal')}
                </Badge>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <span>Created {new Date(portfolio.created_at).toLocaleDateString()}</span>
              </div>
              
              <Button 
                onClick={() => onOpenPortfolio(portfolio)}
                className="w-full"
                size="sm"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Open Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};