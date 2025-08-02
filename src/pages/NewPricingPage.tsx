import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Check,
  X,
  Star,
  Shield,
  Globe2,
  Clock,
  Users,
  Zap,
  ArrowRight,
  Crown,
  Building2,
  CalendarDays,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { EnhancedMarketingLayout } from "@/components/marketing/EnhancedMarketingLayout";
import { formatCurrency } from "@/lib/formatNumber";

export default function NewPricingPage() {
  const { t, i18n } = useTranslation('common');
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Pricing | Feasly - Simple pricing for powerful modeling";
  }, []);

  const plans = [
    {
      name: "Starter",
      price: formatCurrency(299, 'AED', i18n.language),
      period: "/ month (ex VAT)",
      description: "Perfect for individual developers and small teams",
      features: [
        "1 user seat",
        "Basic modeling only", 
        "Excel import (up to 10MB)",
        ".edmf file support",
        "Standard templates",
        "Email support",
        "Basic reporting"
      ],
      limitations: [
        "No scenario planning",
        "No Zakat engine",
        "No Arabic interface", 
        "No custom branding"
      ],
      cta: t('cta.joinEarly'),
      popular: false,
      icon: Users
    },
    {
      name: "Pro",
      price: formatCurrency(299, 'AED', i18n.language),
      period: "/ month (ex VAT)",
      description: "Full feature access for growing teams",
      features: [
        "5 user seats",
        "Full feature access",
        "Unlimited file imports",
        "Scenario planning (base, pessimistic, VE)",
        "Zakat & GCC tax engine",
        "Arabic-first interface",
        "Advanced reporting",
        "Priority support",
        "Custom templates",
        "API access",
        "Advanced analytics"
      ],
      limitations: [],
      cta: t('cta.joinEarly'),
      popular: true,
      icon: Star
    },
    {
      name: "Enterprise",
      price: "Request Pricing",
      period: "",
      description: "Sovereign-grade deployment for large organizations", 
      features: [
        "Unlimited users",
        "Custom GCC hosting",
        "Dedicated onboarding",
        "White-label solution",
        "Custom integrations",
        "24/7 dedicated support",
        "SLA guarantees",
        "Advanced security",
        "Compliance reporting",
        "Custom workflows",
        "Training programs",
        "Regional data sovereignty"
      ],
      limitations: [],
      cta: "Book a demo",
      popular: false,
      icon: Crown
    }
  ];

  const enterpriseFeatures = [
    {
      title: "Saudi in-Kingdom hosting",
      description: "STC Cloud, DETASAD",
      icon: Globe2
    },
    {
      title: "DIFC compliance",
      description: "UAE regulatory requirements",
      icon: Shield
    },
    {
      title: "Qatar Financial Centre",
      description: "QFC requirements",
      icon: Building2
    },
    {
      title: "Bahrain regulatory",
      description: "Full regulatory alignment",
      icon: Check
    }
  ];

  const enterpriseSupport = [
    "Dedicated customer success manager",
    "24/7 technical support",
    "Custom training programs", 
    "White-label deployment options"
  ];

  const faqs = [
    {
      question: "When will Feasly be available?",
      answer: "We're currently in private beta with select GCC partners. Public launch is planned for Q2 2025. Join our waitlist to get early access."
    },
    {
      question: "Do you support regional hosting requirements?",
      answer: "Yes, our Enterprise plan includes sovereign hosting options in KSA (STC Cloud, DETASAD), UAE (DIFC compliance), and other GCC countries."
    },
    {
      question: "Can I import my existing EstateMaster files?",
      answer: "Absolutely. Feasly natively supports .edmf files from EstateMaster and provides intelligent migration tools to preserve your existing models."
    },
    {
      question: "What languages are supported?",
      answer: "Feasly offers full Arabic and English language support with proper RTL layout, localized number formats, and cultural adaptations for GCC markets."
    },
    {
      question: "Is there a free trial?",
      answer: "We offer personalized demos for qualified prospects. Enterprise customers receive a 30-day pilot program with full onboarding support."
    },
    {
      question: t('pricing.faq.afterTrialQ'),
      answer: t('pricing.faq.afterTrialA')
    },
    {
      question: t('pricing.faq.dataQ'),
      answer: t('pricing.faq.dataA')
    }
  ];

  return (
    <EnhancedMarketingLayout>
      <div className="flex flex-col relative">
        {/* Premium Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.1),transparent_50%)] pointer-events-none" />
        
        {/* Hero Section */}
        <section className="py-24 relative z-10 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-8">
                <Zap className="h-4 w-4" />
                Simple & Transparent
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl/tight md:text-6xl font-bold text-foreground max-w-4xl mx-auto mb-6">
                Simple pricing for
                <br />
                <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent">
                  powerful modeling
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                Choose the plan that fits your needs. All plans include our core modeling engine with GCC-specific features and regional compliance.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Pricing Plans */}
        <ScrollReveal>
          <section className="py-12 relative z-10">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`relative ${plan.popular ? 'md:-mt-8' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                          Most Popular
                        </div>
                      </div>
                    )}
                    
                    <Card className={`h-full p-8 ${plan.popular ? 'border-primary/50 shadow-lg shadow-primary/10' : 'border-border/50'}`}>
                      <div className="flex flex-col h-full">
                        {/* Plan Header */}
                        <div className="text-center mb-8">
                          <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                            <plan.icon className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                          <div className="text-3xl font-bold text-primary mb-2">
                            {plan.price}
                            {plan.period && <span className="text-sm font-normal text-muted-foreground"> {plan.period}</span>}
                          </div>
                          <p className="text-muted-foreground">{plan.description}</p>
                        </div>

                        {/* Features */}
                        <div className="flex-grow">
                          <div className="space-y-3 mb-6">
                            {plan.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-3">
                                <Check className="h-4 w-4 text-success flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {/* Limitations */}
                          {plan.limitations.length > 0 && (
                            <div className="space-y-3 mb-6">
                              {plan.limitations.map((limitation, limitationIndex) => (
                                <div key={limitationIndex} className="flex items-center gap-3">
                                  <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{limitation}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CTA */}
                        {plan.cta === "Book a demo" ? (
                          <Dialog open={isCalendlyOpen} onOpenChange={setIsCalendlyOpen}>
                            <DialogTrigger asChild>
                              <Button 
                                className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                                variant={plan.popular ? 'default' : 'outline'}
                              >
                                <CalendarDays className="mr-2 h-4 w-4" />
                                {plan.cta}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl h-[600px]">
                              <DialogHeader>
                                <DialogTitle>Book a Demo</DialogTitle>
                              </DialogHeader>
                              <div className="flex-1">
                                <iframe
                                  src={import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/feasly-demo"}
                                  width="100%"
                                  height="100%"
                                  frameBorder="0"
                                  title="Book a Demo"
                                  className="rounded-lg"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button 
                            className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                            variant={plan.popular ? 'default' : 'outline'}
                          >
                            {plan.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Enterprise Features Section */}
        <ScrollReveal>
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-6">Enterprise-Grade Security & Compliance</h2>
                  <p className="text-xl text-muted-foreground">
                    Built for sovereign-scale deployments with regional data policies and custom SLAs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                  {/* Regional Hosting */}
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Regional Hosting</h3>
                    <div className="space-y-4">
                      {enterpriseFeatures.map((feature, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border/50">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <feature.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enterprise Support */}
                  <div>
                    <h3 className="text-2xl font-bold mb-6">Enterprise Support</h3>
                    <div className="space-y-3">
                      {enterpriseSupport.map((support, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-success flex-shrink-0" />
                          <span>{support}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Savings Banner */}
                <div className="mt-8 max-w-2xl mx-auto">
                  <Alert className="border-primary/30 bg-primary/5">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-primary-foreground">
                      Need annual billing? Save 16 percent with yearly subscriptions.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* FAQ Section */}
        <ScrollReveal>
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-6">Frequently Asked Questions</h2>
                </div>

                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-6 border-border/50">
                        <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Final CTA */}
        <ScrollReveal>
          <section className="py-24 bg-gradient-to-br from-primary/5 via-primary-light/5 to-background relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-light/10 rounded-full blur-3xl" />
            
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Modeling?</h2>
                <p className="text-xl text-muted-foreground mb-10">
                  Join the waitlist and be among the first to experience the future of GCC real estate modeling.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                      Join Waitlist
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