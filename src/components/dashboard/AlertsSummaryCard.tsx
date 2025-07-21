import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useFeaslyAlerts } from '@/hooks/useFeaslyAlerts';
import { useTranslation } from 'react-i18next';

export const AlertsSummaryCard = () => {
  const { t } = useTranslation('common');
  const { portfolioAlerts, isLoading, getAlertStatistics } = useFeaslyAlerts();
  
  if (isLoading) {
    return (
      <Card className="border-border shadow-soft">
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-8 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = getAlertStatistics();
  
  if (stats.totalProjects === 0) {
    return (
      <Card className="border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Portfolio Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No projects to monitor yet
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Portfolio Health
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <NavLink to="/feasly-alerts">
              View All
            </NavLink>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{stats.redProjects}</span>
            </div>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{stats.yellowProjects}</span>
            </div>
            <p className="text-xs text-muted-foreground">Warning</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.greenProjects}</span>
            </div>
            <p className="text-xs text-muted-foreground">Healthy</p>
          </div>
        </div>

        {/* Critical Projects Preview */}
        {stats.redProjects > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Critical Projects</h4>
              <Badge variant="destructive" className="text-xs">
                {stats.redProjects}
              </Badge>
            </div>
            <div className="space-y-2">
              {portfolioAlerts
                .filter(p => p.worstSeverity === 'red')
                .slice(0, 2)
                .map(project => (
                  <div key={project.projectId} className="flex items-center justify-between text-sm">
                    <span className="truncate flex-1">{project.projectName}</span>
                    <div className="flex gap-1">
                      <Badge variant="destructive" className="text-xs">
                        {project.redAlerts.length}
                      </Badge>
                    </div>
                  </div>
                ))}
              {stats.redProjects > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{stats.redProjects - 2} more projects need attention
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button asChild className="w-full" variant="outline">
          <NavLink to="/feasly-alerts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Monitor Portfolio Health
          </NavLink>
        </Button>
      </CardContent>
    </Card>
  );
};