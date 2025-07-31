import { useEffect } from "react";
import { Link } from "react-router-dom";
import { usePWA } from "@/hooks/usePWA";
import { useTranslation } from "react-i18next";
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
import { PricingSection } from "@/components/marketing/PricingSection";
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

import { motion } from "framer-motion";
// Enhanced Animations
import { ParallaxSection, MagneticButton, TextReveal, MorphingBackground, StaggerGrid, TiltCard } from "@/components/marketing/EnhancedAnimations";
import { SpotlightCard, TypewriterText, ParticleBackground, GlitchText, ScrollCounter } from "@/components/marketing/AdvancedEffects";
import { CursorTrail, InteractiveBlob, WaveBackground } from "@/components/marketing/NextLevelAnimations";
import { ScrollProgressiveReveal, ScrollSection, ScrollCard, ScrollTextReveal } from "@/components/marketing/ScrollProgressiveReveal";
import { GradientText } from "@/components/marketing/GradientText";

const getFeatures = (t: (key: string) => string) => [
  {
    title: t('features.excelImport.title'),
    description: t('features.excelImport.description'),
    icon: Upload,
    color: "bg-gradient-to-r from-primary/10 to-primary-light/10",
    iconColor: "text-primary",
  },
  {
    title: t('features.edmfSupport.title'),
    description: t('features.edmfSupport.description'),
    icon: FileText,
    color: "bg-gradient-to-r from-success/10 to-success-light/10", 
    iconColor: "text-success",
  },
  {
    title: t('features.scenarioModeling.title'),
    description: t('features.scenarioModeling.description'),
    icon: Expand,
    color: "bg-gradient-to-r from-warning/10 to-warning-light/10",
    iconColor: "text-warning",
  },
  {
    title: t('features.realTimeCalc.title'),
    description: t('features.realTimeCalc.description'),
    icon: LineChart,
    color: "bg-gradient-to-r from-secondary/10 to-accent/10",
    iconColor: "text-secondary",
  },
  {
    title: t('features.arabicSupport.title'),
    description: t('features.arabicSupport.description'),
    icon: Languages,
    color: "bg-gradient-to-r from-primary/10 to-secondary/10",
    iconColor: "text-primary",
  },
  {
    title: t('features.shareable.title'),
    description: t('features.shareable.description'),
    icon: Share2,
    color: "bg-gradient-to-r from-success/10 to-primary/10",
    iconColor: "text-success",
  },
];

const getAdvantages = (t: (key: string) => string) => [
  {
    title: t('advantages.gccNative.title'),
    description: t('advantages.gccNative.description'),
    icon: Globe2,
  },
  {
    title: t('advantages.saudiRegulation.title'),
    description: t('advantages.saudiRegulation.description'),
    icon: Lock,
  },
  {
    title: t('advantages.aiInsights.title'),
    description: t('advantages.aiInsights.description'),
    icon: Cloud,
  },
  {
    title: t('advantages.multiScenario.title'),
    description: t('advantages.multiScenario.description'),
    icon: BarChart4,
  },
];

