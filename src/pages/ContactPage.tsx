import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Building2,
  Users,
  Shield,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { EnhancedMarketingLayout } from "@/components/marketing/EnhancedMarketingLayout";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    company: "",
    message: ""
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact | Feasly - Ready to learn more?";
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const contactInfo = [
    {
      title: "Email",
      value: "hello@feasly.com",
      description: "Send us an email anytime",
      icon: Mail
    },
    {
      title: "Headquarters", 
      value: "Dubai, UAE",
      description: "Built in the heart of the GCC",
      icon: MapPin
    },
    {
      title: "Support",
      value: "Available 24/7",
      description: "Enterprise customers get priority support",
      icon: Clock
    }
  ];

  const offices = [
    { city: "Dubai, UAE", status: "Headquarters", available: true },
    { city: "Riyadh, KSA", status: "Regional Office", available: true },
    { city: "Doha, Qatar", status: "Coming Soon", available: false },
    { city: "Manama, Bahrain", status: "Coming Soon", available: false }
  ];

  const whyContactReasons = [
    {
      title: "Personalized Demo",
      description: "See how Feasly works with your actual data and modeling requirements. We'll show you real ROI potential for your organization.",
      icon: Building2
    },
    {
      title: "Implementation Guidance",
      description: "Our team has deep GCC market expertise and can guide you through compliance requirements and regional best practices.",
      icon: Users
    },
    {
      title: "Custom Solutions",
      description: "Enterprise customers get tailored deployment options, including sovereign hosting and white-label solutions.",
      icon: Shield
    },
    {
      title: "Production Ready",
      description: "Built for enterprise use with proven reliability and performance across GCC markets.",
      icon: Star
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
                <Mail className="h-4 w-4" />
                Get in Touch
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl/tight md:text-6xl font-bold text-foreground max-w-4xl mx-auto mb-6">
                Ready to
                <br />
                <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent">
                  learn more?
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                Whether you're ready to modernize your modeling workflow or have questions about our platform, we're here to help you succeed.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <ScrollReveal>
          <section className="py-12 relative z-10">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="p-6 text-center border-border/50 hover:shadow-lg transition-all duration-300">
                      <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                      <p className="text-primary font-medium mb-1">{info.value}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Contact Form & Office Locations */}
        <ScrollReveal>
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Contact Form */}
                <div>
                  <h2 className="text-3xl font-bold mb-4">Send us a message</h2>
                  <p className="text-muted-foreground mb-8">We'll get back to you within 24 hours</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Input
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        name="workEmail"
                        type="email"
                        placeholder="Work Email"
                        value={formData.workEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        name="company"
                        placeholder="Company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        name="message"
                        placeholder="Message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Submit Inquiry
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </div>

                {/* Office Locations */}
                <div>
                  <h2 className="text-3xl font-bold mb-4">Office Locations</h2>
                  <p className="text-muted-foreground mb-8">Regional presence across the GCC</p>
                  
                  <div className="space-y-4">
                    {offices.map((office, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-card border border-border/50">
                        <div>
                          <h3 className="font-semibold">{office.city}</h3>
                          <p className="text-sm text-muted-foreground">{office.status}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          office.available 
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {office.available ? 'Available' : 'Coming Soon'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Why Contact Us Section */}
        <ScrollReveal>
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-6">Why Reach Out to Feasly?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {whyContactReasons.map((reason, index) => (
                    <motion.div
                      key={reason.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-6 border-border/50 hover:shadow-lg transition-all duration-300 h-full">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-2xl bg-primary/10 flex-shrink-0">
                            <reason.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-3">{reason.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{reason.description}</p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </EnhancedMarketingLayout>
  );
}