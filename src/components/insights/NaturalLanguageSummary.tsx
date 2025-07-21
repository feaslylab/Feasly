import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  totalGFA: number;
  constructionCost: number;
  estimatedRevenue: number;
  irr: number;
  roi: number;
  profitMargin: number;
  netProfit: number;
  status: string;
  currency: string;
  createdAt: Date;
  scenario: string;
  country?: string;
  city?: string;
}

interface NaturalLanguageSummaryProps {
  projects: Project[];
  kpiMetrics: any;
  formatCurrency: (amount: number) => string;
}

export const NaturalLanguageSummary = ({ 
  projects, 
  kpiMetrics, 
  formatCurrency 
}: NaturalLanguageSummaryProps) => {
  const { isRTL } = useLanguage();

  const summary = useMemo(() => {
    if (projects.length === 0) {
      return "No projects available for analysis. Add projects to see portfolio insights.";
    }

    // Basic portfolio stats
    const totalProjects = projects.length;
    const countries = [...new Set(projects.map(p => p.country).filter(Boolean))];
    const avgIRR = kpiMetrics.avgIRR;
    const totalNetProfit = kpiMetrics.totalNetProfit;
    
    // Risk analysis
    const highRiskProjects = projects.filter(p => 
      p.roi < 5 || p.profitMargin < 10 || p.netProfit < 0
    ).length;
    
    // Top opportunities
    const topProjects = projects
      .filter(p => p.irr > 18 && p.netProfit > 5000000)
      .sort((a, b) => b.irr - a.irr)
      .slice(0, 2);
    
    // Status distribution
    const statusCounts = projects.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Build summary text
    let summaryText = `Your portfolio consists of ${totalProjects} project${totalProjects > 1 ? 's' : ''}`;
    
    if (countries.length > 0) {
      summaryText += ` across ${countries.join(', ')}`;
    }
    
    summaryText += `, generating an average IRR of ${avgIRR.toFixed(1)}% with a total net profit of ${formatCurrency(totalNetProfit)}.`;
    
    // Add performance insights
    if (avgIRR >= 20) {
      summaryText += ` Your portfolio is performing exceptionally well with strong returns.`;
    } else if (avgIRR >= 15) {
      summaryText += ` Your portfolio shows solid performance with room for optimization.`;
    } else {
      summaryText += ` Your portfolio may benefit from strategic review to improve returns.`;
    }
    
    // Risk alerts
    if (highRiskProjects > 0) {
      summaryText += ` ${highRiskProjects} project${highRiskProjects > 1 ? 's show' : ' shows'} elevated risk levels requiring attention.`;
    }
    
    // Top opportunities
    if (topProjects.length > 0) {
      const projectNames = topProjects.map(p => p.name).join(' and ');
      summaryText += ` Key opportunities include ${projectNames}, showing exceptional potential with high IRR and strong profit margins.`;
    }
    
    // Status insights
    const completedProjects = statusCounts['Completed'] || 0;
    const activeProjects = (statusCounts['Construction'] || 0) + (statusCounts['Development'] || 0);
    const plannedProjects = statusCounts['Planning'] || 0;
    
    if (completedProjects > 0) {
      summaryText += ` You have ${completedProjects} completed project${completedProjects > 1 ? 's' : ''}`;
      if (activeProjects > 0) {
        summaryText += `, ${activeProjects} in active development`;
      }
      if (plannedProjects > 0) {
        summaryText += `, and ${plannedProjects} in planning phase`;
      }
      summaryText += '.';
    }
    
    return summaryText;
  }, [projects, kpiMetrics, formatCurrency]);

  const copySummary = () => {
    navigator.clipboard.writeText(summary);
    toast("Summary copied to clipboard!");
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="flex flex-row items-center space-y-0 pb-3">
        <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
        <CardTitle className="text-blue-800 text-lg">Portfolio Insights Summary</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copySummary}
          className="ml-auto"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Summary
        </Button>
      </CardHeader>
      <CardContent>
        <p className={cn("text-blue-900 leading-relaxed", isRTL && "text-right")}>
          {summary}
        </p>
      </CardContent>
    </Card>
  );
};