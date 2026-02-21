import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadSettings } from '../storage/settings';
import type { ThemeMode } from '../storage/settings';
import { getColorsForTheme, type ThemeColors } from './colors';

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [colors, setColors] = useState<ThemeColors>(() => getColorsForTheme('light'));

  const refreshTheme = useCallback(async () => {
    const s = await loadSettings();
    const mode = (s.theme ?? 'light') as ThemeMode;
    setThemeState(mode);
    setColors(getColorsForTheme(mode));
  }, []);

  useEffect(() => {
    refreshTheme();
  }, [refreshTheme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    setColors(getColorsForTheme(mode));
  }, []);

  const isDark = theme === 'dark' || theme === 'chatgpt';

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, setTheme, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
