import { useState, useEffect, createContext, useContext } from 'react';

interface BeginnerModeContextType {
  isBeginnerMode: boolean;
  toggleBeginnerMode: () => void;
  setBeginnerMode: (value: boolean) => void;
}

const BeginnerModeContext = createContext<BeginnerModeContextType | undefined>(undefined);

export const useBeginnerMode = () => {
  const context = useContext(BeginnerModeContext);
  if (!context) {
    throw new Error('useBeginnerMode must be used within a BeginnerModeProvider');
  }
  return context;
};

export const useBeginnerModeState = () => {
  const [isBeginnerMode, setIsBeginnerMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hydraulics-beginner-mode');
      return stored === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('hydraulics-beginner-mode', String(isBeginnerMode));
  }, [isBeginnerMode]);

  const toggleBeginnerMode = () => setIsBeginnerMode(prev => !prev);
  const setBeginnerMode = (value: boolean) => setIsBeginnerMode(value);

  return { isBeginnerMode, toggleBeginnerMode, setBeginnerMode };
};

export { BeginnerModeContext };
