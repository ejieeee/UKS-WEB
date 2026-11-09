import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'vintage' | 'clean' | 'botanical';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  description: string;
  previewBg: string;
  previewCard: string;
  previewAccent: string;
  previewSecondary: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'vintage',
    name: 'Kertas Klasik',
    description: 'Nuansa kertas hvs vintage off-white dengan aksen merah burgundy & hijau sage.',
    previewBg: '#F8F6F0',
    previewCard: '#FFFDF8',
    previewAccent: '#984B50',
    previewSecondary: '#77846B',
  },
  {
    id: 'clean',
    name: 'Putih Bersih',
    description: 'Latar belakang putih bersih modern dengan kontras tinggi & aksen ruby slate.',
    previewBg: '#FFFFFF',
    previewCard: '#F8FAFC',
    previewAccent: '#8B0000',
    previewSecondary: '#475569',
  },
  {
    id: 'botanical',
    name: 'Botanikal Earth Tone',
    description: 'Nuansa alam botanical hijau lumut (moss green) dengan aksen terracotta tanah.',
    previewBg: '#EFEFE6',
    previewCard: '#F6F6EE',
    previewAccent: '#2E4D3E',
    previewSecondary: '#A25A45',
  },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  themeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('pmr_theme') as AppTheme;
    if (saved && ['vintage', 'clean', 'botanical'].includes(saved)) {
      return saved;
    }
    return 'vintage';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('pmr_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
  };

  const themeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeOption }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
