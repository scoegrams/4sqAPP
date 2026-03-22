/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /** Body UI */
        bar: ['"DM Sans"', 'system-ui', 'sans-serif'],
        /** Titles — Hamon-Bold.otf at font-weight 700 (use with font-bold) */
        barWordmark: ['"Hamon"', 'system-ui', 'sans-serif'],
        barDisplay: ['"Hamon"', 'system-ui', 'sans-serif'],
        /** Legacy serif fallback if needed */
        barSerif: ['"Playfair Display"', 'Georgia', 'serif'],
        chalkScript: ['"Special Gothic Expanded One"', 'Impact', 'sans-serif'],
        chalkHeading: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        chalkBody: ['"Patrick Hand"', 'cursive'],
      },
    },
  },
  plugins: [],
};
