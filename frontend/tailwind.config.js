/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta primaria (placeholder teal). Reemplázala por la de tu marca.
        primary: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#0D9488', // Brand main — cámbialo
          600: '#0F766E',
          700: '#115E59',
          800: '#134E4A',
          900: '#0B3B38',
        },
        brand: {
          main:       '#0D9488',
          'main-dark':'#0F766E',
          'main-50':  '#F0FDFA',
          flame:      '#0D9488',
          ink:        '#0B1220',
          slate:      '#475569',
        },
        accent: { 400: '#FFD24C', 500: '#FFC107', 600: '#E0A800' },
        gold:   { 400: '#F5C542', 500: '#E0A800', 600: '#B98900' },
        emerald2: { 500: '#10B981', 600: '#059669' },
        surface: {
          0:   '#FFFFFF',
          50:  '#F8FAFC',
          100: '#F1F5F9',
          150: '#E9EDF3',
          200: '#CBD5E1',
          800: '#1F2937',
          850: '#111827',
          900: '#0B1220',
          950: '#060A14',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 14s linear infinite',
      },
    },
  },
  plugins: [],
}
