import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function StickyCTAFooter() {
  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Feasibility modeling doesn't need to be painful.
          </h2>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="px-8 py-3" asChild>
              <Link to="/demo">
                <Play className="mr-2 h-4 w-4" />
                Try the Demo
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3" asChild>
              <Link to="/welcome">
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}