export default function MarketingHome() {
  const { isOnline } = usePWA();
  const { t } = useTranslation('marketing');
  
  const features = getFeatures(t);
  const advantages = getAdvantages(t);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="flex flex-col relative">
      {/* Premium Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary-light)/0.08),transparent_50%)] pointer-events-none" />
      
      {/* Cursor Trail Effect */}
      <CursorTrail />
      
      {/* Enhanced Hero Section */}
      <div className="relative z-10">
        <AnimatedHero 
          title={t('home.hero.title')} 
          subtitle={t('home.hero.subtitle')} 
          description={t('home.hero.description')} 
        />
      </div>

      {/* Enhanced Problem Section */}
      <ScrollSection background="muted" className="py-24 relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto mb-20">
            <ScrollProgressiveReveal direction="scale" delay={0.2}>
              <div className="text-center mb-16">
                <GlitchText text={t('home.problems.title')} className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent" />
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-light mx-auto rounded-full" />
              </div>
            </ScrollProgressiveReveal>
            
            <ScrollProgressiveReveal direction="up" delay={0.4} stagger={true} staggerDelay={0.2} className="space-y-8 text-lg max-w-3xl mx-auto">
              <ScrollCard index={0} totalCards={4}>
                <div className="group flex items-start gap-6 p-8 rounded-2xl bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="pt-1 group-hover:scale-110 transition-transform duration-300">
                    <AnimatedRedX delay={0.2} />
                  </div>
                  <p className="flex-1 text-foreground/90 leading-relaxed">{t('home.problems.excelFragile')}</p>
                </div>
              </ScrollCard>
              
              <ScrollCard index={1} totalCards={4}>
                <div className="group flex items-start gap-6 p-8 rounded-2xl bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="pt-1 group-hover:scale-110 transition-transform duration-300">
                    <AnimatedRedX delay={0.4} />
                  </div>
                  <p className="flex-1 text-foreground/90 leading-relaxed">{t('home.problems.legacyTools')}</p>
                </div>
              </ScrollCard>
              
              <ScrollCard index={2} totalCards={4}>
                <div className="group flex items-start gap-6 p-8 rounded-2xl bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="pt-1 group-hover:scale-110 transition-transform duration-300">
                    <AnimatedRedX delay={0.6} />
                  </div>
                  <p className="flex-1 text-foreground/90 leading-relaxed">{t('home.problems.missingArabic')}</p>
                </div>
              </ScrollCard>
              
              <ScrollCard index={3} totalCards={4}>
                <div className="group flex items-start gap-6 p-8 rounded-2xl bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                  <div className="pt-1 group-hover:scale-110 transition-transform duration-300">
                    <AnimatedRedX delay={0.8} />
                  </div>
                  <p className="flex-1 text-foreground/90 leading-relaxed">{t('home.problems.sharingMess')}</p>
                </div>
              </ScrollCard>
            </ScrollProgressiveReveal>
            
            <ScrollProgressiveReveal direction="scale" delay={0.8}>
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary-light/10 border border-primary/20 backdrop-blur-sm">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-light rounded-full animate-pulse" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                    {t('home.problems.solution')}
                  </span>
                </div>
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
                text={t('home.benefits.title')}
                className="text-3xl md:text-4xl font-bold mb-6"
                cascade={true}
              />
              <p className="text-xl text-muted-foreground">
                {t('home.benefits.subtitle')}
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
                    <h3 className="text-xl font-semibold mb-2">{t('home.benefits.importSeconds.title')}</h3>
                    <p className="text-muted-foreground">
                      {t('home.benefits.importSeconds.description')}
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
                    <h3 className="text-xl font-semibold mb-2">{t('home.benefits.sideByScenarios.title')}</h3>
                    <p className="text-muted-foreground">
                      {t('home.benefits.sideByScenarios.description')}
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
                    <h3 className="text-xl font-semibold mb-2">{t('home.benefits.arabicSupport.title')}</h3>
                    <p className="text-muted-foreground">
                      {t('home.benefits.arabicSupport.description')}
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
                    <h3 className="text-xl font-semibold mb-2">{t('home.benefits.secureSharing.title')}</h3>
                    <p className="text-muted-foreground">
                      {t('home.benefits.secureSharing.description')}
                    </p>
                  </div>
                </div>
              </ScrollCard>
            </ScrollProgressiveReveal>

            {/* Visual with Interactive Blob */}
            <ScrollProgressiveReveal direction="right" delay={0.6}>
              <div className="relative">
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

      {/* Enhanced Features Grid */}
      <ScrollSection background="muted" className="py-24 relative overflow-hidden" id="features">
        {/* Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/90 to-primary/5" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <ScrollProgressiveReveal direction="scale" delay={0.2}>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-8">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Platform Features
              </div>
              <ScrollTextReveal 
                text={t('home.features.title')}
                className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent"
                cascade={true}
              />
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                {t('home.features.subtitle')}
              </p>
            </div>
          </ScrollProgressiveReveal>

          <ScrollProgressiveReveal direction="up" delay={0.4} stagger={true} staggerDelay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <ScrollCard key={feature.title} index={index} totalCards={features.length}>
                  <SpotlightCard className="h-full group">
                    <div className="p-8 h-full flex flex-col">
                      <div className={cn("p-5 rounded-2xl mb-6 w-fit relative group-hover:scale-110 transition-transform duration-300", feature.color)}>
                        <feature.icon className={cn("h-10 w-10", feature.iconColor)} />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed flex-1 text-lg">{feature.description}</p>
                    </div>
                  </SpotlightCard>
                </ScrollCard>
              ))}
            </div>
          </ScrollProgressiveReveal>

          <ScrollProgressiveReveal direction="scale" delay={0.8}>
            <div className="text-center mt-16">
              <MagneticButton strength={0.1}>
                <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" asChild>
                  <Link to="/features">
                    View All Features <ArrowRight className="ml-2 h-5 w-5" />
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

      {/* Pricing Section */}
      <PricingSection />

      {/* Try Feasly Demo */}
      <TryFeaslyDemo />

      {/* Feasly vs Old Way */}
      <FeaslyVsOldWay />

      {/* Enhanced Built for Real Projects */}
      <section className="py-24 relative overflow-hidden" id="compliance">
        {/* Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-8">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Enterprise Ready
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Built for Real Projects
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Designed from the ground up for the unique requirements of the GCC real estate market.
            </p>
          </div>

          <StaggerGrid columns={2}>
            <TiltCard>
              <div className="group flex items-start gap-6 p-10 rounded-3xl border border-border bg-gradient-to-br from-card via-card/95 to-primary/5 hover:shadow-2xl transition-all duration-500 h-full backdrop-blur-xl hover:-translate-y-2 hover:border-primary/30">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Designed for $100M+ real estate developments</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">Handle complex, large-scale projects with confidence and precision.</p>
                </div>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="group flex items-start gap-6 p-10 rounded-3xl border border-border bg-gradient-to-br from-card via-card/95 to-success/5 hover:shadow-2xl transition-all duration-500 h-full backdrop-blur-xl hover:-translate-y-2 hover:border-success/30">
                <div className="bg-gradient-to-br from-success/20 to-success/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <BarChart4 className="h-8 w-8 text-success" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Used by feasibility teams and investment professionals</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">Trusted by the experts who build the future of real estate.</p>
                </div>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="group flex items-start gap-6 p-10 rounded-3xl border border-border bg-gradient-to-br from-card via-card/95 to-warning/5 hover:shadow-2xl transition-all duration-500 h-full backdrop-blur-xl hover:-translate-y-2 hover:border-warning/30">
                <div className="bg-gradient-to-br from-warning/20 to-warning/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Globe2 className="h-8 w-8 text-warning" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Optimized for GCC mandates and Arabic workflows</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">Built specifically for the Gulf region's unique market conditions.</p>
                </div>
              </div>
            </TiltCard>

            <TiltCard>
              <div className="group flex items-start gap-6 p-10 rounded-3xl border border-border bg-gradient-to-br from-card via-card/95 to-secondary/5 hover:shadow-2xl transition-all duration-500 h-full backdrop-blur-xl hover:-translate-y-2 hover:border-secondary/30">
                <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Layers className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">Handles single towers to giga-project portfolios</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">Scale from individual developments to massive portfolio analysis.</p>
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

        {/* Social Proof / Trust Signals */}
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <ScrollReveal>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-12">
                  5 M AED in projects modelled • Trusted by GCC developers • Built by Saudi real-estate pros
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
                  Ready to kill the spreadsheet?
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

    </div>
  );
}