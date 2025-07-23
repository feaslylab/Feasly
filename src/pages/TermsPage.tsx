import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

export default function TermsPage() {
  useEffect(() => {
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

          <div className="prose prose-lg max-w-none">
            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
                <p>
                  By accessing and using Feasly's real estate feasibility modeling platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Description of Service</h2>
                <p className="mb-4">
                  Feasly provides cloud-based financial modeling and feasibility analysis tools for real estate development projects. Our services include:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Financial modeling and projection tools</li>
                  <li>Scenario analysis and comparison features</li>
                  <li>Collaboration and sharing capabilities</li>
                  <li>Data import and export functionality</li>
                  <li>Compliance and reporting features</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">User Accounts and Responsibilities</h2>
                <h3 className="text-lg font-semibold mb-3">Account Creation</h3>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>You must provide accurate and complete information</li>
                  <li>You are responsible for maintaining account security</li>
                  <li>You must notify us immediately of any unauthorized access</li>
                </ul>
                
                <h3 className="text-lg font-semibold mb-3">Acceptable Use</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Use the service for lawful purposes only</li>
                  <li>Do not attempt to gain unauthorized access to our systems</li>
                  <li>Do not use the service to store illegal or harmful content</li>
                  <li>Respect intellectual property rights</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Data Ownership and Privacy</h2>
                <h3 className="text-lg font-semibold mb-3">Your Data</h3>
                <p className="mb-4">
                  You retain ownership of all data, models, and content you create or upload to Feasly. We do not claim ownership of your project data or financial models.
                </p>
                
                <h3 className="text-lg font-semibold mb-3">Our Rights</h3>
                <p>
                  We have the right to access your data solely for the purposes of providing the service, ensuring security, and complying with legal obligations.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Subscription and Payment</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Subscription fees are charged in advance</li>
                  <li>Refunds are provided according to our refund policy</li>
                  <li>We reserve the right to change pricing with notice</li>
                  <li>Failure to pay may result in service suspension</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Service Availability</h2>
                <p className="mb-4">
                  While we strive for high availability, we cannot guarantee uninterrupted service. We reserve the right to:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Perform scheduled maintenance</li>
                  <li>Make updates and improvements</li>
                  <li>Suspend service for security reasons</li>
                  <li>Discontinue features with appropriate notice</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
                <p className="mb-4">
                  Feasly provides financial modeling tools for informational purposes. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>The service is provided "as is" without warranties</li>
                  <li>Financial projections are estimates, not guarantees</li>
                  <li>You should verify all calculations independently</li>
                  <li>We are not liable for investment decisions based on our tools</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Termination</h2>
                <p className="mb-4">
                  Either party may terminate this agreement:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>You may cancel your subscription at any time</li>
                  <li>We may terminate for violation of these terms</li>
                  <li>Data export will be available for 30 days after termination</li>
                  <li>All data will be permanently deleted after the retention period</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
                <p>
                  These terms are governed by the laws of the jurisdiction in which Feasly Technologies is incorporated. Any disputes will be resolved through binding arbitration.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p><strong>Email:</strong> legal@feasly.com</p>
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