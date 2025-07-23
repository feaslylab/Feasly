import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { WaitlistForm } from "@/components/marketing/WaitlistForm";

export function StickyCTAFooter() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Ready to kill the spreadsheet?
          </h2>
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="px-8 py-3" asChild>
                <Link to="/demo" aria-label="Try the Demo">
                  <Play className="mr-2 h-4 w-4" />
                  Try the Demo
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3" asChild>
                <Link to="/welcome" aria-label="Start free trial">
                  Start free trial
                </Link>
              </Button>
            </div>
            
            <div className="max-w-md mx-auto">
              <WaitlistForm 
                placeholder="Enter your email for early access"
                buttonText="Start free trial"
                className="justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}