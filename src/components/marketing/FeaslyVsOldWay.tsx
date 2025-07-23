import { Check, X, AlertTriangle } from "lucide-react";

const comparisons = [
  {
    capability: "Real-time scenarios",
    feasly: true,
    traditional: false,
  },
  {
    capability: "Arabic RTL support", 
    feasly: true,
    traditional: false,
  },
  {
    capability: "Excel import (structured + raw)",
    feasly: true,
    traditional: "limited",
  },
  {
    capability: "Legacy .edmf import",
    feasly: true,
    traditional: "limited",
  },
  {
    capability: "Public shareable demo",
    feasly: true,
    traditional: false,
  },
  {
    capability: "Audit-ready exports",
    feasly: true,
    traditional: "limited",
  },
];

export function FeaslyVsOldWay() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Feasly vs. The Old Way
          </h2>
          <p className="text-xl text-muted-foreground">
            See why teams are making the switch
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-background rounded-xl border border-border overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-muted/50 p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center font-semibold">Capability</div>
                <div className="text-center font-semibold text-primary">Feasly</div>
                <div className="text-center font-semibold text-muted-foreground">Traditional Tools</div>
              </div>
            </div>
            
            {/* Comparison rows */}
            <div className="divide-y divide-border">
              {comparisons.map((item, index) => (
                <div key={index} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Capability */}
                    <div className="text-sm md:text-base">{item.capability}</div>
                    
                    {/* Feasly */}
                    <div className="flex justify-center">
                      {item.feasly === true && (
                        <Check className="h-5 w-5 text-success" />
                      )}
                      {item.feasly === false && (
                        <X className="h-5 w-5 text-destructive" />
                      )}
                      {typeof item.feasly === 'string' && (
                        <span className="text-sm text-warning flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {item.feasly}
                        </span>
                      )}
                    </div>
                    
                    {/* Traditional */}
                    <div className="flex justify-center">
                      {item.traditional === true && (
                        <Check className="h-5 w-5 text-success" />
                      )}
                      {item.traditional === false && (
                        <X className="h-5 w-5 text-destructive" />
                      )}
                      {typeof item.traditional === 'string' && (
                        <span className="text-sm text-warning flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          {item.traditional}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              ✅ Full support • ❌ Not available • ⚠️ Limited functionality
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}