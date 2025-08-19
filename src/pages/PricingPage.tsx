import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { AnimatedBackground } from "@/components/marketing/AnimatedBackground";
import { PulsingButton } from "@/components/marketing/AnimatedCTA";
import { motion } from "framer-motion";
// Enhanced Animations
import { ScrollProgressiveReveal, ScrollSection, ScrollCard, ScrollTextReveal } from "@/components/marketing/ScrollProgressiveReveal";
import { CursorTrail, InteractiveBlob } from "@/components/marketing/NextLevelAnimations";
import { MagneticButton, MorphingBackground } from "@/components/marketing/EnhancedAnimations";
import { SpotlightCard, TypewriterText } from "@/components/marketing/AdvancedEffects";
import {
  ArrowRight,
  Check,
  Building2,
  Users,
  Crown,
  Zap,
  Shield,
  Headphones,
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Solo analysts",
    price: "299 AED",
    period: "month",
    icon: Building2,
    color: "from-muted/20 to-muted/40",
    popular: false,
    features: [
      "1 project",
      "1 user",
      "Basic Financial Modeling",
      "3 Scenarios per Project",
      "Standard Templates",
      "PDF Export",
      "Community Support",
      "Basic Compliance Checks",
    ],
    cta: "Start free trial",
    ctaVariant: "outline" as const,
  },
  {
    name: "Growth",
    description: "Small teams",
    price: "999 AED",
    period: "month",
    icon: Users,
    color: "from-primary/20 to-primary-light/20",
    popular: true,
    features: [
      "10 projects",
      "5 users",
      "Advanced Financial Modeling",
      "Unlimited Scenarios",
      "AI-Powered Insights",
      "Smart Alerts & Monitoring",
      "Advanced Compliance (Zakat, Escrow)",
      "Team Collaboration",
      "Custom Export Templates",
      "Version Control & Audit Logs",
      "Priority Support",
      "Advanced Reporting",
    ],
    cta: "Start free trial",
    ctaVariant: "default" as const,
  },
  {
    name: "Enterprise",
    description: "Giga-projects",
    price: "Custom",
    period: "",
    icon: Crown,
    color: "from-secondary/20 to-accent/20",
    popular: false,
    features: [
      "Unlimited",
      "SLA",
      "Private cloud",
      "Custom Integrations",
      "White-label Solutions",
      "Dedicated Account Manager",
      "Custom Training & Onboarding",
      "SLA Guarantees",
      "Advanced Security & Compliance",
      "Custom Workflows",
      "API Access",
      "Premium Support",
      "Custom Reporting & Analytics",
    ],
    cta: "Request Custom Quote",
    ctaVariant: "outline" as const,
  },
];

const features = [
  {
    category: "Core Features",
    items: [
      { name: "Financial Modeling", pilot: true, pro: true, enterprise: true },
      { name: "Scenario Analysis", pilot: "3 scenarios", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Projects", pilot: "1 project", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Export Options", pilot: "PDF only", pro: "PDF + Excel", enterprise: "PDF + Excel + Custom" },
    ],
  },
  {
    category: "Advanced Features",
    items: [
      { name: "AI Insights", pilot: false, pro: true, enterprise: true },
      { name: "Smart Alerts", pilot: false, pro: true, enterprise: true },
      { name: "Team Collaboration", pilot: false, pro: true, enterprise: true },
      { name: "Version Control", pilot: false, pro: true, enterprise: true },
      { name: "Custom Integrations", pilot: false, pro: false, enterprise: true },
      { name: "API Access", pilot: false, pro: false, enterprise: true },
    ],
  },
  {
    category: "Compliance & Support",
    items: [
      { name: "Basic Compliance", pilot: true, pro: true, enterprise: true },
      { name: "Saudi Zakat & Escrow", pilot: false, pro: true, enterprise: true },
      { name: "Support Level", pilot: "Community", pro: "Priority", enterprise: "Premium + Dedicated" },
      { name: "SLA Guarantee", pilot: false, pro: false, enterprise: true },
    ],
  },
];

