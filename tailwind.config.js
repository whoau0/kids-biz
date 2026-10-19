/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fbf9f6',
          100: '#f5f1eb',
          200: '#ece3d6',
          300: '#decbb8',
          400: '#cbb096',
          500: '#b89476',
          600: '#a37e62',
          700: '#85644e',
          800: '#6d5241',
          900: '#5a4336',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#cedccd',
          300: '#acc4aa',
          400: '#84a682',
          500: '#648a62',
          600: '#4e6e4c',
          700: '#3e563d',
        },
        slateCustom: {
          850: '#1e2430',
          900: '#141822',
        }
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
