/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          2: '#111118',
          3: '#18181f',
          4: '#1e1e28',
          5: '#24242f',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          2: 'rgba(255,255,255,0.13)',
          3: 'rgba(255,255,255,0.20)',
        },
        accent: { DEFAULT: '#6c63ff', 2: '#8b83ff' },
        fin: {
          green:  '#22d3a5',
          red:    '#ff5f7e',
          amber:  '#f59e0b',
          blue:   '#38bdf8',
          purple: '#a78bfa',
        },
      },
      borderRadius: { card: '16px' },
    },
  },
  plugins: [],
}
