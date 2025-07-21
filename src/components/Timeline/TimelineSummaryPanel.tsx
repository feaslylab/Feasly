import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertTriangle, CheckCircle2, Target } from "lucide-react";
import { format, differenceInDays, isValid } from "date-fns";
import type { FeaslyModelFormData } from "@/components/FeaslyModel/types";
import type { Milestone } from "@/hooks/useMilestones";

interface TimelineSummaryPanelProps {
  milestones: Milestone[];
}

export function TimelineSummaryPanel({ milestones }: TimelineSummaryPanelProps) {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();

  const startDate = form.watch("start_date");
  const completionDate = form.watch("completion_date");
  
  const currentDate = new Date();

  // Calculate project metrics
  const getProjectMetrics = () => {
    if (!startDate || !completionDate || !isValid(startDate) || !isValid(completionDate)) {
      return null;
    }

    const totalDays = differenceInDays(completionDate, startDate);
    const elapsedDays = Math.max(0, differenceInDays(currentDate, startDate));
    const remainingDays = Math.max(0, differenceInDays(completionDate, currentDate));
    const progressPercentage = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));

    return {
      totalDays,
      elapsedDays,
      remainingDays,
      progressPercentage,
    };
  };

  // Calculate milestone statistics
  const getMilestoneStats = () => {
    const total = milestones.length;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const inProgress = milestones.filter(m => m.status === 'in_progress').length;
    const overdue = milestones.filter(m => 
      m.status !== 'completed' && new Date(m.target_date) < currentDate
    ).length;

    const nextMilestone = milestones
      .filter(m => m.status !== 'completed' && new Date(m.target_date) >= currentDate)
      .sort((a, b) => new Date(a.target_date).getTime() - new Date(b.target_date).getTime())[0];

    return {
      total,
      completed,
      inProgress,
      overdue,
      nextMilestone,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const projectMetrics = getProjectMetrics();
  const milestoneStats = getMilestoneStats();

  if (!projectMetrics) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Timeline Summary</CardTitle>
          </div>
          <CardDescription>
            Project timeline overview and milestone progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No timeline data available</p>
            <p className="text-sm">Add start and completion dates to view summary</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  };

  const getDaysToNext = (targetDate: string) => {
    return differenceInDays(new Date(targetDate), currentDate);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>Timeline Summary</CardTitle>
        </div>
        <CardDescription>
          Project timeline overview and milestone progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Progress */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Project Progress</span>
          </h4>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-2xl font-bold">{projectMetrics.totalDays}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">% Complete</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-primary">
                  {projectMetrics.progressPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${projectMetrics.progressPercentage}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Days Remaining</p>
              <p className="text-2xl font-bold text-orange-600">
                {projectMetrics.remainingDays}
              </p>
              <p className="text-xs text-muted-foreground">
                until {formatDate(completionDate!)}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Days Elapsed</p>
              <p className="text-2xl font-bold text-blue-600">
                {projectMetrics.elapsedDays}
              </p>
              <p className="text-xs text-muted-foreground">
                since {formatDate(startDate!)}
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Milestone Progress</span>
          </h4>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Milestones</p>
              <p className="text-2xl font-bold">{milestoneStats.total}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-green-600">
                  {milestoneStats.completed}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {milestoneStats.completionPercentage}%
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {milestoneStats.inProgress}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Overdue</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-red-600">
                  {milestoneStats.overdue}
                </p>
                {milestoneStats.overdue > 0 && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        {milestoneStats.nextMilestone && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Next Milestone</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{milestoneStats.nextMilestone.label}</span>
                <Badge 
                  variant={milestoneStats.nextMilestone.status === 'in_progress' ? 'default' : 'secondary'}
                >
                  {milestoneStats.nextMilestone.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Target: {formatDate(milestoneStats.nextMilestone.target_date)}</span>
                <span>
                  {getDaysToNext(milestoneStats.nextMilestone.target_date)} days away
                </span>
              </div>
              
              {milestoneStats.nextMilestone.description && (
                <p className="text-sm text-muted-foreground">
                  {milestoneStats.nextMilestone.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Milestone completion progress bar */}
        {milestoneStats.total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Milestone Completion</span>
              <span>{milestoneStats.completionPercentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${milestoneStats.completionPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}