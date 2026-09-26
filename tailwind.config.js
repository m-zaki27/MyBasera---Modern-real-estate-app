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
  // Emit plain colors instead of `--tw-*-opacity` CSS variables. On native, NativeWind
  // must remount a component whose className starts setting a variable after its first
  // render, and its dev-only warning for that crashes inside React Navigation
  // ("Couldn't find a navigation context"). Opacity modifiers like `bg-background/90`
  // still work without these plugins.
  corePlugins: {
    backgroundOpacity: false,
    borderOpacity: false,
    textOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    ringOpacity: false,
  },
  plugins: [],
};
