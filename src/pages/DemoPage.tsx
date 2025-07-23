import { useState } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  BarChart4,
  FileText,
  Users,
  Lock,
  Play,
  Eye,
  AlertCircle,
} from "lucide-react";

const demoMetrics = [
  {
    label: "Total Investment",
    value: "SAR 450M",
    change: "+12.5%",
    type: "positive" as const,
  },
  {
    label: "Expected IRR",
    value: "18.7%",
    change: "+2.1%",
    type: "positive" as const,
  },
  {
    label: "Break-even Period",
    value: "4.2 years",
    change: "-0.3 years",
    type: "positive" as const,
  },
  {
    label: "Risk Score",
    value: "Medium",
    change: "Stable",
    type: "neutral" as const,
  },
];

const scenarios = [
  {
    name: "Base Case",
    irr: "18.7%",
    npv: "SAR 89M",
    active: true,
  },
  {
    name: "Optimistic",
    irr: "24.2%",
    npv: "SAR 124M",
    active: false,
  },
  {
    name: "Pessimistic",
    irr: "12.1%",
    npv: "SAR 45M",
    active: false,
  },
];

export default function DemoPage() {
  const [activeScenario, setActiveScenario] = useState("Base Case");

  return (
    <MarketingLayout>
      <div className="flex flex-col">
        {/* Demo Banner */}
        <section className="bg-primary/10 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <Badge variant="outline" className="mr-2">
                    DEMO MODE
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Riyadh Mixed-Use Development Project
                  </span>
                </div>
              </div>
              <Button size="sm" asChild>
                <Link to="/welcome">
                  Create Your Own Project <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Project Header */}
        <section className="pt-8 pb-6">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Al Noor Towers Development
                  </h1>
                  <p className="text-lg text-muted-foreground mb-4">
                    Mixed-use residential and commercial complex in Riyadh
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Building2 className="mr-1 h-3 w-3" />
                      Mixed Use
                    </Badge>
                    <Badge variant="outline">850 Units</Badge>
                    <Badge variant="outline">45,000 sqm</Badge>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    Read Only
                  </Button>
                  <Button asChild>
                    <Link to="/welcome">
                      Try Full Version
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {demoMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <BarChart4 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <p className={`text-sm ${
                          metric.type === 'positive' 
                            ? 'text-success' 
                            : 'text-muted-foreground'
                        }`}>
                          {metric.change}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Scenario Comparison */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart4 className="h-5 w-5" />
                    Scenario Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {scenarios.map((scenario, index) => (
                      <div
                        key={index}
                        className={`rounded-lg border p-4 cursor-pointer transition-all ${
                          scenario.name === activeScenario
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setActiveScenario(scenario.name)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold">{scenario.name}</h3>
                          {scenario.name === activeScenario && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">IRR:</span>
                            <span className="font-medium">{scenario.irr}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">NPV:</span>
                            <span className="font-medium">{scenario.npv}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Placeholder */}
                  <div className="mt-6 h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <BarChart4 className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">Cash Flow Analysis Chart</p>
                      <p className="text-sm text-muted-foreground">
                        Showing {activeScenario} projections
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Showcase */}
        <section className="pb-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Import History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-8 h-8 rounded bg-success/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Al_Noor_Financial_Model.xlsx</p>
                          <p className="text-sm text-muted-foreground">Imported 2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">legacy_model.edmf</p>
                          <p className="text-sm text-muted-foreground">EstateMaster import • Yesterday</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Shared Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                            AH
                          </div>
                          <div>
                            <p className="font-medium">Ahmed Hassan</p>
                            <p className="text-sm text-muted-foreground">Project Manager</p>
                          </div>
                        </div>
                        <Badge variant="outline">Owner</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-medium">
                            SF
                          </div>
                          <div>
                            <p className="font-medium">Sarah Franklin</p>
                            <p className="text-sm text-muted-foreground">Financial Analyst</p>
                          </div>
                        </div>
                        <Badge variant="secondary">View Only</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Demo CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-8">
                <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">
                  This is Just a Preview
                </h2>
                <p className="text-xl text-muted-foreground mb-6">
                  See the full power of Feasly with your own projects and data
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">Import Your Files</h3>
                  <p className="text-sm text-muted-foreground">Excel, .edmf, or start fresh</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-3">
                    <BarChart4 className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-1">Run Scenarios</h3>
                  <p className="text-sm text-muted-foreground">Model multiple outcomes</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-warning" />
                  </div>
                  <h3 className="font-semibold mb-1">Share Results</h3>
                  <p className="text-sm text-muted-foreground">Collaborate with your team</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="group" asChild>
                  <Link to="/welcome">
                    Start Your Project <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/pricing">
                    View Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}