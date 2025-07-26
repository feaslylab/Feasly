import { useState, useEffect } from "react";
import { removeBackground, loadImageFromUrl } from "@/lib/backgroundRemoval";

interface TransparentLogoProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export const TransparentLogo = ({ src, alt, className, fallbackClassName }: TransparentLogoProps) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        setError(false);
        
        // Load the image
        const imageElement = await loadImageFromUrl(src);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for the processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedImageUrl(url);
        
      } catch (err) {
        console.error('Failed to process logo:', err);
        setError(true);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();

    // Cleanup function
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [src]);

  // Show fallback while processing or on error
  if (isProcessing || error || !processedImageUrl) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={fallbackClassName || className}
        style={error ? undefined : { opacity: isProcessing ? 0.7 : 1 }}
      />
    );
  }

  return (
    <img 
      src={processedImageUrl} 
      alt={alt} 
      className={className}
    />
  );
};