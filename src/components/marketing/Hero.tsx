import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroLaptop from "@/assets/hero-laptop.jpg";
import bg1 from "@/assets/hero-bg-1.jpg";
import bg2 from "@/assets/hero-bg-2.jpg";
import bg3 from "@/assets/hero-bg-3.jpg";

export function Hero() {
  const { t } = useTranslation('common');

  return (
    <section 
      className="relative py-24 lg:py-32 min-h-[90vh] overflow-hidden"
    >
      {/* Background rotating images */}
      <div className="absolute inset-0">
        <motion.img
          src={bg1}
          alt="Abstract green-tinted background 1"
          className="w-full h-full object-cover absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.img
          src={bg2}
          alt="Abstract green-tinted background 2"
          className="w-full h-full object-cover absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        />
        <motion.img
          src={bg3}
          alt="Abstract green-tinted background 3"
          className="w-full h-full object-cover absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 12 }}
        />
      </div>
      {/* Background overlay tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background/60 to-background/80" />
      
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
        
        {/* Photorealistic Laptop Hero Image */}
        <motion.div 
          className="mt-16 max-w-4xl mx-auto relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="relative">
            <img
              src={heroLaptop}
              alt="Financial modeling dashboard on a laptop"
              className="w-full max-w-[1400px] mx-auto rounded-xl shadow-2xl"
              loading="eager"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
        </motion.div>
      </div>
      
      {/* Floating KPI Cards */}
      <motion.div 
        className="absolute left-10 xl:left-20 top-1/4 animate-float hidden lg:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div className="backdrop-blur-md bg-white/15 dark:bg-white/5 shadow-lg/20 rounded-2xl p-4 border border-white/20 w-[160px]">
          <div className="text-2xl font-bold text-success">17.8%</div>
          <div className="text-sm text-muted-foreground">NPV</div>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute right-10 xl:right-20 top-1/3 animate-float-reverse hidden lg:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <div className="backdrop-blur-md bg-white/15 dark:bg-white/5 shadow-lg/20 rounded-2xl p-4 border border-white/20 w-[160px]">
          <div className="text-2xl font-bold text-primary">22.4%</div>
          <div className="text-sm text-muted-foreground">IRR</div>
        </div>
      </motion.div>
    </section>
  );
}