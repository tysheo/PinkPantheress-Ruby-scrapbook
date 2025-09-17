import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        paper: 'var(--paper)',
        pink: 'var(--pink)',
        hotpink: 'var(--hot-pink)',
        cream: 'var(--cream)'
      },
      boxShadow: {
        card: 'var(--shadow-1)',
        lift: 'var(--shadow-2)'
      },
      borderRadius: {
        card: 'var(--radius-card)',
        tile: 'var(--radius-tile)'
      }
    }
  },
  plugins: []
} satisfies Config
