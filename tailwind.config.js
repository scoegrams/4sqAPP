/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        bar: ['"DM Sans"', 'system-ui', 'sans-serif'],
        barDisplay: ['"Playfair Display"', 'Georgia', 'serif'],
        chalkScript: ['"Special Gothic Expanded One"', 'Impact', 'sans-serif'],
        chalkHeading: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        chalkBody: ['"Patrick Hand"', 'cursive'],
      },
    },
  },
  plugins: [],
};
