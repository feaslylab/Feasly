import React, { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { useEngine } from '@/lib/engine/EngineContext';
import { useModelValidations } from '@/lib/validation/useModelValidations';
import { cn } from '@/lib/utils';

interface ValidationIssue {
  id: string;
  level: 'error' | 'warn';
  message: string;
  section?: string;
}

interface FeaslyValidationPanelProps {
  projectId?: string;
  onSectionClick?: (section: string) => void;
}

export default function FeaslyValidationPanel({ 
  projectId = 'default', 
  onSectionClick 
}: FeaslyValidationPanelProps) {
  const { inputs } = useEngine();
  const { issues, hasBlocking } = useModelValidations(inputs);
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());

  // Load dismissed warnings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`validation_dismissed:${projectId}`);
    if (stored) {
      try {
        const dismissed = new Set<string>(JSON.parse(stored));
        setDismissedWarnings(dismissed);
      } catch (e) {
        console.warn('Failed to parse dismissed validations from localStorage');
      }
    }
  }, [projectId]);

  // Map validation issues to include section metadata
  const enrichedIssues: ValidationIssue[] = issues.map((issue, index) => {
    let section = 'project'; // default section
    
    // Determine section based on message content
    if (issue.message.toLowerCase().includes('unit type')) {
      section = 'units';
    } else if (issue.message.toLowerCase().includes('cost')) {
      section = 'costs';
    } else if (issue.message.toLowerCase().includes('period') || issue.message.toLowerCase().includes('start date')) {
      section = 'project';
    }

    return {
      id: `${section}-${index}-${issue.message.slice(0, 20)}`,
      level: issue.level,
      message: issue.message,
      section
    };
  });

  // Filter out dismissed warnings
  const visibleIssues = enrichedIssues.filter(issue => 
    issue.level === 'error' || !dismissedWarnings.has(issue.id)
  );

  const errors = visibleIssues.filter(issue => issue.level === 'error');
  const warnings = visibleIssues.filter(issue => issue.level === 'warn');

  const handleDismiss = useCallback((issueId: string) => {
    const newDismissed = new Set(dismissedWarnings);
    newDismissed.add(issueId);
    setDismissedWarnings(newDismissed);
    
    // Persist to localStorage
    localStorage.setItem(
      `validation_dismissed:${projectId}`, 
      JSON.stringify([...newDismissed])
    );

    // Analytics event
    console.log('Analytics Event: validation_dismissed', { 
      projectId, 
      issueId 
    });
  }, [dismissedWarnings, projectId]);

  const handleIssueClick = useCallback((issue: ValidationIssue) => {
    if (issue.section && onSectionClick) {
      onSectionClick(issue.section);
    }

    // Analytics event
    console.log('Analytics Event: validation_issue_clicked', { 
      projectId, 
      section: issue.section,
      level: issue.level 
    });
  }, [projectId, onSectionClick]);

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      project: 'Project',
      units: 'Units',
      costs: 'Costs',
      financing: 'Financing'
    };
    return labels[section] || section;
  };

  // If no issues, show success state
  if (visibleIssues.length === 0) {
    return (
      <Card data-section="validation" className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">All validation checks passed</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Your model configuration looks good to go.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-section="validation" className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Validation Status</CardTitle>
          <div className="flex items-center space-x-2">
            {errors.length > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.length} Error{errors.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {warnings.length > 0 && (
              <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {hasBlocking 
            ? 'Fix errors below to run your model'
            : 'Review recommendations to improve your model'
          }
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Errors Section */}
        {errors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-destructive">
              Critical Issues ({errors.length})
            </h4>
            {errors.map((issue) => (
              <Alert 
                key={issue.id} 
                variant="destructive"
                className="cursor-pointer hover:bg-destructive/5 transition-colors"
                onClick={() => handleIssueClick(issue)}
              >
                <AlertTriangle className="h-4 w-4" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <AlertDescription className="flex-1">
                      {issue.message}
                    </AlertDescription>
                    <div className="flex items-center space-x-2 ml-2">
                      {issue.section && (
                        <Badge variant="outline" className="text-xs">
                          {getSectionLabel(issue.section)}
                        </Badge>
                      )}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Warnings Section */}
        {warnings.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-yellow-600">
              Recommendations ({warnings.length})
            </h4>
            {warnings.map((issue) => (
              <Alert 
                key={issue.id}
                className={cn(
                  "border-yellow-200 bg-yellow-50 text-yellow-800",
                  "cursor-pointer hover:bg-yellow-100 transition-colors"
                )}
                onClick={() => handleIssueClick(issue)}
              >
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <AlertDescription className="flex-1 text-yellow-800">
                      {issue.message}
                    </AlertDescription>
                    <div className="flex items-center space-x-2 ml-2">
                      {issue.section && (
                        <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                          {getSectionLabel(issue.section)}
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-yellow-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(issue.id);
                        }}
                        title="Dismiss this warning"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}