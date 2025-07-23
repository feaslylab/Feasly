import { motion } from "framer-motion";
import { X } from "lucide-react";

interface AnimatedRedXProps {
  delay?: number;
}

export function AnimatedRedX({ delay = 0 }: AnimatedRedXProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
        rotate: { duration: 0.6, ease: "easeOut" }
      }}
      whileHover={{ 
        scale: 1.2,
        rotate: 180,
        transition: { duration: 0.3 }
      }}
      className="flex-shrink-0"
    >
      <div className="relative">
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0 hsl(var(--destructive) / 0.7)",
              "0 0 0 10px hsl(var(--destructive) / 0)",
              "0 0 0 0 hsl(var(--destructive) / 0)"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="w-8 h-8 rounded-full bg-destructive/10 border-2 border-destructive flex items-center justify-center"
        >
          <X className="w-4 h-4 text-destructive font-bold" strokeWidth={3} />
        </motion.div>
      </div>
    </motion.div>
  );
}