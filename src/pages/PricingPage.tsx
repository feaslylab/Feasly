import React from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
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
    description: "Perfect for individual analysts",
    price: "TBD",
    period: "",
    icon: Building2,
    color: "from-muted/20 to-muted/40",
    popular: false,
    features: [
      "1 Active Project",
      "Basic Financial Modeling",
      "3 Scenarios per Project",
      "Standard Templates",
      "PDF Export",
      "Community Support",
      "Basic Compliance Checks",
    ],
    cta: "Start Free",
    ctaVariant: "outline" as const,
  },
  {
    name: "Pro",
    description: "Consultants + small firms",
    price: "TBD",
    period: "",
    icon: Users,
    color: "from-primary/20 to-primary-light/20",
    popular: true,
    features: [
      "Unlimited Projects",
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
    cta: "Start Free",
    ctaVariant: "default" as const,
  },
  {
    name: "Enterprise",
    description: "Multi-project teams",
    price: "Custom",
    period: "",
    icon: Crown,
    color: "from-secondary/20 to-accent/20",
    popular: false,
    features: [
      "Everything in Pro",
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
    cta: "Request Proposal",
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
  return (
    <MarketingLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Simple pricing that scales with your team
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Choose the plan that fits your development portfolio. Start free, scale as you grow.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-xl border ${
                    plan.popular 
                      ? 'border-primary shadow-xl scale-105' 
                      : 'border-border'
                  } bg-background p-8 transition-all duration-300 hover:shadow-lg`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  )}
                  
                  <div className="text-center mb-8">
                    <div className={`bg-gradient-to-r ${plan.color} p-4 rounded-full w-fit mx-auto mb-4`}>
                      <plan.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground ml-2">/{plan.period}</span>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      variant={plan.ctaVariant}
                      asChild
                    >
                      <Link to={plan.name === 'Enterprise' ? '#contact' : '/welcome'}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Additional info below pricing */}
            <div className="max-w-4xl mx-auto text-center mt-16 space-y-4">
              <p className="text-muted-foreground">Free onboarding for early users</p>
              <p className="text-muted-foreground">No credit card required to get started</p>
              <p className="text-muted-foreground">Bulk licensing available for enterprise clients</p>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Detailed Feature Comparison
                </h2>
                <p className="text-xl text-muted-foreground">
                  See exactly what's included in each plan
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border border-border rounded-lg overflow-hidden">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4 font-medium">Features</th>
                      <th className="text-center p-4 font-medium">Starter</th>
                      <th className="text-center p-4 font-medium">Pro</th>
                      <th className="text-center p-4 font-medium">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((category, categoryIndex) => (
                      <React.Fragment key={categoryIndex}>
                        <tr className="bg-muted/50">
                          <td colSpan={4} className="p-4 font-semibold text-sm uppercase tracking-wide">
                            {category.category}
                          </td>
                        </tr>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="border-t border-border">
                            <td className="p-4">{item.name}</td>
                            <td className="p-4 text-center">
                              {typeof item.pilot === 'boolean' ? (
                                item.pilot ? (
                                  <Check className="h-5 w-5 text-success mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )
                              ) : (
                                <span className="text-sm">{item.pilot}</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {typeof item.pro === 'boolean' ? (
                                item.pro ? (
                                  <Check className="h-5 w-5 text-success mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )
                              ) : (
                                <span className="text-sm">{item.pro}</span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              {typeof item.enterprise === 'boolean' ? (
                                item.enterprise ? (
                                  <Check className="h-5 w-5 text-success mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )
                              ) : (
                                <span className="text-sm">{item.enterprise}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
                    <p className="text-muted-foreground">Yes, you can change your plan at any time. Changes take effect immediately.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Is there a free trial for Pro?</h3>
                    <p className="text-muted-foreground">Yes, we offer a 14-day free trial for the Pro plan with full access to all features.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                    <p className="text-muted-foreground">We accept all major credit cards and bank transfers for Enterprise customers.</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Do you offer custom enterprise solutions?</h3>
                    <p className="text-muted-foreground">Yes, our Enterprise plan includes custom integrations, workflows, and dedicated support.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Is my data secure?</h3>
                    <p className="text-muted-foreground">Absolutely. We use enterprise-grade security with encryption at rest and in transit.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Can I cancel anytime?</h3>
                    <p className="text-muted-foreground">Yes, you can cancel your subscription at any time with no cancellation fees.</p>
                  </div>
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
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Join developers across the GCC who trust Feasly for their real estate financial modeling.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="group" asChild>
                  <Link to="/welcome">
                    Start Free <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="#contact">
                    Contact Sales
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