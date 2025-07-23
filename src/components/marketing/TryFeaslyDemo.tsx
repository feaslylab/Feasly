import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Eye, BarChart3, FileText, Calculator } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { PulsingButton } from "./AnimatedCTA";

const demoFeatures = [
  { icon: BarChart3, text: "Live Financial Model" },
  { icon: Calculator, text: "Real-time Calculations" }, 
  { icon: FileText, text: "Interactive Reports" }
];

export function TryFeaslyDemo() {
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % demoFeatures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20" id="demo">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-gradient-to-r from-primary/10 to-primary-light/10 rounded-2xl border border-border p-8 md:p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Animated background effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"
              animate={{
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Animated icon */}
            <motion.div 
              className="bg-primary/20 rounded-full p-6 w-fit mx-auto mb-6 relative z-10"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Eye className="h-12 w-12 text-primary" />
              </motion.div>
            </motion.div>
            
            {/* Content */}
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-4 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Try Feasly — No Login Required
            </motion.h2>
            
            <motion.p 
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Explore a real feasibility model in read-only mode. Instantly.
            </motion.p>
            
            {/* Rotating demo features */}
            <motion.div 
              className="flex justify-center gap-8 mb-8 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              {demoFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center gap-2 transition-all duration-500 ${
                    index === currentFeature ? 'text-primary scale-110' : 'text-muted-foreground'
                  }`}
                  animate={{
                    scale: index === currentFeature ? 1.1 : 1,
                    opacity: index === currentFeature ? 1 : 0.7
                  }}
                >
                  <feature.icon className="h-5 w-5" />
                  <span className="font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="relative z-10"
            >
              <PulsingButton size="lg" className="px-8 py-4 text-lg" asChild>
                <Link to="/demo">
                  <Play className="mr-2 h-5 w-5" />
                  Launch Public Demo
                </Link>
              </PulsingButton>
            </motion.div>
            
            <motion.p 
              className="text-sm text-muted-foreground mt-4 relative z-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
            >
              No signup required • Full-featured preview • Takes 30 seconds
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}