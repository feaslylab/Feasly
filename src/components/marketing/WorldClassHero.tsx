import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import skyline1 from "@/assets/skyline-1.jpg";
import skyline2 from "@/assets/skyline-2.jpg";
import skyline3 from "@/assets/skyline-3.jpg";

export function WorldClassHero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [typewriterText, setTypewriterText] = useState("");
  const [showTypewriter, setShowTypewriter] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 150, damping: 50 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 50 });

  const skylineImages = [skyline1, skyline2, skyline3];
  const typewriterFullText = "Modern Modeling Infrastructure for the GCC";

  useEffect(() => {
    setIsLoaded(true);
    
    // Start typewriter effect after initial fade-in
    const typewriterTimer = setTimeout(() => {
      setShowTypewriter(true);
    }, 1200);
    
    // Rotate images every 8 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % skylineImages.length);
    }, 8000);
    
    return () => {
      clearTimeout(typewriterTimer);
      clearInterval(interval);
    };
  }, [skylineImages.length]);

  // Typewriter effect
  useEffect(() => {
    if (!showTypewriter) return;
    
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex <= typewriterFullText.length) {
        setTypewriterText(typewriterFullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 80); // Adjust speed here
    
    return () => clearInterval(typeInterval);
  }, [showTypewriter, typewriterFullText]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    mouseX.set(x);
    mouseY.set(y);
  };

  return (
    <section 
      className="min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Premium Background with Rotating Skylines */}
      <div className="absolute inset-0">
        {/* Rotating Skyline Images */}
        {skylineImages.map((image, index) => (
          <motion.div
            key={image}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${image})`,
              opacity: currentImageIndex === index ? 0.41 : 0, // 59% transparency = 0.41 opacity
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: currentImageIndex === index ? 0.41 : 0,
              scale: currentImageIndex === index ? 1.05 : 1.1
            }}
            transition={{ 
              duration: 2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Light Green Tint Overlay */}
        <div className="absolute inset-0 bg-green-500/20 mix-blend-soft-light" />
        
        {/* Background Gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/85" />
        
        {/* Subtle animated gradients */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            background: `radial-gradient(circle at ${springX.get() + 50}% ${springY.get() + 50}%, hsl(var(--primary)/0.1) 0%, transparent 50%)`
          }}
        />
        
        <motion.div 
          className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-primary/6 to-primary-light/4 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div 
          className="absolute -bottom-1/4 -right-1/4 w-80 h-80 bg-gradient-to-r from-primary-light/4 to-primary/6 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10 max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Badge with Enhanced Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.4 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium mb-8"
              whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary)/0.4)" }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="w-2 h-2 bg-primary rounded-full"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Built in the GCC, for the GCC
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-full blur-2xl scale-110" />
              <img 
                src="/lovable-uploads/9c1fb9f6-2ebe-4aca-a9d2-295f77d9d4ba.png" 
                alt="Feasly Logo" 
                className="w-24 h-24 relative z-10 drop-shadow-xl"
              />
            </div>
          </motion.div>

          {/* Main Headline with Typewriter Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <h1 className="text-5xl/tight md:text-7xl font-bold text-foreground max-w-4xl mx-auto mb-6">
              {showTypewriter ? (
                <>
                  <span className="block">
                    {typewriterText.split(' for the GCC')[0]}
                    {typewriterText.includes(' for the GCC') && (
                      <>
                        <br />
                        <span className="bg-gradient-to-r from-primary via-primary-light to-primary-dark bg-clip-text text-transparent">
                          for the GCC
                        </span>
                      </>
                    )}
                    <motion.span
                      className="inline-block w-1 h-16 md:h-20 bg-primary ml-2"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  </span>
                </>
              ) : (
                <span className="opacity-0">Modern Modeling Infrastructure for the GCC</span>
              )}
            </h1>
          </motion.div>

          {/* Subheading with Character Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.8 }} // After typewriter completes
          >
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.0, duration: 1.2 }}
            >
              Feasly replaces spreadsheets, outdated tools, and consulting bottlenecks with precision-grade capital modeling, built in the Gulf, for the Gulf.
            </motion.p>
          </motion.div>

          {/* CTA with Premium Animation */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 4.0, type: "spring", bounce: 0.3 }}
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 30px -10px hsl(var(--primary) / 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button size="lg" className="px-8 py-4 text-lg font-semibold relative overflow-hidden group">
                <motion.span
                  className="relative z-10 flex items-center"
                  initial={{ x: 0 }}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  Register Interest
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary-light to-primary opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}