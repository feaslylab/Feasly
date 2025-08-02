import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const { t } = useTranslation('common');

  return (
    <section 
      className="relative py-24 lg:py-32 min-h-[90vh] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-[900px] mx-auto text-center">
          <motion.h1 
            className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {t('hero.headline')}
          </motion.h1>
          <motion.p 
            className="text-lg leading-7 text-muted-foreground mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {t('hero.sub')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="px-10 py-6 text-lg font-semibold transition-transform duration-150 hover:scale-105"
            >
              {t('cta.joinEarly')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
        
        {/* Mock Laptop with GIF */}
        <motion.div 
          className="mt-16 max-w-4xl mx-auto relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="relative">
            <img 
              src="/assets/mock-laptop.svg" 
              alt="Laptop mockup"
              className="w-full max-w-[1400px] mx-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[65%] h-[65%] rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src="/assets/main-preview.gif" 
                  alt="Feasly platform preview"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Floating KPI Cards */}
      <motion.div 
        className="absolute left-5 top-1/4 animate-float hidden lg:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="backdrop-blur-md bg-white/15 dark:bg-white/5 shadow-lg/20 rounded-2xl p-4 border border-white/20">
          <div className="text-2xl font-bold text-success">17.8%</div>
          <div className="text-sm text-muted-foreground">NPV</div>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute right-6 top-1/3 animate-float-reverse hidden lg:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="backdrop-blur-md bg-white/15 dark:bg-white/5 shadow-lg/20 rounded-2xl p-4 border border-white/20">
          <div className="text-2xl font-bold text-primary">22.4%</div>
          <div className="text-sm text-muted-foreground">IRR</div>
        </div>
      </motion.div>
    </section>
  );
}