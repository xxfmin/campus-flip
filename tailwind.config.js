/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        worksans: ["WorkSans-Regular", "sans-serif"],
        "worksans-bold": ["WorkSans-Bold", "sans-serif"],
        "worksans-extrabold": ["WorkSans-ExtraBold", "sans-serif"],
        "worksans-medium": ["WorkSans-Medium", "sans-serif"],
        "worksans-semibold": ["WorkSans-SemiBold", "sans-serif"],
        "worksans-light": ["WorkSans-Light", "sans-serif"],
      },
      colors: {
        cream: "#f4f1de",
        orange: "#e07a5f",
        blue: "#3d405b",
        green: "#81b29a",
        gold: "#f2cc8f",
      },
    },
  },
  plugins: [],
};
