export const theme = {
  colors: {
    primary: '#6200EE',    // Deep purple
    secondary: '#03DAC6',  // Teal
    accent: '#FF4081',     // Pink
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#B00020',
    text: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    round: 9999,
  },
  typography: {
    h1: {
      fontSize: 96,
      fontWeight: 'light',
    },
    h2: {
      fontSize: 60,
      fontWeight: 'light',
    },
    h3: {
      fontSize: 48,
      fontWeight: 'regular',
    },
    body1: {
      fontSize: 16,
      fontWeight: 'regular',
    },
    body2: {
      fontSize: 14,
      fontWeight: 'regular',
    },
  },
} as const; 