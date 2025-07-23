import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Eye } from "lucide-react";

export function TryFeaslyDemo() {
  return (
    <section className="py-20" id="demo">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-2xl border border-border p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="bg-primary/20 rounded-full p-6 w-fit mx-auto mb-6">
              <Eye className="h-12 w-12 text-primary" />
            </div>
            
            {/* Content */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Try Feasly — No Login Required
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore a real feasibility model in read-only mode. Instantly.
            </p>
            
            {/* CTA */}
            <Button size="lg" className="group px-8 py-4 text-lg mb-8" asChild>
              <Link to="/demo">
                <Play className="mr-2 h-5 w-5" />
                Launch Public Demo
              </Link>
            </Button>
            
            {/* Preview screenshot placeholder */}
            <div className="bg-background rounded-xl border border-border shadow-lg overflow-hidden">
              <div className="aspect-[16/9] w-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Play className="h-16 w-16 text-primary mx-auto" />
                  <p className="text-lg text-muted-foreground">Demo Preview</p>
                  <p className="text-sm text-muted-foreground/70">
                    Real data • Live calculations • No signup
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}