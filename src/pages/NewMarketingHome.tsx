import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Upload,
  FileText,
  Expand,
  LineChart,
  Languages,
  Share2,
  Building2,
  Users,
  Crown,
  MapPin,
  ArrowRight,
  CheckCircle,
  Shield,
  Globe2,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { AnimatedFeatureCard } from "@/components/marketing/AnimatedFeatureCard";
import { WorldClassHero } from "@/components/marketing/WorldClassHero";

export default function NewMarketingHome() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    // Set page title
    document.title = "Feasly | Modern Modeling Infrastructure for the GCC";
  }, []);

  const features = [
    {
      title: "Legacy Integration",
      description: ".edmf and Excel imports parsed in seconds",
      icon: Upload,
      color: "from-primary/10 to-primary-light/10",
      iconColor: "text-primary"
    },
    {
      title: "Scenario Planning", 
      description: "Base, pessimistic, and VE modeling",
      icon: Expand,
      color: "from-success/10 to-success-light/10",
      iconColor: "text-success"
    },
    {
      title: "GCC Compliance",
      description: "Zakat engine and sovereign-ready outputs",
      icon: Shield,
      color: "from-warning/10 to-warning-light/10", 
      iconColor: "text-warning"
    },
    {
      title: "Bilingual Ready",
      description: "Arabic-first layout and reporting",
      icon: Languages,
      color: "from-secondary/10 to-accent/10",
      iconColor: "text-secondary"
    }
  ];

  const clientTypes = [
    {
      title: "Developers",
      description: "Real estate development teams",
      icon: Building2,
      color: "from-primary/5 to-primary-light/5"
    },
    {
      title: "Advisors", 
      description: "Financial consulting firms",
      icon: Users,
      color: "from-success/5 to-success-light/5"
    },
    {
      title: "Sovereign Clients",
      description: "Government and institutional investors", 
      icon: Crown,
      color: "from-warning/5 to-warning-light/5"
    }
  ];

  const regions = [
    { country: "KSA", flag: "🇸🇦", status: "Available" },
    { country: "UAE", flag: "🇦🇪", status: "Available" },
    { country: "Qatar", flag: "🇶🇦", status: "Available" },
    { country: "Bahrain", flag: "🇧🇭", status: "Available" }
  ];

  return (
    <div className="flex flex-col relative">
      {/* World-Class Hero Section */}
      <WorldClassHero />

      {/* Why Feasly Section */}
      <ScrollReveal>
        <section className="py-24 bg-gradient-to-b from-muted/50 via-muted/30 to-background relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Why Feasly?</h2>
              <p className="text-xl text-muted-foreground">
                Transform your data ingestion into structured modeling pipelines with exportable logic
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => (
                <AnimatedFeatureCard key={feature.title} index={index}>
                  <div className={`p-5 rounded-2xl mb-6 w-fit bg-gradient-to-br ${feature.color}`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </AnimatedFeatureCard>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Built For Section */}
      <ScrollReveal>
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Built For</h2>
              <p className="text-xl text-muted-foreground">
                Serving the full spectrum of GCC real estate professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {clientTypes.map((client, index) => (
                <motion.div
                  key={client.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className={`p-8 h-full border-border/50 bg-gradient-to-br ${client.color} hover:shadow-lg transition-all duration-300`}>
                    <div className="flex flex-col items-center text-center">
                      <div className="p-4 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <client.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold mb-3 text-foreground">{client.title}</h3>
                      <p className="text-muted-foreground">{client.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Regional Trust Section */}
      <ScrollReveal>
        <section className="py-24 bg-gradient-to-b from-muted/50 via-muted/30 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Regional Trust & Deployment</h2>
              <p className="text-xl text-muted-foreground">
                Sovereign-ready hosting across the Gulf Cooperation Council
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {regions.map((region, index) => (
                <motion.div
                  key={region.country}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="p-6 text-center border-border/50 hover:shadow-lg transition-all duration-300">
                    <div className="text-4xl mb-4">{region.flag}</div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">{region.country}</h3>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-success/10 text-success border border-success/20">
                      <CheckCircle className="h-3 w-3" />
                      {region.status}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Platform Vision Section */}
      <ScrollReveal>
        <section className="py-24 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Platform Vision</h2>
                  <h3 className="text-2xl font-semibold text-primary mb-6">From Excel to Giga-City Consolidation</h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Transform legacy modeling workflows into sovereign-scale infrastructure. Feasly bridges the gap between spreadsheet limitations and enterprise-grade financial modeling requirements.
                  </p>
                  <Button variant="outline" size="lg" className="group border-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5">
                    Explore the Platform
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl overflow-hidden">
                    <div className="aspect-[4/3] w-full bg-gradient-to-br from-background to-muted/50 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <ArrowRight className="h-6 w-6 text-primary" />
                          <Zap className="h-8 w-8 text-primary" />
                          <ArrowRight className="h-6 w-6 text-primary" />
                          <Globe2 className="h-8 w-8 text-success" />
                        </div>
                        <p className="text-sm text-muted-foreground">Excel → Processing → Sovereign Infrastructure</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating badges */}
                  <div className="absolute -top-4 -right-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                      <span className="text-sm font-medium">GCC Ready</span>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Sovereign Grade</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Premium CTA Section - Enhanced Visibility */}
      <ScrollReveal>
        <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20 dark:from-slate-100 dark:via-slate-50 dark:to-primary/10 relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/20 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white dark:text-slate-900">
                Ready to Transform
                <br />
                <span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                  GCC Real Estate?
                </span>
                <br />
                <span className="text-3xl md:text-4xl text-white/90 dark:text-slate-800 mt-4 block">
                  Ready to kill the spreadsheet?
                </span>
              </h2>
              <p className="text-xl text-white/80 dark:text-slate-700 mb-10 leading-relaxed">
                Join the exclusive beta program. Be among the first to experience sovereign-grade modeling infrastructure.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="px-10 py-6 text-lg font-semibold bg-primary hover:bg-primary-light text-primary-foreground border-2 border-primary-light hover:border-primary shadow-2xl"
                  >
                    Request Beta Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-10 py-6 text-lg font-semibold border-2 border-background/30 bg-background/10 backdrop-blur-sm text-background hover:bg-background/20 hover:border-background/50"
                  >
                    Platform Overview
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
