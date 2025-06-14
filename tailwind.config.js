/** @type {import('tailwindcss').Config} */
/* eslint-disable no-undef */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {animation: {
    fadeIn: 'fadeIn 0.15s ease-out forwards',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: 0, transform: 'scale(0.95)' },
      '100%': { opacity: 1, transform: 'scale(1)' },
    },
  },},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
