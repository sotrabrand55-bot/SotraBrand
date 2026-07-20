/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#C7A96B",   // gold acc
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "Times New Roman", "serif"],
        sans: ["Cormorant Garamond", "Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
}
