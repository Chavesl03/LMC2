/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#0071e3',
          gray: {
            50: '#f5f5f7',
            100: '#e8e8ed',
            500: '#86868b',
            900: '#1d1d1f',
          },
        },
      },
      fontFamily: {
        sans: ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};