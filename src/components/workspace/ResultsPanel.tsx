import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, BarChart3, PieChart } from 'lucide-react';

export default function ResultsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Results</h2>
        <p className="text-muted-foreground">
          Financial projections and key performance indicators
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPV</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 0</div>
            <p className="text-xs text-muted-foreground">
              Net present value
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
              Internal rate of return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 0</div>
            <p className="text-xs text-muted-foreground">
              Total profit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--%</div>
            <p className="text-xs text-muted-foreground">
              Return on investment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="financing">Financing</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>
                Summary of key financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No calculation results available</p>
                  <p className="text-sm mt-1">Run calculations to see results here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Analysis</CardTitle>
              <CardDescription>
                Monthly cash flow projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No cash flow data available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financing Structure</CardTitle>
              <CardDescription>
                Debt and equity analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <PieChart className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No financing data available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Return Analysis</CardTitle>
              <CardDescription>
                IRR and return metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No return data available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Calculation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              No calculations run
            </Badge>
            <span className="text-sm text-muted-foreground">
              Configure inputs and run calculations to see results
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}