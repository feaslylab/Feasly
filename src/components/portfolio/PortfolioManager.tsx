import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Plus, ArrowLeft } from "lucide-react";
import { usePortfolioManager } from "@/hooks/usePortfolioManager";
import { PortfolioList } from "./PortfolioList";
import { PortfolioEditor } from "./PortfolioEditor";
import { CreatePortfolioDialog } from "./CreatePortfolioDialog";
import type { Portfolio } from "@/hooks/usePortfolioManager";

export const PortfolioManager = () => {
  const { portfolios, loading, reload } = usePortfolioManager();
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load last opened portfolio from localStorage
  useEffect(() => {
    const lastPortfolioId = localStorage.getItem('last-opened-portfolio');
    if (lastPortfolioId && portfolios.length > 0) {
      const portfolio = portfolios.find(p => p.id === lastPortfolioId);
      if (portfolio) {
        setSelectedPortfolio(portfolio);
      }
    }
  }, [portfolios]);

  // Save last opened portfolio to localStorage
  useEffect(() => {
    if (selectedPortfolio) {
      localStorage.setItem('last-opened-portfolio', selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  const handleOpenPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
  };

  const handleBackToList = () => {
    setSelectedPortfolio(null);
    reload(); // Refresh the list when returning
  };

  const handlePortfolioCreated = (portfolio: Portfolio) => {
    reload();
    setSelectedPortfolio(portfolio);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-muted-foreground">Loading portfolios...</div>
        </CardContent>
      </Card>
    );
  }

  // If editing a portfolio, show the editor
  if (selectedPortfolio) {
    return (
      <div className="space-y-6">
        <PortfolioEditor 
          portfolio={selectedPortfolio}
          onBack={handleBackToList}
          onPortfolioUpdated={(updated) => setSelectedPortfolio(updated)}
        />
        
        <CreatePortfolioDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onPortfolioCreated={handlePortfolioCreated}
        />
      </div>
    );
  }

  // Otherwise show the portfolio list
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Portfolio Manager
            </CardTitle>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Portfolio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PortfolioList 
            portfolios={portfolios}
            onOpenPortfolio={handleOpenPortfolio}
          />
        </CardContent>
      </Card>
      
      <CreatePortfolioDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onPortfolioCreated={handlePortfolioCreated}
      />
    </div>
  );
};