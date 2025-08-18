import React, { createContext, useContext, ReactNode } from 'react';

export type ReadOnlyMode = 'demo' | 'share' | 'normal';

interface ReadOnlyContextType {
  readOnly: boolean;
  mode: ReadOnlyMode;
}

const ReadOnlyContext = createContext<ReadOnlyContextType>({
  readOnly: false,
  mode: 'normal',
});

interface DemoReadOnlyProviderProps {
  children: ReactNode;
  mode?: ReadOnlyMode;
}

export const DemoReadOnlyProvider: React.FC<DemoReadOnlyProviderProps> = ({ 
  children, 
  mode = 'normal' 
}) => {
  const readOnly = mode === 'demo' || mode === 'share';

  return (
    <ReadOnlyContext.Provider value={{ readOnly, mode }}>
      {children}
    </ReadOnlyContext.Provider>
  );
};

export const useReadOnly = (): ReadOnlyContextType => {
  return useContext(ReadOnlyContext);
};