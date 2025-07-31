import { ReactNode } from "react";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { StickyCTAFooter } from "./StickyCTAFooter";

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <MarketingHeader />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <StickyCTAFooter />
      <MarketingFooter />
    </div>
  );
}