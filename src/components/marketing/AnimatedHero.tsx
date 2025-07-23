
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GradientText } from "./GradientText";

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  description: string;
}

export function AnimatedHero({ title, subtitle, description }: AnimatedHeroProps) {
  const { t } = useTranslation('marketing');
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const typewriterText = t('common.nextGenModeling');

  useEffect(() => {
    if (currentIndex < typewriterText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + typewriterText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, typewriterText]);

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
    <motion.div
      className="text-center relative z-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)'
      }}
    >
      {/* Typewriter subtitle */}
      <motion.div variants={itemVariants}>
        <p className="text-primary font-medium mb-4 text-lg">
          {displayedText}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="inline-block w-0.5 h-5 bg-primary ml-1"
          />
        </p>
      </motion.div>

      {/* Main title with proper color */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-foreground">
          <GradientText animated={true}>
            {title}
          </GradientText>
          <br />
          <div className="text-center">
            <GradientText animated={true}>
              {t('home.hero.titleSpeed')}
            </GradientText>
          </div>
        </h1>
      </motion.div>

      {/* Description */}
      <motion.div variants={itemVariants}>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button size="lg" className="group px-8 py-4 text-lg" asChild>
            <Link to="/demo">
              <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" /> 
              {t('cta.viewLiveDemo')}
            </Link>
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="outline" size="lg" className="group px-8 py-4 text-lg" asChild>
            <Link to="/welcome">
              {t('cta.getStartedFree')}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
