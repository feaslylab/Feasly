import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe2,
  Building2,
  BarChart3,
  Users
} from "lucide-react";

interface FloatingMetric {
  id: string;
  value: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  position: { x: number; y: number };
  delay: number;
}

export function WorldClassHero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 10;
    const y = (e.clientY - rect.top - rect.height / 2) / 10;
    mouseX.set(x);
    mouseY.set(y);
  };

  const floatingMetrics: FloatingMetric[] = [
    {
      id: "projects",
      value: "SAR 2.3B+",
      label: "Projects Modeled",
      icon: Building2,
      color: "from-primary/20 to-primary-light/20",
      position: { x: -20, y: -10 },
      delay: 0.2
    },
    {
      id: "accuracy",
      value: "99.7%",
      label: "Model Accuracy",
      icon: TrendingUp,
      color: "from-success/20 to-success-light/20",
      position: { x: 15, y: -15 },
      delay: 0.4
    },
    {
      id: "compliance",
      value: "4 GCC",
      label: "Countries Ready",
      icon: Shield,
      color: "from-warning/20 to-warning-light/20",
      position: { x: -15, y: 15 },
      delay: 0.6
    },
    {
      id: "speed",
      value: "10min",
      label: "Average Model Time",
      icon: Zap,
      color: "from-secondary/20 to-accent/20",
      position: { x: 20, y: 12 },
      delay: 0.8
    }
  ];

  return (
    <section 
      className="min-h-[95vh] flex flex-col items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Premium Animated Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-1/4 w-80 h-80 bg-gradient-to-r from-primary-light/15 to-success/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Mouse-following gradient */}
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-2xl pointer-events-none"
          style={{
            x: springX,
            y: springY,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center relative"
        >
          {/* Beta Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary-light/10 border border-primary/20 text-primary font-medium mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-semibold tracking-wide">PRIVATE BETA • INVITATION ONLY</span>
            </div>
          </motion.div>

          {/* Logo with Glow Effect */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light rounded-full blur-xl opacity-30 scale-110" />
              <img 
                src="/lovable-uploads/9c1fb9f6-2ebe-4aca-a9d2-295f77d9d4ba.png" 
                alt="Feasly Logo" 
                className="w-28 h-28 relative z-10 drop-shadow-2xl"
              />
            </div>
          </motion.div>

          {/* Main Headline with Gradient Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <h1 className="text-6xl/tight md:text-8xl font-bold max-w-5xl mx-auto mb-8">
              <span className="block mb-2 text-foreground">Sovereign-Scale</span>
              <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent">
                Modeling Infrastructure
              </span>
              <span className="block text-5xl md:text-6xl text-muted-foreground mt-4">
                for the Gulf
              </span>
            </h1>
          </motion.div>

          {/* Premium Subheading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed font-medium">
              Join the exclusive beta. Transform spreadsheet chaos into precision-grade capital modeling 
              <span className="text-foreground font-semibold"> — built in the Gulf, for the Gulf.</span>
            </p>
          </motion.div>

          {/* Premium CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Button 
                  size="lg" 
                  className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-primary via-primary-light to-primary-dark hover:from-primary-dark hover:to-primary shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                >
                  Request Private Beta Access
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group"
              >
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-10 py-6 text-lg font-semibold border-2 border-primary/30 bg-background/80 backdrop-blur-sm hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                >
                  View Platform Overview
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Sovereign-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <span>4 GCC Countries Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Enterprise Partners Only</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Metrics Cards */}
        {floatingMetrics.map((metric) => (
          <motion.div
            key={metric.id}
            className="absolute hidden lg:block"
            style={{
              left: `${50 + metric.position.x}%`,
              top: `${50 + metric.position.y}%`,
            }}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              transition: {
                delay: metric.delay + 1.5,
                duration: 0.8,
                ease: "backOut"
              }
            }}
            whileHover={{ 
              scale: 1.1, 
              rotate: [0, -2, 2, 0],
              transition: { duration: 0.3 }
            }}
          >
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${metric.color} backdrop-blur-xl border border-white/20 shadow-2xl min-w-[140px]`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/20">
                  <metric.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-32 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent pointer-events-none" />
    </section>
  );
}