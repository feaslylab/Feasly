import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CursorEffects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      setIsPointer(
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer'
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed w-4 h-4 bg-primary rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isPointer ? 1.5 : 1
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 800
        }}
      />
      
      {/* Cursor trail */}
      <motion.div
        className="fixed w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-40"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isPointer ? 2 : 1
        }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 200
        }}
      />
    </>
  );
}