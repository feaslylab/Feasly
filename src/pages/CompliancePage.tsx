import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Shield,
  Globe2,
  Lock,
  FileCheck,
  Building2,
  Crown,
  CheckCircle,
  Server,
  Database,
  Key
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { EnhancedMarketingLayout } from "@/components/marketing/EnhancedMarketingLayout";

export default function CompliancePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Compliance | Feasly - Built in the GCC. Ready for Sovereign Hosting.";
  }, []);

  const complianceRegions = [
    {
      country: "Saudi Arabia (KSA)",
      flag: "🇸🇦",
      description: "In-Kingdom hosting with STC Cloud and DETASAD infrastructure",
      features: [
        "Saudi Data & AI Authority (SDAIA) compliance",
        "Personal Data Protection Law (PDPL) adherence", 
        "In-Kingdom data residency requirements",
        "Arabic language interface requirements",
        "Local hosting partner certification"
      ]
    },
    {
      country: "UAE (DIFC & Mainland)",
      flag: "🇦🇪", 
      description: "Dubai International Financial Centre compliance and UAE data protection",
      features: [
        "DIFC Data Protection Law compliance",
        "UAE Federal Data Protection Law",
        "Dubai Financial Services Authority (DFSA) requirements",
        "Emirates ID integration capabilities",
        "Local cloud infrastructure partnerships"
      ]
    },
    {
      country: "Qatar",
      flag: "🇶🇦",
      description: "Qatar Financial Centre regulations and national data protection",
      features: [
        "Qatar Financial Centre Authority (QFCA) compliance",
        "Personal Data Protection Law (Law No. 13/2016)",
        "Qatar Central Bank regulations",
        "Arabic and English interface parity",
        "Local data sovereignty requirements"
      ]
    },
    {
      country: "Bahrain",
      flag: "🇧🇭",
      description: "Central Bank of Bahrain regulations and data protection compliance",
      features: [
        "Central Bank of Bahrain (CBB) requirements",
        "Personal Data Protection Law compliance",
        "Bahrain Economic Development Board guidelines",
        "Islamic finance principles compatibility",
        "Regional hosting infrastructure"
      ]
    }
  ];

  const securityFeatures = [
    {
      title: "Data Encryption",
      description: "End-to-end encryption with AES-256 for data at rest and in transit",
      icon: Lock
    },
    {
      title: "Access Controls",
      description: "Role-based access control (RBAC) with multi-factor authentication",
      icon: Key
    },
    {
      title: "Audit Trails", 
      description: "Comprehensive logging and audit trails for regulatory compliance",
      icon: FileCheck
    },
    {
      title: "Data Residency",
      description: "Configurable data residency options to meet sovereign requirements",
      icon: Database
    }
  ];

  const certifications = [
    "ISO 27001 (Information Security Management)",
    "SOC 2 Type II (Service Organization Control)",
    "GDPR Compliance (General Data Protection Regulation)",
    "CCPA Compliance (California Consumer Privacy Act)",
    "PCI DSS Level 1 (Payment Card Industry Data Security)"
  ];

  const hostingOptions = [
    {
      title: "Private Cloud",
      description: "Dedicated infrastructure within your chosen GCC country",
      icon: Server
    },
    {
      title: "Hybrid Deployment", 
      description: "Combination of local and regional hosting",
      icon: Globe2
    },
    {
      title: "On-Premises",
      description: "Complete on-site deployment for maximum control",
      icon: Building2
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
                <Shield className="h-4 w-4" />
                Sovereign-Grade Security
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl/tight md:text-6xl font-bold text-foreground max-w-4xl mx-auto mb-6">
                Built in the GCC.
                <br />
                <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent">
                  Ready for Sovereign Hosting.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-12">
                Feasly is built to comply with regional data policies, including sovereign hosting requirements and cultural adaptations for government and institutional use across the Gulf.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Regional Compliance Framework */}
        <ScrollReveal>
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-6">Regional Compliance Framework</h2>
                  <p className="text-xl text-muted-foreground">
                    Comprehensive compliance coverage across all GCC member states with local hosting and regulatory adherence
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {complianceRegions.map((region, index) => (
                    <motion.div
                      key={region.country}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-6 border-border/50 hover:shadow-lg transition-all duration-300 h-full">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="text-3xl">{region.flag}</div>
                          <div>
                            <h3 className="text-xl font-bold mb-2">{region.country}</h3>
                            <p className="text-muted-foreground">{region.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {region.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start gap-3">
                              <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Enterprise Security Features */}
        <ScrollReveal>
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-6">Enterprise Security Features</h2>
                  <p className="text-xl text-muted-foreground">
                    Military-grade security architecture designed for sovereign-scale deployments
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {securityFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Card className="p-6 text-center border-border/50 hover:shadow-lg transition-all duration-300 h-full">
                        <div className="p-3 rounded-2xl bg-primary/10 w-fit mx-auto mb-4">
                          <feature.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Industry Certifications */}
        <ScrollReveal>
          <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-6">Industry Certifications & Standards</h2>
                  <p className="text-xl text-muted-foreground">
                    Feasly meets or exceeds international security and compliance standards
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certifications.map((certification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border/50">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="font-medium">{certification}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Data Sovereignty Section */}
        <ScrollReveal>
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl font-bold mb-6">Data Sovereignty & Hosting Options</h2>
                  <p className="text-xl text-muted-foreground">
                    Your data stays where you need it to, with hosting options designed for each GCC member state's requirements
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {hostingOptions.map((option, index) => (
                    <motion.div
                      key={option.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="p-6 text-center border-border/50 hover:shadow-lg transition-all duration-300 h-full">
                        <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto mb-6">
                          <option.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{option.title}</h3>
                        <p className="text-muted-foreground">{option.description}</p>
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