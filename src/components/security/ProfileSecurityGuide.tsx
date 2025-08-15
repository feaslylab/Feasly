import { Shield, Lock, Users, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const ProfileSecurityGuide = () => {
  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
            <Shield className="h-5 w-5" />
            <span>Profile Security Status: Protected</span>
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300">
            Your email and personal information are fully protected
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">Email Privacy</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Only you can see your email address. Team members only see your display name.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">Team Visibility</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Team members can only see basic profile info like name and avatar.
                </p>
              </div>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">
              Security Guarantee
            </AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <div className="space-y-2">
                <p>Your profile is protected by multiple security layers:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Row Level Security (RLS) prevents unauthorized database access</li>
                  <li>Email addresses are never exposed to other users</li>
                  <li>Only team members can see basic profile information</li>
                  <li>All data access is logged and monitored</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};