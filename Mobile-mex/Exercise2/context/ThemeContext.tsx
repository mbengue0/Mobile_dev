import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define theme colors
const themes = {
  light: {
    background: '#ffffff',
    text: '#000000',
    card: '#f0f0f0',
    primary: '#007AFF',
  },
  dark: {
    background: '#000000',
    text: '#ffffff',
    card: '#1c1c1e',
    primary: '#0A84FF',
  },
};

// Define the shape of our context
type ThemeContextType = {
  theme: typeof themes.light;
  isDark: boolean;
  toggleTheme: () => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create the provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const theme = isDark ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}