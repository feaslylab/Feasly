import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

// 8. Spotlight Effect
export function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary)/0.2), transparent 60%)`,
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </motion.div>
  );
}

// 9. Typewriter Effect with Cursor
export function TypewriterText({ 
  text, 
  speed = 50, 
  className = "",
  showCursor = true 
}: { 
  text: string; 
  speed?: number; 
  className?: string;
  showCursor?: boolean;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block w-0.5 h-[1em] bg-primary ml-1"
        />
      )}
    </span>
  );
}

// 10. Particle System - Performance Optimized with Correct Colors
export function ParticleBackground({ particleCount = 8 }: { particleCount?: number }) {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * 12 + 6, // Moderate size (6px to 18px)
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 6 + 8, // Slower, less frequent updates
    delay: Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: `radial-gradient(circle at 30% 30%, hsl(224 76% 48% / 0.4), hsl(224 76% 48% / 0.1))`,
            boxShadow: `0 0 ${particle.size}px hsl(224 76% 48% / 0.2)`,
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
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

// 15. Scroll-Triggered Counter
export function ScrollCounter({ 
  target, 
  duration = 2, 
  prefix = "", 
  suffix = "" 
}: { 
  target: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string; 
}) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const startTime = Date.now();
          const startValue = 0;

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(startValue + (target - startValue) * easeOutQuart);
            
            setCount(current);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, duration, hasStarted]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-4xl font-bold"
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.div>
  );
}

// 12. Glitch Effect
export function GlitchText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.div
      className={`relative text-center ${className}`}
      whileHover="hover"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
    >
      <motion.span
        variants={{
          hover: {
            x: [0, -2, 2, 0],
            textShadow: [
              "0 0 0 hsl(var(--primary))",
              "2px 0 0 hsl(var(--destructive)), -2px 0 0 hsl(var(--accent))",
              "0 0 0 hsl(var(--primary))"
            ],
          }
        }}
        transition={{ duration: 0.3 }}
        className="block"
      >
        {text}
      </motion.span>
    </motion.div>
  );
}