export default function PricingPage() {
  const { t } = useTranslation('marketing');
  
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Pricing | Feasly";
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
                  text="Simple pricing that scales with your team"
                  className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
                  cascade={true}
                />
                <TypewriterText 
                  text="Choose the plan that fits your development portfolio. Start free, scale as you grow."
                  className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto"
                  speed={40}
                />
              </div>
            </ScrollProgressiveReveal>
          </div>
        </ScrollSection>

        {/* Pricing Cards */}
        <ScrollSection background="muted" className="py-20">
          <div className="container mx-auto px-4">
            <ScrollProgressiveReveal direction="up" delay={0.3} stagger={true} staggerDelay={0.2}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan, index) => (
                  <ScrollCard key={index} index={index} totalCards={plans.length}>
                    <SpotlightCard 
                      className={`relative rounded-xl border ${
                        plan.popular 
                          ? 'border-primary shadow-xl lg:scale-105' 
                          : 'border-border'
                      } bg-background p-6 h-full flex flex-col`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                          {t('common.mostPopular')}
                        </Badge>
                      )}
                      
                      <div className="text-center mb-6 flex-shrink-0">
                        <div className={`bg-gradient-to-r ${plan.color} p-3 rounded-full w-fit mx-auto mb-4`}>
                          <plan.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                        <p className="text-muted-foreground mb-3 text-sm">{plan.description}</p>
                        <div className="mb-4">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          {plan.period && (
                            <span className="text-muted-foreground ml-1 text-sm">/{plan.period}</span>
                          )}
                        </div>
                        <MagneticButton strength={0.1}>
                          <Button 
                            className="w-full" 
                            variant={plan.ctaVariant}
                            size="sm"
                            asChild
                          >
                            <Link to={plan.name === 'Enterprise' ? "#contact" : "/welcome"} aria-label={plan.cta}>
                              {plan.cta}
                            </Link>
                          </Button>
                        </MagneticButton>
                      </div>

                      <div className="space-y-2 flex-grow">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                            <span className="text-xs leading-relaxed">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </SpotlightCard>
                  </ScrollCard>
                ))}
              </div>
            </ScrollProgressiveReveal>
            
            {/* Additional info below pricing */}
              <ScrollProgressiveReveal direction="fade" delay={0.8}>
                <div className="max-w-4xl mx-auto text-center mt-12 space-y-4">
                  <p className="text-muted-foreground text-sm">{t('pricing.faq.freeTrial')} {t('pricing.faq.exportExcel')}</p>
                </div>
              </ScrollProgressiveReveal>
          </div>
        </ScrollSection>

        {/* Feature Comparison Table */}
        <ScrollSection className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <ScrollProgressiveReveal direction="up" delay={0.2}>
                <div className="text-center mb-16">
                  <ScrollTextReveal 
                    text="Detailed Feature Comparison"
                    className="text-3xl md:text-4xl font-bold mb-4"
                    cascade={true}
                  />
                  <p className="text-xl text-muted-foreground">
                    See exactly what's included in each plan
                  </p>
                </div>
              </ScrollProgressiveReveal>

              <ScrollProgressiveReveal direction="scale" delay={0.4}>
                <div className="overflow-x-auto">
                  <SpotlightCard className="border border-border rounded-lg overflow-hidden bg-background">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 md:p-4 font-medium text-sm">Features</th>
                          <th className="text-center p-3 md:p-4 font-medium text-sm">Starter</th>
                          <th className="text-center p-3 md:p-4 font-medium text-sm">Pro</th>
                          <th className="text-center p-3 md:p-4 font-medium text-sm">Enterprise</th>
                        </tr>
                      </thead>
                      <tbody>
                        {features.map((category, categoryIndex) => (
                          <React.Fragment key={categoryIndex}>
                            <tr className="bg-muted/50">
                              <td colSpan={4} className="p-3 md:p-4 font-semibold text-xs uppercase tracking-wide">
                                {category.category}
                              </td>
                            </tr>
                            {category.items.map((item, itemIndex) => (
                              <tr key={itemIndex} className="border-t border-border hover:bg-muted/20 transition-colors">
                                <td className="p-3 md:p-4 text-sm">{item.name}</td>
                                <td className="p-3 md:p-4 text-center">
                                  {typeof item.pilot === 'boolean' ? (
                                    item.pilot ? (
                                      <Check className="h-4 w-4 text-success mx-auto" />
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )
                                  ) : (
                                    <span className="text-xs">{item.pilot}</span>
                                  )}
                                </td>
                                <td className="p-3 md:p-4 text-center">
                                  {typeof item.pro === 'boolean' ? (
                                    item.pro ? (
                                      <Check className="h-4 w-4 text-success mx-auto" />
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )
                                  ) : (
                                    <span className="text-xs">{item.pro}</span>
                                  )}
                                </td>
                                <td className="p-3 md:p-4 text-center">
                                  {typeof item.enterprise === 'boolean' ? (
                                    item.enterprise ? (
                                      <Check className="h-4 w-4 text-success mx-auto" />
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )
                                  ) : (
                                    <span className="text-xs">{item.enterprise}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </SpotlightCard>
                </div>
              </ScrollProgressiveReveal>
            </div>
          </div>
        </ScrollSection>

        {/* FAQ Section */}
        <ScrollSection background="muted" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollProgressiveReveal direction="up" delay={0.2}>
                <div className="text-center mb-16">
                  <ScrollTextReveal 
                    text="Frequently Asked Questions"
                    className="text-3xl md:text-4xl font-bold mb-4"
                    cascade={true}
                  />
                </div>
              </ScrollProgressiveReveal>

              <ScrollProgressiveReveal direction="up" delay={0.4} stagger={true} staggerDelay={0.1}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <ScrollCard index={0} totalCards={6}>
                      <SpotlightCard className="p-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg h-full">
                        <h3 className="text-lg font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
                        <p className="text-muted-foreground text-sm">Yes, you can change your plan at any time. Changes take effect immediately.</p>
                      </SpotlightCard>
                    </ScrollCard>
                    <ScrollCard index={1} totalCards={6}>
                      <SpotlightCard className="p-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg h-full">
                        <h3 className="text-lg font-semibold mb-2">Is there a free trial for Pro?</h3>
                        <p className="text-muted-foreground text-sm">Yes, we offer a 14-day free trial for the Pro plan with full access to all features.</p>
                      </SpotlightCard>
                    </ScrollCard>
                    <ScrollCard index={2} totalCards={6}>
                      <SpotlightCard className="p-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg h-full">
                        <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                        <p className="text-muted-foreground text-sm">We accept all major credit cards and bank transfers for Enterprise customers.</p>
                      </SpotlightCard>
                    </ScrollCard>
                  </div>
                  <div className="space-y-6">
                    <ScrollCard index={3} totalCards={6}>
                      <SpotlightCard className="p-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg h-full">
                        <h3 className="text-lg font-semibold mb-2">Do you offer custom enterprise solutions?</h3>
                        <p className="text-muted-foreground text-sm">Yes, our Enterprise plan includes custom integrations, workflows, and dedicated support.</p>
                      </SpotlightCard>
                    </ScrollCard>
                    <ScrollCard index={4} totalCards={6}>
                      <SpotlightCard className="p-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg h-full">
                        <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
                        <p className="text-muted-foreground text-sm">Absolutely. We use enterprise-grade security with encryption at rest and in transit.</p>
                      </SpotlightCard>
                    </ScrollCard>
                    <ScrollCard index={5} totalCards={6}>
                      <SpotlightCard className="p-6 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg h-full">
                        <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
                        <p className="text-muted-foreground text-sm">Yes, you can cancel your subscription at any time with no cancellation fees.</p>
                      </SpotlightCard>
                    </ScrollCard>
                  </div>
                </div>
              </ScrollProgressiveReveal>
            </div>
          </div>
        </ScrollSection>

        {/* CTA Section */}
        <ScrollSection className="py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollProgressiveReveal direction="scale" delay={0.2}>
              <div className="max-w-4xl mx-auto text-center">
                <ScrollTextReveal 
                  text="Ready to Get Started?"
                  className="text-3xl md:text-4xl font-bold mb-6"
                  cascade={true}
                />
                <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                  Join developers across the GCC who trust Feasly for their real estate financial modeling.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <div className="max-w-md mx-auto">
                    <WaitlistForm 
                      placeholder="Enter your email to get started"
                      buttonText="Join Waitlist"
                      className="justify-center"
                    />
                  </div>
                  <MagneticButton strength={0.1}>
                    <Button variant="outline" size="lg" asChild>
                      <Link to="#contact">
                        Contact Sales
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