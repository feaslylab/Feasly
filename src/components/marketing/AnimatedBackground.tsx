
import { motion } from "framer-motion";

export function AnimatedBackground() {
  const shapes = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 5.5 + Math.random() * 4, // 5.5-9.5 seconds (50% faster)
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
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />

      {/* Floating geometric shapes - like floating in water */}
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full bg-gradient-to-r from-primary/40 to-accent/40 blur-sm"
          style={{
            width: shape.size,
            height: shape.size,
            left: `${shape.x}%`,
            top: `${shape.y}%`,
          }}
          animate={{
            y: [0, -50, 0, 45, 0], // Much more dramatic floating motion
            x: [0, 35, -30, 32, 0], // Much more expansive drift across screen
            scale: [1, 1.02, 0.98, 1.01, 1], // Very subtle breathing
            opacity: [0.6, 0.8, 0.7, 0.9, 0.6], // Much more solid (60% increase)
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Additional floating orbs for atmosphere */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full bg-gradient-to-r from-accent/30 to-primary/30 blur-md"
          style={{
            width: 80 + Math.random() * 40,
            height: 80 + Math.random() * 40,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -55, 25, -45, 0], // Even more dramatic floating motion
            x: [0, 40, -35, 38, 0], // Much more expansive horizontal movement
            scale: [1, 1.05, 0.95, 1.02, 1],
            opacity: [0.4, 0.7, 0.5, 0.8, 0.4], // More solid orbs
          }}
          transition={{
            duration: 6.5 + Math.random() * 5, // 6.5-11.5 seconds (50% faster)
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        />
      ))}

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
