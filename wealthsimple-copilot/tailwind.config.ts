import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wealthsimple actual website palette — light, warm, organic
        ws: {
          bg: '#FBF7F0',
          'bg-alt': '#F5F0E8',
          'bg-dark': '#2B2B28',
          card: '#FFFFFF',
          'card-hover': '#F9F6F1',
          border: '#E8E4DD',
          'border-dark': '#D4D0C8',
          green: '#0A7B5A',
          'green-light': '#E8F5F0',
          'green-dim': '#0A7B5A15',
          red: '#C13515',
          'red-light': '#FDF0ED',
          'red-dim': '#C1351515',
          yellow: '#B8860B',
          'yellow-light': '#FFF8E7',
          'yellow-dim': '#B8860B15',
          text: '#1A1A1A',
          'text-secondary': '#6B6B6B',
          'text-muted': '#9B9B9B',
          accent: '#0A7B5A',
          'btn-dark': '#2B2B28',
          'btn-dark-hover': '#3D3D39',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'ws': '12px',
        'ws-lg': '16px',
      },
      boxShadow: {
        'ws': '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'ws-md': '0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        'ws-lg': '0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
