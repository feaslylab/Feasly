import { Building2, Mail, Phone, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const ContractorSecurityNotice = () => {
  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 mb-6">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800 dark:text-orange-200">
        Contractor Information Security
      </AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-300">
        <div className="space-y-3">
          <p>
            This section contains sensitive business information that is protected from unauthorized access.
          </p>
          
          <div className="grid gap-3 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Contact emails secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Phone numbers protected</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Contract amounts private</span>
            </div>
          </div>
          
          <p className="text-sm">
            <strong>Security Measures:</strong> Only project team members can view, edit, or export contractor details.
            This information is never exposed in public project views.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};