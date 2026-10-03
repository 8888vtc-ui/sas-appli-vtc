/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#131313',
          dim: '#131313',
          bright: '#3a3939',
          'container-lowest': '#0e0e0e',
          'container-low': '#1c1b1b',
          container: '#201f1f',
          'container-high': '#2a2a2a',
          'container-highest': '#353534',
        },
        'on-surface': {
          DEFAULT: '#e5e2e1',
          variant: '#b9cbb9',
        },
        primary: {
          DEFAULT: '#f1ffef',
          container: '#00ff87',
          fixed: '#60ff98',
          'fixed-dim': '#00e478',
        },
        'on-primary': {
          DEFAULT: '#003919',
          container: '#007138',
        },
        secondary: {
          DEFAULT: '#adc6ff',
          container: '#0566d9',
        },
        'on-secondary': {
          DEFAULT: '#002e6a',
          container: '#e6ecff',
        },
        tertiary: {
          DEFAULT: '#fffaf8',
          container: '#ffd8ad',
          'fixed-dim': '#ffb95f',
        },
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        outline: {
          DEFAULT: '#849585',
          variant: '#3b4b3d',
        },
        background: '#131313',
        'on-background': '#e5e2e1',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
