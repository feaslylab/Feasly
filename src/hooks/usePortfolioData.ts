import { useMemo } from "react";

export interface PortfolioProject {
  projectId: string;
  scenarioId: string;
  projectName: string;
  scenarioName: string;
  location?: string;
  assetType?: string;
  totalValue?: number;
  irr?: number;
  npv?: number;
  approvalStatus: 'draft' | 'under_review' | 'approved';
  lastUpdated: Date;
  results?: any;
}

export interface PortfolioKPIs {
  totalProjects: number;
  totalDevelopmentValue: number;
  avgIRR: number;
  avgMOIC: number;
  assetTypeMix: Array<{ name: string; value: number; percentage: number }>;
  statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
}

export const usePortfolioData = () => {
  const portfolioProjects = useMemo((): PortfolioProject[] => {
    const projects: PortfolioProject[] = [];
    
    // Get all projects from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // Look for scenario results
      if (key.startsWith('scenario_results:')) {
        const [, projectId, scenarioId] = key.split(':');
        const resultsData = localStorage.getItem(key);
        
        if (resultsData) {
          try {
            const results = JSON.parse(resultsData);
            
            // Get project name from project data
            const projectDataKey = `project_data:${projectId}`;
            const projectData = localStorage.getItem(projectDataKey);
            let projectName = `Project ${projectId.slice(0, 8)}`;
            let location = '';
            let assetType = '';
            
            if (projectData) {
              const parsedProjectData = JSON.parse(projectData);
              projectName = parsedProjectData.project?.name || projectName;
              location = parsedProjectData.project?.location || '';
              assetType = parsedProjectData.project?.asset_type || '';
            }
            
            // Get scenario name
            const scenarioKey = `scenario:${projectId}:${scenarioId}`;
            const scenarioData = localStorage.getItem(scenarioKey);
            let scenarioName = `Scenario ${scenarioId.slice(0, 8)}`;
            
            if (scenarioData) {
              const parsedScenarioData = JSON.parse(scenarioData);
              scenarioName = parsedScenarioData.name || scenarioName;
            }
            
            // Get approval status
            const approvalKey = `approval_status:${projectId}:${scenarioId}`;
            const approvalData = localStorage.getItem(approvalKey);
            let approvalStatus: 'draft' | 'under_review' | 'approved' = 'draft';
            
            if (approvalData) {
              const parsedApprovalData = JSON.parse(approvalData);
              approvalStatus = parsedApprovalData.status || 'draft';
            }
            
            // Extract key metrics from results
            const irr = results.project?.irr_pa || results.kpis?.irr_pa || 0;
            const npv = results.project?.npv || results.kpis?.npv || 0;
            const totalValue = results.project?.total_cost || results.costs?.total || 0;
            
            projects.push({
              projectId,
              scenarioId,
              projectName,
              scenarioName,
              location,
              assetType,
              totalValue,
              irr: irr * 100, // Convert to percentage
              npv,
              approvalStatus,
              lastUpdated: new Date(results.timestamp || Date.now()),
              results
            });
          } catch (error) {
            console.warn(`Failed to parse results for ${key}:`, error);
          }
        }
      }
    }
    
    return projects.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  }, []);

  const portfolioKPIs = useMemo((): PortfolioKPIs => {
    const totalProjects = portfolioProjects.length;
    
    if (totalProjects === 0) {
      return {
        totalProjects: 0,
        totalDevelopmentValue: 0,
        avgIRR: 0,
        avgMOIC: 0,
        assetTypeMix: [],
        statusBreakdown: []
      };
    }
    
    const totalDevelopmentValue = portfolioProjects.reduce((sum, p) => sum + (p.totalValue || 0), 0);
    const validIRRs = portfolioProjects.filter(p => p.irr && p.irr > 0);
    const avgIRR = validIRRs.length > 0 ? validIRRs.reduce((sum, p) => sum + p.irr!, 0) / validIRRs.length : 0;
    
    // Calculate MOIC (simplified as NPV/Total Cost ratio)
    const validMOICs = portfolioProjects.filter(p => p.npv && p.totalValue && p.totalValue > 0);
    const avgMOIC = validMOICs.length > 0 ? 
      validMOICs.reduce((sum, p) => sum + (p.npv! / p.totalValue!), 0) / validMOICs.length : 0;
    
    // Asset type mix
    const assetTypeCount: Record<string, number> = {};
    portfolioProjects.forEach(p => {
      const type = p.assetType || 'Unspecified';
      assetTypeCount[type] = (assetTypeCount[type] || 0) + 1;
    });
    
    const assetTypeMix = Object.entries(assetTypeCount).map(([name, value]) => ({
      name,
      value,
      percentage: (value / totalProjects) * 100
    }));
    
    // Status breakdown
    const statusCount: Record<string, number> = {};
    portfolioProjects.forEach(p => {
      const status = p.approvalStatus || 'draft';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    
    const statusBreakdown = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      percentage: (count / totalProjects) * 100
    }));
    
    return {
      totalProjects,
      totalDevelopmentValue,
      avgIRR,
      avgMOIC,
      assetTypeMix,
      statusBreakdown
    };
  }, [portfolioProjects]);

  const getTopPerformer = () => {
    if (portfolioProjects.length === 0) return null;
    return portfolioProjects.reduce((top, current) => 
      (current.irr || 0) > (top.irr || 0) ? current : top
    );
  };

  const getRiskOutliers = () => {
    const lowIRRThreshold = 10; // 10% IRR threshold
    return portfolioProjects.filter(p => (p.irr || 0) < lowIRRThreshold);
  };

  return {
    portfolioProjects,
    portfolioKPIs,
    getTopPerformer,
    getRiskOutliers
  };
};