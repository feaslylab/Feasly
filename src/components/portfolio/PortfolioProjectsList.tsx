import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Grid, List, ExternalLink } from "lucide-react";
import { PortfolioProject } from "@/hooks/usePortfolioData";
import { useNavigate } from "react-router-dom";

interface PortfolioProjectsListProps {
  projects: PortfolioProject[];
}

export const PortfolioProjectsList = ({ projects }: PortfolioProjectsListProps) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filteredProjects = projects.filter(project => {
    if (statusFilter !== 'all' && project.approvalStatus !== statusFilter) return false;
    if (assetTypeFilter !== 'all' && project.assetType !== assetTypeFilter) return false;
    return true;
  });

  const uniqueAssetTypes = [...new Set(projects.map(p => p.assetType).filter(Boolean))];

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Approved</Badge>;
      case 'under_review':
        return <Badge variant="secondary">Under Review</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const handleProjectClick = (project: PortfolioProject) => {
    navigate(`/model?project=${project.projectId}&scenario=${project.scenarioId}`);
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating and running scenarios to build your portfolio.
            </p>
            <Button onClick={() => navigate('/projects/new')}>
              Create New Project
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and View Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueAssetTypes.map(type => (
                    <SelectItem key={type} value={type || 'unspecified'}>
                      {type || 'Unspecified'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={`${project.projectId}-${project.scenarioId}`} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader onClick={() => handleProjectClick(project)}>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.projectName}</CardTitle>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{project.scenarioName}</p>
              </CardHeader>
              <CardContent onClick={() => handleProjectClick(project)}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm">{project.location || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Asset Type</span>
                    <span className="text-sm">{project.assetType || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <span className="text-sm font-medium">{formatCurrency(project.totalValue || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">IRR</span>
                    <span className="text-sm font-medium">{(project.irr || 0).toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(project.approvalStatus)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Scenario</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Asset Type</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>IRR</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow 
                    key={`${project.projectId}-${project.scenarioId}`}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleProjectClick(project)}
                  >
                    <TableCell className="font-medium">{project.projectName}</TableCell>
                    <TableCell>{project.scenarioName}</TableCell>
                    <TableCell>{project.location || 'Not specified'}</TableCell>
                    <TableCell>{project.assetType || 'Not specified'}</TableCell>
                    <TableCell>{formatCurrency(project.totalValue || 0)}</TableCell>
                    <TableCell>{(project.irr || 0).toFixed(1)}%</TableCell>
                    <TableCell>{getStatusBadge(project.approvalStatus)}</TableCell>
                    <TableCell>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};