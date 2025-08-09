/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      textShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.5)',
        'DEFAULT': '0 1px 3px rgba(0, 0, 0, 0.6)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.7)',
        'lg': '0 2px 8px rgba(0, 0, 0, 0.8)',
        'xl': '0 3px 12px rgba(0, 0, 0, 0.9)',
        'heavy': '0 4px 16px rgba(0, 0, 0, 1)',
        'glow': '0 0 8px rgba(255, 255, 255, 0.8)',
        'none': 'none',
      }
    },
  },
  plugins: [
    function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    },
  ],
}
