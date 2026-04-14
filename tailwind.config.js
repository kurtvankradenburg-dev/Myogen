/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        foreground: '#FAFAFA',
        card: '#0A0A0A',
        'card-foreground': '#FAFAFA',
        primary: '#00F0FF',
        'primary-foreground': '#000000',
        secondary: '#FF3B30',
        'secondary-foreground': '#FFFFFF',
        muted: '#18181B',
        'muted-foreground': '#A1A1AA',
        accent: '#27272A',
        'accent-foreground': '#FAFAFA',
        border: '#27272A',
        input: '#27272A',
        ring: '#00F0FF',
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hero-glow': 'radial-gradient(circle at center, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.6s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
