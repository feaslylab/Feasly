import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function PrivacyPage() {
  useEffect(() => {
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

          <div className="prose prose-lg max-w-none">
            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                <p>
                  Feasly Technologies ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our real estate feasibility modeling platform and related services.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Account information (name, email address, company details)</li>
                  <li>Profile information and preferences</li>
                  <li>Communication records and support interactions</li>
                </ul>
                
                <h3 className="text-lg font-semibold mb-3">Project Data</h3>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Financial models and feasibility calculations</li>
                  <li>Project metadata and configurations</li>
                  <li>Collaboration and sharing activities</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Technical Information</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Device and browser information</li>
                  <li>Usage analytics and performance metrics</li>
                  <li>Security logs and access records</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide and maintain our financial modeling services</li>
                  <li>Process and store your project data securely</li>
                  <li>Communicate with you about your account and services</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Data Security</h2>
                <p className="mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>End-to-end encryption for data transmission</li>
                  <li>Encrypted storage of sensitive financial data</li>
                  <li>Regular security audits and assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Compliance with SOC 2 and ISO 27001 standards</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Access and review your personal information</li>
                  <li>Correct or update inaccurate data</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your project data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Request information about data processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">International Transfers</h2>
                <p>
                  Your information may be processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers, including standard contractual clauses and adequacy decisions.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p><strong>Email:</strong> privacy@feasly.com</p>
                  <p><strong>General:</strong> hello@feasly.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}