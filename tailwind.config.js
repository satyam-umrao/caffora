/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        caffora: {
          50: "#FFF7F2",
          100: "#FBE9DE",
          200: "#F5D0BC",
          300: "#E9AD8C",
          400: "#D9865B",
          500: "#B95E2E",
          600: "#9E4D24",
          700: "#823F20",
          800: "#69351F",
          900: "#552E1E",
        },
      },
    },
  },

  plugins: [],
};
