import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useState } from "react";

// 13. Cursor Trail Effect
export function CursorTrail() {
  const [dots, setDots] = useState<{ x: number; y: number; id: number }[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setDots(prev => [
        ...prev.slice(-20), // Keep only last 20 dots
        { x: e.clientX, y: e.clientY, id: nextId }
      ]);
      setNextId(prev => prev + 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [nextId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {dots.map((dot, index) => (
        <motion.div
          key={dot.id}
          className="absolute w-2 h-2 bg-primary/60 rounded-full"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ 
            opacity: 0, 
            scale: 0,
            x: dot.x - 4,
            y: dot.y - 4
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// 14. Interactive Blob
export function InteractiveBlob({ size = 200 }: { size?: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  
  const springX = useSpring(x, { stiffness: 100, damping: 20 });
  const springY = useSpring(y, { stiffness: 100, damping: 20 });
  const springScale = useSpring(scale, { stiffness: 200, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) * 0.1);
    y.set((e.clientY - centerY) * 0.1);
    scale.set(1.1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ width: size, height: size }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl opacity-40 pointer-events-none"
        style={{
          x: springX,
          y: springY,
          scale: springScale,
          zIndex: -1,
        }}
        animate={{
          borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%"
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
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

// 16. Wave Animation
export function WaveBackground() {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden">
      <motion.svg
        className="relative block w-full h-24"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
          fill="hsl(var(--primary))"
          opacity="0.3"
          animate={{
            d: [
              "M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z",
              "M-160 44c30 0 58-10 88-10s58 10 88 10 58-10 88-10 58 10 88 10v44h-352z",
              "M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M-160 44c30 0 58-12 88-12s58 12 88 12 58-12 88-12 58 12 88 12v44h-352z"
          fill="hsl(var(--accent))"
          opacity="0.2"
          animate={{
            d: [
              "M-160 44c30 0 58-12 88-12s58 12 88 12 58-12 88-12 58 12 88 12v44h-352z",
              "M-160 44c30 0 58-20 88-20s58 20 88 20 58-20 88-20 58 20 88 20v44h-352z",
              "M-160 44c30 0 58-12 88-12s58 12 88 12 58-12 88-12 58 12 88 12v44h-352z"
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}