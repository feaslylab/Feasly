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
  Upload,
  Languages,
  Share2,
  Download,
  Eye,
  Smartphone,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WhyFeaslyWorks } from "@/components/marketing/WhyFeaslyWorks";
import { WhoUsesFeasly } from "@/components/marketing/WhoUsesFeasly";
import { HowRealTeamsUseFeasly } from "@/components/marketing/HowRealTeamsUseFeasly";
import { TryFeaslyDemo } from "@/components/marketing/TryFeaslyDemo";
import { FeaslyVsOldWay } from "@/components/marketing/FeaslyVsOldWay";
import { EnterpriseScale } from "@/components/marketing/EnterpriseScale";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";
import { PersonaSelector } from "@/components/marketing/PersonaSelector";
import { AIFeaturesVisual } from "@/components/marketing/AIFeaturesVisual";
import { AnimatedHero } from "@/components/marketing/AnimatedHero";
import { AnimatedFeatureCard } from "@/components/marketing/AnimatedFeatureCard";
import { AnimatedRedX } from "@/components/marketing/AnimatedRedX";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { MobileScrollReveal } from "@/components/marketing/MobileOptimizedAnimations";
import { AnimatedBackground } from "@/components/marketing/AnimatedBackground";
import { PulsingButton, NumberCounter } from "@/components/marketing/AnimatedCTA";
import { Card3D } from "@/components/ui/3d-card";
import { AnimatedChart } from "@/components/marketing/AnimatedChart";
import { CurrencyConverter } from "@/components/marketing/CurrencyConverter";
import { TimelineProgress } from "@/components/marketing/TimelineProgress";
import { AnimationTest } from "@/components/marketing/AnimationTest";
import { motion } from "framer-motion";
// Enhanced Animations
import { ParallaxSection, MagneticButton, TextReveal, MorphingBackground, StaggerGrid, TiltCard } from "@/components/marketing/EnhancedAnimations";
import { SpotlightCard, TypewriterText, ParticleBackground, GlitchText, ScrollCounter } from "@/components/marketing/AdvancedEffects";
import { CursorTrail, InteractiveBlob, WaveBackground } from "@/components/marketing/NextLevelAnimations";
import { ScrollProgressiveReveal, ScrollSection, ScrollCard, ScrollTextReveal } from "@/components/marketing/ScrollProgressiveReveal";

