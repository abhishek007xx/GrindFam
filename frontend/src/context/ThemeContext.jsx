import React, { createContext, useContext } from 'react';
import { useSettings } from './SettingsContext';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const { settings, updateSettings } = useSettings();

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light' || newTheme === 'auto') {
      updateSettings({ theme: newTheme });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: settings.theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
