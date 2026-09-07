/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        snip: {
          primary: '#0058BE',
          accent: '#FEA619',
          danger: '#D6393D',
          success: '#10B981',
          ink: '#131B2E',
          surface: '#FFFFFF',
          bg: '#F4F6FD',
          muted: '#E2E7FF',
        }
      },
      boxShadow: {
        'neo-low': '2px 2px 0px #131B2E',
        'neo': '4px 4px 0px #131B2E',
        'neo-deep': '6px 6px 0px #131B2E',
        'neo-press': '1px 1px 0px #131B2E',
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '36px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
