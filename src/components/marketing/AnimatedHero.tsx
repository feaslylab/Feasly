
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GradientText } from "./GradientText";
import { HeroLoadingFallback } from "./HeroLoadingFallback";
import { ProductMockup } from "./ProductMockup";
import { useTranslationReady } from "@/hooks/useTranslationReady";
import { TM } from "@/components/ui/trademark";

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export function AnimatedHero({ title, subtitle, description }: AnimatedHeroProps) {
  const { t } = useTranslation('marketing');
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Critical translation keys for hero section
  const criticalKeys = [
    'common.nextGenModeling',
    'home.hero.titleSpeed',
    'cta.viewLiveDemo',
    'cta.getStartedFree'
  ];
  
  const isTranslationReady = useTranslationReady('marketing', criticalKeys);
  const typewriterText = t('common.nextGenModeling');

  useEffect(() => {
    if (!isTranslationReady) return;
    
    if (currentIndex < typewriterText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + typewriterText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, typewriterText, isTranslationReady]);

  // Reset typewriter when translations load or language changes
  useEffect(() => {
    if (isTranslationReady) {
      setDisplayedText("");
      setCurrentIndex(0);
    }
  }, [isTranslationReady, typewriterText]);

  // Show loading fallback until translations are ready
  if (!isTranslationReady) {
    return <HeroLoadingFallback />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }
    }
  };

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center text-center bg-gradient-to-b from-background via-surface to-background">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)'
          }}
        >
          {/* Product Mockup */}
          <motion.div variants={itemVariants} className="mb-12">
            <ProductMockup className="mx-auto" />
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl/tight md:text-7xl font-semibold text-foreground max-w-[13ch] mx-auto mb-6">
              Model the future.<br />Manage with precision.
            </h1>
          </motion.div>

          {/* Subhead */}
          <motion.div variants={itemVariants}>
            <p className="mt-6 text-lg md:text-2xl text-muted-foreground max-w-[45ch] mx-auto">
              Next-gen feasibility modeling with Feasly<TM /> for GCC developers. Faster than Excel, native Arabic support, enterprise-grade security.
            </p>
          </motion.div>

          {/* CTA Group */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="group px-8 py-4 text-lg">
                Try the live demo
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="ghost" size="lg" className="group px-8 py-4 text-lg">
                Book a call
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
