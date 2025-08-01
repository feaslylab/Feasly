import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export function BrandedPreloader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-primary/90 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background particles effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Feasly Logo Animation */}
        <motion.div
          className="relative mb-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Enhanced glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/30 blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Secondary glow */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary-foreground/20 blur-xl"
            animate={{
              scale: [1.2, 0.8, 1.2],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          
          {/* Logo container with combined animations */}
          <motion.div
            className="relative w-24 h-24 flex items-center justify-center filter drop-shadow-2xl"
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: {
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          >
            {/* Feasly Logo */}
            <img 
              src="/lovable-uploads/070ac141-e042-40ea-9bc5-6df0bee525e3.png" 
              alt="Feasly Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white tracking-wide">
            FEASLY
          </h1>
        </motion.div>

        {/* Enhanced Loading Section */}
        <div className="w-80 space-y-6">
          {/* Custom Progress Bar */}
          <div className="relative">
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-white via-primary-foreground to-white rounded-full shadow-lg"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              {/* Progress glow */}
              <motion.div
                className="absolute top-0 h-full bg-white/50 rounded-full blur-sm"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
          
          {/* Dynamic Loading Text */}
          <motion.div
            className="text-center space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <motion.p
              className="text-xl font-semibold text-white"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {progress < 30 ? 'Initializing...' : 
               progress < 60 ? 'Loading Resources...' : 
               progress < 90 ? 'Almost Ready...' : 'Launching Feasly...'}
            </motion.p>
            <motion.p
              className="text-white/70 text-sm font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {Math.round(progress)}% Complete
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Enhanced shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        }}
        animate={{ x: [-1200, 1200] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}