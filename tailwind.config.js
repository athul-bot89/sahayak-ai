/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Work Sans', 'system-ui', '-apple-system', 'sans-serif'],
        'heading': ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Work Sans', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Primary - Burgundy
        'burgundy': {
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
        // Secondary - Amber
        'amber': {
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
        // Accent - Navy
        'navy': {
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
        // Neutral - Cream
        'cream': {
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
        'parchment': '#faf8f3',
        'paper': '#fffef9',
        'ink': '#2c1810',
        // Keep legacy forest colors for compatibility
        'forest': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'mint': {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        'earth': {
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.45s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'slideIn': 'slideInRight 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'shimmer': 'shimmer 1.5s infinite linear',
        'pulse-soft': 'pulse 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
      },
      boxShadow: {
        'warm-xs': '0 1px 2px 0 rgba(140, 81, 47, 0.05)',
        'warm-sm': '0 2px 4px -1px rgba(140, 81, 47, 0.06), 0 1px 2px -1px rgba(140, 81, 47, 0.04)',
        'warm-md': '0 4px 6px -2px rgba(140, 81, 47, 0.05), 0 2px 4px -2px rgba(140, 81, 47, 0.04)',
        'warm-lg': '0 10px 15px -3px rgba(140, 81, 47, 0.08), 0 4px 6px -2px rgba(140, 81, 47, 0.05)',
        'warm-xl': '0 20px 25px -5px rgba(140, 81, 47, 0.1), 0 10px 10px -5px rgba(140, 81, 47, 0.04)',
        'warm-2xl': '0 25px 50px -12px rgba(140, 81, 47, 0.15)',
        'glow': '0 0 20px rgba(251, 191, 36, 0.15)',
        'inner-warm': 'inset 0 2px 4px 0 rgba(140, 81, 47, 0.06)',
      },
      backgroundImage: {
        'warm-gradient': 'linear-gradient(135deg, #cd2346 0%, #f59e0b 100%)',
        'subtle-gradient': 'linear-gradient(180deg, #faf8f3 0%, #fbf8f4 100%)',
        'paper-texture': 'radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.03) 0%, transparent 50%)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [],
}