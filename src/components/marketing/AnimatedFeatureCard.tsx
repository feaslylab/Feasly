import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedFeatureCardProps {
  children: ReactNode;
  index: number;
  className?: string;
}

export function AnimatedFeatureCard({ children, index, className = "" }: AnimatedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={`group cursor-pointer ${className}`}
    >
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-xl" />
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}