import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import { Shield, Users, AlertTriangle, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContractorSecurityGuardProps {
  projectId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ContractorSecurityGuard = ({ 
  projectId, 
  children, 
  fallback 
}: ContractorSecurityGuardProps) => {
  const { canViewComments: canViewSensitiveData, isLoading } = useProjectAccess(projectId);

  // Get public contractor summary for non-team members
  const { data: publicSummary } = useQuery({
    queryKey: ["public-contractor-summary", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_public_contractor_summary', { project_id_param: projectId });
      
      if (error) {
        console.error('Error fetching public contractor summary:', error);
        return null;
      }
      
      return data?.[0];
    },
    enabled: !canViewSensitiveData && !isLoading
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  // If user can view sensitive data, show full contractor info
  if (canViewSensitiveData) {
    return <>{children}</>;
  }

  // If user cannot view sensitive data, show public summary or fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default public view - show summary without sensitive details
  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
          <Shield className="h-5 w-5" />
          <span>Contractor Information Protected</span>
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          Detailed contractor information is only visible to project team members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {publicSummary && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Contractors
                </p>
                <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                  {publicSummary.contractor_count}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                {publicSummary.total_phases} Phases
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant={
                  publicSummary.project_status === 'all_completed' ? 'default' :
                  publicSummary.project_status === 'in_progress' ? 'secondary' : 'outline'
                }
                className="text-amber-700"
              >
                {publicSummary.project_status === 'all_completed' ? 'Completed' :
                 publicSummary.project_status === 'in_progress' ? 'In Progress' : 'Planning'}
              </Badge>
            </div>
          </div>
        )}

        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Lock className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">
            Business Information Protected
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <div className="space-y-2">
              <p>This project's contractor details are secured to protect:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Contractor contact information and emails</li>
                <li>Contract amounts and financial details</li>
                <li>Business relationships and vendor networks</li>
                <li>Competitive project information</li>
              </ul>
              <p className="text-sm mt-2">
                <strong>Team members have full access</strong> to manage contractor relationships.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

// Hook to safely access contractor data
export const useSecureContractors = (projectId: string) => {
  const { canViewComments: canViewSensitiveData } = useProjectAccess(projectId);

  return useQuery({
    queryKey: ["secure-contractors", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_contractors")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: canViewSensitiveData && !!projectId
  });
};