/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#141414",
        secondary: "#1A1A1A",
        accent: "#FACC15", 
        light: "#F3F4F6",
      },
    },
  },
  plugins: [],
}
