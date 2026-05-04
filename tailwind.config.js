/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}

// npx tailwindcss -i ./CSS/input.css -o ./dist/output.css --watch