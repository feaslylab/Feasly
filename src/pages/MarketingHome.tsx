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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-[20%] w-72 h-72 bg-primary/10 rounded-full filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-[10%] w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent leading-tight">
              Model the Future.
              <br />
              Manage with Precision.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
              Built for $100M+ projects. Import Excel or legacy EstateMaster files. Model in Arabic. Share with stakeholders. Export with confidence.
            </p>
            
            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Button size="lg" className="group px-8 py-4 text-lg" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" /> View Live Demo
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
                <Link to="/welcome">
                  Get Started Free
                </Link>
              </Button>
            </div>

            {/* Trust Signal */}
            <p className="text-sm text-muted-foreground/80 mb-16">
              Used by leading real estate teams • No credit card required
            </p>
          </div>
          
          {/* Hero Visual */}
          <div className="max-w-7xl mx-auto">
            <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              <div className="aspect-[16/10] w-full bg-gradient-to-br from-background via-muted/30 to-muted flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Building2 className="h-16 w-16 text-primary mx-auto" />
                  <p className="text-lg text-muted-foreground">Live Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stop Fighting Spreadsheets
            </h2>
            <p className="text-xl text-muted-foreground">
              Real estate financial modeling shouldn't require a PhD in Excel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold">Excel Chaos</h3>
              <p className="text-muted-foreground">
                Broken formulas, version conflicts, and hours lost on formatting instead of analysis
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-warning" />
              </div>
              <h3 className="text-xl font-semibold">No Visibility</h3>
              <p className="text-muted-foreground">
                Stakeholders can't see updates, scenarios live in isolation, decision-making slows down
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <Globe2 className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Outdated Tools</h3>
              <p className="text-muted-foreground">
                Legacy software that doesn't support Arabic, mobile access, or modern collaboration
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Model Faster. Decide Smarter.
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for professional real estate financial modeling
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Benefits List */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BarChart4 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Import in Seconds</h3>
                  <p className="text-muted-foreground">
                    Upload Excel files or legacy EstateMaster .edmf files. Our AI handles the rest.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Expand className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Side-by-Side Scenarios</h3>
                  <p className="text-muted-foreground">
                    Compare Base, Optimistic, and Pessimistic outcomes in real-time.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <Globe2 className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Arabic & RTL Support</h3>
                  <p className="text-muted-foreground">
                    Native Arabic interface with right-to-left layout support.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Secure Sharing</h3>
                  <p className="text-muted-foreground">
                    Generate read-only links for stakeholders. Control access with precision.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <LineChart className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Scenario Comparison View</p>
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm font-medium">Live Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30" id="features">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Real Estate Professionals
            </h2>
            <p className="text-xl text-muted-foreground">
              Every feature designed to solve real problems faced by developers and analysts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-xl border border-border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
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

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/features">
                View All Features <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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

        {/* Trust Signals */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-12">
                Built for $100M+ Projects • Designed with Input from Developers and Analysts
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">15min</div>
                  <p className="text-sm text-muted-foreground">Average setup time from Excel import</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">3x</div>
                  <p className="text-sm text-muted-foreground">Faster scenario analysis</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <p className="text-sm text-muted-foreground">Audit-ready version history</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Persistent CTA Bar */}
        <section className="py-20 relative overflow-hidden" id="get-started">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Start Modeling Today
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
                Import your Excel files, explore scenarios, and share with stakeholders. Free onboarding for early users.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
                <Button size="lg" className="group px-8 py-4 text-lg" asChild>
                  <Link to="/demo">
                    <Play className="mr-2 h-5 w-5" />
                    Try Live Demo
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
                  <Link to="/welcome">
                    Get Started Free
                  </Link>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                No credit card required • Full Arabic support • Import .edmf files
              </p>
            </div>
          </div>
        </section>
    </div>
  );
}