import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// 1. Parallax Scroll Effects
export function ParallaxSection({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} style={{ y: springY }}>
      {children}
    </motion.div>
  );
}

// 2. Magnetic Button Effect
export function MagneticButton({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setPosition({
      x: (e.clientX - centerX) * strength,
      y: (e.clientY - centerY) * strength,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
      className="inline-block cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

// 3. Text Reveal Animation
export function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        {text}
      </motion.div>
    </motion.div>
  );
}

// 4. Morphing Shape Background
export function MorphingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-10 morphing-bg"
        animate={{
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%"
          ],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          background: "linear-gradient(45deg, hsl(var(--primary) / 0.3), hsl(var(--accent) / 0.3))",
          filter: "blur(80px)",
          zIndex: -1
        }}
      />
    </div>
  );
}

// 5. Stagger Grid Animation
export function StaggerGrid({ children, columns = 3 }: { children: React.ReactNode[]; columns?: number }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// 6. Floating Elements with Physics
export function FloatingElement({ 
  children, 
  intensity = 1,
  rotationRange = 10 
}: { 
  children: React.ReactNode; 
  intensity?: number;
  rotationRange?: number;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -20 * intensity, 0],
        x: [0, 10 * intensity, 0],
        rotate: [-rotationRange, rotationRange, -rotationRange],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        willChange: 'transform',
      }}
    >
      {children}
    </motion.div>
  );
}

// 7. Progressive Blur Effect
export function ProgressiveBlur({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const blur = useTransform(scrollYProgress, [0, 0.5], [0, 10]);

  return (
    <motion.div style={{ filter: `blur(${blur}px)` }}>
      {children}
    </motion.div>
  );
}

// 11. 3D Tilt Effect
export function TiltCard({ children, tiltStrength = 15 }: { children: React.ReactNode; tiltStrength?: number }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const tiltX = ((e.clientY - centerY) / rect.height) * tiltStrength;
    const tiltY = ((e.clientX - centerX) / rect.width) * -tiltStrength;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}