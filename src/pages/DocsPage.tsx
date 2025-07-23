import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Book,
  FileText,
  Video,
  MessageSquare,
  Download,
  Zap,
  Users,
  Shield,
} from "lucide-react";

const docCategories = [
  {
    title: "Getting Started",
    description: "Everything you need to start modeling with Feasly",
    icon: Zap,
    color: "from-primary/20 to-primary-light/20",
    docs: [
      { name: "Quick Start Guide", description: "Get up and running in 5 minutes" },
      { name: "First Project Setup", description: "Create your first financial model" },
      { name: "Understanding Templates", description: "Choose the right template for your project" },
      { name: "Basic Navigation", description: "Navigate the Feasly interface" },
    ],
  },
  {
    title: "Features & Functionality",
    description: "Detailed guides for every Feasly feature",
    icon: FileText,
    color: "from-success/20 to-success-light/20",
    docs: [
      { name: "Scenario Modeling", description: "Create and compare multiple scenarios" },
      { name: "AI Insights", description: "Understanding AI-powered recommendations" },
      { name: "Compliance Tools", description: "Saudi Zakat and Escrow calculations" },
      { name: "Export & Reporting", description: "Generate professional reports" },
      { name: "Team Collaboration", description: "Work with your team effectively" },
    ],
  },
  {
    title: "Advanced Usage",
    description: "Power user guides and enterprise features",
    icon: Users,
    color: "from-secondary/20 to-accent/20",
    docs: [
      { name: "Custom Integrations", description: "Connect Feasly to your existing systems" },
      { name: "API Documentation", description: "Build custom solutions with our API" },
      { name: "Bulk Data Import", description: "Import data from Excel and other sources" },
      { name: "Custom Templates", description: "Create templates for your organization" },
    ],
  },
];

const resources = [
  {
    title: "Video Tutorials",
    description: "Step-by-step video guides for common tasks",
    icon: Video,
    link: "#videos",
  },
  {
    title: "Community Forum",
    description: "Connect with other Feasly users and experts",
    icon: MessageSquare,
    link: "#community",
  },
  {
    title: "Templates Library",
    description: "Download ready-made templates for different project types",
    icon: Download,
    link: "#templates",
  },
  {
    title: "Compliance Guide",
    description: "Complete guide to GCC real estate compliance",
    icon: Shield,
    link: "#compliance",
  },
];

export default function DocsPage() {
  return (
    <MarketingLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Documentation & Resources
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                Everything you need to master Feasly and build better financial models.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="group" asChild>
                  <Link to="#getting-started">
                    Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="#search">
                    Search Docs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Notice */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-8">
                <Book className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Documentation Coming Soon</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We're working hard to create comprehensive documentation, tutorials, and resources for Feasly users. 
                  This section will be available with our official launch.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button asChild>
                    <Link to="/welcome">
                      Try Feasly Now
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="#notify">
                      Notify Me When Ready
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Preview of Documentation Structure */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                What's Coming in Our Documentation
              </h2>
              <p className="text-xl text-muted-foreground">
                A complete knowledge base to help you succeed with Feasly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {docCategories.map((category, index) => (
                <div key={index} className="bg-background rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                  <div className={`bg-gradient-to-r ${category.color} p-3 rounded-full w-fit mb-4`}>
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                  
                  <div className="space-y-3">
                    {category.docs.map((doc, docIndex) => (
                      <div key={docIndex} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Preview */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Additional Resources
              </h2>
              <p className="text-xl text-muted-foreground">
                Beyond documentation, we're building a complete ecosystem of learning resources.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {resources.map((resource, index) => (
                <div key={index} className="bg-background rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <resource.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{resource.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">{resource.description}</p>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Need Help Getting Started?</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  While we're building our documentation, our team is here to help you succeed with Feasly.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button size="lg" asChild>
                    <Link to="#contact">
                      Contact Support
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/welcome">
                      Start Free Trial
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}