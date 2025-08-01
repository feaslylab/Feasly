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
      {/* Premium Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary-light)/0.08),transparent_50%)] pointer-events-none" />
      
      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center relative z-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-8">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Built in the GCC, for the GCC
            </div>

            {/* Logo */}
            <div className="mb-8">
              <img 
                src="/lovable-uploads/9c1fb9f6-2ebe-4aca-a9d2-295f77d9d4ba.png" 
                alt="Feasly Logo" 
                className="w-24 h-24 mx-auto drop-shadow-lg"
              />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl/tight md:text-7xl font-bold text-foreground max-w-4xl mx-auto mb-6">
              Modern Modeling Infrastructure
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent">
                for the GCC
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
              Feasly replaces spreadsheets, outdated tools, and consulting bottlenecks with precision-grade capital modeling — built in the Gulf, for the Gulf.
            </p>

            {/* CTA */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                Register Interest
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Feasly Section */}
      <ScrollReveal>
        <section className="py-24 bg-muted/30 relative">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Feasly?</h2>
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
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Built For</h2>
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
                      <h3 className="text-2xl font-bold mb-3">{client.title}</h3>
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
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Regional Trust & Deployment</h2>
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
                    <h3 className="text-lg font-bold mb-2">{region.country}</h3>
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
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Platform Vision</h2>
                  <h3 className="text-2xl font-semibold text-primary mb-6">From Excel to Giga-City Consolidation</h3>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Transform legacy modeling workflows into sovereign-scale infrastructure. Feasly bridges the gap between spreadsheet limitations and enterprise-grade financial modeling requirements.
                  </p>
                  <Button variant="outline" size="lg" className="group">
                    Explore the Platform
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
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
                  <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-3 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
                      <span className="text-sm font-medium">GCC Ready</span>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-3 shadow-lg">
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
    </div>
  );
}