/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.js",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary300: "#565656",
        background: "#F4E7F8",
      },
      padding: {
        spacer0: 4,
        spacer1: 8,
        spacer2: 16,
        spacer3: 24,
        spacer4: 32,
        spacer5: 40,
        spacer6: 48,
      },
      borderRadius: {
        borderRadius0: 4,
        borderRadius1: 6,
        borderRadius2: 8,
        borderRadius3: 10,
        borderRadius4: 16,
        borderRadius5: 24,
      },
      borderWidth: {
        smBorder: 4,
        mBorder: 8,
        lgBorder: 16,
      },
    },
  },
  plugins: [],
};
