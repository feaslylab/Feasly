import { useEffect } from "react";
import { Link } from "react-router-dom";
import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Expand,
  ShieldCheck,
  LineChart,
  FileText,
  Layers,
  Globe2,
  Lock,
  Cloud,
  Building2,
  BarChart4,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Development Feasibility",
    description:
      "Comprehensive financial modeling tailored for real estate development projects.",
    icon: Building2,
    color: "bg-gradient-to-r from-primary/10 to-primary-light/10",
    iconColor: "text-primary",
  },
  {
    title: "Saudi Compliance",
    description:
      "Built-in support for Zakat calculation, Escrow compliance, and Saudi regulations.",
    icon: ShieldCheck,
    color: "bg-gradient-to-r from-success/10 to-success-light/10",
    iconColor: "text-success",
  },
  {
    title: "Smart Insights",
    description:
      "AI-driven analysis provides actionable insights from your financial data.",
    icon: LineChart,
    color: "bg-gradient-to-r from-warning/10 to-warning-light/10",
    iconColor: "text-warning",
  },
  {
    title: "Consolidation & Reporting",
    description:
      "Aggregate data across projects for portfolio-wide performance analysis.",
    icon: FileText,
    color: "bg-gradient-to-r from-secondary/10 to-accent/10",
    iconColor: "text-secondary",
  },
  {
    title: "Audit-Ready Versioning",
    description:
      "Track changes across all financial models with detailed audit logs.",
    icon: Layers,
    color: "bg-gradient-to-r from-primary/10 to-secondary/10",
    iconColor: "text-primary",
  },
  {
    title: "Multi-Scenario Modeling",
    description:
      "Test multiple scenarios to see how different variables affect outcomes.",
    icon: Expand,
    color: "bg-gradient-to-r from-success/10 to-primary/10",
    iconColor: "text-success",
  },
];

const advantages = [
  {
    title: "GCC-Native",
    description:
      "Built specifically for the Gulf region's unique market conditions and regulations.",
    icon: Globe2,
  },
  {
    title: "Saudi Regulation Support",
    description:
      "Fully compliant with Saudi Arabia's latest real estate investment requirements.",
    icon: Lock,
  },
  {
    title: "AI-Powered Insights",
    description:
      "Native AI integration for predictive analytics and financial optimization.",
    icon: Cloud,
  },
  {
    title: "Multi-Scenario Planning",
    description:
      "Create, compare, and stress-test various financial scenarios with ease.",
    icon: BarChart4,
  },
];

export default function MarketingHome() {
  const { isOnline } = usePWA();

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 z-0" />
        
        {/* Animated Background Elements (Optional) */}
        <div className="absolute top-20 right-[20%] w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Model the Future. Manage with Precision.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Feasly is a next-gen real estate financial modeling platform, built for the GCC and beyond.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="group" asChild>
                <Link to="#get-started">
                  Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <Link to="#watch-demo">
                  <Play className="h-4 w-4" /> Watch Demo
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Hero Visual Element */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="bg-card rounded-xl border border-border shadow-xl overflow-hidden">
              <div className="aspect-video w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                <p className="text-lg text-muted-foreground">Interactive Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30" id="features">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Financial Modeling
            </h2>
            <p className="text-xl text-muted-foreground">
              Feasly brings together essential tools for real estate developers, investors, and finance professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-md",
                  feature.color
                )}
              >
                <div className={cn("p-3 rounded-full w-fit mb-4", feature.color)}>
                  <feature.icon className={cn("h-6 w-6", feature.iconColor)} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Feasly Section */}
      <section className="py-20" id="compliance">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Feasly?
            </h2>
            <p className="text-xl text-muted-foreground">
              Designed from the ground up for the unique requirements of the GCC real estate market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-300"
              >
                <div className="bg-primary/10 p-3 rounded-full">
                  <advantage.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{advantage.title}</h3>
                  <p className="text-muted-foreground">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Screenshots Section */}
      <section className="py-20 bg-muted/30" id="use-cases">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Real Estate Analytics
            </h2>
            <p className="text-xl text-muted-foreground">
              Visualize complex financial data with intuitive dashboards and reports.
            </p>
          </div>

          {/* Mockup Screens - Vertical Scroll */}
          <div className="max-w-6xl mx-auto space-y-16">
            {/* First Screenshot */}
            <div className="rounded-xl border border-border overflow-hidden shadow-xl">
              <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                <p className="text-lg text-muted-foreground">Financial Dashboard Preview</p>
              </div>
            </div>
            
            {/* Second Screenshot */}
            <div className="rounded-xl border border-border overflow-hidden shadow-xl">
              <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                <p className="text-lg text-muted-foreground">Multi-Scenario Analysis Preview</p>
              </div>
            </div>
            
            {/* Third Screenshot */}
            <div className="rounded-xl border border-border overflow-hidden shadow-xl">
              <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                <p className="text-lg text-muted-foreground">Compliance Reporting Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden" id="get-started">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 z-0" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Real Estate Financial Modeling?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Join leading developers and investors across the GCC who are using Feasly to make better investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="group" asChild>
                <Link to="#get-started">
                  Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/welcome">
                  Login to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}