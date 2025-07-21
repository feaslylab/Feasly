import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format, differenceInDays, isValid } from "date-fns";
import type { FeaslyModelFormData } from "./types";

export function TimelineGantt() {
  const { t } = useTranslation('feasly.model');
  const form = useFormContext<FeaslyModelFormData>();

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
          <div>
            Progress: {timelineData.progressPercentage.toFixed(1)}%
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="space-y-4">
          {timelineData.phases.map((phase, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{phase.name}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(phase.startDate)} → {formatDate(phase.endDate)}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-muted rounded-full h-6">
                  <div 
                    className={`${phase.color} h-6 rounded-full flex items-center px-3 text-white text-xs font-medium transition-all duration-300`}
                    style={{ width: `${Math.max(5, (phase.duration / timelineData.totalDays) * 100)}%` }}
                  >
                    {phase.duration} days
                  </div>
                </div>
                
                {/* Progress Overlay */}
                {phase.progress > 0 && (
                  <div 
                    className="absolute top-0 bg-white/30 h-6 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((phase.progress / 100) * (phase.duration / timelineData.totalDays) * 100, (phase.duration / timelineData.totalDays) * 100)}%` 
                    }}
                  />
                )}
              </div>
              
              {/* Progress Info */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{phase.progress.toFixed(1)}% complete</span>
                <span>{phase.duration} days ({((phase.duration / timelineData.totalDays) * 100).toFixed(1)}% of total)</span>
              </div>
            </div>
          ))}
        </div>

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
    </Card>
  );
}