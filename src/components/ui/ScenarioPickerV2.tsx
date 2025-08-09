import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calculator, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { NavigationGuardModal } from '@/components/ui/NavigationGuardModal';
import { useAuth } from '@/components/auth/AuthProvider';

interface ScenarioOption {
  projectId: string;
  projectName: string;
  scenarioId: string;
  scenarioType: 'base' | 'optimistic' | 'pessimistic' | 'custom';
  displayName: string;
  value: string; // Combined projectId-scenarioId
}

interface ScenarioPickerV2Props {
  value?: {
    projectId: string | null;
    scenarioId: string | null;
  };
  onChange?: (value: { projectId: string; scenarioId: string }) => void;
  disabled?: boolean;
  isCalculating?: boolean;
  className?: string;
  baseRoute?: string; // optional override for the base route to navigate to
}

// Fetch scenarios for the user - simplified version for MVP
async function fetchUserScenarios(userId: string): Promise<ScenarioOption[]> {
  // For now, return mock data since the full schema isn't available
  const mockScenarios: ScenarioOption[] = [
    {
      projectId: 'demo-project-1',
      projectName: 'North Tower',
      scenarioId: 'base-scenario',
      scenarioType: 'base',
      displayName: 'North Tower – Base',
      value: 'demo-project-1-base-scenario'
    },
    {
      projectId: 'demo-project-1',
      projectName: 'North Tower',
      scenarioId: 'optimistic-scenario',
      scenarioType: 'optimistic',
      displayName: 'North Tower – Optimistic',
      value: 'demo-project-1-optimistic-scenario'
    },
    {
      projectId: 'demo-project-2',
      projectName: 'Marina Plaza',
      scenarioId: 'base-scenario',
      scenarioType: 'base',
      displayName: 'Marina Plaza – Base',
      value: 'demo-project-2-base-scenario'
    }
  ];

  return mockScenarios;
}

export function ScenarioPickerV2({
  value,
  onChange,
  disabled = false,
  isCalculating = false,
  className,
  baseRoute
}: ScenarioPickerV2Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Try to get form state if available (from FormProvider context)
  let formState: any = {};
  try {
    const form = useFormContext();
    formState = form?.formState || {};
  } catch {
    // No form context available
  }

  const isDirty = formState.isDirty || false;
  
  const { 
    attemptNavigation, 
    confirmNavigation, 
    cancelNavigation,
    showConfirmModal,
    setShowConfirmModal,
    getConfirmMessage
  } = useNavigationGuard({
    isBlocking: true,
    isDirty,
    isCalculating
  });

  // Query for scenarios
  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['user-scenarios', user?.id],
    queryFn: () => fetchUserScenarios(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Current value from URL params or props
  const currentValue = useMemo(() => {
    const projectId = value?.projectId || params.projectId;
    const scenarioId = value?.scenarioId || params.scenarioId;
    
    if (projectId && scenarioId) {
      return `${projectId}-${scenarioId}`;
    }
    return '';
  }, [value, params]);

  // Current scenario display
  const currentScenario = scenarios.find(s => s.value === currentValue);

  const handleValueChange = (newValue: string) => {
    if (disabled || isCalculating) return;
    
    const [projectId, scenarioId] = newValue.split('-');
    if (!projectId || !scenarioId) return;

    // Determine the target route based on current location (allow override)
    const routeBase = baseRoute && baseRoute.length > 0
      ? baseRoute.replace(/^\//, '')
      : location.pathname.split('/')[1];
    const targetPath = `/${routeBase}/${projectId}/${scenarioId}`;
    
    const navigationSuccess = attemptNavigation(targetPath);
    
    if (navigationSuccess && onChange) {
      onChange({ projectId, scenarioId });
    }
  };

  const isDisabled = disabled || isCalculating || isLoading;

  const getStatusIcon = () => {
    if (isCalculating) return <Calculator className="h-3 w-3 animate-pulse" />;
    if (isDirty) return <AlertTriangle className="h-3 w-3 text-warning" />;
    return null;
  };

  const getTooltipText = () => {
    if (isCalculating) return "Wait for calculation to complete";
    if (isDirty) return "You have unsaved changes";
    if (isDisabled) return "Loading scenarios...";
    return undefined;
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Select
                value={currentValue}
                onValueChange={handleValueChange}
                disabled={isDisabled}
              >
                <SelectTrigger 
                  className={cn(
                    "w-64 h-8 text-xs bg-background border-border",
                    isDisabled && "opacity-50 cursor-not-allowed",
                    isDirty && "border-warning",
                    isCalculating && "border-primary"
                  )}
                  aria-label="Select project and scenario"
                  role="combobox"
                >
                  <div className="flex items-center gap-2 truncate">
                    {getStatusIcon()}
                    <SelectValue 
                      placeholder={isLoading ? "Loading..." : "Select scenario..."}
                    />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {scenarios.length === 0 && !isLoading ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      No scenarios available
                    </div>
                  ) : (
                    scenarios.map((scenario) => (
                      <SelectItem 
                        key={scenario.value}
                        value={scenario.value}
                        className="text-xs"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{scenario.displayName}</span>
                          <Badge 
                            variant="outline" 
                            className="ml-2 text-xs"
                          >
                            {scenario.scenarioType}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {/* Status indicator */}
              {(isDirty || isCalculating) && (
                <div className="absolute -top-1 -right-1">
                  <div 
                    className={cn(
                      "w-2 h-2 rounded-full",
                      isCalculating ? "bg-primary animate-pulse" : "bg-warning"
                    )}
                  />
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {getTooltipText()}
          </TooltipContent>
        </Tooltip>

        {/* Additional status info */}
        {isCalculating && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Calculating...</span>
          </div>
        )}
      </div>

      <NavigationGuardModal
        open={showConfirmModal}
        onOpenChange={setShowConfirmModal}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
        message={getConfirmMessage()}
      />
    </TooltipProvider>
  );
}