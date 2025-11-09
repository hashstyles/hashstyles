/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#ffe7f1',
          100: '#ffd0e3',
          200: '#ffa8ca',
          300: '#ff7db0',
          400: '#ff5aa1',
          500: '#c02c70',  // ← your Hash logo color
          600: '#a2245c',
          700: '#8c1d4c',
          800: '#76163e',
          900: '#5f1031'
        },
        brand: {
          background: '#fff7f6',
          surface: '#ffffff',
          border:  '#eadfe0',
          text: { primary: '#1f1720', secondary: '#6f606a' }
        }
      },
      borderRadius: { xl: '0.75rem', '2xl': '1rem' },
      boxShadow: { card: '0 6px 20px rgba(16,24,40,0.06)' },
      fontFamily: { display: ['Manrope','Inter','system-ui','sans-serif'] },
    },
  },
  plugins: [],
};
