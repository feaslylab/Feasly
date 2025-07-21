import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, DollarSign, TrendingDown } from "lucide-react";
import { useContractors } from "@/hooks/useContractors";

interface ContractorWarningsProps {
  projectId: string;
}

export function ContractorWarnings({ projectId }: ContractorWarningsProps) {
  const { getRiskWarnings } = useContractors(projectId);
  const warnings = getRiskWarnings();

  if (warnings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-green-500" />
            <CardTitle className="text-green-700">Vendor Health Status</CardTitle>
          </div>
          <CardDescription>
            Automated risk assessment and delivery warnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-green-700 mb-2">All Clear!</h3>
            <p className="text-sm text-muted-foreground">
              No vendor risk warnings detected. Your contractor portfolio looks healthy.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getWarningIcon = (type: string) => {
    switch (type) {
      case 'high_risk_exposure':
      case 'high_value_at_risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'long_running_contracts':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getWarningVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <CardTitle className="text-orange-700">Vendor Risk Warnings</CardTitle>
        </div>
        <CardDescription>
          Automated risk assessment and delivery warnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {warnings.map((warning, index) => (
          <Alert key={index} variant={getWarningVariant(warning.severity)}>
            {getWarningIcon(warning.type)}
            <AlertTitle className="flex items-center justify-between">
              <span>{warning.title}</span>
              <Badge 
                variant={warning.severity === 'high' ? 'destructive' : 'secondary'}
                className="ml-2"
              >
                {warning.severity.toUpperCase()}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2">
              <p>{warning.message}</p>
              
              {/* Additional details based on warning type */}
              {warning.type === 'high_risk_exposure' && warning.value && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-3 w-3" />
                    <span>High risk exposure: {formatCurrency(warning.value)}</span>
                  </div>
                </div>
              )}
              
              {warning.type === 'high_value_at_risk' && warning.value && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-3 w-3" />
                    <span>Value at risk: {formatCurrency(warning.value)}</span>
                  </div>
                </div>
              )}
              
              {warning.type === 'long_running_contracts' && warning.contractors && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium">Long-running contractors:</p>
                  {warning.contractors.slice(0, 3).map((contractor: any) => (
                    <div key={contractor.id} className="text-xs p-2 bg-muted rounded">
                      {contractor.name} - {contractor.phase} ({contractor.status})
                    </div>
                  ))}
                  {warning.contractors.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{warning.contractors.length - 3} more contractors
                    </p>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}

        {/* Action Recommendations */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Recommended Actions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {warnings.some(w => w.type === 'high_risk_exposure') && (
              <li>• Review high-risk contractors and consider mitigation strategies</li>
            )}
            {warnings.some(w => w.type === 'long_running_contracts') && (
              <li>• Follow up with long-running contractors on delivery timelines</li>
            )}
            {warnings.some(w => w.type === 'high_value_at_risk') && (
              <li>• Consider diversifying risk or adding contingency measures</li>
            )}
            <li>• Schedule regular contractor performance reviews</li>
            <li>• Update contract statuses to maintain accuracy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}