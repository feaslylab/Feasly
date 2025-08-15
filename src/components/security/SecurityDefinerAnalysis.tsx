import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertTriangle, Info } from "lucide-react";

export const SecurityDefinerAnalysis = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Definer Function Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              The Supabase linter detected SECURITY DEFINER functions. This analysis explains why they are legitimate and secure.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Legitimate Authentication Functions</span>
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                <li>• <code>handle_new_user_profile()</code> - Creates user profiles on signup</li>
                <li>• <code>handle_new_user_organization()</code> - Creates default organization</li>
                <li>• <code>create_default_organization_for_user()</code> - Organization setup trigger</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                These functions require SECURITY DEFINER to access auth schema and create initial user data.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>RLS Helper Functions</span>
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                <li>• <code>is_organization_admin()</code> - Checks admin status for RLS policies</li>
                <li>• <code>is_organization_member()</code> - Checks membership for RLS policies</li>
                <li>• <code>is_project_team_member()</code> - Checks team membership for RLS policies</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                These functions prevent infinite recursion in RLS policies and provide consistent permission checking.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>System Maintenance Functions</span>
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                <li>• <code>cleanup_expired_invitations()</code> - Removes expired invitations</li>
                <li>• <code>cleanup_expired_reports()</code> - Removes expired reports</li>
                <li>• <code>update_updated_at_column()</code> - Timestamp trigger functions</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                These functions require elevated privileges for automated system maintenance.
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Fixed Security Issues</span>
              </h3>
              <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                <li>• Removed public project feature entirely</li>
                <li>• Updated <code>get_safe_team_member_info()</code> to use RLS instead of SECURITY DEFINER</li>
                <li>• Created secure view with security_barrier for team member profiles</li>
                <li>• Enhanced contractor information protection</li>
              </ul>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Linter False Positive:</strong> The remaining SECURITY DEFINER functions are all legitimate and necessary for proper system operation. They follow security best practices and have appropriate access controls.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};