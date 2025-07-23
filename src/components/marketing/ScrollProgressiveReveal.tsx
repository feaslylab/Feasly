import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ScrollProgressiveRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "fade" | "scale";
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
  stagger?: boolean;
  staggerDelay?: number;
}

export function ScrollProgressiveReveal({ 
  children, 
  direction = "up",
  distance = 100,
  delay = 0,
  duration = 0.8,
  className = "",
  stagger = false,
  staggerDelay = 0.1
}: ScrollProgressiveRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const getInitialTransform = () => {
    switch (direction) {
      case "up": return { opacity: 0, y: distance };
      case "down": return { opacity: 0, y: -distance };
      case "left": return { opacity: 0, x: distance };
      case "right": return { opacity: 0, x: -distance };
      case "scale": return { opacity: 0, scale: 0.8 };
      case "fade": return { opacity: 0 };
      default: return { opacity: 0, y: distance };
    }
  };

  const getAnimateTransform = () => {
    switch (direction) {
      case "up":
      case "down": return { opacity: 1, y: 0 };
      case "left":
      case "right": return { opacity: 1, x: 0 };
      case "scale": return { opacity: 1, scale: 1 };
      case "fade": return { opacity: 1 };
      default: return { opacity: 1, y: 0 };
    }
  };

  const containerVariants = stagger ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  } : undefined;

  const itemVariants = stagger ? {
    hidden: getInitialTransform(),
    visible: {
      ...getAnimateTransform(),
      transition: {
        duration,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  } : undefined;

  if (stagger) {
    return (
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ 
          once: true, 
          margin: "-100px",
          amount: 0.1
        }}
        className={className}
      >
        {Array.isArray(children) ? 
          children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          )) :
          <motion.div variants={itemVariants}>
            {children}
          </motion.div>
        }
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      initial={getInitialTransform()}
      whileInView={getAnimateTransform()}
      viewport={{ 
        once: true, 
        margin: "-100px",
        amount: 0.1
      }}
      transition={{ 
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered section wrapper
export function ScrollSection({ 
  children, 
  className = "",
  background = "default",
  id,
  ...htmlProps
}: { 
  children: ReactNode; 
  className?: string;
  background?: "default" | "muted" | "gradient";
  id?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'id'>) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.8, 1, 1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.98, 1, 1, 0.98]);

  const getBackgroundClass = () => {
    switch (background) {
      case "muted": return "bg-muted/20";
      case "gradient": return "bg-gradient-to-b from-background to-muted/10";
      default: return "";
    }
  };

  return (
    <motion.section
      ref={ref}
      style={{ opacity, scale }}
      className={`relative overflow-hidden ${getBackgroundClass()} ${className}`}
      id={id}
    >
      {children}
    </motion.section>
  );
}

// Card reveal with sophisticated animations
export function ScrollCard({ 
  children, 
  index = 0,
  totalCards = 1,
  className = ""
}: { 
  children: ReactNode; 
  index?: number;
  totalCards?: number;
  className?: string;
}) {
  const delay = (index / totalCards) * 0.3;
  
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 80,
        rotateX: 30,
        scale: 0.9
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        rotateX: 0,
        scale: 1
      }}
      viewport={{ 
        once: true, 
        margin: "-50px",
        amount: 0.2
      }}
      transition={{ 
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      whileHover={{ 
        y: -10,
        scale: 1.02,
        rotateX: -5,
        transition: { duration: 0.3 }
      }}
      className={`transform-gpu ${className}`}
      style={{
        transformStyle: "preserve-3d",
        backfaceVisibility: "hidden"
      }}
    >
      {children}
    </motion.div>
  );
}

// Text reveal with typewriter effect
export function ScrollTextReveal({ 
  text, 
  className = "",
  delay = 0,
  cascade = false
}: { 
  text: string; 
  className?: string;
  delay?: number;
  cascade?: boolean;
}) {
  if (cascade) {
    const words = text.split(" ");
    return (
      <div className={className}>
        {words.map((word, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              duration: 0.6,
              delay: delay + (index * 0.1),
              ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
            }}
            className="inline-block mr-2"
          >
            {word}
          </motion.span>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
      }}
      className={className}
    >
      {text}
    </motion.div>
  );
}