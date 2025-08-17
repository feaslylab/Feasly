import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export default function PreviewPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Preview</h2>
        <p className="text-muted-foreground">
          Review key metrics and assumptions before running calculations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Project Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 0</div>
            <p className="text-xs text-muted-foreground">
              Total development value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60</div>
            <p className="text-xs text-muted-foreground">
              Months duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--%</div>
            <p className="text-xs text-muted-foreground">
              Project internal rate of return
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Model Validation</CardTitle>
          <CardDescription>
            Check for potential issues before running calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                No inputs configured
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Add unit types and cost items to generate meaningful results
              </p>
            </div>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              Warning
            </Badge>
          </div>

          <div className="pt-4">
            <Button className="w-full" disabled>
              Run Calculation
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Configure inputs to enable calculations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}