import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface TimeContextType {
  hour: number;
  isDarkMode: boolean;
  overLight: boolean;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

interface TimeProviderProps {
  children: ReactNode;
  hour: number;
  isDarkMode: boolean;
}

export const TimeProvider: React.FC<TimeProviderProps> = ({ children, hour, isDarkMode }) => {
  // Set overLight to true except when it's night time
  // Night time is when hour >= 20 or hour < 5 (based on GooeyBackground logic)
  const isNight = hour >= 20 || hour < 5;
  const overLight = !isNight;

  return (
    <TimeContext.Provider value={{ hour, isDarkMode, overLight }}>
      {children}
    </TimeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTime = (): TimeContextType => {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOptionalTime = (): TimeContextType | null => {
  return useContext(TimeContext) ?? null;
};
