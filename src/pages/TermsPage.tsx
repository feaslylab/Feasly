import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Terms of Service | Feasly";
  }, []);

  return (
    <MarketingLayout>
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p>
                By accessing and using Feasly's real estate feasibility modeling platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
              <p className="mb-4">
                All content, features, and functionality of the Feasly platform are protected by intellectual property laws.
              </p>
              <p className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-muted-foreground/20">
                Trade-mark applications filed in the United Arab Emirates, Saudi Arabia, Qatar, Bahrain, Oman and Kuwait.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at: legal@feasly.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MarketingLayout>
  );
}

export default TermsPage;