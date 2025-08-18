import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Density = 'comfortable' | 'compact';

interface DensityContextType {
  density: Density;
  setDensity: (density: Density) => void;
  isCompact: boolean;
}

const DensityContext = createContext<DensityContextType | undefined>(undefined);

interface DensityProviderProps {
  children: ReactNode;
}

export const DensityProvider: React.FC<DensityProviderProps> = ({ children }) => {
  const [density, setDensityState] = useState<Density>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('feasly-density') as Density;
      return stored && ['comfortable', 'compact'].includes(stored) ? stored : 'comfortable';
    }
    return 'comfortable';
  });

  const setDensity = (newDensity: Density) => {
    setDensityState(newDensity);
    localStorage.setItem('feasly-density', newDensity);
  };

  const isCompact = density === 'compact';

  return (
    <DensityContext.Provider value={{ density, setDensity, isCompact }}>
      {children}
    </DensityContext.Provider>
  );
};

export const useDensity = (): DensityContextType => {
  const context = useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
};