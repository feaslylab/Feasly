import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, Clock, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { format, differenceInDays, isValid } from "date-fns";
import type { FeaslyModelFormData } from "@/components/FeaslyModel/types";
import { useMilestones, type Milestone } from "@/hooks/useMilestones";
import { MilestoneDialog } from "./MilestoneDialog";
import { cn } from "@/lib/utils";

export function TimelineGantt({ projectId = "demo-project-123" }: { projectId?: string }) {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { 
    milestones, 
    isLoading, 
    createMilestone, 
    updateMilestone, 
    deleteMilestone 
  } = useMilestones(projectId);

  // Watch timeline dates
  const startDate = form.watch("start_date");
  const constructionStartDate = form.watch("construction_start_date");
  const completionDate = form.watch("completion_date");
  const phasingEnabled = form.watch("phasing_enabled");

  const currentDate = new Date();

  // Calculate timeline data
  const getTimelineData = () => {
    if (!startDate || !completionDate || !isValid(startDate) || !isValid(completionDate)) {
      return null;
    }

    const totalDays = differenceInDays(completionDate, startDate);
    const currentDays = differenceInDays(currentDate, startDate);
    const progressPercentage = Math.max(0, Math.min(100, (currentDays / totalDays) * 100));

    const phases = [];

    // Pre-construction phase
    if (constructionStartDate && isValid(constructionStartDate)) {
      const preConstructionDays = differenceInDays(constructionStartDate, startDate);
      phases.push({
        name: "Pre-Construction",
        startDate,
        endDate: constructionStartDate,
        duration: preConstructionDays,
        progress: Math.max(0, Math.min(100, (currentDays / preConstructionDays) * 100)),
        color: "bg-blue-500"
      });

      // Construction phase
      const constructionDays = differenceInDays(completionDate, constructionStartDate);
      const constructionProgress = Math.max(0, Math.min(100, ((currentDays - preConstructionDays) / constructionDays) * 100));
      
      phases.push({
        name: "Construction",
        startDate: constructionStartDate,
        endDate: completionDate,
        duration: constructionDays,
        progress: constructionProgress,
        color: "bg-orange-500"
      });
    } else {
      // Single project phase
      phases.push({
        name: "Project Execution",
        startDate,
        endDate: completionDate,
        duration: totalDays,
        progress: progressPercentage,
        color: "bg-primary"
      });
    }

    return {
      totalDays,
      progressPercentage,
      phases
    };
  };

  const timelineData = getTimelineData();

  if (!timelineData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>{t('project_timeline')}</CardTitle>
          </div>
          <CardDescription>
            Visual timeline of project phases and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No timeline data available</p>
            <p className="text-sm">Add start and completion dates to view timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return format(date, "MMM dd, yyyy");
  };

  const handleCreateMilestone = () => {
    setSelectedMilestone(undefined);
    setIsDialogOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setIsDialogOpen(true);
  };

  const handleSaveMilestone = async (data: any) => {
    if (selectedMilestone) {
      await updateMilestone(selectedMilestone.id!, {
        label: data.label,
        target_date: format(data.target_date, 'yyyy-MM-dd'),
        status: data.status,
        description: data.description,
      });
    } else {
      await createMilestone({
        ...data,
        target_date: format(data.target_date, 'yyyy-MM-dd'),
      });
    }
  };

  const handleDeleteMilestone = async (milestone: Milestone) => {
    if (milestone.id && confirm('Are you sure you want to delete this milestone?')) {
      await deleteMilestone(milestone.id);
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMilestonePosition = (targetDate: string) => {
    if (!startDate || !completionDate || !isValid(startDate) || !isValid(completionDate)) {
      return 0;
    }
    
    const milestone = new Date(targetDate);
    const totalDays = differenceInDays(completionDate, startDate);
    const milestoneDays = differenceInDays(milestone, startDate);
    
    return Math.max(0, Math.min(100, (milestoneDays / totalDays) * 100));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>{t('project_timeline')}</CardTitle>
        </div>
        <CardDescription>
          Visual timeline of project phases and milestones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Header */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Total Duration: {timelineData.totalDays} days</span>
          </div>
          <div className="flex items-center space-x-4">
            <div>Progress: {timelineData.progressPercentage.toFixed(1)}%</div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateMilestone}
              className="flex items-center space-x-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add Milestone</span>
            </Button>
          </div>
        </div>

        {/* Timeline Visualization with Milestones */}
        <div className="space-y-6">
          {timelineData.phases.map((phase, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{phase.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(phase.startDate)} → {formatDate(phase.endDate)}
                </div>
              </div>
              
              {/* Progress Bar with Milestones */}
              <div className="relative">
                <div className="w-full bg-muted rounded-full h-8">
                  <div 
                    className={`${phase.color} h-8 rounded-full flex items-center px-3 text-white text-xs font-medium transition-all duration-300`}
                    style={{ width: `${Math.max(5, (phase.duration / timelineData.totalDays) * 100)}%` }}
                  >
                    {phase.duration} days
                  </div>
                </div>
                
                {/* Progress Overlay */}
                {phase.progress > 0 && (
                  <div 
                    className="absolute top-0 bg-white/30 h-8 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((phase.progress / 100) * (phase.duration / timelineData.totalDays) * 100, (phase.duration / timelineData.totalDays) * 100)}%` 
                    }}
                  />
                )}

                {/* Today Marker */}
                <div 
                  className="absolute top-0 w-0.5 h-8 bg-red-500"
                  style={{ left: `${timelineData.progressPercentage}%` }}
                />
                <div 
                  className="absolute -top-1 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2"
                  style={{ left: `${timelineData.progressPercentage}%` }}
                />

                {/* Milestone Markers */}
                {milestones.map((milestone) => {
                  const position = getMilestonePosition(milestone.target_date);
                  const isOverdue = milestone.status !== 'completed' && new Date(milestone.target_date) < currentDate;
                  
                  return (
                    <TooltipProvider key={milestone.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "absolute -top-2 w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 flex items-center justify-center hover:scale-110 transition-transform",
                              milestone.status === 'completed' ? "bg-green-500" :
                              milestone.status === 'in_progress' ? "bg-blue-500" :
                              isOverdue ? "bg-red-500" : "bg-gray-400"
                            )}
                            style={{ left: `${position}%` }}
                            onClick={() => handleEditMilestone(milestone)}
                          >
                            {getMilestoneIcon(milestone.status)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="space-y-1">
                            <p className="font-medium">{milestone.label}</p>
                            <p className="text-xs">{formatDate(new Date(milestone.target_date))}</p>
                            <p className="text-xs capitalize">{milestone.status.replace('_', ' ')}</p>
                            {isOverdue && (
                              <p className="text-xs text-red-300">Overdue</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
              
              {/* Progress Info */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{phase.progress.toFixed(1)}% complete</span>
                <span>{phase.duration} days ({((phase.duration / timelineData.totalDays) * 100).toFixed(1)}% of total)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Milestones List */}
        {milestones.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Project Milestones</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {milestones.map((milestone) => {
                const isOverdue = milestone.status !== 'completed' && new Date(milestone.target_date) < currentDate;
                
                return (
                  <div 
                    key={milestone.id} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      isOverdue ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {getMilestoneIcon(milestone.status)}
                      <div>
                        <p className="font-medium text-sm">{milestone.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(milestone.target_date))}
                          {isOverdue && <span className="text-red-500 ml-2">(Overdue)</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditMilestone(milestone)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMilestone(milestone)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Date Indicator */}
        <div className="border-t pt-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Today: {formatDate(currentDate)}</span>
          </div>
        </div>

        {/* Key Milestones */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Key Milestones</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Project Start:</span>
              <span className="ml-2 font-medium">{formatDate(startDate!)}</span>
            </div>
            {constructionStartDate && isValid(constructionStartDate) && (
              <div>
                <span className="text-muted-foreground">Construction Start:</span>
                <span className="ml-2 font-medium">{formatDate(constructionStartDate)}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Completion:</span>
              <span className="ml-2 font-medium">{formatDate(completionDate!)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Days Remaining:</span>
              <span className="ml-2 font-medium">
                {Math.max(0, differenceInDays(completionDate!, currentDate))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Milestone Dialog */}
      <MilestoneDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        milestone={selectedMilestone}
        projectId={projectId}
        onSave={handleSaveMilestone}
      />
    </Card>
  );
}