// Design Tokens for Warm Academic Theme
export const tokens = {
  // Color Palette - Warm Academic
  colors: {
    // Primary colors - Deep, rich tones
    burgundy: {
      50: '#fdf2f4',
      100: '#fce4e9',
      200: '#f9c9d5',
      300: '#f49db3',
      400: '#ed6485',
      500: '#e23d5f',
      600: '#cd2346',
      700: '#ab1937',
      800: '#8f1732',
      900: '#7a172f',
      950: '#440715',
    },
    
    // Secondary - Warm amber/gold
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde58a',
      300: '#fcd24d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    
    // Tertiary - Rich navy for contrast
    navy: {
      50: '#f6f7f9',
      100: '#eceef2',
      200: '#d5dae2',
      300: '#b0bac8',
      400: '#8594a9',
      500: '#66778f',
      600: '#516076',
      700: '#424f60',
      800: '#394351',
      900: '#333b45',
      950: '#1e232b',
    },
    
    // Neutral - Warm grays and creams
    cream: {
      50: '#fdfcfb',
      100: '#fbf8f4',
      200: '#f7f0e6',
      300: '#f0e1ce',
      400: '#e7cdb0',
      500: '#ddb896',
      600: '#cda07a',
      700: '#b48862',
      800: '#977152',
      900: '#7d5e46',
      950: '#433024',
    },
    
    // Background colors
    parchment: '#faf8f3',
    paper: '#fffef9',
    ink: '#2c1810',
    
    // Semantic colors
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
  },
  
  // Typography
  typography: {
    fontFamilies: {
      heading: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      body: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
      // Multi-language support
      multilang: '"Work Sans", "Noto Sans", "Noto Sans Devanagari", "Noto Sans Tamil", "Noto Sans Telugu", "Noto Sans Kannada", "Noto Sans Malayalam", "Noto Sans Gujarati", "Noto Sans Bengali", sans-serif',
    },
    
    // Type scale using perfect fourth (1.333) ratio
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.333rem',   // 21px
      '2xl': '1.777rem', // 28px
      '3xl': '2.369rem', // 38px
      '4xl': '3.157rem', // 50px
      '5xl': '4.209rem', // 67px
    },
    
    // Font weights
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    
    // Line heights
    lineHeights: {
      tight: 1.1,
      snug: 1.3,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    // Letter spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Spacing scale (using Fibonacci-like sequence)
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem',    // 256px
  },
  
  // Shadows with warm undertones
  shadows: {
    xs: '0 1px 2px 0 rgba(140, 81, 47, 0.05)',
    sm: '0 2px 4px -1px rgba(140, 81, 47, 0.06), 0 1px 2px -1px rgba(140, 81, 47, 0.04)',
    md: '0 4px 6px -2px rgba(140, 81, 47, 0.05), 0 2px 4px -2px rgba(140, 81, 47, 0.04)',
    lg: '0 10px 15px -3px rgba(140, 81, 47, 0.08), 0 4px 6px -2px rgba(140, 81, 47, 0.05)',
    xl: '0 20px 25px -5px rgba(140, 81, 47, 0.1), 0 10px 10px -5px rgba(140, 81, 47, 0.04)',
    '2xl': '0 25px 50px -12px rgba(140, 81, 47, 0.15)',
    inner: 'inset 0 2px 4px 0 rgba(140, 81, 47, 0.06)',
    glow: '0 0 20px rgba(251, 191, 36, 0.15)',
  },
  
  // Border radius
  radii: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  
  // Animation
  animation: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      base: '300ms',
      slow: '450ms',
      slower: '600ms',
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  },
  
  // Z-index scale
  zIndex: {
    hide: -1,
    base: 0,
    raised: 10,
    dropdown: 20,
    sticky: 30,
    overlay: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
    toast: 80,
    max: 999,
  },
  
  // Breakpoints (matching Tailwind)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export default tokens;