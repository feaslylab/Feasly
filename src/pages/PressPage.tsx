import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Image, FileText, Users } from "lucide-react";
import { useEffect } from "react";

function PressPage() {
  useEffect(() => {
    document.title = "Press & Media Kit | Feasly";
  }, []);

  return (
    <MarketingLayout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Press & Media Kit
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to write about Feasly and our mission to revolutionize real estate feasibility modeling.
            </p>
          </div>

          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Users className="mr-3 h-6 w-6 text-primary" />
                Company Description
              </h2>
              <blockquote className="text-lg border-l-4 border-primary pl-6">
                "Feasly is a modern, Arabic-friendly feasibility modeling platform built for real estate developers, analysts, and giga-scale projects across MENA and beyond."
              </blockquote>
            </CardContent>
          </Card>

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

export default PressPage;