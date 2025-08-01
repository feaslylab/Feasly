import { useEffect } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Download, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TM } from "@/components/ui/trademark";

interface ComparisonFeature {
  feature: string;
  description: string;
  excel: boolean;
  argus: boolean;
  estateMaster: boolean;
  feasly: boolean;
  feaslyNote?: string;
}

const comparisonFeatures: ComparisonFeature[] = [
  {
    feature: "GCC Regional Support",
    description: "Built for UAE, Saudi, Qatar markets with local compliance",
    excel: false,
    argus: false,
    estateMaster: false,
    feasly: true,
    feaslyNote: "UAE-based, full Arabic & GCC compliance"
  },
  {
    feature: "Direct .edmf Import",
    description: "Import EstateMaster files without rebuilding",
    excel: false,
    argus: false,
    estateMaster: false,
    feasly: true,
    feaslyNote: "Seamless migration from legacy tools"
  },
  {
    feature: "Multi-Scenario Modeling",
    description: "Compare Base, Optimistic, Pessimistic scenarios instantly",
    excel: false,
    argus: true,
    estateMaster: true,
    feasly: true,
    feaslyNote: "Visual side-by-side comparison"
  },
  {
    feature: "Automated Funding Stacks",
    description: "Built-in debt+equity waterfall calculations",
    excel: false,
    argus: true,
    estateMaster: false,
    feasly: true,
    feaslyNote: "Automated debt/equity calculations"
  },
  {
    feature: "Arabic & RTL Interface",
    description: "Full right-to-left layout with Arabic translations",
    excel: false,
    argus: false,
    estateMaster: false,
    feasly: true,
    feaslyNote: "Native Arabic interface"
  },
  {
    feature: "Real-Time Dashboards",
    description: "Live metrics, P&L, cashflow monitoring",
    excel: false,
    argus: false,
    estateMaster: false,
    feasly: true,
    feaslyNote: "Live updates, no refresh needed"
  },
  {
    feature: "Secure Project Sharing",
    description: "Share models with stakeholders via secure links",
    excel: false,
    argus: false,
    estateMaster: false,
    feasly: true,
    feaslyNote: "Read-only links with access control"
  },
  {
    feature: "VAT & Zakat Compliance",
    description: "GCC-specific tax calculations and reporting",
    excel: false,
    argus: false,
    estateMaster: false,
    feasly: true,
    feaslyNote: "Built-in GCC tax templates"
  },
  {
    feature: "Cloud-Based Access",
    description: "Access from anywhere, automatic backups",
    excel: false,
    argus: false,
    estateMaster: false,
    feasly: true,
    feaslyNote: "No installation, always up-to-date"
  },
  {
    feature: "Regular Updates",
    description: "Continuous feature improvements and market adaptations",
    excel: false,
    argus: false,
    estateMaster: false,
    feasly: true,
    feaslyNote: "Developer-driven roadmap"
  }
];

const FeatureIcon = ({ supported }: { supported: boolean }) => (
  supported ? (
    <Check className="w-5 h-5 text-success" />
  ) : (
    <X className="w-5 h-5 text-destructive" />
  )
);

function FeatureComparison() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Feasly vs Excel, Argus, EstateMaster | Feature Comparison";
  }, []);

  return (
    <MarketingLayout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Feature Comparison
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How Feasly<TM /> Compares to Legacy Alternatives
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See why GCC developers choose Feasly over traditional spreadsheets and legacy tools 
              for real estate feasibility modeling and financial analysis.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Feature Comparison Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 min-w-[200px]">Feature</th>
                        <th className="text-center p-4 min-w-[120px]">Excel</th>
                        <th className="text-center p-4 min-w-[120px]">Argus</th>
                        <th className="text-center p-4 min-w-[140px]">EstateMaster</th>
                        <th className="text-center p-4 min-w-[120px] bg-primary/10">
                          <span className="font-bold text-primary">Feasly</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((feature, index) => (
                        <tr key={index} className="border-t border-border">
                          <td className="p-4">
                            <div>
                              <div className="font-medium mb-1">{feature.feature}</div>
                              <div className="text-sm text-muted-foreground">
                                {feature.description}
                              </div>
                            </div>
                          </td>
                          <td className="text-center p-4">
                            <FeatureIcon supported={feature.excel} />
                          </td>
                          <td className="text-center p-4">
                            <FeatureIcon supported={feature.argus} />
                          </td>
                          <td className="text-center p-4">
                            <FeatureIcon supported={feature.estateMaster} />
                          </td>
                          <td className="text-center p-4 bg-primary/5">
                            <div className="flex flex-col items-center gap-2">
                              <FeatureIcon supported={feature.feasly} />
                              {feature.feaslyNote && (
                                <div className="text-xs text-primary font-medium text-center">
                                  {feature.feaslyNote}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why GCC Developers Choose Feasly
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">🌍 GCC-Native</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Built specifically for UAE, Saudi Arabia, Qatar, and other GCC markets. 
                    Includes local compliance, Arabic support, and regional best practices.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">⚡ Migration Made Easy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Import your existing Excel models and EstateMaster .edmf files directly. 
                    No rebuilding required... get up and running in minutes.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">🚀 Modern & Collaborative</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Cloud-based platform with real-time updates, secure sharing, 
                    and automated calculations. No more email spreadsheets.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pricing Comparison */}
          <div className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Pricing Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <h3 className="font-bold mb-2">Excel</h3>
                    <p className="text-2xl font-bold text-muted-foreground mb-2">$329/year</p>
                    <p className="text-sm text-muted-foreground">
                      Per user + template costs
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">Argus</h3>
                    <p className="text-2xl font-bold text-muted-foreground mb-2">$15,000+</p>
                    <p className="text-sm text-muted-foreground">
                      Enterprise setup + training
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">EstateMaster</h3>
                    <p className="text-2xl font-bold text-muted-foreground mb-2">$2,500+</p>
                    <p className="text-sm text-muted-foreground">
                      Per license + updates
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <h3 className="font-bold mb-2 text-primary">Feasly</h3>
                    <p className="text-2xl font-bold text-primary mb-2">$99/month</p>
                    <p className="text-sm text-primary">
                      All features included
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-3xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Upgrade Your Feasibility Modeling?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  See how Feasly can transform your development analysis workflow. 
                  Try our interactive demo or start your free trial today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/demo">
                      Try Interactive Demo
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/welcome">
                      Start Free Trial
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg">
                    <Download className="mr-2 w-4 h-4" />
                    Download PDF Comparison
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}

export default FeatureComparison;