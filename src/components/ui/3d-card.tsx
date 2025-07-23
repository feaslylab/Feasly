import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Card3DProps {
  children: ReactNode;
  backContent?: ReactNode;
  className?: string;
}

export function Card3D({ children, backContent, className = "" }: Card3DProps) {
  return (
    <div className={`group perspective-1000 ${className}`}>
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        whileHover={{ rotateY: backContent ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          {children}
        </div>
        
        {/* Back */}
        {backContent && (
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            {backContent}
          </div>
        )}
      </motion.div>
    </div>
  );
}