const features = [
  {
    title: "Excel Import",
    description: "Upload raw spreadsheets. Get a structured model instantly.",
    icon: Upload,
    color: "bg-gradient-to-r from-primary/10 to-primary-light/10",
    iconColor: "text-primary",
  },
  {
    title: "EstateMaster File Support",
    description: "Direct .edmf import, no rebuilds required.",
    icon: FileText,
    color: "bg-gradient-to-r from-success/10 to-success-light/10", 
    iconColor: "text-success",
  },
  {
    title: "Scenario Modeling",
    description: "Toggle Base, Optimistic, Pessimistic. Instantly.",
    icon: Expand,
    color: "bg-gradient-to-r from-warning/10 to-warning-light/10",
    iconColor: "text-warning",
  },
  {
    title: "Real-Time Calculations",
    description: "No waiting. Changes reflect across the model.",
    icon: LineChart,
    color: "bg-gradient-to-r from-secondary/10 to-accent/10",
    iconColor: "text-secondary",
  },
  {
    title: "Arabic Language Support",
    description: "RTL and native labels built in.",
    icon: Languages,
    color: "bg-gradient-to-r from-primary/10 to-secondary/10",
    iconColor: "text-primary",
  },
  {
    title: "Shareable Projects", 
    description: "Send read-only project links securely.",
    icon: Share2,
    color: "bg-gradient-to-r from-success/10 to-primary/10",
    iconColor: "text-success",
  },
  {
    title: "Full Export History",
    description: "Every version saved and downloadable.",
    icon: Download,
    color: "bg-gradient-to-r from-warning/10 to-secondary/10",
    iconColor: "text-warning",
  },
  {
    title: "Public Demo Access",
    description: "Try without creating an account.",
    icon: Eye,
    color: "bg-gradient-to-r from-primary/10 to-accent/10",
    iconColor: "text-primary",
  },
  {
    title: "Mobile-Responsive Access",
    description: "Model from anywhere.",
    icon: Smartphone,
    color: "bg-gradient-to-r from-success/10 to-warning/10",
    iconColor: "text-success",
  },
  {
    title: "Asset-Specific Templates",
    description: "Residential, Retail, Hospitality, and more.",
    icon: Layout,
    color: "bg-gradient-to-r from-secondary/10 to-primary/10",
    iconColor: "text-secondary",
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
      {/* Cursor Trail Effect */}
      <CursorTrail />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <MorphingBackground />
        </div>
        <div className="container mx-auto px-4 relative z-10 content-layer">
          <TextReveal text="Stop building feasibility models in Excel" className="hero-title text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-primary via-primary to-primary-light bg-clip-text text-transparent text-reveal" />
          <div className="text-center mb-8">
            <TypewriterText 
              text="Next-gen real estate financial modeling" 
              className="hero-subtitle text-xl md:text-2xl text-muted-foreground"
              speed={60}
            />
          </div>
          <ParallaxSection speed={0.3}>
            <div className="text-center space-y-8">
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Replace spreadsheets with intelligent modeling. Get accurate projections, real-time collaboration, and compliance-ready outputs for complex development projects.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <MagneticButton strength={0.2}>
                  <PulsingButton size="lg" className="px-8 py-4 text-lg" asChild>
                    <Link to="/demo">
                      <Play className="mr-2 h-5 w-5" />
                      Try the Demo
                    </Link>
                  </PulsingButton>
                </MagneticButton>
                <MagneticButton strength={0.15}>
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
                    <Link to="/welcome">
                      Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticButton>
              </div>
            </div>
          </ParallaxSection>
        </div>
        <WaveBackground />
      </section>

      {/* The Problem We Solve */}
      <ScrollSection background="muted" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto mb-16">
            <ScrollProgressiveReveal direction="scale" delay={0.2}>
              <GlitchText text="Feasibility modeling is broken." className="text-3xl md:text-4xl font-bold mb-6 text-center" />
            </ScrollProgressiveReveal>
            
            <ScrollProgressiveReveal direction="up" delay={0.4} stagger={true} staggerDelay={0.2} className="space-y-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              <ScrollCard index={0} totalCards={4}>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                  <div className="pt-1">
                    <AnimatedRedX delay={0.2} />
                  </div>
                  <p className="flex-1">Excel models are fragile, unstructured, and hard to audit</p>
                </div>
              </ScrollCard>
              
              <ScrollCard index={1} totalCards={4}>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                  <div className="pt-1">
                    <AnimatedRedX delay={0.4} />
                  </div>
                  <p className="flex-1">Legacy tools like EstateMaster are outdated, slow, and siloed</p>
                </div>
              </ScrollCard>
              
              <ScrollCard index={2} totalCards={4}>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                  <div className="pt-1">
                    <AnimatedRedX delay={0.6} />
                  </div>
                  <p className="flex-1">Most platforms ignore Arabic language and GCC-specific needs</p>
                </div>
              </ScrollCard>
              
              <ScrollCard index={3} totalCards={4}>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50">
                  <div className="pt-1">
                    <AnimatedRedX delay={0.8} />
                  </div>
                  <p className="flex-1">Sharing models with stakeholders is a mess</p>
                </div>
              </ScrollCard>
            </ScrollProgressiveReveal>
            
            <ScrollProgressiveReveal direction="scale" delay={0.8}>
              <div className="mt-12 text-center">
                <ScrollTextReveal 
                  text="Feasly is purpose-built to fix all of this." 
                  className="text-2xl font-bold text-primary"
                  cascade={true}
                  delay={0.2}
                />
              </div>
            </ScrollProgressiveReveal>
          </div>
        </div>
      </ScrollSection>

      {/* Benefits Section */}
      <ScrollSection className="py-20">
        <div className="container mx-auto px-4">
          <ScrollProgressiveReveal direction="up" delay={0.2}>
            <div className="max-w-4xl mx-auto text-center mb-16">
              <ScrollTextReveal 
                text="Model Faster. Decide Smarter." 
                className="text-3xl md:text-4xl font-bold mb-6"
                cascade={true}
              />
              <p className="text-xl text-muted-foreground">
                Everything you need for professional real estate financial modeling
              </p>
            </div>
          </ScrollProgressiveReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Benefits List */}
            <ScrollProgressiveReveal direction="left" delay={0.4} stagger={true} staggerDelay={0.15}>
              <ScrollCard index={0} totalCards={4}>
                <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
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
              </ScrollCard>
              
              <ScrollCard index={1} totalCards={4}>
                <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
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
              </ScrollCard>
              
              <ScrollCard index={2} totalCards={4}>
                <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
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
              </ScrollCard>
              
              <ScrollCard index={3} totalCards={4}>
                <div className="flex items-start gap-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
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
              </ScrollCard>
            </ScrollProgressiveReveal>

            {/* Visual with Interactive Blob */}
            <ScrollProgressiveReveal direction="right" delay={0.6}>
              <div className="relative">
                <InteractiveBlob size={300} />
                <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden relative z-10">
                  <div className="aspect-[4/3] w-full bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <LineChart className="h-12 w-12 text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">Scenario Comparison View</p>
                    </div>
                  </div>
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-4 shadow-lg z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success"></div>
                    <span className="text-sm font-medium">Live Updates</span>
                  </div>
                </div>
              </div>
            </ScrollProgressiveReveal>
          </div>
        </div>
      </ScrollSection>

      {/* Why Feasly Works - Visual Walkthrough */}
      <WhyFeaslyWorks />

      {/* Interactive Persona Selector */}
      <PersonaSelector />

      {/* Who Uses Feasly */}
      <WhoUsesFeasly />

      {/* Features Grid */}
      <ScrollSection background="muted" className="py-20" id="features">
        <div className="container mx-auto px-4">
          <ScrollProgressiveReveal direction="scale" delay={0.2}>
            <div className="text-center mb-16">
              <ScrollTextReveal 
                text="Core Features That Make Feasly Different"
                className="text-3xl md:text-4xl font-bold mb-4"
                cascade={true}
              />
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Built for real estate professionals who need accuracy, speed, and compliance in their financial modeling.
              </p>
            </div>
          </ScrollProgressiveReveal>

          <ScrollProgressiveReveal direction="up" delay={0.4} stagger={true} staggerDelay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <ScrollCard key={feature.title} index={index} totalCards={features.length}>
                  <SpotlightCard className="h-full">
                    <div className="p-6">
                      <div className={cn("p-4 rounded-lg mb-4 w-fit", feature.color)}>
                        <feature.icon className={cn("h-8 w-8", feature.iconColor)} />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </SpotlightCard>
                </ScrollCard>
              ))}
            </div>
          </ScrollProgressiveReveal>

          <ScrollProgressiveReveal direction="scale" delay={0.8}>
            <div className="text-center mt-12">
              <MagneticButton strength={0.1}>
                <Button size="lg" asChild>
                  <Link to="/features">
                    View All Features <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </MagneticButton>
            </div>
          </ScrollProgressiveReveal>
        </div>
      </ScrollSection>

      {/* AI Features Visual Section */}
      <AIFeaturesVisual />

      {/* How Real Teams Use Feasly */}
      <HowRealTeamsUseFeasly />

      {/* Try Feasly Demo */}
      <TryFeaslyDemo />

      {/* Feasly vs Old Way */}
      <FeaslyVsOldWay />

      {/* Built for Real Projects */}
      <section className="py-20" id="compliance">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Real Projects
            </h2>
            <p className="text-xl text-muted-foreground">
              Designed from the ground up for the unique requirements of the GCC real estate market.
            </p>
          </div>

          <StaggerGrid columns={2}>
            <TiltCard>
              <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-300 h-full">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Designed for $100M+ real estate developments</h3>
                  <p className="text-muted-foreground">Handle complex, large-scale projects with confidence and precision.</p>
                </div>
              </div>
            </TiltCard>
            
            <TiltCard>
              <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-300 h-full">
                <div className="bg-success/10 p-3 rounded-full">
                  <BarChart4 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Used by feasibility teams, analysts, and investment professionals</h3>
                  <p className="text-muted-foreground">Trusted by the experts who build the future of real estate.</p>
                </div>
              </div>
            </TiltCard>
            
            <TiltCard>
              <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-300 h-full">
                <div className="bg-warning/10 p-3 rounded-full">
                  <Globe2 className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Optimized for GCC mandates and Arabic-first workflows</h3>
                  <p className="text-muted-foreground">Built specifically for the Gulf region's unique market conditions.</p>
                </div>
              </div>
            </TiltCard>
            
            <TiltCard>
              <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-background hover:shadow-md transition-all duration-300 h-full">
                <div className="bg-secondary/10 p-3 rounded-full">
                  <Layers className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Handles project types from single towers to giga-project portfolios</h3>
                  <p className="text-muted-foreground">Scale from individual developments to massive portfolio analysis.</p>
                </div>
              </div>
            </TiltCard>
          </StaggerGrid>
        </div>
      </section>

      {/* Screenshots / Visual Proof */}
      <section className="py-20 bg-muted/30" id="use-cases">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Screenshots / Visual Proof
            </h2>
            <p className="text-xl text-muted-foreground">
              See Feasly in action with real screenshots from the platform.
            </p>
          </div>

          {/* Screenshots with Captions */}
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Excel Upload → Structured Model */}
            <div className="text-center space-y-4">
              <div className="rounded-xl border border-border overflow-hidden shadow-xl">
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Upload className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-lg text-muted-foreground">Excel Upload Interface</p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground font-medium">Structured model auto-generated from messy Excel</p>
            </div>
            
            {/* Modeling View with Tabs */}
            <div className="text-center space-y-4">
              <div className="rounded-xl border border-border overflow-hidden shadow-xl">
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Expand className="h-12 w-12 text-success mx-auto" />
                    <p className="text-lg text-muted-foreground">Scenario Comparison View</p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground font-medium">Compare multiple scenarios with a click</p>
            </div>
            
            {/* Arabic RTL Interface */}
            <div className="text-center space-y-4">
              <div className="rounded-xl border border-border overflow-hidden shadow-xl">
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Languages className="h-12 w-12 text-warning mx-auto" />
                    <p className="text-lg text-muted-foreground">Arabic RTL Interface</p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground font-medium">Full Arabic language support</p>
            </div>
            
            {/* Public Demo Mode */}
            <div className="text-center space-y-4">
              <div className="rounded-xl border border-border overflow-hidden shadow-xl">
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Eye className="h-12 w-12 text-secondary mx-auto" />
                    <p className="text-lg text-muted-foreground">Public Demo Banner</p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground font-medium">Try without creating an account</p>
            </div>
            
            {/* Export + Version History */}
            <div className="text-center space-y-4">
              <div className="rounded-xl border border-border overflow-hidden shadow-xl">
                <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Download className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-lg text-muted-foreground">Export & Version History</p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground font-medium">Complete audit trail and export options</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Scale */}
      <EnterpriseScale />

        {/* Trust Signals */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <ScrollReveal>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-12">
                  Built for $100M+ Projects • Designed with Input from Developers and Analysts
                </p>
              </ScrollReveal>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ScrollReveal delay={0.2}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      <ScrollCounter target={15} suffix="min" />
                    </div>
                    <p className="text-sm text-muted-foreground">Average setup time from Excel import</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.4}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      <ScrollCounter target={3} suffix="x" />
                    </div>
                    <p className="text-sm text-muted-foreground">Faster scenario analysis</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal delay={0.6}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      <ScrollCounter target={100} suffix="%" />
                    </div>
                    <p className="text-sm text-muted-foreground">Audit-ready version history</p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Persistent CTA Bar */}
        <section className="py-20 relative overflow-hidden" id="get-started">
          <AnimatedBackground />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center">
              <ScrollReveal>
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Feasibility modeling doesn't need to be painful.
                </h2>
              </ScrollReveal>
              
              <ScrollReveal delay={0.3}>
                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
                  <PulsingButton size="lg" className="px-8 py-4 text-lg" asChild>
                    <Link to="/demo">
                      <Play className="mr-2 h-5 w-5" />
                      Try the Demo
                    </Link>
                  </PulsingButton>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
                      <Link to="/welcome">
                        Create Account
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.6}>
                <p className="text-sm text-muted-foreground">
                  No credit card required • Full Arabic support • Import .edmf files
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

      {/* Animation Test Component - Remove after debugging */}
      <AnimationTest />
    </div>
  );
}