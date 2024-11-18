import React, { createContext, useContext, ReactNode } from 'react';

interface ThemeContextType {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    header: {
      from: string;
      to: string;
    };
  };
  gradients: {
    header: string;
  };
}

const ThemeContext = createContext<ThemeContextType>({
  colors: {
    primary: 'bg-blue-600',
    secondary: 'bg-gray-100',
    accent: 'bg-indigo-600',
    background: 'bg-gray-50',
    text: 'text-gray-900',
    border: 'border-gray-200',
    header: {
      from: 'from-gray-900',
      to: 'to-gray-800'
    }
  },
  gradients: {
    header: 'bg-gradient-to-r from-gray-900 to-gray-800'
  }
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = {
    colors: {
      primary: 'bg-blue-600',
      secondary: 'bg-gray-100',
      accent: 'bg-indigo-600',
      background: 'bg-gray-50',
      text: 'text-gray-900',
      border: 'border-gray-200',
      header: {
        from: 'from-gray-900',
        to: 'to-gray-800'
      }
    },
    gradients: {
      header: 'bg-gradient-to-r from-gray-900 to-gray-800'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}