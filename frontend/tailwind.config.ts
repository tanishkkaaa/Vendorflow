import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E1420',
        surface: '#F5F6F8',
        card: '#FFFFFF',
        primary: {
          DEFAULT: '#2C5F6F',
          dark: '#1F4750',
          light: '#DCE9EC',
        },
        accent: {
          DEFAULT: '#E8A33D',
          dark: '#C97F1E',
          light: '#FBEDD3',
        },
        success: { DEFAULT: '#2F9E68', light: '#E1F5EB' },
        danger: { DEFAULT: '#C1443C', light: '#FBE6E4' },
        warning: { DEFAULT: '#E8A33D', light: '#FBEDD3' },
        border: '#E3E6EA',
        muted: '#6B7280',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14, 20, 32, 0.06), 0 1px 3px rgba(14, 20, 32, 0.08)',
      },
      borderRadius: {
        card: '10px',
      },
    },
  },
  plugins: [],
} satisfies Config;
