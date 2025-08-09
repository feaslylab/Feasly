import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface ActivityLogEntry {
  id: string;
  user_name: string;
  action: string;
  timestamp: string;
  project_id?: string;
  project_name?: string;
}

interface FilterState {
  projectId: string | null;
  dateRange: 30 | 90 | 365 | null;
}

interface TeamActivityLogProps {
  filters: FilterState;
}

export const TeamActivityLog = ({ filters }: TeamActivityLogProps) => {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchActivityLog();
    }
  }, [user, filters]);

  const fetchActivityLog = async () => {
    try {
      setIsLoading(true);

      // Build query with filters
      let query = supabase
        .from('organization_audit_logs')
        .select(`
          id,
          action,
          created_at,
          resource_type,
          resource_id,
          organization_id
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Project filter not applicable to organization_audit_logs

      if (filters.dateRange) {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - filters.dateRange);
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data: activityData, error } = await query;

      if (error) throw error;

      const transformedActivities = activityData?.map((activity: any) => ({
        id: activity.id,
        user_name: 'User',
        action: activity.action,
        timestamp: activity.created_at,
        project_id: undefined,
        project_name: undefined,
      })) || [];

      setActivities(transformedActivities);

    } catch (error: any) {
      console.error('Error fetching activity log:', error);
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('created')) return 'default';
    if (action.includes('updated') || action.includes('edited')) return 'secondary';
    if (action.includes('deleted')) return 'destructive';
    return 'outline';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Team Activity Log
        </CardTitle>
        <CardDescription>
          Recent actions performed by team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              No recent activity found
              {filters.projectId || filters.dateRange ? ' for the selected filters' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 py-3 border-b border-border last:border-0 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                  <User className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">
                      {activity.user_name}
                    </span>
                    <Badge 
                      variant={getActionBadgeVariant(activity.action)}
                      className="text-xs px-2 py-0.5"
                    >
                      {activity.action}
                    </Badge>
                    {activity.project_name && (
                      <span className="text-xs text-muted-foreground">
                        in {activity.project_name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};