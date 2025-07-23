import { useEffect } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  LineChart,
  FileText,
  Layers,
  BarChart4,
  Calculator,
  AlertTriangle,
  Download,
  Globe2,
  Users,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    title: "Smart Excel & Legacy File Import",
    benefit: "Import your existing work in seconds",
    description: "Upload Excel files (structured or raw) or import legacy EstateMaster .edmf files directly. Our AI handles the mapping and formatting automatically.",
    icon: FileText,
    color: "from-primary/20 to-primary-light/20",
    iconColor: "text-primary",
    quote: "Importing our 5-year-old EstateMaster model took just 30 seconds.",
  },
  {
    title: "Multi-Scenario Financial Modeling",
    benefit: "Test every possibility before you invest",
    description: "Create unlimited scenarios to stress-test your development projects. Compare optimistic, realistic, and pessimistic outcomes side-by-side with advanced sensitivity analysis.",
    icon: BarChart4,
    color: "from-success/20 to-success-light/20",
    iconColor: "text-success",
    quote: "We saved 6 months of analysis time with Feasly's scenario modeling.",
  },
  {
    title: "Saudi Compliance & Zakat Calculation",
    benefit: "Built for GCC regulations from day one",
    description: "Automatic Zakat calculations, Escrow compliance tracking, and full Saudi Arabia real estate regulation support. No more manual compliance calculations.",
    icon: ShieldCheck,
    color: "from-success/20 to-success-light/20",
    iconColor: "text-success",
    quote: "Finally, a tool that understands Saudi real estate requirements.",
  },
  {
    title: "AI-Powered Smart Insights",
    benefit: "Let AI find the opportunities you might miss",
    description: "Advanced algorithms analyze your financial models to surface optimization opportunities, risk factors, and investment insights automatically.",
    icon: LineChart,
    color: "from-warning/20 to-warning-light/20",
    iconColor: "text-warning",
    quote: "The AI insights helped us identify $2M in cost savings.",
  },
  {
    title: "Intelligent Alerts & Monitoring",
    benefit: "Never miss a critical threshold again",
    description: "Set custom alerts for KPI thresholds, cash flow warnings, and compliance deadlines. Get notified before issues become problems.",
    icon: AlertTriangle,
    color: "from-destructive/20 to-destructive-light/20",
    iconColor: "text-destructive",
    quote: "Early warnings saved our project from going over budget.",
  },
  {
    title: "Audit-Ready Version Control",
    benefit: "Complete transparency for investors and auditors",
    description: "Every change is tracked with detailed audit logs. Compare versions, see who changed what, and maintain full accountability across your team.",
    icon: Layers,
    color: "from-secondary/20 to-accent/20",
    iconColor: "text-secondary",
    quote: "Audit season is now stress-free with complete change tracking.",
  },
  {
    title: "Portfolio Consolidation",
    benefit: "Manage multiple projects from one dashboard",
    description: "Aggregate data across all your development projects. Get portfolio-wide KPIs, consolidated reporting, and cross-project insights.",
    icon: Building2,
    color: "from-primary/20 to-secondary/20",
    iconColor: "text-primary",
    quote: "Managing 12 projects simultaneously has never been easier.",
  },
  {
    title: "Professional Export & Reporting",
    benefit: "Investor-ready reports in seconds",
    description: "Generate beautiful PDF reports and Excel exports with your branding. Custom templates for different stakeholder needs.",
    icon: Download,
    color: "from-primary/20 to-primary-light/20",
    iconColor: "text-primary",
    quote: "Our investor presentations now look truly professional.",
  },
  {
    title: "Team Collaboration",
    benefit: "Keep everyone aligned and informed",
    description: "Real-time collaboration, role-based permissions, and commenting system. Keep stakeholders in the loop without compromising security.",
    icon: Users,
    color: "from-success/20 to-primary/20",
    iconColor: "text-success",
    quote: "Our entire team stays synchronized on project changes.",
  },
];

export default function FeaturesPage() {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    document.title = "Features | Feasly";
  }, []);

  return (
    <MarketingLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Features Built for Real Estate Excellence
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Every feature designed to solve real problems faced by developers, investors, and finance teams in the GCC market.
              </p>
              <Button size="lg" className="group" asChild>
                <Link to="#features">
                  Explore Features <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30" id="features">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {features.map((feature, index) => (
                <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-16`}>
                  {/* Content */}
                  <div className="flex-1 space-y-6">
                    <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-full w-fit`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-xl text-primary font-semibold mb-4">{feature.benefit}</p>
                      <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                      {feature.quote && (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                          "{feature.quote}"
                        </blockquote>
                      )}
                    </div>
                  </div>

                  {/* Visual Placeholder */}
                  <div className="flex-1">
                    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                      <div className="aspect-[4/3] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <feature.icon className={`h-12 w-12 ${feature.iconColor} mx-auto`} />
                          <p className="text-sm text-muted-foreground">Feature Screenshot</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Development Process?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Join developers across the GCC who are using Feasly to make better, faster investment decisions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="group" asChild>
                  <Link to="/pricing">
                    View Pricing <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/welcome">
                    Try Feasly Now
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