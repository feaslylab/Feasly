import { ReactNode } from "react";
import { motion } from "framer-motion";
import { MarketingHeader } from "./MarketingHeader";
import { MarketingFooter } from "./MarketingFooter";
import { StickyCTAFooter } from "./StickyCTAFooter";
import { useTranslation } from "react-i18next";
import { HeroLoadingFallback } from "./HeroLoadingFallback";

interface EnhancedMarketingLayoutProps {
  children: ReactNode;
}

export function EnhancedMarketingLayout({ children }: EnhancedMarketingLayoutProps) {
  const { ready } = useTranslation('marketing');

  // Show loading fallback until translations are ready to prevent key flicker
  if (!ready) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground relative">
        <MarketingHeader />
        <main className="flex-1 relative z-10 flex items-center justify-center">
          <HeroLoadingFallback />
        </main>
        <StickyCTAFooter />
        <MarketingFooter />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background text-foreground relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh' }} // Prevent layout shift
    >
      <MarketingHeader />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <StickyCTAFooter />
      <MarketingFooter />
    </motion.div>
  );
}