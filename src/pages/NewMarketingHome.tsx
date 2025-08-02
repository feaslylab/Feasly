import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { PainPromise } from "@/components/marketing/PainPromise";
import { MiniFeatureGrid } from "@/components/marketing/MiniFeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
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
      {/* New Hero Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-[900px] mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              {t('hero.headline')}
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              {t('hero.sub')}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="px-10 py-6 text-lg font-semibold">
                {t('cta.joinEarly')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pain to Promise Section */}
      <ScrollReveal>
        <PainPromise />
      </ScrollReveal>

      {/* Mini Feature Grid */}
      <ScrollReveal>
        <MiniFeatureGrid />
      </ScrollReveal>

      {/* How It Works */}
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      {/* Founders Story Banner */}
      <ScrollReveal>
        <FoundersStoryBanner />
      </ScrollReveal>

      {/* Final CTA */}
      <ScrollReveal>
        <FinalCTA />
      </ScrollReveal>
    </div>
  );
}
