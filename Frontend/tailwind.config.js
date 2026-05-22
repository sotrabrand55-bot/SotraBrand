/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#C7A96B",   // gold acc
      },
      fontFamily: {
        serif: ["Prata", "serif"],   // main logo / headers
        sans: ["Poppins", "ui-sans-serif", "system-ui"], // secondary text
      },
    },
  },
  plugins: [],
}
