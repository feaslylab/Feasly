import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2 } from "lucide-react";

export default function SimpleMarketingHome() {
  console.log("SimpleMarketingHome rendered");
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Next-Gen Real Estate <br />
              <span className="text-primary">Financial Modeling</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Build accurate financial models for your real estate projects. 
              From construction to revenue forecasting - all in one platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/welcome">
                  Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Built for Real Estate Professionals
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Project Modeling</h3>
                <p className="text-muted-foreground">
                  Model complex construction cashflows, revenue streams, and financing scenarios.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Financial Analysis</h3>
                <p className="text-muted-foreground">
                  Calculate IRR, NPV, payback periods and other key financial metrics automatically.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Scenario Planning</h3>
                <p className="text-muted-foreground">
                  Test different scenarios and make data-driven investment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Building?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join real estate professionals using Feasly to model their projects.
            </p>
            <Button size="lg" asChild>
              <Link to="/welcome">
                Login to Access Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}