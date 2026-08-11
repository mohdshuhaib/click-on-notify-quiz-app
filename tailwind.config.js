/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        anek: ['var(--font-anek)', 'sans-serif'],
      },
      colors: {
        'neu-bg': '#e6e9ef',
        'neu-text': '#4a5568',
        'neu-text-light': '#718096',
        'neu-blue': '#4299e1',
        'neu-green': '#48bb78',
        'neu-red': '#f56565',
      },
      boxShadow: {
        'neu-flat': '8px 8px 16px #c4c6cb, -8px -8px 16px #ffffff',
        'neu-pressed': 'inset 8px 8px 16px #c4c6cb, inset -8px -8px 16px #ffffff',
        'neu-sm': '4px 4px 8px #c4c6cb, -4px -4px 8px #ffffff',
        'neu-pressed-sm': 'inset 4px 4px 8px #c4c6cb, inset -4px -4px 8px #ffffff',
      }
    },
  },
  plugins: [],
}