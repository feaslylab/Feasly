import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Image, FileText, Users } from "lucide-react";
import { useEffect } from "react";

export default function PressPage() {
  useEffect(() => {
    document.title = "Press & Media Kit | Feasly";
  }, []);

  const downloadAssets = [
    {
      name: "Feasly Logo Pack",
      description: "Light, dark, and transparent versions",
      icon: <Image className="h-5 w-5" />,
      href: "#logo-pack"
    },
    {
      name: "Product Screenshots",
      description: "High-resolution interface previews",
      icon: <FileText className="h-5 w-5" />,
      href: "#screenshots"
    },
    {
      name: "Company Assets",
      description: "Brandbook and style guidelines",
      icon: <Download className="h-5 w-5" />,
      href: "#brand-assets"
    }
  ];

  const screenshots = [
    "Feasly Model Interface",
    "Financial Projections Dashboard",
    "Scenario Analysis View",
    "Arabic Interface Preview",
    "Mobile Responsive Design"
  ];

  return (
    <MarketingLayout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Press & Media Kit
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to write about Feasly and our mission to revolutionize real estate feasibility modeling.
            </p>
          </div>

          {/* Elevator Pitch */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Users className="mr-3 h-6 w-6 text-primary" />
                One-Sentence Elevator Pitch
              </h2>
              <blockquote className="text-lg italic border-l-4 border-primary pl-6">
                "Feasly is a cloud-based real estate feasibility modeling platform that replaces Excel with intelligent automation, real-time collaboration, and Arabic-first design for developers across MENA and beyond."
              </blockquote>
            </CardContent>
          </Card>

          {/* Company Description */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Company Description</h2>
              <div className="prose prose-lg max-w-none">
                <p className="mb-4">
                  Feasly is a modern, Arabic-friendly feasibility modeling platform built for real estate developers, analysts, and giga-scale projects across MENA and beyond. Founded to solve the limitations of traditional Excel-based financial modeling, Feasly provides intelligent automation, real-time collaboration, and compliance-ready outputs for complex development projects.
                </p>
                <p className="mb-4">
                  The platform serves development teams, institutional investors, and government entities who need to model multi-billion dollar projects with accuracy, speed, and regulatory compliance. With native Arabic language support and GCC-specific financial calculations, Feasly addresses the unique requirements of the Middle Eastern real estate market while maintaining global best practices.
                </p>
                <p>
                  Feasly's vision is to democratize sophisticated financial modeling, making enterprise-grade feasibility analysis accessible to projects of all sizes while ensuring cultural and regulatory alignment with local markets.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Downloadable Assets */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Downloadable Assets</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {downloadAssets.map((asset, index) => (
                  <div key={index} className="text-center p-6 border rounded-lg hover:border-primary transition-colors">
                    <div className="mb-4 flex justify-center text-primary">
                      {asset.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{asset.description}</p>
                    <Button size="sm" variant="outline">
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Screenshots */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Product Screenshots</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {screenshots.map((screenshot, index) => (
                  <div key={index} className="bg-muted rounded-lg p-8 text-center">
                    <div className="bg-background rounded border-2 border-dashed border-border p-8">
                      <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{screenshot}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                High-resolution screenshots available for download above
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Media Inquiries</h2>
              <p className="text-muted-foreground mb-6">
                For press inquiries, partnership opportunities, or additional information:
              </p>
              <Button asChild>
                <a href="mailto:hello@feasly.com">
                  Contact Us: hello@feasly.com
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingLayout>
  );
}