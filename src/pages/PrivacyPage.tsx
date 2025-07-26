import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy | Feasly";
  }, []);

  return (
    <MarketingLayout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p>
                Feasly Technologies is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our real estate feasibility modeling platform.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Jurisdiction</h2>
              <p className="mb-4">
                This website and our services are operated from the United Arab Emirates and are subject to UAE laws and regulations.
              </p>
              <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-muted-foreground/20">
                This site is operated from the United Arab Emirates; we do not knowingly collect or store personal data of users in Australia.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at: privacy@feasly.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingLayout>
  );
}

export default PrivacyPage;