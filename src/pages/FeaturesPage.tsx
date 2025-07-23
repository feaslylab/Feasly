import { useEffect } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { AnimatedFeatureCard } from "@/components/marketing/AnimatedFeatureCard";
import { AnimatedBackground } from "@/components/marketing/AnimatedBackground";
import { PulsingButton } from "@/components/marketing/AnimatedCTA";
import { motion } from "framer-motion";
// Enhanced Animations
import { ScrollProgressiveReveal, ScrollSection, ScrollCard, ScrollTextReveal } from "@/components/marketing/ScrollProgressiveReveal";
import { CursorTrail, InteractiveBlob } from "@/components/marketing/NextLevelAnimations";
import { MagneticButton, MorphingBackground, TiltCard } from "@/components/marketing/EnhancedAnimations";
import { SpotlightCard, TypewriterText } from "@/components/marketing/AdvancedEffects";
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
    title: "Smart Excel & EDMF import",
    benefit: "Upload raw files. Our AI maps every cell.",
    description: "Upload Excel files (structured or raw) or import legacy EstateMaster .edmf files directly. Our AI handles the mapping and formatting automatically.",
    icon: FileText,
    color: "from-primary/20 to-primary-light/20",
    iconColor: "text-primary",
    quote: "Importing our 5-year-old EstateMaster model took just 30 seconds.",
  },
  {
    title: "Multi-scenario modelling",
    benefit: "Flip Base, Optimistic, Pessimistic in one click.",
    description: "Create unlimited scenarios to stress-test your development projects. Compare optimistic, realistic, and pessimistic outcomes side-by-side with advanced sensitivity analysis.",
    icon: BarChart4,
    color: "from-success/20 to-success-light/20",
    iconColor: "text-success",
    quote: "We saved 6 months of analysis time with Feasly's scenario modeling.",
  },
  {
    title: "Saudi compliance & Zakat",
    benefit: "Built-in escrow and tax rules.",
    description: "Automatic Zakat calculations, Escrow compliance tracking, and full Saudi Arabia real estate regulation support. No more manual compliance calculations.",
    icon: ShieldCheck,
    color: "from-success/20 to-success-light/20",
    iconColor: "text-success",
    quote: "Finally, a tool that understands Saudi real estate requirements.",
  },
  {
    title: "AI-powered smart insights",
    benefit: "Spot risks before they cost you.",
    description: "Advanced algorithms analyze your financial models to surface optimization opportunities, risk factors, and investment insights automatically.",
    icon: LineChart,
    color: "from-warning/20 to-warning-light/20",
    iconColor: "text-warning",
    quote: "The AI insights helped us identify $2M in cost savings.",
  },
  {
    title: "Audit-ready version control",
    benefit: "Every change tracked, time-stamped.",
    description: "Every change is tracked with detailed audit logs. Compare versions, see who changed what, and maintain full accountability across your team.",
    icon: Layers,
    color: "from-secondary/20 to-accent/20",
    iconColor: "text-secondary",
    quote: "Audit season is now stress-free with complete change tracking.",
  },
  {
    title: "Portfolio consolidation",
    benefit: "View KPIs across projects.",
    description: "Aggregate data across all your development projects. Get portfolio-wide KPIs, consolidated reporting, and cross-project insights.",
    icon: Building2,
    color: "from-primary/20 to-secondary/20",
    iconColor: "text-primary",
    quote: "Managing 12 projects simultaneously has never been easier.",
  },
  {
    title: "Investor-ready exports",
    benefit: "PDF, Excel, Arabic or English.",
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
      <CursorTrail />
      <div className="flex flex-col">
        {/* Hero Section */}
        <ScrollSection className="pt-32 pb-20 md:pt-40 md:pb-32">
          <MorphingBackground />
          <div className="container mx-auto px-4 relative z-10">
            <ScrollProgressiveReveal direction="scale" delay={0.2}>
              <div className="max-w-4xl mx-auto text-center">
                <ScrollTextReveal 
                  text="Features Built for Real Estate Excellence"
                  className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
                  cascade={true}
                />
                <TypewriterText 
                  text="Every feature designed to solve real problems faced by developers, investors, and finance teams in the GCC market."
                  className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto"
                  speed={45}
                />
                <MagneticButton strength={0.15}>
                  <Button size="lg" className="group" asChild>
                    <Link to="#features">
                      Explore Features <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </MagneticButton>
              </div>
            </ScrollProgressiveReveal>
          </div>
        </ScrollSection>

        {/* Features Grid */}
        <ScrollSection background="muted" className="py-20" id="features">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {features.map((feature, index) => (
                <ScrollCard key={index} index={index} totalCards={features.length}>
                  <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-16`}>
                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-full w-fit`}>
                        <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                      </div>
                      <div>
                        <ScrollTextReveal 
                          text={feature.title}
                          className="text-3xl font-bold mb-2"
                          delay={index * 0.1}
                        />
                        <p className="text-xl text-primary font-semibold mb-4">{feature.benefit}</p>
                        <p className="text-lg text-muted-foreground mb-6">{feature.description}</p>
                        {feature.quote && (
                          <ScrollProgressiveReveal direction="left" delay={0.3}>
                            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground bg-background/50 backdrop-blur-sm p-4 rounded-r-lg">
                              "{feature.quote}"
                            </blockquote>
                          </ScrollProgressiveReveal>
                        )}
                      </div>
                    </div>

                    {/* Visual Placeholder with Interactive Blob */}
                    <ScrollProgressiveReveal direction="right" delay={0.2} className="flex-1">
                      <div className="relative">
                        <InteractiveBlob size={150} />
                        <SpotlightCard className="bg-card rounded-xl border border-border shadow-lg overflow-hidden relative z-10">
                          <div className="aspect-[4/3] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <feature.icon className={`h-12 w-12 ${feature.iconColor} mx-auto`} />
                              <p className="text-sm text-muted-foreground">Feature Screenshot</p>
                            </div>
                          </div>
                        </SpotlightCard>
                      </div>
                    </ScrollProgressiveReveal>
                  </div>
                </ScrollCard>
              ))}
            </div>
          </div>
        </ScrollSection>

        {/* CTA Section */}
        <ScrollSection className="py-20">
          <div className="container mx-auto px-4 relative z-10">
            <ScrollProgressiveReveal direction="scale" delay={0.2}>
              <div className="max-w-4xl mx-auto text-center">
                <ScrollTextReveal 
                  text="Ready to Transform Your Development Process?"
                  className="text-3xl md:text-4xl font-bold mb-6"
                  cascade={true}
                />
                <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                  Join developers across the GCC who are using Feasly to make better, faster investment decisions.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <MagneticButton strength={0.2}>
                    <PulsingButton size="lg" className="group" asChild>
                      <Link to="/pricing">
                        View Pricing <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </PulsingButton>
                  </MagneticButton>
                  <MagneticButton strength={0.1}>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/welcome">
                        Try Feasly Now
                      </Link>
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </ScrollProgressiveReveal>
          </div>
        </ScrollSection>
      </div>
    </MarketingLayout>
  );
}