import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from './background-remover';

interface SmartLogoProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export function SmartLogo({ 
  src, 
  alt, 
  className = "", 
  fallbackClassName = "" 
}: SmartLogoProps) {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const processImage = async () => {
      try {
        setIsProcessing(true);
        setError(false);
        
        // Fetch the original image
        const response = await fetch(src);
        const blob = await response.blob();
        
        // Load as image element
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        if (mounted) {
          const processedUrl = URL.createObjectURL(processedBlob);
          setProcessedSrc(processedUrl);
        }
      } catch (err) {
        console.error('Failed to process logo:', err);
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setIsProcessing(false);
        }
      }
    };

    processImage();

    return () => {
      mounted = false;
      if (processedSrc) {
        URL.revokeObjectURL(processedSrc);
      }
    };
  }, [src]);

  // Show fallback while processing or on error
  if (isProcessing || error || !processedSrc) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={fallbackClassName || className}
      />
    );
  }

  // Show processed image
  return (
    <img 
      src={processedSrc} 
      alt={alt} 
      className={className}
    />
  );
}