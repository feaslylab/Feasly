import { useState, useEffect } from 'react';

export interface PortfolioProject {
  id: string;
  name: string;
  npv: number;
  irr: number;
  risk: 'low' | 'medium' | 'high';
  weight: number;
  scenario: string;
}

export interface PortfolioKPIs {
  totalNPV: number;
  weightedIRR: number;
  totalProjects: number;
  averageRisk: string;
}

export function usePortfolioData() {
  const [portfolioProjects] = useState<PortfolioProject[]>([]);
  const [portfolioKPIs] = useState<PortfolioKPIs>({
    totalNPV: 0,
    weightedIRR: 0,
    totalProjects: 0,
    averageRisk: 'medium'
  });

  const getTopPerformer = () => {
    return portfolioProjects.reduce((top, project) => 
      project.irr > (top?.irr || 0) ? project : top, null as PortfolioProject | null
    );
  };

  const getRiskOutliers = () => {
    return portfolioProjects.filter(p => p.risk === 'high');
  };

  return {
    portfolioProjects,
    portfolioKPIs,
    getTopPerformer,
    getRiskOutliers
  };
}