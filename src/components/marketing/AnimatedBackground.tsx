
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const shapes = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 15, // Reduced max size from 80 to 55
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Floating geometric shapes */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/20 to-accent/20 blur-sm"
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            y: [0, -20, 0], // Reduced movement from -30 to -20
            x: [0, 10, 0], // Reduced movement from 15 to 10
            scale: [1, 1.05, 1], // Reduced scale from 1.1 to 1.05
            opacity: [0.3, 0.6, 0.3], // Reduced opacity range
          }}
          transition={{
            duration: 3 + shape.delay, // Slower animation
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Mouse-following glow - made smaller and more subtle */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-primary/5 to-accent/5 blur-3xl"
        animate={{
          x: mousePosition.x - 128, // Adjusted for smaller size
          y: mousePosition.y - 128,
        }}
        transition={{
          type: "spring",
          damping: 40, // Increased damping for smoother movement
          stiffness: 150, // Reduced stiffness
        }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>
    </div>
  );
}
