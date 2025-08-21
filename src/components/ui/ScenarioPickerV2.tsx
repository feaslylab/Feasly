import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useProjectScenarios } from '@/hooks/useProjectScenarios';
import { useAuth } from '@/components/auth/AuthProvider';

// Define types for scenarios and projects
interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  organization_id?: string;
}

interface Scenario {
  id: string;
  name: string;
  type: string;
  project_id: string;
  is_base: boolean;
}

interface ScenarioOption {
  projectId: string;
  projectName: string;
  scenarioId: string;
  scenarioType: string;
  displayName: string;
  value: string;
}

interface ScenarioPickerV2Props {
  value?: {
    projectId?: string;
    scenarioId?: string;
  };
  onChange?: (selection: { projectId: string; scenarioId: string }) => void;
  disabled?: boolean;
  isCalculating?: boolean;
  compact?: boolean;
  className?: string;
  baseRoute?: string;
  placeholder?: string;
}

const ScenarioPickerV2: React.FC<ScenarioPickerV2Props> = ({
  value,
  onChange,
  disabled = false,
  isCalculating = false,
  compact = false,
  className = '',
  baseRoute = '',
  placeholder = 'Select project & scenario...'
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const { projectScenarioOptions, isLoading } = useProjectScenarios();

  const currentValue = useMemo(() => {
    const projectId = value?.projectId || params.projectId;
    const scenarioId = value?.scenarioId || params.scenarioId;
    
    if (projectId && scenarioId) {
      return `${projectId}::${scenarioId}`;
    }
    return '';
  }, [value, params]);

  const attemptNavigation = (targetPath: string): boolean => {
    try {
      navigate(targetPath, { replace: true });
      return true;
    } catch (error) {
      console.warn(`Navigation to ${targetPath} failed:`, error);
      return false;
    }
  };

  const handleValueChange = (newValue: string) => {
    if (disabled || isCalculating) return;
    
    const [selectedProjectId, selectedScenarioId] = newValue.split('::');
    if (!selectedProjectId || !selectedScenarioId) return;

    // Handle "new" scenario creation
    if (selectedScenarioId === 'new') {
      const targetPath = `/projects/${selectedProjectId}`;
      navigate(targetPath);
      return;
    }

    const isUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const safeProjectId = isUuid(selectedProjectId) ? selectedProjectId : (params.projectId || selectedProjectId);

    const routeBase = baseRoute && baseRoute.length > 0
      ? baseRoute.replace(/^\//, '')
      : location.pathname.split('/')[1];
    const targetPath = `/${routeBase}/${safeProjectId}/${selectedScenarioId}`;
    
    const navigationSuccess = attemptNavigation(targetPath);
    
    if (navigationSuccess && onChange) {
      onChange({ projectId: safeProjectId, scenarioId: selectedScenarioId });
    }
  };

  const handleCreateNew = () => {
    navigate('/projects/new');
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>Please log in to access projects</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading projects...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select
        value={currentValue}
        onValueChange={handleValueChange}
        disabled={disabled || isCalculating}
      >
        <SelectTrigger className="w-full min-w-0 h-auto px-2 py-1 text-sm border border-border rounded bg-background text-foreground">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-w-[400px] bg-background/95 backdrop-blur-sm border-border/50 shadow-lg rounded-lg">
          {projectScenarioOptions.length === 0 ? (
            <SelectItem value="no-projects" disabled>
              No projects found
            </SelectItem>
          ) : (
            projectScenarioOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2 w-full">
                  <span className="truncate">{option.displayName}</span>
                  <Badge 
                    variant={option.scenarioType === 'base' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {option.scenarioType}
                  </Badge>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        onClick={handleCreateNew}
        disabled={disabled || isCalculating}
        className="h-auto px-2 py-1 text-sm border border-border rounded bg-background text-foreground"
      >
        <Plus className="h-3 w-3 mr-1" />
        New
      </Button>
    </div>
  );
};

export default ScenarioPickerV2;
