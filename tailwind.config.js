/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066FF',
        success: '#00D084',
        warning: '#FFB800',
        danger: '#FF3333',
        pending: '#6C757D',
        'in-progress': '#FFB800',
        complete: '#00D084',
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F8FAFB',
        'bg-tertiary': '#F0F4FF',
        'text-primary': '#2D3436',
        'text-secondary': '#636E72',
        'text-light': '#95A5A6',
        border: '#E8EAED',
        'border-accent': '#D4D7DC',
      },
      fontSize: {
        'h1': ['32px', { fontWeight: '700', letterSpacing: '-0.5px' }],
        'h2': ['24px', { fontWeight: '600', letterSpacing: '-0.3px' }],
        'h3': ['18px', { fontWeight: '600' }],
        'body': ['14px', { fontWeight: '400', lineHeight: '1.6' }],
        'small': ['12px', { fontWeight: '400' }],
      },
      borderRadius: {
        'btn': '6px',
        'card': '8px',
        'modal': '12px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 16px rgba(0, 0, 0, 0.1)',
        'modal': '0 20px 25px rgba(0, 0, 0, 0.15)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
}
