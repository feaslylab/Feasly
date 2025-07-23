import { useEffect } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Users,
  Building,
  TrendingUp,
  Shield,
  Zap,
  Globe2,
  BarChart4,
} from "lucide-react";

const useCases = [
  {
    title: "Solo Developer",
    subtitle: "Individual developers and small development companies",
    description: "Perfect for independent developers working on residential or small commercial projects. Get professional-grade financial modeling without the complexity.",
    icon: Users,
    color: "from-primary/20 to-primary-light/20",
    iconColor: "text-primary",
    features: [
      "Quick project setup with templates",
      "Basic scenario analysis",
      "Professional PDF reports for investors",
      "Saudi compliance calculations",
      "Simple cash flow projections",
    ],
    benefits: [
      "Save 80% of time on financial modeling",
      "Present professional proposals to investors",
      "Ensure compliance with local regulations",
      "Make data-driven investment decisions",
    ],
    cta: "Start Free",
    ctaLink: "/welcome",
  },
  {
    title: "Giga Project",
    subtitle: "Large-scale developments and mega projects",
    description: "Built for complex, multi-phase developments worth billions. Handle massive projects with sophisticated financial modeling, team collaboration, and advanced analytics.",
    icon: Building2,
    color: "from-success/20 to-success-light/20",
    iconColor: "text-success",
    features: [
      "Multi-phase project modeling",
      "Advanced scenario planning",
      "Team collaboration & permissions",
      "Custom reporting for stakeholders",
      "Portfolio-wide consolidation",
      "AI-powered risk analysis",
    ],
    benefits: [
      "Manage complex project phases seamlessly",
      "Coordinate multiple teams and stakeholders",
      "Generate investor-grade financial reports",
      "Monitor performance across entire portfolio",
    ],
    cta: "View Pro Features",
    ctaLink: "/pricing",
  },
  {
    title: "Government / ERP Integration",
    subtitle: "Government entities and large organizations",
    description: "Enterprise-grade solution for government bodies, large corporations, and organizations requiring custom integrations with existing ERP systems.",
    icon: Building,
    color: "from-secondary/20 to-accent/20",
    iconColor: "text-secondary",
    features: [
      "Custom ERP integrations",
      "White-label solutions",
      "Advanced compliance reporting",
      "Dedicated account management",
      "Custom workflows & templates",
      "API access for system integration",
    ],
    benefits: [
      "Seamlessly integrate with existing systems",
      "Maintain brand consistency with white-labeling",
      "Meet complex compliance requirements",
      "Scale across multiple departments",
    ],
    cta: "Contact Sales",
    ctaLink: "#contact",
  },
];

const workflows = [
  {
    step: "1",
    title: "Model",
    description: "Set up your project with intelligent templates and input your key financial parameters.",
    icon: BarChart4,
  },
  {
    step: "2",
    title: "Monitor",
    description: "Track performance with real-time KPIs, alerts, and AI-powered insights.",
    icon: TrendingUp,
  },
  {
    step: "3",
    title: "Compare",
    description: "Analyze multiple scenarios and stress-test your assumptions with advanced modeling.",
    icon: Zap,
  },
  {
    step: "4",
    title: "Consolidate",
    description: "Aggregate data across projects for portfolio-wide reporting and decision-making.",
    icon: Globe2,
  },
];

export default function UseCasesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Use Cases | Feasly";
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
                Built for Every Scale of Development
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                From solo developers to government giga projects, Feasly scales to meet your financial modeling needs.
              </p>
            </div>
          </div>
        </section>

        {/* Project Lifecycle */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Complete Project Lifecycle Management
              </h2>
              <p className="text-xl text-muted-foreground">
                From initial feasibility to portfolio consolidation, Feasly supports every stage of your development journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {workflows.map((workflow, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <workflow.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mx-auto mb-4">
                    {workflow.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{workflow.title}</h3>
                  <p className="text-muted-foreground">{workflow.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Choose Your Path
              </h2>
              <p className="text-xl text-muted-foreground">
                Three tailored solutions for different scales of real estate development.
              </p>
            </div>

            <div className="space-y-20">
              {useCases.map((useCase, index) => (
                <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-16`}>
                  {/* Content */}
                  <div className="flex-1 space-y-6">
                    <div className={`bg-gradient-to-r ${useCase.color} p-4 rounded-full w-fit`}>
                      <useCase.icon className={`h-8 w-8 ${useCase.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{useCase.title}</h3>
                      <p className="text-lg text-primary font-semibold mb-4">{useCase.subtitle}</p>
                      <p className="text-lg text-muted-foreground mb-6">{useCase.description}</p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Key Features:</h4>
                      <ul className="space-y-2">
                        {useCase.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Benefits:</h4>
                      <ul className="space-y-2">
                        {useCase.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-success rounded-full flex-shrink-0" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button size="lg" className="group" asChild>
                      <Link to={useCase.ctaLink}>
                        {useCase.cta} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>

                  {/* Visual */}
                  <div className="flex-1">
                    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                      <div className="aspect-[4/3] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <useCase.icon className={`h-16 w-16 ${useCase.iconColor} mx-auto`} />
                          <div>
                            <p className="font-semibold">{useCase.title}</p>
                            <p className="text-sm text-muted-foreground">Workflow Preview</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by Leading Developers
              </h2>
              <p className="text-xl text-muted-foreground">
                Real results from real projects across the GCC region.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-xl p-6 border border-border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Small Developer Success</h3>
                  <p className="text-muted-foreground text-sm">
                    "Reduced financial modeling time from weeks to days. Secured $5M funding with professional reports."
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  — Independent Developer, Riyadh
                </div>
              </div>

              <div className="bg-background rounded-xl p-6 border border-border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="h-6 w-6 text-success" />
                  </div>
                  <h3 className="font-semibold mb-2">Giga Project Impact</h3>
                  <p className="text-muted-foreground text-sm">
                    "Managing 12 phases of our $2B project seamlessly. Team collaboration features are game-changing."
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  — Project Director, NEOM
                </div>
              </div>

              <div className="bg-background rounded-xl p-6 border border-border">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <Building className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-semibold mb-2">Government Efficiency</h3>
                  <p className="text-muted-foreground text-sm">
                    "Custom integration with our ERP system. Now managing 50+ projects with complete visibility."
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  — Ministry of Housing, KSA
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Find Your Perfect Fit
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Whether you're a solo developer or managing giga projects, Feasly scales to meet your needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="group" asChild>
                  <Link to="/welcome">
                    Start Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/pricing">
                    View All Plans
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