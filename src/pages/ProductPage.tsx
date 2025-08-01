import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Layers,
  DollarSign,
  Languages,
  MousePointer,
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Globe2,
  TrendingUp,
  Calculator,
  Target,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { AnimatedFeatureCard } from "@/components/marketing/AnimatedFeatureCard";
import { EnhancedMarketingLayout } from "@/components/marketing/EnhancedMarketingLayout";

export default function ProductPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Product | Feasly - The End of Excel Modeling";
  }, []);

  const pipelineSteps = [
    {
      title: "Raw Data",
      description: "Legacy .edmf files and Excel spreadsheets",
      icon: FileText,
      color: "text-muted-foreground"
    },
    {
      title: "AI Processing", 
      description: "Intelligent parsing and validation",
      icon: Zap,
      color: "text-primary"
    },
    {
      title: "Structured Output",
      description: "Precision-grade financial models",
      icon: BarChart3,
      color: "text-success"
    }
  ];

  const platformCapabilities = [
    {
      title: ".edmf & Excel Imports",
      description: "Legacy EstateMaster and Excel files parsed in seconds with AI-assisted mapping",
      icon: Upload,
      color: "from-primary/10 to-primary-light/10",
      iconColor: "text-primary",
      features: ["Automatic field recognition", "Data validation", "Error reporting", "Bulk processing"]
    },
    {
      title: "Scenario Planning",
      description: "Build base, pessimistic, and value engineering scenarios with dynamic modeling",
      icon: Layers,
      color: "from-success/10 to-success-light/10", 
      iconColor: "text-success",
      features: ["Multiple scenario comparison", "Sensitivity analysis", "Monte Carlo simulation", "Risk assessment"]
    },
    {
      title: "Funding Stack Overlays",
      description: "Model complex capital structures with cash, equity, debt, and mezzanine financing",
      icon: DollarSign,
      color: "from-warning/10 to-warning-light/10",
      iconColor: "text-warning", 
      features: ["Waterfall modeling", "IRR calculations", "Cash flow projections", "Return analysis"]
    },
    {
      title: "Zakat & GCC Tax Engine",
      description: "Built-in compliance for regional tax requirements and Zakat calculations",
      icon: Calculator,
      color: "from-destructive/10 to-destructive-light/10",
      iconColor: "text-destructive",
      features: ["Automatic Zakat calculations", "VAT compliance", "Tax optimization", "Audit trails"]
    },
    {
      title: "Arabic-First Interface",
      description: "Native Arabic language support with RTL layout and localized reporting",
      icon: Languages,
      color: "from-secondary/10 to-accent/10",
      iconColor: "text-secondary",
      features: ["RTL text support", "Arabic number formats", "Local currency", "Cultural adaptations"]
    },
    {
      title: "No-Code Financial Control",
      description: "Build complex financial models without programming or formula expertise",
      icon: MousePointer,
      color: "from-primary/10 to-secondary/10",
      iconColor: "text-primary",
      features: ["Drag-and-drop interface", "Template library", "Custom workflows", "Visual modeling"]
    }
  ];

  return (
    <EnhancedMarketingLayout>
      <div className="flex flex-col relative">
        {/* Premium Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none" />
        
        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col items-center justify-center text-center relative z-10 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-8">
                <Target className="h-4 w-4" />
                Product Overview
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl/tight md:text-7xl font-bold text-foreground max-w-4xl mx-auto mb-6">
                The End of
                <br />
                <span className="bg-gradient-to-r from-destructive via-warning to-primary bg-clip-text text-transparent">
                  Excel Modeling
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
                Transform legacy spreadsheets into precision-grade financial models with sovereign-ready outputs and GCC compliance built-in.
              </p>

              {/* CTA */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                  Request Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Pipeline Section */}
        <ScrollReveal>
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Data Pipeline Transformation</h2>
                <p className="text-xl text-muted-foreground">
                  Watch your raw Excel sheets transform into glowing structured reports through our intelligent processing pipeline
                </p>
              </div>

              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  {pipelineSteps.map((step, index) => (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className="relative"
                    >
                      <Card className="p-8 text-center border-border/50 hover:shadow-lg transition-all duration-300">
                        <div className={`p-4 rounded-2xl bg-primary/10 mb-6 w-fit mx-auto`}>
                          <step.icon className={`h-10 w-10 ${step.color}`} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </Card>
                      
                      {/* Arrow connector */}
                      {index < pipelineSteps.length - 1 && (
                        <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                          <ArrowRight className="h-8 w-8 text-primary" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Platform Capabilities Section */}
        <ScrollReveal>
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Platform Capabilities</h2>
                <p className="text-xl text-muted-foreground">
                  Enterprise-grade features built for GCC real estate professionals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {platformCapabilities.map((capability, index) => (
                  <AnimatedFeatureCard key={capability.title} index={index} className="h-full">
                    <div className="h-full flex flex-col">
                      <div className={`p-5 rounded-2xl mb-6 w-fit bg-gradient-to-br ${capability.color}`}>
                        <capability.icon className={`h-8 w-8 ${capability.iconColor}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{capability.title}</h3>
                      <p className="text-muted-foreground mb-6 flex-grow">{capability.description}</p>
                      
                      {/* Feature List */}
                      <div className="space-y-2">
                        {capability.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AnimatedFeatureCard>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Call to Action Section */}
        <ScrollReveal>
          <section className="py-24 bg-gradient-to-br from-primary/5 via-primary-light/5 to-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl" />
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Modernize Your Modeling?</h2>
                <p className="text-xl text-muted-foreground mb-10">
                  Join the next generation of GCC real estate professionals using precision-grade modeling infrastructure.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                      Request Demo
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold">
                      Contact Sales
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </EnhancedMarketingLayout>
  );
}