import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FolderOpen, 
  Building, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Plus,
  Search,
  Filter,
  Grid,
  List
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Enhanced loading skeleton with proper content structure
const ProjectCardSkeleton = () => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex justify-between text-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 w-20" />
      </div>
    </CardContent>
  </Card>
);

// Memoized Empty State Component
const EmptyState = ({ onCreateProject }: { onCreateProject: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
      <FolderOpen className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
    <p className="text-muted-foreground mb-6 max-w-md">
      Get started by creating your first real estate development project. 
      You can add properties, run financial models, and track progress.
    </p>
    <Button onClick={onCreateProject} size="lg" className="min-h-[44px]">
      <Plus className="w-5 h-5 mr-2" />
      Create Your First Project
    </Button>
  </div>
);

// Enhanced Project Card with better UX
interface ProjectCardProps {
  project: any;
  viewMode: 'grid' | 'list';
}

const ProjectCard = ({ project, viewMode }: ProjectCardProps) => {
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'planning': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'on_hold': return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  }, []);

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", getStatusColor(project.status))}
                >
                  {project.status || 'draft'}
                </Badge>
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {project.assets?.length || 0} assets
                </span>
                <span>Created {formatDate(project.created_at)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 ml-4">
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {formatCurrency(project.totalValue || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Portfolio Value</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <NavLink to={`/project/${project.id}`}>View</NavLink>
                </Button>
                <Button size="sm" asChild>
                  <NavLink to={`/feasly-model?projectId=${project.id}`}>Model</NavLink>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:border-primary/20 h-full">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
          <Badge 
            variant="outline" 
            className={cn("text-xs", getStatusColor(project.status))}
          >
            {project.status || 'draft'}
          </Badge>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Portfolio Value</span>
          <span className="font-medium text-foreground">
            {formatCurrency(project.totalValue || 0)}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building className="w-3 h-3" />
            {project.assets?.length || 0} assets
          </span>
          <span>Created {formatDate(project.created_at)}</span>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <NavLink to={`/project/${project.id}`}>View Details</NavLink>
          </Button>
          <Button size="sm" asChild>
            <NavLink to={`/feasly-model?projectId=${project.id}`}>Model</NavLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Enhanced Projects Grid Component
interface EnhancedProjectsGridProps {
  projects: any[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCreateProject: () => void;
}

export const EnhancedProjectsGrid = ({
  projects,
  isLoading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  onCreateProject,
}: EnhancedProjectsGridProps) => {
  
  // Memoized filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        {/* Loading grid */}
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        )}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredProjects.length === 0 && projects.length === 0) {
    return <EmptyState onCreateProject={onCreateProject} />;
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Projects ({filteredProjects.length})
            </h2>
            <p className="text-muted-foreground">
              Manage your real estate development portfolio
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-h-[40px]">
                  <Filter className="w-4 h-4 mr-2" />
                  {statusFilter === 'all' ? 'All Status' : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onStatusFilterChange('all')}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusFilterChange('active')}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusFilterChange('planning')}>
                  Planning
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusFilterChange('on_hold')}>
                  On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusFilterChange('completed')}>
                  Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Create Project */}
            <Button onClick={onCreateProject} className="min-h-[40px]">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button variant="outline" onClick={() => {
              onSearchChange('');
              onStatusFilterChange('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};