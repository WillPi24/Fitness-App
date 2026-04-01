import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { lightColors, darkColors, type ThemeColors } from '../theme';

type ColorMode = 'light' | 'dark';

type ThemeContextValue = {
  colorMode: ColorMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleColorMode: () => void;
};

const THEME_KEY = 'fitnessapp.colorMode.v1';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') {
        setColorMode(stored);
      }
      hasLoadedRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    AsyncStorage.setItem(THEME_KEY, colorMode);
  }, [colorMode]);

  const value = useMemo(() => ({
    colorMode,
    colors: colorMode === 'dark' ? darkColors : lightColors,
    isDark: colorMode === 'dark',
    toggleColorMode: () => setColorMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
  }), [colorMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
