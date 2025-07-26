import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Static page for Australian traffic redirects
 * Displays service unavailability message for AU residents
 */
function AustraliaRedirect() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Service Not Available | Feasly";
    
    // Prevent indexing of this page
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);
    
    return () => {
      // Cleanup meta tag if component unmounts
      document.head.removeChild(metaRobots);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <Card className="border-2 border-destructive/20">
          <CardContent className="p-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Service Not Available
                </h1>
                <p className="text-lg text-muted-foreground">
                  This service is not available in Australia
                </p>
              </div>
              
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Feasly™ financial modeling services are provided by Feasly (DIFC) Ltd 
                  for customers in the GCC and selected international markets.
                </p>
                
                <p>
                  We do not currently offer services to Australian residents 
                  due to regulatory and licensing requirements.
                </p>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-xs">
                    If you believe you've reached this page in error, please contact us at{" "}
                    <a 
                      href="mailto:hello@feasly.com" 
                      className="text-primary hover:underline"
                    >
                      hello@feasly.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AustraliaRedirect;