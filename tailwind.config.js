/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /** App UI + body — Hamon Regular @ 400 (use font-normal) */
        bar: ['"Hamon"', 'system-ui', 'sans-serif'],
        /** Display / titles — same family; use font-bold (700) or font-light (300) */
        barWordmark: ['"Hamon"', 'system-ui', 'sans-serif'],
        barDisplay: ['"Hamon"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
