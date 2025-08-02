import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { AnimatedFeatureCard } from "@/components/marketing/AnimatedFeatureCard";
import { SheetCompare } from "@/components/marketing/SheetCompare";
import { motion } from "framer-motion";
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
  Brain,
  Info
} from "lucide-react";

const features = [
  {
    title: "Smart Excel & EDMF import",
    benefit: "Upload raw files. Our AI maps every cell.",
    icon: FileText,
    color: "from-primary/20 to-primary-light/20",
    iconColor: "text-primary",
  },
  {
    title: "Multi-scenario modelling",
    benefit: "Flip Base, Optimistic, Pessimistic in one click.",
    icon: BarChart4,
    color: "from-success/20 to-success-light/20",
    iconColor: "text-success",
  },
  {
    title: "Saudi compliance & Zakat",
    benefit: "Built-in escrow and tax rules.",
    icon: ShieldCheck,
    color: "from-success/20 to-success-light/20",
    iconColor: "text-success",
  },
  {
    title: "AI Risk Flags",
    benefit: "Identifies risky assumptions before they cost you.",
    icon: Brain,
    color: "from-warning/20 to-warning-light/20",
    iconColor: "text-warning",
  },
  {
    title: "Audit-ready version control",
    benefit: "Every change tracked, time-stamped.",
    icon: Layers,
    color: "from-secondary/20 to-accent/20",
    iconColor: "text-secondary",
  },
  {
    title: "Portfolio consolidation",
    benefit: "View KPIs across projects.",
    icon: Building2,
    color: "from-primary/20 to-secondary/20",
    iconColor: "text-primary",
  },
  {
    title: "Investor-ready exports",
    benefit: "PDF, Excel, Arabic or English.",
    icon: Download,
    color: "from-primary/20 to-primary-light/20",
    iconColor: "text-primary",
  },
  {
    title: "Team Collaboration",
    benefit: "Keep everyone aligned and informed",
    icon: Users,
    color: "from-success/20 to-primary/20",
    iconColor: "text-success",
  },
];

export default function FeaturesPage() {
  const { t } = useTranslation('common');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Features | Feasly";
  }, []);

  return (
    <MarketingLayout>
      <div className="flex flex-col">
        {/* Saudi Compliance Banner */}
        <section className="bg-success/5 border-b border-success/20">
          <div className="container mx-auto px-4 py-4">
            <Alert className="border-success/30 bg-success/10">
              <Info className="h-4 w-4 text-success" />
              <AlertDescription className="text-success-foreground">
                {t('features.saudiBanner')}
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32">
          <div className="container mx-auto px-4">
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
        <ScrollReveal>
          <section className="py-20 bg-muted/50" id="features">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                  <AnimatedFeatureCard key={feature.title} index={index}>
                    <div className={`p-5 rounded-2xl mb-6 w-fit bg-gradient-to-br ${feature.color}`}>
                      <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.benefit}</p>
                  </AnimatedFeatureCard>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Comparison Table */}
        <ScrollReveal>
          <SheetCompare />
        </ScrollReveal>

        {/* CTA Section */}
        <ScrollReveal>
          <section className="py-20 bg-gradient-to-br from-primary/5 via-primary-light/5 to-background">
            <div className="container mx-auto px-4">
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
                      {t('cta.joinEarly')} <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
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
        </ScrollReveal>
      </div>
    </MarketingLayout>
  );
}