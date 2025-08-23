import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderOpen, Plus } from "lucide-react";
import { usePortfolioManager } from "@/hooks/usePortfolioManager";
import { PortfolioList } from "./PortfolioList";
import { PortfolioEditor } from "./PortfolioEditor";
import type { Portfolio } from "@/hooks/usePortfolioManager";

export const PortfolioManager = () => {
  const { portfolios, loading, createPortfolio, reload } = usePortfolioManager();
  const [activeTab, setActiveTab] = useState<"list" | "edit">("list");
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);

  // Load last opened portfolio from localStorage
  useEffect(() => {
    const lastPortfolioId = localStorage.getItem('last-opened-portfolio');
    if (lastPortfolioId && portfolios.length > 0) {
      const portfolio = portfolios.find(p => p.id === lastPortfolioId);
      if (portfolio) {
        setSelectedPortfolio(portfolio);
        setActiveTab("edit");
      }
    }
  }, [portfolios]);

  // Save last opened portfolio to localStorage
  useEffect(() => {
    if (selectedPortfolio) {
      localStorage.setItem('last-opened-portfolio', selectedPortfolio.id);
    }
  }, [selectedPortfolio]);

  const handleCreatePortfolio = async () => {
    const name = `Portfolio ${portfolios.length + 1}`;
    const newPortfolio = await createPortfolio(name);
    if (newPortfolio) {
      setSelectedPortfolio(newPortfolio);
      setActiveTab("edit");
    }
  };

  const handleOpenPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setActiveTab("edit");
  };

  const handleBackToList = () => {
    setActiveTab("list");
    setSelectedPortfolio(null);
    reload(); // Refresh the list when returning
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Portfolio Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "list" | "edit")}>
            <TabsList className="mb-6">
              <TabsTrigger value="list">Portfolios</TabsTrigger>
              {selectedPortfolio && (
                <TabsTrigger value="edit">
                  Edit: {selectedPortfolio.name}
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="list">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Your Portfolios</h3>
                  <Button onClick={handleCreatePortfolio}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Portfolio
                  </Button>
                </div>

                <PortfolioList 
                  portfolios={portfolios}
                  onOpenPortfolio={handleOpenPortfolio}
                />
              </div>
            </TabsContent>

            {selectedPortfolio && (
              <TabsContent value="edit">
                <PortfolioEditor 
                  portfolio={selectedPortfolio}
                  onBack={handleBackToList}
                  onPortfolioUpdated={(updated) => setSelectedPortfolio(updated)}
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};