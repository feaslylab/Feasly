import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function WorldClassHero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 150, damping: 50 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 50 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section 
      className="min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Premium Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/98 to-primary/3" />
        
        {/* Subtle animated gradients */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{
            background: `radial-gradient(circle at ${springX.get() + 50}% ${springY.get() + 50}%, hsl(var(--primary)/0.1) 0%, transparent 50%)`
          }}
        />
        
        <motion.div 
          className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-primary/8 to-primary-light/6 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute -bottom-1/4 -right-1/4 w-80 h-80 bg-gradient-to-r from-primary-light/6 to-primary/8 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10 max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-8">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Built in the GCC, for the GCC
            </div>
          </motion.div>

          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-full blur-2xl scale-110" />
              <img 
                src="/lovable-uploads/9c1fb9f6-2ebe-4aca-a9d2-295f77d9d4ba.png" 
                alt="Feasly Logo" 
                className="w-24 h-24 relative z-10 drop-shadow-xl"
              />
            </div>
          </motion.div>

          {/* Main Headline - YOUR EXACT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <h1 className="text-5xl/tight md:text-7xl font-bold text-foreground max-w-4xl mx-auto mb-6">
              Modern Modeling Infrastructure
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent">
                for the GCC
              </span>
            </h1>
          </motion.div>

          {/* Subheading - YOUR EXACT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed">
              Feasly replaces spreadsheets, outdated tools, and consulting bottlenecks with precision-grade capital modeling — built in the Gulf, for the Gulf.
            </p>
          </motion.div>

          {/* CTA - Only changed trial to beta as requested */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                Register Interest
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}