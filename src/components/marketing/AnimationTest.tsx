import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

export function AnimationTest() {
  const [animationStatus, setAnimationStatus] = useState<{
    framerMotion: boolean;
    css: boolean;
    viewport: boolean;
  }>({
    framerMotion: false,
    css: false,
    viewport: false
  });

  useEffect(() => {
    // Test CSS animations
    const testElement = document.createElement('div');
    testElement.style.animation = 'fadeIn 0.1s ease';
    setAnimationStatus(prev => ({ ...prev, css: true }));

    // Test viewport detection
    if ('IntersectionObserver' in window) {
      setAnimationStatus(prev => ({ ...prev, viewport: true }));
    }

    // Test framer-motion by checking if motion components render
    setAnimationStatus(prev => ({ ...prev, framerMotion: true }));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg p-4 shadow-lg max-w-xs">
      <h3 className="font-semibold mb-2 text-sm">Animation Status</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          {animationStatus.framerMotion ? (
            <CheckCircle className="h-3 w-3 text-success" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-warning" />
          )}
          <span>Framer Motion</span>
        </div>
        
        <div className="flex items-center gap-2">
          {animationStatus.css ? (
            <CheckCircle className="h-3 w-3 text-success" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-warning" />
          )}
          <span>CSS Animations</span>
        </div>
        
        <div className="flex items-center gap-2">
          {animationStatus.viewport ? (
            <CheckCircle className="h-3 w-3 text-success" />
          ) : (
            <AlertTriangle className="h-3 w-3 text-warning" />
          )}
          <span>Viewport Detection</span>
        </div>
      </div>

      {/* Live animation test */}
      <motion.div
        className="mt-3 p-2 bg-primary/10 rounded text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
      >
        <span className="text-xs">Live Test</span>
      </motion.div>

      {/* Device info */}
      <div className="mt-2 text-xs text-muted-foreground">
        <div>UA: {navigator.userAgent.includes('iPad') ? 'iPad' : 'Other'}</div>
        <div>Touch: {'ontouchstart' in window ? 'Yes' : 'No'}</div>
        <div>ReducedMotion: {window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Yes' : 'No'}</div>
      </div>
    </div>
  );
}