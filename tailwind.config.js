const { colors } = require('./src/constants/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      spacing: {
        screen: '20px', // horizontal page padding: `px-screen`
      },
      borderRadius: {
        card: '20px',
        field: '12px',
      },
    },
  },
  plugins: [],
};
