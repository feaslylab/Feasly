import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { Hero } from "@/components/marketing/Hero";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { PainPromise } from "@/components/marketing/PainPromise";
import { MiniFeatureGrid } from "@/components/marketing/MiniFeatureGrid";
import { Carousel } from "@/components/marketing/Carousel";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FoundersRow } from "@/components/marketing/FoundersRow";
import { FoundersStoryBanner } from "@/components/marketing/FoundersStoryBanner";
import { FinalCTA } from "@/components/marketing/FinalCTA";

export default function NewMarketingHome() {
  const { t } = useTranslation('common');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Feasly | Modern Modeling Infrastructure for the GCC";
  }, []);

  return (
    <div className="flex flex-col relative">
      {/* New Premium Hero Section */}
      <Hero />

      {/* Trust Strip */}
      <TrustStrip />

      {/* Pain to Promise Section */}
      <ScrollReveal>
        <PainPromise />
      </ScrollReveal>

      {/* Mini Feature Grid with Glassmorphism */}
      <ScrollReveal>
        <MiniFeatureGrid />
      </ScrollReveal>

      {/* Screenshot Carousel */}
      <ScrollReveal>
        <Carousel />
      </ScrollReveal>

      {/* How It Works */}
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      {/* Founders Story Banner */}
      <ScrollReveal>
        <FoundersStoryBanner />
      </ScrollReveal>

      {/* Founders Row */}
      <ScrollReveal>
        <FoundersRow />
      </ScrollReveal>

      {/* Final CTA */}
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </div>
  );
}
